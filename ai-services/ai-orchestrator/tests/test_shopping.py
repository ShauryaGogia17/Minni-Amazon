from unittest.mock import AsyncMock
from uuid import UUID

import httpx
import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.schemas.shopping import ChatRequest, Intent, Message, RecommendationRequest
from app.services.shopping import ShoppingService, parse_intent
from main import create_app


def product(n, name, price, category="home-living"):
    return {
        "id": f"00000000-0000-4000-8000-{n:012d}", "name": name, "brand": "Test brand",
        "description": name, "price": price, "currency": "INR", "featured": True,
        "category": {"slug": category, "name": category}, "images": [], "specifications": {},
    }


CATALOG = [
    product(1, "Pour-over coffee set", 1890),
    product(2, "Trail insulated bottle", 1290, "outdoors"),
    product(3, "Orbit wireless headphones", 7990, "electronics"),
    product(4, "Pocket Bluetooth speaker", 3490, "electronics"),
    product(5, "Everyday backpack", 2490, "everyday"),
]


@pytest.fixture
def shopping():
    def respond(request):
        return httpx.Response(200, json={"items": CATALOG, "totalPages": 1})
    client = httpx.AsyncClient(base_url="http://catalog", transport=httpx.MockTransport(respond))
    return ShoppingService(client, Settings(openai_api_key=""))


@pytest.mark.parametrize("message,minimum,maximum", [
    ("gift for my dad under ₹2,000", None, 2000),
    ("headphones under 10k", None, 10000),
    ("budget rs. 2000", None, 2000),
    ("between ₹1,000 and ₹2,000", 1000, 2000),
    ("above ₹3000", 3000, None),
    ("₹1500", None, 1500),
    ("2000", None, 2000),
    ("2k", None, 2000),
])
def test_rupee_budget_formats(message, minimum, maximum):
    intent = parse_intent(ChatRequest(message=message))
    assert (intent.min_price, intent.max_price) == (minimum, maximum)


async def test_gift_followup_preserves_budget_and_links_only_catalog_products(shopping):
    first = await shopping.chat(ChatRequest(message="gift for my dad under ₹2000"))
    assert "enjoy" in first.message
    assert len(first.items) == 2
    assert all(item.product.price <= 2000 for item in first.items)
    reply = await shopping.chat(ChatRequest(message="He likes coffee", history=[
        Message(role="user", content="gift for my dad under ₹2000"),
    ]))
    assert [str(item.product.id) for item in reply.items] == [CATALOG[0]["id"]]
    assert reply.mode == "catalog"
    assert reply.filters.max_price == 2000


async def test_budget_change_no_match_exclusions_and_reset(shopping):
    reply = await shopping.chat(ChatRequest(message="Only under ₹1500", history=[Message(role="user", content="coffee under ₹2000")]))
    assert not reply.items
    assert "couldn’t find" in reply.message
    assert not (await shopping.chat(ChatRequest(message="television under ₹2000"))).items
    reply = await shopping.chat(ChatRequest(message="not coffee under ₹2000"))
    assert [item.product.name for item in reply.items] == ["Trail insulated bottle"]
    reply = await shopping.chat(ChatRequest(message="Start over", history=[Message(role="user", content="headphones under ₹100")]))
    assert reply.filters.max_price is None
    assert reply.filters.terms == []
    assert reply.items


async def test_browsing_affinity_excludes_seen_and_unknown_ids(shopping):
    result = await shopping.recommendations(RecommendationRequest(viewed_ids=[UUID(CATALOG[2]["id"])]))
    assert result.basis == "browsing"
    assert result.items[0].product.name == "Pocket Bluetooth speaker"
    assert CATALOG[2]["id"] not in [str(item.product.id) for item in result.items]
    reset = await shopping.recommendations(RecommendationRequest())
    assert reset.basis == "catalog"
    result = await shopping.recommendations(RecommendationRequest(context_product_id=UUID(CATALOG[2]["id"])))
    assert result.basis == "complementary"
    assert CATALOG[2]["id"] not in [str(item.product.id) for item in result.items]


async def test_model_failure_falls_back_and_model_cannot_override_explicit_budget(shopping):
    shopping.model_intent = AsyncMock(return_value=None)
    assert (await shopping.chat(ChatRequest(message="coffee under ₹2000"))).items
    shopping.model_intent = AsyncMock(return_value=Intent(terms=["coffee"], max_price=50000))
    reply = await shopping.chat(ChatRequest(message="coffee under ₹1000"))
    assert reply.filters.max_price == 1000
    assert not reply.items


async def test_provider_timeout_returns_catalog_mode(monkeypatch, shopping):
    settings = Settings(openai_api_key="test-only")
    service = ShoppingService(shopping.client, settings)
    async def unavailable(*args, **kwargs):
        raise httpx.ReadTimeout("unavailable")
    monkeypatch.setattr(httpx.AsyncClient, "post", unavailable)
    reply = await service.chat(ChatRequest(message="coffee under ₹2000"))
    assert reply.mode == "catalog"
    assert reply.items[0].product.name == "Pour-over coffee set"


async def test_structured_provider_intent_is_validated_and_normalized(monkeypatch, shopping):
    service = ShoppingService(shopping.client, Settings(openai_api_key="test-only"))
    async def response(self, url, **kwargs):
        assert url == "https://api.openai.com/v1/responses"
        assert kwargs["json"]["store"] is False
        assert kwargs["json"]["text"]["format"]["strict"] is True
        assert kwargs["headers"]["Authorization"] == "Bearer test-only"
        return httpx.Response(200, request=httpx.Request("POST", url), json={
            "output": [{"content": [{"type": "output_text", "text":
                '{"terms":["Caffeine"],"excluded_terms":[],"min_price":null,"max_price":2000}'}]}],
        })
    monkeypatch.setattr(httpx.AsyncClient, "post", response)
    reply = await service.chat(ChatRequest(message="A present for someone who enjoys brewing"))
    assert reply.mode == "model"
    assert reply.filters.terms == ["coffee"]
    assert [item.product.name for item in reply.items] == ["Pour-over coffee set"]


def test_unavailable_catalog_returns_503_not_fabricated_recommendations():
    with TestClient(create_app()) as client:
        client.app.state.shopping.client = httpx.AsyncClient(
            base_url="http://offline", transport=httpx.MockTransport(lambda _: httpx.Response(503)),
        )
        for path, body in [("chat", {"message": "coffee"}), ("recommendations", {})]:
            response = client.post("/api/v1/ai/" + path, json=body)
            assert response.status_code == 503
            assert "temporarily unavailable" in response.json()["detail"]


def test_chat_and_recommendation_api_validation(shopping):
    with TestClient(create_app()) as client:
        client.app.state.shopping = shopping
        assert client.post("/api/v1/ai/chat", json={"message": "coffee under ₹2000"}).status_code == 200
        assert client.post("/api/v1/ai/chat", json={"message": "x" * 1001}).status_code == 422
        assert client.post("/api/v1/ai/recommendations", json={"viewed_ids": ["invalid"]}).status_code == 422
        assert client.post("/api/v1/ai/recommendations", json={"limit": 100}).status_code == 422
        assert client.post("/api/v1/ai/recommendations", json={"context_product_id": "00000000-0000-4000-8000-000000000099"}).status_code == 404
        assert client.options("/api/v1/ai/chat", headers={
            "Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST",
        }).status_code == 200
