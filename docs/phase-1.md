# Phase 1 — foundation

## Objective and implementation

Create a maintainable local foundation with a real frontend-to-database catalog path, Redis caching, AI service health, and Docker packaging. Source is written directly into this repository. See the [README](../README.md) for both current/target architecture diagrams, [files](files.md) for every source path, [setup](setup-guide.md) for exact commands and common runtime fixes, [schema](database-schema.md) for migrations, and [API reference](api-documentation.md) for request/response contracts.

Complete directory structure created locally:

```text
frontend/shopai-web/
  public/ src/assets/ src/components/{common,navbar,footer,products,cart,checkout,chatbot,admin}/
  src/pages/admin/ src/layouts/ src/hooks/ src/context/ src/services/ src/types/ src/utils/
backend/
  api-gateway/ user-service/ product-service/ cart-service/ order-service/
  inventory-service/ payment-service/ notification-service/
ai-services/ai-orchestrator/
  app/{agents,graph,tools,services,api,schemas}/ tests/
infrastructure/{docker,kafka,postgres,redis,monitoring,aws}/
docs/ scripts/ .github/workflows/
```

Only reached implementation areas contain files. Empty directories are retained locally and described here rather than padded with hundreds of placeholders.

## Configuration and installation

The checked-in `.env.example` documents local variables. `make env` creates a private `.env`; no credentials are needed from a human. `make install` installs Node dependencies and a Python venv. `make build` produces a Java 21 executable JAR and a compiled React bundle. Docker compiles everything internally with `docker compose up --build`.

## Database changes

PostgreSQL bootstrap establishes isolated Product and AI roles/databases and AI pgvector support. Flyway V1 creates the four catalog tables and indexes; opt-in development fixtures add eight products/four categories. Redis uses expiring catalog keys. No authoritative inventory/payment or customer identity is fabricated.

## Verification

Actual command results are recorded here after execution. Do not interpret the existence of test files, Compose configuration or GitHub Actions as evidence they have run.

Verified locally on **30 October 2026 (Asia/Kolkata)**:

- `bash scripts/native-test.sh`: **13 Java tests passed**, zero failures/errors/skips, using the separate native PostgreSQL test database and Redis DB 15; **4 Python tests passed**; **3 React tests passed**.
- `DOCKER_HOST=unix:///Users/shauryagogia17/.colima/shopai/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock make test`: the same **13 Java tests passed against fresh Testcontainers PostgreSQL/Redis containers**, followed by the Python/React suites. This verifies both supported dependency paths.
- `npm --prefix frontend/shopai-web run build`: TypeScript compilation and Vite production bundling passed. Native Java packaging also passed.
- `docker compose config --quiet`: configuration validated. `docker compose up --build -d --wait --wait-timeout 240`: **all five services healthy**. Java, Python and frontend images built successfully; image packaging skips tests because the separately executed suites are the verification gate.
- `python3 scripts/smoke.py`: **passed against both native services and the Compose stack**, including the frontend reverse proxy, real product records/details/categories, query validation, and actual PostgreSQL/Redis/AI readiness.
- `SHOPAI_E2E_BASE_URL=http://127.0.0.1:5173 npm --prefix frontend/shopai-web run test:e2e`: **2 browser tests passed against the containerized app**, covering search, product details, sorting, category filtering, mobile navigation, no horizontal overflow, AI capability reporting and service status. Both browser tests also passed against native services.
- Desktop (1440px) and mobile (390px) screenshots were visually inspected. All six homepage images loaded in the live check. Screenshots are local QA output under ignored `.local/`.
- Redis was deliberately stopped: catalog reads remained **200 via PostgreSQL**, while Product and AI readiness correctly became **503**. Redis was restored and the smoke check passed again.
- Direct database connection checks confirmed that Product and AI roles **cannot connect to one another's databases**. Docker AI database reports **pgvector 0.8.7**.
- Generated `.env` permissions are **0600**; the compiled frontend bundle contains none of the configured server passwords.

There are **22 distinct passing automated tests** (13 Java + 4 Python + 3 React + 2 browser), plus live smoke, failure-recovery, isolation and secret-handling checks. Repeated native/container runs are not counted as additional distinct tests.

