# Deployment preparation

No AWS account, cloud resource, external payment, email integration or domain has been created or verified in Phase 1.

The container boundaries prepare for future ECS/Fargate deployment behind an Application Load Balancer. Gateway and frontend ingress will use HTTPS via ACM, with DNS in Route 53. Use separate RDS PostgreSQL service databases/roles, ElastiCache Redis and Amazon MSK for Kafka. Product uploads belong in S3 with restricted upload policies. Secrets belong in Secrets Manager, never image layers, frontend bundles, checked-in `.env`, or task command arguments.

Before deployment, complete authentication/authorization and trusted service identity propagation; secure webhook verification and idempotency; transactional inventory/order flows; provider sandbox tests; event/outbox recovery; rate limits; origin/CSP policy; tracing/metrics/audit logging; database backup/restore verification; image scanning; resource sizing; and deployment/migration rollback procedures.

Compose's pgvector image uses a bootstrap superuser solely for creating development databases/extensions. Production should use a controlled administrative migration job, distinct runtime roles and managed database networking. Runtime service users should eventually be separated from migration owners. Never deploy the `dev` profile or reuse a database already seeded with development fixtures.

Phase 7 will add OpenTelemetry, Prometheus, Grafana, production logging and hardened pipelines. Phase 8 will provide actual infrastructure definitions and deployment verification. No empty Terraform or AWS configuration is included to imply those phases are complete.
