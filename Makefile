SHELL := /bin/bash
ifneq ($(wildcard /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home),)
export JAVA_HOME := /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
endif
.PHONY: env install build up down logs infra native-infra native-up native-down test native-test smoke e2e
env:
	python3 scripts/init-env.py
install:
	npm --prefix frontend/shopai-web ci
	python3 -m venv ai-services/ai-orchestrator/.venv
	ai-services/ai-orchestrator/.venv/bin/python -m pip install -e './ai-services/ai-orchestrator[test]'
build:
	mvn -B -f backend/product-service/pom.xml package -DskipTests
	npm --prefix frontend/shopai-web run build
up: env
	docker compose up --build -d
down:
	docker compose down
logs:
	docker compose logs --tail=100 -f
infra: env
	docker compose up -d postgres redis
native-infra: env
	bash scripts/native-infra.sh
native-up:
	bash scripts/native-apps.sh
native-down:
	bash scripts/native-apps.sh stop
	bash scripts/native-infra.sh stop
test:
	mvn -B -f backend/product-service/pom.xml verify
	ai-services/ai-orchestrator/.venv/bin/python -m pytest ai-services/ai-orchestrator/tests -q
	npm --prefix frontend/shopai-web test
native-test:
	bash scripts/native-test.sh
smoke:
	python3 scripts/smoke.py
e2e:
	npm --prefix frontend/shopai-web run test:e2e
