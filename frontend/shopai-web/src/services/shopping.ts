import { api } from "./api";
import type { Product } from "../types/catalog";

export interface Recommendation {
  product: Product;
  reason: string;
}
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
export interface ChatReply {
  message: string;
  items: Recommendation[];
  suggestions: string[];
  mode: "catalog" | "model";
  filters: { terms: string[]; min_price: number | null; max_price: number | null };
}
export interface Recommendations {
  title: string;
  basis: "browsing" | "catalog" | "complementary";
  items: Recommendation[];
}
export const askAssistant = async (message: string, history: ChatMessage[], signal?: AbortSignal) =>
  (await api.post<ChatReply>("/api/v1/ai/chat", { message, history }, { signal, timeout: 20000 })).data;
export const getRecommendations = async (viewed_ids: string[], context_product_id?: string, signal?: AbortSignal) =>
  (await api.post<Recommendations>("/api/v1/ai/recommendations", { viewed_ids, context_product_id, limit: 4 }, { signal })).data;
