# Phase 1 file manifest

All **86** source/configuration/documentation files below were created in the initially empty `shopai/` repository, including the later yellow-and-white UI refinement. Paths are relative to this repository root; each link opens the actual file.

The root is `/Users/shauryagogia17/Desktop/Coding/minni amazon /shopai`. Complete implementation source is in the linked files rather than duplicated as a chat code dump.

## Repository configuration

- [.dockerignore](../.dockerignore) — Exclude generated files and local environments from image build contexts.
- [.env.example](../.env.example) — Document local configuration without real secrets.
- [.github/workflows/ci.yml](../.github/workflows/ci.yml) — GitHub Actions build, container integration and browser check workflow.
- [.gitignore](../.gitignore) — Exclude secrets, environments, runtime data, logs and build products.
- [Makefile](../Makefile) — Provide installation, build, test, startup and shutdown commands.
- [README.md](../README.md) — Project scope, architecture diagrams, setup, API, tests and troubleshooting.
- [docker-compose.yml](../docker-compose.yml) — Healthy, networked five-service local foundation with named volumes.

## Product Service — Java application, persistence and tests

- [backend/product-service/.dockerignore](../backend/product-service/.dockerignore) — Exclude generated files and local environments from image build contexts.
- [backend/product-service/Dockerfile](../backend/product-service/Dockerfile) — Build and run this implemented service as a non-root container.
- [backend/product-service/pom.xml](../backend/product-service/pom.xml) — Java 21 / Spring Boot dependencies and executable packaging.
- [backend/product-service/src/main/java/com/shopai/product/ProductApplication.java](../backend/product-service/src/main/java/com/shopai/product/ProductApplication.java) — Spring Boot application entry point.
- [backend/product-service/src/main/java/com/shopai/product/api/ApiExceptionHandler.java](../backend/product-service/src/main/java/com/shopai/product/api/ApiExceptionHandler.java) — Safe HTTP Problem Details for catalog request errors.
- [backend/product-service/src/main/java/com/shopai/product/api/CatalogController.java](../backend/product-service/src/main/java/com/shopai/product/api/CatalogController.java) — Validated read-only catalog HTTP endpoints.
- [backend/product-service/src/main/java/com/shopai/product/api/CatalogDtos.java](../backend/product-service/src/main/java/com/shopai/product/api/CatalogDtos.java) — Immutable public response contracts.
- [backend/product-service/src/main/java/com/shopai/product/application/CatalogService.java](../backend/product-service/src/main/java/com/shopai/product/application/CatalogService.java) — Transactional product lookup, query filters, sorting and caching.
- [backend/product-service/src/main/java/com/shopai/product/config/CacheConfig.java](../backend/product-service/src/main/java/com/shopai/product/config/CacheConfig.java) — Redis cache namespace, TTL and PostgreSQL fallback policy.
- [backend/product-service/src/main/java/com/shopai/product/config/CorrelationFilter.java](../backend/product-service/src/main/java/com/shopai/product/config/CorrelationFilter.java) — Sanitize and propagate request correlation identifiers.
- [backend/product-service/src/main/java/com/shopai/product/config/SecurityConfig.java](../backend/product-service/src/main/java/com/shopai/product/config/SecurityConfig.java) — Read-only route authorization and explicit CORS origins.
- [backend/product-service/src/main/java/com/shopai/product/domain/Category.java](../backend/product-service/src/main/java/com/shopai/product/domain/Category.java) — Persistent catalog category.
- [backend/product-service/src/main/java/com/shopai/product/domain/CategoryRepository.java](../backend/product-service/src/main/java/com/shopai/product/domain/CategoryRepository.java) — JPA category access.
- [backend/product-service/src/main/java/com/shopai/product/domain/Product.java](../backend/product-service/src/main/java/com/shopai/product/domain/Product.java) — Persistent product aggregate and catalog attributes.
- [backend/product-service/src/main/java/com/shopai/product/domain/ProductRepository.java](../backend/product-service/src/main/java/com/shopai/product/domain/ProductRepository.java) — JPA product access and specification queries.
- [backend/product-service/src/main/resources/application-dev.yml](../backend/product-service/src/main/resources/application-dev.yml) — Explicitly enable development fixtures.
- [backend/product-service/src/main/resources/application.yml](../backend/product-service/src/main/resources/application.yml) — Database, Redis, validation, health and logging configuration.
- [backend/product-service/src/main/resources/db/dev/R__development_catalog.sql](../backend/product-service/src/main/resources/db/dev/R__development_catalog.sql) — Idempotent, opt-in development catalog fixtures.
- [backend/product-service/src/main/resources/db/migration/V1__catalog.sql](../backend/product-service/src/main/resources/db/migration/V1__catalog.sql) — Create catalog tables, constraints, foreign keys and indexes.
- [backend/product-service/src/test/java/com/shopai/product/CatalogIntegrationTest.java](../backend/product-service/src/test/java/com/shopai/product/CatalogIntegrationTest.java) — Real database/cache/security tests with native or Testcontainers dependencies.
- [backend/product-service/src/test/java/com/shopai/product/CatalogServiceTest.java](../backend/product-service/src/test/java/com/shopai/product/CatalogServiceTest.java) — Unit tests for invalid filters and missing products.

