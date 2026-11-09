import { api } from "./api";
import type {
  Capabilities,
  CatalogFilters,
  Category,
  Product,
  ProductPage,
} from "../types/catalog";
export const getProducts = async (
  filters: CatalogFilters = {},
  signal?: AbortSignal,
) =>
  (await api.get<ProductPage>("/api/v1/products", { params: filters, signal }))
    .data;
export const getProduct = async (id: string, signal?: AbortSignal) =>
  (
    await api.get<Product>(`/api/v1/products/${encodeURIComponent(id)}`, {
      signal,
    })
  ).data;
export const getCategories = async (signal?: AbortSignal) =>
  (await api.get<Category[]>("/api/v1/categories", { signal })).data;
export const getCapabilities = async () =>
  (await api.get<Capabilities>("/api/v1/ai/capabilities")).data;
