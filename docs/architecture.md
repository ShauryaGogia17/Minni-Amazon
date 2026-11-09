# Architecture

## Current foundation

The browser uses one origin. Vite proxies development requests; Nginx serves the production frontend container and proxies the same paths. Only catalog reads and health/capability endpoints exist. A proxy is not yet an authentication gateway.

The Product Service separates HTTP contracts (`api`), application use cases (`application`), persisted records/repositories (`domain`), and runtime policy (`config`). JPA maps PostgreSQL records to immutable API DTOs inside read transactions. Sorting is allowlisted, pages are bounded, wildcard searches are escaped and use query parameters. Flyway creates schema; Hibernate validates it instead of modifying it.

Redis caches application DTOs in private authenticated infrastructure for 120 seconds. Cache failures are logged without secrets and fall back to the database. Readiness includes database and Redis checks. Liveness checks the process. The initial cache serializer is JDK serialization for application-written serializable DTOs; Redis is therefore a trusted internal dependency and must not accept untrusted writers. A versioned JSON cache contract is a follow-up before widening Redis access or mixing deployments. Catalog mutation endpoints must evict all relevant pages/details/categories in Phase 2.

FastAPI owns lifecycle-managed HTTP/Redis clients. Its readiness checks AI PostgreSQL connectivity, Redis, and Product Service readiness concurrently with timeouts. It does not access private orders, execute model instructions, run tools, or generate recommendations in this phase. Five capability records explicitly advertise `available=false`.

## Target service boundaries

- Gateway: routing, JWT enforcement, CORS, per-principal rate limits, request IDs.
- User: identities, roles, addresses, hashed passwords, rotated refresh-token families.
- Product: categories, products, media metadata, specifications and reviews; public search.
- Cart: customer-scoped Redis carts with authoritative product/stock validation at checkout.
- Order: immutable item-price snapshots, totals, order history, returns and saga state.
- Inventory: authoritative stock/reservations, expiry, transactional conditional updates.
- Payment: provider IDs, verified webhooks, idempotency, refunds; no card numbers or CVVs.
- Notification: durable retryable notifications, delivery attempts, event deduplication.
- AI: conversations/recommendation history/embeddings, intent routing, authorized backend tools.

Every service owns a database and migrations. The local PostgreSQL server can host separate databases, but services never join or write into another service's database. Internal credentials and customer identity propagation will be added with the authenticated gateway; no unsecured admin CRUD is introduced in Phase 1.

## Planned order lifecycle

1. Persist a pending order and its outbox event atomically with a client idempotency key.
2. Inventory consumes the event once and atomically reserves available stock.
3. Reservation success initiates a test-provider payment; reservation failure blocks capture.
4. A verified, deduplicated payment webhook drives payment success/failure events.
5. Success confirms the order; failure or cancellation releases the reservation.
6. Notification consumes confirmation and shipment events with retries and a dead-letter queue.

At-least-once event transport requires database uniqueness and inbox/idempotency records, not assumptions of globally exactly-once delivery. Outbox publication, compensation and reservation expiry must be tested with duplicate events and process restarts in Phase 4.

## Security limits and future hardening

The current API is read-only, all state-changing/unknown routes are denied, database roles are separated, CORS origins are explicit, secrets are server-side, and request IDs are sanitized. There is no login or promise of authenticated sessions yet. TLS, ingress rate limits, JWT enforcement, audit retention, CSP, traces and metrics are later release gates. Compose is local-only with loopback host bindings.

Reference compatibility: [Spring Boot 3.5 system requirements](https://docs.spring.io/spring-boot/3.5/system-requirements.html), [Spring Redis integration](https://docs.spring.io/spring-boot/3.5/reference/data/nosql.html), [Vite prerequisites](https://vite.dev/guide/), and [FastAPI container deployment](https://fastapi.tiangolo.com/deployment/docker/).