## AI foundation — FastAPI configuration, probes and tests

- [ai-services/ai-orchestrator/.dockerignore](../ai-services/ai-orchestrator/.dockerignore) — Exclude generated files and local environments from image build contexts.
- [ai-services/ai-orchestrator/Dockerfile](../ai-services/ai-orchestrator/Dockerfile) — Build and run this implemented service as a non-root container.
- [ai-services/ai-orchestrator/app/__init__.py](../ai-services/ai-orchestrator/app/__init__.py) — Define and describe the Python package.
- [ai-services/ai-orchestrator/app/config.py](../ai-services/ai-orchestrator/app/config.py) — Typed, server-only settings with secret-safe fields.
- [ai-services/ai-orchestrator/app/schemas/__init__.py](../ai-services/ai-orchestrator/app/schemas/__init__.py) — Define and describe the Python package.
- [ai-services/ai-orchestrator/app/schemas/health.py](../ai-services/ai-orchestrator/app/schemas/health.py) — Validated health and agent capability response schemas.
- [ai-services/ai-orchestrator/app/services/__init__.py](../ai-services/ai-orchestrator/app/services/__init__.py) — Define and describe the Python package.
- [ai-services/ai-orchestrator/app/services/readiness.py](../ai-services/ai-orchestrator/app/services/readiness.py) — Concurrent, bounded dependency probes.
- [ai-services/ai-orchestrator/main.py](../ai-services/ai-orchestrator/main.py) — FastAPI application, lifecycle, public health and capability endpoints.
- [ai-services/ai-orchestrator/pyproject.toml](../ai-services/ai-orchestrator/pyproject.toml) — Python package requirements, test extras and pytest configuration.
- [ai-services/ai-orchestrator/tests/test_api.py](../ai-services/ai-orchestrator/tests/test_api.py) — FastAPI endpoint, availability and failure-state tests.
- [ai-services/ai-orchestrator/tests/test_readiness.py](../ai-services/ai-orchestrator/tests/test_readiness.py) — Dependency failure handling tests.

## Storefront — React application, styling, integration and tests

- [frontend/shopai-web/.dockerignore](../frontend/shopai-web/.dockerignore) — Exclude generated files and local environments from image build contexts.
- [frontend/shopai-web/Dockerfile](../frontend/shopai-web/Dockerfile) — Build and run this implemented service as a non-root container.
- [frontend/shopai-web/e2e/catalog.spec.ts](../frontend/shopai-web/e2e/catalog.spec.ts) — Actual desktop/mobile catalog browser journeys.
- [frontend/shopai-web/index.html](../frontend/shopai-web/index.html) — Accessible document shell, metadata and frontend entry.
- [frontend/shopai-web/nginx.conf](../frontend/shopai-web/nginx.conf) — Same-origin API proxy, SPA fallback and response headers.
- [frontend/shopai-web/package-lock.json](../frontend/shopai-web/package-lock.json) — Resolved frontend dependency lockfile.
- [frontend/shopai-web/package.json](../frontend/shopai-web/package.json) — Frontend dependency and command definitions.
- [frontend/shopai-web/playwright.config.ts](../frontend/shopai-web/playwright.config.ts) — Browser checks against local Vite or an explicit running stack.
- [frontend/shopai-web/public/favicon.svg](../frontend/shopai-web/public/favicon.svg) — Original ShopAI browser icon.
- [frontend/shopai-web/public/fonts/dm-sans-license.txt](../frontend/shopai-web/public/fonts/dm-sans-license.txt) — Preserve the self-hosted DM Sans font attribution and Open Font License.
- [frontend/shopai-web/src/App.tsx](../frontend/shopai-web/src/App.tsx) — Customer routes, layout and assistant dialog state.
- [frontend/shopai-web/src/components/chatbot/AssistantDialog.tsx](../frontend/shopai-web/src/components/chatbot/AssistantDialog.tsx) — Live capability lookup and honest planned-agent presentation.
- [frontend/shopai-web/src/components/common/QueryState.tsx](../frontend/shopai-web/src/components/common/QueryState.tsx) — Loading and retryable error states.
- [frontend/shopai-web/src/components/footer/Footer.tsx](../frontend/shopai-web/src/components/footer/Footer.tsx) — Working footer navigation and development disclosure.
- [frontend/shopai-web/src/components/navbar/Navbar.tsx](../frontend/shopai-web/src/components/navbar/Navbar.tsx) — Navigation, validated search and responsive menu.
- [frontend/shopai-web/src/components/products/ProductCard.test.tsx](../frontend/shopai-web/src/components/products/ProductCard.test.tsx) — Catalog card accessibility, route and price tests.
- [frontend/shopai-web/src/components/products/ProductCard.tsx](../frontend/shopai-web/src/components/products/ProductCard.tsx) — API-supplied product imagery, pricing and detail link.
- [frontend/shopai-web/src/hooks/useCatalog.ts](../frontend/shopai-web/src/hooks/useCatalog.ts) — Cached, cancellable React catalog queries.
- [frontend/shopai-web/src/main.tsx](../frontend/shopai-web/src/main.tsx) — React entry with routing and TanStack Query.
- [frontend/shopai-web/src/pages/Home.tsx](../frontend/shopai-web/src/pages/Home.tsx) — Storefront discovery homepage using real catalog requests.
- [frontend/shopai-web/src/pages/ProductDetails.tsx](../frontend/shopai-web/src/pages/ProductDetails.tsx) — Database-backed product details and specifications.
- [frontend/shopai-web/src/pages/Products.test.tsx](../frontend/shopai-web/src/pages/Products.test.tsx) — UI query parameter and API-failure tests.
- [frontend/shopai-web/src/pages/Products.tsx](../frontend/shopai-web/src/pages/Products.tsx) — URL-based search, category/budget filters, sorting and pagination.
- [frontend/shopai-web/src/pages/Status.tsx](../frontend/shopai-web/src/pages/Status.tsx) — Live service readiness and planned capability status.
- [frontend/shopai-web/src/services/api.ts](../frontend/shopai-web/src/services/api.ts) — Shared bounded-timeout Axios client.
- [frontend/shopai-web/src/services/products.ts](../frontend/shopai-web/src/services/products.ts) — Typed catalog and AI capability API methods.
- [frontend/shopai-web/src/styles.css](../frontend/shopai-web/src/styles.css) — Responsive original ShopAI design system.
- [frontend/shopai-web/src/test-setup.ts](../frontend/shopai-web/src/test-setup.ts) — React DOM test setup and cleanup.
- [frontend/shopai-web/src/types/catalog.ts](../frontend/shopai-web/src/types/catalog.ts) — Frontend API contract types.
- [frontend/shopai-web/src/utils/currency.ts](../frontend/shopai-web/src/utils/currency.ts) — INR/currency display formatter.
- [frontend/shopai-web/tsconfig.json](../frontend/shopai-web/tsconfig.json) — Strict TypeScript compilation configuration.
- [frontend/shopai-web/vite.config.ts](../frontend/shopai-web/vite.config.ts) — React/Tailwind integration, development proxies and Vitest configuration.

