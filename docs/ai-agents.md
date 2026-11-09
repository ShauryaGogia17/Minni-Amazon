# AI system roadmap

The foundation has a FastAPI process, typed settings/contracts, managed clients, request IDs, health checks and a capability endpoint. The shopping/recommendation extension is now implemented: budget-aware catalog conversations, local browsing personalization, complementary picks, and optional server-side OpenAI intent extraction. See [shopping assistant setup, contracts and limitations](shopping-assistant.md). No AI key is required for rules-based catalog matching. There is no LangGraph graph, purchase-history ranking, or generated product data.

Capabilities and future work:

1. Shopping: budget/preference extraction and catalog retrieval are available; richer specification comparison remains future work.
2. Recommendation: content-based ranking and browser-local history are available; real co-purchase signals, authenticated customer history and embeddings remain future work.
3. Review: summarize only the reviews actually fetched, returning processed counts, positive/negative themes, and common complaints.
4. Support: authenticated owner-only order status and policy retrieval. Never trust an order/customer ID supplied by a model without API authorization.
5. Inventory: admin-only sales/stock insights and validated reorder suggestions. External purchases require explicit administrator approval.

The future LangGraph state will contain authenticated identity context, conversation messages, classified intent, tool results and validated response state. Conditional edges select specialized nodes and a controlled error/human-approval path. Backend authorization is the source of permission; model text cannot grant access.

Tools call service APIs using scoped credentials and propagated identity. The LLM never receives a SQL connection or payment/inventory write capability. Product/review documents are untrusted retrieval content, not instructions. Mutations need structured schemas, allowlisted operations, ownership checks and idempotency. Caches must include identity/authorization context for any private result.

Embedding migrations, RAG document ingestion and authenticated agent tools belong to that future phase. The shopping extension includes optional model configuration and mocked provider tests; real provider verification requires a configured API key. A status card or OpenAPI endpoint alone is not evidence of a completed AI integration.