Local runtimes installed for this verification: Java 21, Maven, PostgreSQL 17, Redis, pgvector, Docker CLI/Compose/Buildx, and an isolated Colima profile named `shopai`. The Docker stack remains available at `http://localhost:5173`; native verification processes were stopped before switching to Compose. Stop it with `docker compose down`; stop the dedicated engine with `colima stop --profile shopai` if desired. No remote GitHub repository, remote CI run or cloud deployment was created.

One non-failing upstream deprecation warning appears in the Python TestClient suite about HTTPX usage in the installed Starlette version. Model/provider/auth/payment tests are not claimed because those features belong to later phases.

Failures discovered and resolved before completion: a Spring CORS bean naming/wiring issue, npm 10 peer resolution failure (tooling aligned and lockfile generated with npm 11), a desktop menu CSS specificity issue, async controlled-radio assertions in browser tests, and a native runtime JAR being replaced during a concurrent Maven rebuild. Native startup now copies the executable JAR to a separate runtime path. Final checks above passed after those corrections.

## Expected output and common fixes

After startup, homepage product cards are API-backed, catalog search/filter/sort changes request parameters, details show database specifications, and `/status` reflects dependency readiness. The AI dialog lists five unavailable planned agents. On an unavailable backend the UI exposes a retryable error; it does not substitute sample arrays.

Use Java 21 rather than the system Java 8; start an actual Docker engine rather than merely installing its CLI; free conflicting loopback ports; preserve the database password that was used to initialize a volume; and use the explicit development profile to load seed products. See setup/README troubleshooting for commands.

## Completion checklist

- [x] Inspect the original empty workspace before writing.
- [x] Create directory map and only implemented source files.
- [x] Configure React/TypeScript/Vite/Tailwind and real API reads.
- [x] Implement read-only Product Service, JPA, migrations and cache.
- [x] Configure separate PostgreSQL roles/databases and Redis.
- [x] Implement honest FastAPI foundation and dependency checks.
- [x] Write service/frontend Dockerfiles and Compose configuration.
- [x] Add automated tests, smoke checks, CI and documentation.
- [x] Record final executed build/test/runtime results, with no failing required checks.

## Next phase

Phase 2: User Service, registration/login, JWT/refresh rotation and role enforcement, admin product CRUD, richer search/filtering and frontend integration. No Phase 2 work is started in this delivery.

## Yellow-and-white UI refinement — 30 October 2026

Applied the requested professional yellow-and-white identity across the storefront, catalog, details, status page, AI dialog, filters and footer. The shared design tokens use sunshine yellow (`#ffd43b`), white, warm cream and charcoal text. Typography now uses self-hosted DM Sans, with larger body text, clearer headings, stronger contrast, consistent rounded surfaces, bordered product cards and keyboard focus states. The homepage has a refreshed hero, accurate category icons, a second working collection link and a brighter editorial photograph. Navigation now identifies the selected catalog/edit route correctly.

Modified files:

- `frontend/shopai-web/src/styles.css` — shared colors, typography, components, responsive breakpoints and reduced-motion support.
- `frontend/shopai-web/src/pages/Home.tsx` — hero actions, category icons and editorial photograph.
- `frontend/shopai-web/src/components/navbar/Navbar.tsx` — updated branding/announcement and route-aware selected navigation.
- `frontend/shopai-web/src/components/footer/Footer.tsx` — matching yellow brand mark.
- `frontend/shopai-web/src/main.tsx` — import the self-hosted font.
- `frontend/shopai-web/public/favicon.svg` and `frontend/shopai-web/index.html` — yellow icon and browser theme color.
- `frontend/shopai-web/package.json` and `frontend/shopai-web/package-lock.json` — resolved DM Sans font dependency.
- `docs/files.md` and this report — source inventory and refinement record.

Created `frontend/shopai-web/public/fonts/dm-sans-license.txt` to retain the font attribution and license in the served build. All 86 source files are listed in the updated manifest.

Validation: production TypeScript/Vite build passed; all **3 React tests and 2 Playwright tests passed**; the rebuilt frontend container is healthy; live API smoke checks passed. Responsive checks at **320, 390, 768, 1024 and 1440 pixels** found no horizontal page or hero-heading overflow. Desktop/mobile homepage and catalog screenshots were inspected; QA output is under ignored `.local/yellow-*.png`. Existing backend services and stored catalog records were preserved. A font stylesheet import mismatch was caught by the first build and corrected before the successful builds above.
