# Database ownership and migrations

## Implemented

`shopai_product` is owned by the Product Service role. Flyway V1 creates:

- `categories`: `slug` primary key and unique, required name.
- `products`: UUID primary key; required name, brand, description; nonnegative `NUMERIC(12,2)` INR price; category foreign key; featured flag; UTC-aware created/updated timestamps.
- `product_images`: product foreign key with cascading deletion, ordered nonnegative position and URL; composite primary key.
- `product_specifications`: product foreign key with cascading deletion, name/value; composite primary key.

Indexes support category/price lookup, price sorting and recency sorting. Initial contains search uses parameterized `LIKE`; introduce PostgreSQL trigram indexes when the catalog size warrants it. Stock, review counts, and ratings are deliberately absent because those domains are not implemented.

`db/dev/R__development_catalog.sql` is opt-in through `application-dev.yml`. This repeatable fixture migration inserts four categories and eight explicitly fictional development products with illustrative Unsplash photos. `ON CONFLICT DO NOTHING` preserves existing records on repeat runs. `V1` remains the only production schema migration; future versioned migrations run before the repeatable fixture script.

`shopai_ai` is owned by the AI role. Docker bootstrap installs the `vector` extension. It has no application tables or embedding records yet. Native setup enables vector if installed for PostgreSQL 17. No unused conversation or recommendation tables are created in advance.

Service roles cannot connect to one another's databases because public CONNECT permission is revoked. The bootstrap role is infrastructure-only. The native test database is separate (`shopai_product_test`), and Redis tests use DB 15.

## Planned ownership

- User: users, roles, user_roles, addresses, refresh token families, audit records.
- Product: existing catalog tables; reviews and review moderation.
- Cart: Redis aggregate plus any later durable snapshot tables if needed; not duplicated as unused SQL carts in Phase 1.
- Inventory: inventory, inventory_reservations, inbox/outbox records.
- Order: orders, order_items, shipments, coupons, saga/inbox/outbox records.
- Payment: payments, refunds, webhook inbox, idempotency records, outbox.
- Notification: notifications, delivery attempts, inbox/outbox records.
- AI: recommendation_history, conversation_history, product/review embedding projections.

Cross-service references are opaque UUIDs validated through APIs/events, not foreign keys spanning independently owned databases. Foreign keys and uniqueness constraints apply inside each owned schema. Prices and money use decimal values with explicit currency. Future writes must maintain `updated_at` and capture audit metadata in the same transaction.
