export interface Category {
  slug: string;
  name: string;
}
export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  currency: string;
  category: Category;
  featured: boolean;
  images: string[];
  specifications: Record<string, string>;
}
export interface ProductPage {
  items: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export interface CatalogFilters {
  q?: string;
  category?: string;
  sort?: string;
  page?: number;
  size?: number;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}
export interface Capabilities {
  phase: number;
  llm_enabled: boolean;
  message: string;
  agents: {
    id: string;
    name: string;
    available: boolean;
    planned_phase: number;
  }[];
}