## Infrastructure and local development tools

- [infrastructure/postgres/01-create-databases.sh](../infrastructure/postgres/01-create-databases.sh) — Create separated database owners and enable AI pgvector.
- [scripts/init-env.py](../scripts/init-env.py) — Create mode-600 local secrets without overwriting existing settings.
- [scripts/native-apps.sh](../scripts/native-apps.sh) — Start/stop native services with per-process logs and a separate runtime JAR.
- [scripts/native-infra.sh](../scripts/native-infra.sh) — Start/stop an isolated native PostgreSQL cluster and private Redis.
- [scripts/native-test.sh](../scripts/native-test.sh) — Run the native integration, Python and React suites.
- [scripts/smoke.py](../scripts/smoke.py) — Verify the live same-origin catalog and dependency-health path.

## Project documentation

- [docs/ai-agents.md](../docs/ai-agents.md) — Honest AI foundation scope and five-agent implementation plan.
- [docs/api-documentation.md](../docs/api-documentation.md) — Exact Phase 1 endpoints, parameters, responses and error behavior.
- [docs/architecture.md](../docs/architecture.md) — Current and future service boundaries, lifecycle and security limits.
- [docs/database-schema.md](../docs/database-schema.md) — Implemented schema and planned database ownership.
- [docs/deployment-guide.md](../docs/deployment-guide.md) — Future AWS mapping and explicit deployment prerequisites.
- [docs/files.md](../docs/files.md) — This complete inventory of created source/configuration/documentation files.
- [docs/phase-1.md](../docs/phase-1.md) — Phase objective, created directory map, executed results and checklist.
- [docs/setup-guide.md](../docs/setup-guide.md) — Exact Docker/native setup, individual service and shutdown commands.

## Generated local artifacts

- `.env`: generated local credentials, mode 0600; ignored and never included in this manifest’s source links.
- `.local/`: isolated native PostgreSQL/Redis data, private Redis configuration, PIDs, runtime JAR, logs and QA screenshots; ignored.
- `backend/product-service/target/`: executable JAR, compiled classes and actual Surefire test reports; ignored.
- `frontend/shopai-web/node_modules/`, `dist/`, `tsconfig.tsbuildinfo`, and `test-results/`: installed dependencies, production bundle, compiler cache and browser traces; ignored.
- `ai-services/ai-orchestrator/.venv/`, Python caches, pytest cache and editable-package metadata: local runtime outputs; ignored.
- `.git/`: initialized local repository metadata; no remote configured, no commit or push performed.
- Docker named volumes `shopai_postgres-data` and `shopai_redis-data`: persistent container data, outside the source tree.
- Colima profile `shopai` and Docker CLI plugin links: local verification runtime setup, outside the source tree.

Reserved empty future-phase directories are enumerated in [phase-1.md](phase-1.md). They intentionally have no placeholder source files.
