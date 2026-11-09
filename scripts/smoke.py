#!/usr/bin/env python3
"""Live HTTP integration checks. Requires the complete Phase 1 stack."""
import json
import os
import time
import urllib.error
import urllib.request

base = os.environ.get("SHOPAI_BASE_URL", "http://127.0.0.1:5173")


def read(path):
    with urllib.request.urlopen(base + path, timeout=6) as response:
        return json.load(response)


for attempt in range(45):
    try:
        read("/health/catalog")
        read("/health/ai/ready")
        break
    except (OSError, ValueError):
        if attempt == 44:
            raise SystemExit("Stack did not become ready. Check service logs and ports.")
        time.sleep(1)

catalog = read("/api/v1/products?size=2&sort=price-asc")
assert 0 < len(catalog["items"]) <= 2, "Development catalog was not seeded"
assert catalog["totalElements"] >= len(catalog["items"])
product = read("/api/v1/products/" + catalog["items"][0]["id"])
assert product["name"] == catalog["items"][0]["name"]
assert len(read("/api/v1/categories")) > 0
capabilities = read("/api/v1/ai/capabilities")
assert len(capabilities["agents"]) == 5
assert {agent["id"] for agent in capabilities["agents"] if agent["available"]} == {"shopping", "recommendation"}
body = json.dumps({"message": "gift for my dad under ₹2000"}).encode()
request = urllib.request.Request(base + "/api/v1/ai/chat", data=body, headers={"Content-Type": "application/json"})
with urllib.request.urlopen(request, timeout=20) as response:
    recommendations = json.load(response)
assert recommendations["items"], "Shopping assistant did not return development catalog picks"
assert all(item["product"]["price"] <= 2000 for item in recommendations["items"])
assert all(read("/health/ai/ready")["checks"].values())
try:
    read("/api/v1/products?size=999")
    raise AssertionError("Invalid page size was accepted")
except urllib.error.HTTPError as error:
    assert error.code == 400
print("PASS: same-origin storefront proxy, catalog, product details, categories, validation, AI capabilities, PostgreSQL/Redis readiness.")
