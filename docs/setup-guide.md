# Local setup

## Docker (recommended portable path)

Install Docker Desktop or Docker Engine with Compose v2. On macOS a compatible alternative is the Docker CLI plus Colima and the Compose plugin. Do not run both engines simultaneously by accident; inspect `docker context show`.

From the repository root:

```bash
python3 scripts/init-env.py
docker compose config --quiet
docker compose up --build -d --wait --wait-timeout 240
make smoke
```

Compose starts only implemented Phase 1 services: PostgreSQL/pgvector, Redis, Product Service, AI foundation, frontend. Kafka and later services are intentionally not dummy containers. Docker health gates control startup ordering. Ports 5173, 8081, 8000, 5432 and 6379 bind to loopback; named volumes persist PostgreSQL and Redis.

## Native macOS setup

```bash
brew install openjdk@21 maven postgresql@17 redis pgvector
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/postgresql@17/bin:$JAVA_HOME/bin:$PATH"
```

Use the equivalent JDK/PostgreSQL paths on Intel macOS or Linux. Install Node 22.12+ and Python 3.12+ using your existing runtime manager. The supplied scripts select the Apple Silicon Homebrew Java path without changing global shell configuration.

```bash
make env
make install
make native-infra
make build
make native-up
make smoke
```

`native-infra` creates its own password-protected cluster in `.local/postgres`, adds separate service/test database roles, and starts Redis using a mode-600 config under `.local/`. It does not register login services. `.env` values are loaded only by explicit local scripts; Spring Boot does not automatically read a root `.env` when run manually.

After installing and building once, run `npm run dev` from the outer `minni amazon ` folder, or `bash scripts/dev.sh` from this repository. This starts native infrastructure and the backend services, waits for their readiness checks, and then runs Vite in the foreground. Ctrl+C stops Vite; use `make native-down` from this repository to stop the background services as well. This avoids Vite proxy `ECONNREFUSED` errors when the APIs have not been started.

### Individual service terminals

First start infrastructure. In each terminal, enter the repository root and export settings:

```bash
set -a
source .env
set +a
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
```

Product:

```bash
mvn -f backend/product-service/pom.xml spring-boot:run
```

AI:

```bash
cd ai-services/ai-orchestrator
.venv/bin/uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd frontend/shopai-web
npm run dev
```

Vite proxies to 8081/8000 by default. Change `PRODUCT_SERVICE_URL` and `AI_SERVICE_URL` in the frontend process environment if using other ports. Native startup scripts derive the AI proxy URL from `AI_PORT`; keep `PRODUCT_SERVICE_URL` in `.env` aligned with `PRODUCT_PORT`.

## Tests

```bash
make native-test  # only after native-infra; isolated test DB and Redis DB 15
make e2e         # real APIs must be running; local Google Chrome required
```

To test a running Compose stack without launching Vite, run `SHOPAI_E2E_BASE_URL=http://127.0.0.1:5173 make e2e`. CI uses this setting after starting the containers.

Without native infrastructure, `make test` uses Testcontainers, requiring a reachable Docker daemon. The integration test selects external dependencies only when `SHOPAI_TEST_DB_URL` is explicitly set. Never point that variable at production data.

If using Colima instead of Docker Desktop, point Testcontainers at the active Docker context before `make test`:

```bash
export DOCKER_HOST="$(docker context inspect --format '{{.Endpoints.docker.Host}}')"
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
make test
```

## Stop

```bash
make native-down
# or for Docker:
docker compose down
```

Logs are under `.local/` for native mode and `docker compose logs` for Docker. Stop the native stack before starting Compose on the same ports. Generated local databases/secrets/builds are ignored by Git.
