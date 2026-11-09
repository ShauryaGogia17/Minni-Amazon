# Shopping assistant

Open **Meet your AI** in the navigation or **Ask ShopAI** at the bottom of any page. Try “gift for my dad under ₹2000”, then “he likes coffee”. Replies link to current catalog products and include prices and match reasons. Follow-ups retain recent needs and budgets; **Start a new conversation** resets the conversation. Closing the dialog preserves the conversation until the page is reloaded. Outages show a retry action; an empty match never introduces invented products or over-budget alternatives.

## Runtime

After the one-time installation/build, run `npm run dev` from the outer folder, or `bash scripts/dev.sh` from `shopai`. PostgreSQL, Redis, the Product Service and FastAPI must be available. The frontend proxies both shopping endpoints to FastAPI. Existing AI processes need a restart after Python source or environment changes.

Catalog matching works without an API key. It supports English product/interest keywords, a small synonym dictionary, exclusions, and numeric INR amounts such as `₹2,000`, `under 2k`, and `between 1000 and 2000`. This fallback is a rules-based catalog search rather than a language model. It asks for interests or a budget when those are missing. Recent user messages (up to twelve history messages) are submitted on each turn; start a new conversation to clear earlier constraints.

For model-assisted understanding, add these **server-side** settings to the ignored `shopai/.env`, then restart the AI service:

```dotenv
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4o-mini
```

Never put the key in a `VITE_` variable. No key is bundled in the frontend. The optional [OpenAI Responses API Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) integration extracts needs and numeric constraints, with `store: false`. User conversation text is sent to OpenAI only when configured. Product IDs, details, reasons and prices come from the Product Service, not generated model output. Explicit numeric budgets take precedence over the model. Timeout, refusal, provider failure or invalid output falls back to catalog matching and is labeled accordingly. Live provider calls require an independently configured account/key and are not part of the default local tests.

## Recommendations and data

- Homepage suggestions use up to twenty recently viewed product IDs, stored in browser local storage for thirty days. IDs are sent to the recommendation API to rank the current catalog; the AI service does not persist browsing history or chat sessions. **Reset suggestions** clears local history and restores general picks. Browsing still works when local storage is blocked.
- Product pages show **Goes well with your find**, based on complementary categories, excluding the current product and previously viewed items.
- There is no completed-order service or purchase history yet. These are content-based suggestions; they are not labeled “customers also bought”. That label needs verified co-purchase records when orders are implemented.
- Catalog retrieval is bounded to 480 products per request. This suits the current eight-product development catalog; larger catalogs should use server-side retrieval/ranking. Development prices are INR. Requests have bounded message, history, ID and recommendation limits. Production deployment still needs authentication/quotas before exposing paid model usage publicly.

## API

`POST /api/v1/ai/chat`:

```json
{"message":"he likes coffee","history":[{"role":"user","content":"gift for my dad under ₹2000"}]}
```

Returns `message`, `items` (`product` plus `reason`), `suggestions`, `mode` (`catalog` or `model`) and parsed `filters`.

`POST /api/v1/ai/recommendations`:

```json
{"viewed_ids":["00000000-0000-4000-8000-000000000001"],"limit":4}
```

Add `context_product_id` for complementary suggestions. Returns `title`, `basis` (`catalog`, `browsing` or `complementary`) and `items`. Invalid input returns 422, a missing context product returns 404, and an unavailable catalog returns 503.

## Verification

Run AI tests with `ai-services/ai-orchestrator/.venv/bin/python -m pytest ai-services/ai-orchestrator/tests`, frontend tests with `npm --prefix frontend/shopai-web test`, and the frontend build with `npm --prefix frontend/shopai-web run build`. With the stack running, `make smoke` checks live shopping responses and `make e2e` covers multi-turn gifts, product links, browsing personalization/reset, error retry and the mobile dialog.
