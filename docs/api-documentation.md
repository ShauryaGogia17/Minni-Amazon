# Phase 1 API contracts

## Product Service — localhost:8081

`GET /api/v1/products`

Optional query parameters:

- `q`: name/brand case-insensitive contains search; at most 120 characters. `%` and `_` are literal.
- `category`: category slug, at most 80 characters.
- `minPrice`, `maxPrice`: decimal INR bounds from 0 to 9999999999.99; inclusive. Minimum cannot exceed maximum.
- `featured`: boolean; true restricts to the everyday edit.
- `page`: zero-based, 0–10000; default 0.
- `size`: 1–48; default 12.
- `sort`: `newest` (default), `name`, `price-asc`, `price-desc`. UUID is a stable secondary ordering.

Response 200 shape:

```json
{"items": [], "page": 0, "size": 12, "totalElements": 0, "totalPages": 0}
```

Each item contains `id`, `name`, `brand`, `description`, decimal `price`, `currency`, `category: {slug,name}`, `featured`, ordered `images`, and a string-to-string `specifications` object. Empty results remain 200. Malformed or out-of-range filters return 400.

`GET /api/v1/products/{uuid}` returns one item; unknown UUID is 404, malformed UUID is 400.

`GET /api/v1/categories` returns `[{"slug":"...","name":"..."}]`, sorted by category name.

`GET /actuator/health/liveness` reports process liveness. `GET /actuator/health/readiness` checks application readiness, PostgreSQL and Redis; unhealthy dependencies produce 503. Details and credentials are not exposed. `/actuator/health` reports aggregate health.

Errors use Spring Problem Details (`type`, `title`, `status`, `detail`, optional `instance`) and never include stack traces. Request headers may supply a 1–64 character alphanumeric/underscore/hyphen `X-Request-ID`; otherwise a UUID is generated. Responses return the ID. Unknown/mutation routes return 403 by design until secured features exist.

## AI foundation — localhost:8000

`GET /health/live` returns `{"status":"ok","service":"ai-orchestrator","checks":{}}` without dependency checks.

`GET /health/ready` returns 200/503 with `status: ready|not_ready` and boolean `checks: {postgres,redis,product_service}`. Readiness failures are actual dependency failures, not random or fabricated states.

`GET /api/v1/ai/capabilities` returns `phase:1`, `llm_enabled:false`, a message and five agents (`shopping`, `recommendation`, `review`, `support`, `inventory`). Each has `available:false` and `planned_phase:5`. There is no chat/action endpoint.

FastAPI provides `/docs` and `/openapi.json` directly. No customer data or credentials appear in these public foundation endpoints.

## Same-origin frontend mapping — localhost:5173

- `/api/v1/products*`, `/api/v1/categories` → Product Service.
- `/api/v1/ai/*` → AI service.
- `/health/catalog` → Product readiness.
- `/health/ai/ready` → AI readiness.
- Other paths → React Router frontend.

The frontend API client applies an 8-second timeout; queries expose errors and retry controls. It does not silently load local product arrays when the backend is unavailable.
