import {
  ArrowLeft,
  ArrowRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useCategories, useProducts } from "../hooks/useCatalog";
import { ProductCard } from "../components/products/ProductCard";
import { ProductSkeletons, QueryError } from "../components/common/QueryState";

export function Products() {
  const [params, setParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const categories = useCategories();
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const sort = params.get("sort") || "newest";
  const rawPage = Number(params.get("page") || 0);
  const page =
    Number.isInteger(rawPage) && rawPage >= 0 && rawPage <= 10000 ? rawPage : 0;
  const rawPrice = params.get("maxPrice");
  const maxPrice =
    rawPrice && Number.isFinite(Number(rawPrice)) && Number(rawPrice) >= 0
      ? Number(rawPrice)
      : undefined;
  const featured = params.get("featured") === "true";
  const products = useProducts({
    q,
    category,
    sort,
    page,
    size: 8,
    maxPrice,
    featured,
  });
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }
  return (
    <main className="container catalog-page">
      <div className="catalog-intro">
        <span className="eyebrow">GOOD THINGS START HERE</span>
        <h1>
          {q
            ? `A little search for “${q}”`
            : featured
              ? "The everyday edit."
              : "Find your everyday."}
        </h1>
        <p>A considered collection of things to make life a little better.</p>
      </div>
      <div className="catalog-toolbar">
        <span>
          {products.data
            ? `${products.data.totalElements} good ${products.data.totalElements === 1 ? "find" : "finds"}`
            : "Exploring the catalog…"}
        </span>
        <div>
          <button
            className="filter-toggle button secondary"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
          <label className="sort-label">
            Sort by{" "}
            <select
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="newest">Newest arrivals</option>
              <option value="name">Name: A to Z</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>
      <div className="catalog-layout">
        <aside className={`filters ${filterOpen ? "expanded" : ""}`}>
          <div className="filter-title">
            <SlidersHorizontal size={17} />
            <h2>Make it yours</h2>
          </div>
          <fieldset>
            <legend>Categories</legend>
            <label>
              <input
                type="radio"
                name="category"
                checked={!category}
                onChange={() => update("category", "")}
              />
              All good things
            </label>
            {categories.data?.map((c) => (
              <label key={c.slug}>
                <input
                  type="radio"
                  name="category"
                  checked={category === c.slug}
                  onChange={() => update("category", c.slug)}
                />
                {c.name}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Your budget</legend>
            <label htmlFor="budget">
              {maxPrice === undefined
                ? "Any price"
                : `Under ₹${maxPrice.toLocaleString("en-IN")}`}
            </label>
            <input
              id="budget"
              type="range"
              min="0"
              max="10000"
              step="500"
              value={maxPrice ?? 10000}
              onChange={(e) => update("maxPrice", e.target.value)}
            />
            <div className="range-label">
              <span>₹0</span>
              <span>₹10,000</span>
            </div>
          </fieldset>
          <label className="featured-filter">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) =>
                update("featured", e.target.checked ? "true" : "")
              }
            />
            The everyday edit
          </label>
          <button
            className="text-link reset-filters"
            onClick={() => setParams({})}
          >
            <X size={14} />
            Clear all filters
          </button>
          <div className="sample-note">
            A first look at ShopAI.
            <br />
            You’re browsing development seed products. Purchasing opens in a
            later phase.
          </div>
        </aside>
        <section className="catalog-results" aria-label="Product results">
          {products.isPending ? (
            <ProductSkeletons count={8} />
          ) : products.isError ? (
            <QueryError retry={() => void products.refetch()} />
          ) : products.data.items.length === 0 ? (
            <div className="query-state">
              <Search size={30} />
              <h2>No finds just yet.</h2>
              <p>
                Try a different search or give your filters a little more room.
              </p>
              <button
                className="button secondary"
                onClick={() => setParams({})}
              >
                Explore all products
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.data.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="pagination">
                <button
                  className="button secondary"
                  disabled={page === 0}
                  onClick={() => update("page", String(page - 1))}
                >
                  <ArrowLeft size={15} /> Previous
                </button>
                <span>
                  Page {page + 1} of {products.data.totalPages}
                </span>
                <button
                  className="button secondary"
                  disabled={page + 1 >= products.data.totalPages}
                  onClick={() => update("page", String(page + 1))}
                >
                  Next <ArrowRight size={15} />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
