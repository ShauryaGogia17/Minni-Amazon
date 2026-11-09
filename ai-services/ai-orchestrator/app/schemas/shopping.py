from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=1000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000, pattern=r"\S")
    history: list[Message] = Field(default_factory=list, max_length=12)


class RecommendationRequest(BaseModel):
    viewed_ids: list[UUID] = Field(default_factory=list, max_length=20)
    context_product_id: UUID | None = None
    limit: int = Field(default=4, ge=1, le=8)


class Category(BaseModel):
    slug: str
    name: str


class Product(BaseModel):
    id: UUID
    name: str
    brand: str
    description: str
    price: float = Field(ge=0)
    currency: str
    category: Category
    featured: bool
    images: list[str]
    specifications: dict[str, str]


class Recommendation(BaseModel):
    product: Product
    reason: str


class RecommendationResponse(BaseModel):
    title: str
    basis: Literal["browsing", "catalog", "complementary"]
    items: list[Recommendation]


class Intent(BaseModel):
    terms: list[str] = Field(default_factory=list, max_length=12)
    excluded_terms: list[str] = Field(default_factory=list, max_length=12)
    min_price: float | None = Field(default=None, ge=0, le=9999999999.99)
    max_price: float | None = Field(default=None, ge=0, le=9999999999.99)


class ChatResponse(BaseModel):
    message: str
    items: list[Recommendation]
    suggestions: list[str]
    mode: Literal["catalog", "model"]
    filters: Intent
