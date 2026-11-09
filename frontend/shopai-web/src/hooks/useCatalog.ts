import { useQuery } from "@tanstack/react-query";
import { getCategories, getProduct, getProducts } from "../services/products";
import type { CatalogFilters } from "../types/catalog";
export const useProducts = (filters: CatalogFilters = {}) =>
  useQuery({
    queryKey: ["products", filters],
    queryFn: ({ signal }) => getProducts(filters, signal),
  });
export const useProduct = (id: string) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: ({ signal }) => getProduct(id, signal),
  });
export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => getCategories(signal),
  });
