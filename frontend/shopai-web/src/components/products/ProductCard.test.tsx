import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ProductCard } from "./ProductCard";
import type { Product } from "../../types/catalog";
const product: Product = {
  id: "test",
  name: "Test headphones",
  brand: "FORM",
  price: 7990,
  currency: "INR",
  category: { slug: "electronics", name: "Electronics" },
  description: "Test fixture",
  featured: true,
  images: ["/test.jpg"],
  specifications: {},
};
describe("Product card", () => {
  it("links actual product data to its detail route with INR pricing", () => {
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/products/test");
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Test headphones");
    expect(screen.getByText("₹7,990")).toBeInTheDocument();
  });
});
