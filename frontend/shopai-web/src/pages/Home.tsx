import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Backpack,
  Compass,
  Headphones,
  House,
  Leaf,
  Mountain,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCategories, useProducts } from "../hooks/useCatalog";
import { ProductCard } from "../components/products/ProductCard";
import { ProductSkeletons, QueryError } from "../components/common/QueryState";
import { currency } from "../utils/currency";
import { RecommendationSection } from "../components/products/RecommendationSection";

const categoryIcons = {
  electronics: Headphones,
  everyday: Backpack,
  "home-living": House,
  outdoors: Mountain,
};

export function Home({ openAssistant }: { openAssistant: () => void }) {
  const products = useProducts({ size: 4, featured: true, sort: "name" });
  const hero = useProducts({ size: 1, q: "headphones" });
  const categories = useCategories();
  const featured = hero.data?.items[0];
  return (
    <>
      <main className="container home">
        <div className="page-intro">
          <span>
            <span className="live-dot" /> THE EVERYDAY, REIMAGINED
          </span>
          <span>Thoughtfully chosen. Effortlessly discovered.</span>
        </div>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-label">
              <Sparkles size={14} /> A LITTLE INTELLIGENCE. A LOT OF
              POSSIBILITY.
            </div>
            <h1 id="hero-title">
              Good finds.
              <br />
              Better <span>everyday.</span>
            </h1>
            <p>
              Discover things you’ll love, for the life you live.
              <br className="desktop-break" /> Thoughtful essentials. Fresh
              perspectives. All in one place.
            </p>
            <div className="hero-actions">
              <Link className="button primary" to="/products">
                Find your everyday <ArrowUpRight size={18} />
              </Link>
              <Link className="hero-secondary" to="/products?featured=true">
                Explore the edit <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-footnote">
              <span className="mini-sparkle">
                <Sparkles size={13} />
              </span>{" "}
              A smarter shopping experience is taking shape.
            </div>
          </div>
          <div className="hero-visual">
            <span className="hero-orbit orbit-one" />
            <span className="hero-orbit orbit-two" />
            <span className="visual-caption">
              LESS NOISE.
              <br />
              MORE YOU.
            </span>
            <div className="hero-photo">
              {featured && (
                <img
                  src={featured.images[0]}
                  alt={featured.name}
                  fetchPriority="high"
                />
              )}
            </div>
            <span className="hero-sticker">
              <AudioLines size={22} />
              <span>
                YOUR WORLD.
                <br />
                <strong>YOUR SOUND.</strong>
              </span>
            </span>
            {featured && (
              <Link to={`/products/${featured.id}`} className="hero-product">
                <span>
                  <small>THE SOUND OF A BETTER DAY</small>
                  <strong>{featured.name}</strong>
                  <span>{currency(featured.price, featured.currency)}</span>
                </span>
                <span className="round-arrow">
                  <ArrowUpRight size={23} />
                </span>
              </Link>
            )}
            <span className="hero-edition">THE EVERYDAY COLLECTION — 01</span>
          </div>
        </section>
        <div className="values-strip">
          <div>
            <Compass />
            <span>
              <strong>Considered, not complicated</strong>
              <small>A fresh perspective on everyday essentials</small>
            </span>
          </div>
          <div>
            <Leaf />
            <span>
              <strong>Less scrolling. More discovering.</strong>
              <small>Explore products by what matters to you</small>
            </span>
          </div>
          <div>
            <ShieldCheck />
            <span>
              <strong>Clarity comes first</strong>
              <small>Product details, all in one place</small>
            </span>
          </div>
        </div>
        <section className="categories-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND YOUR KIND OF GOOD</span>
              <h2>A little something for every day.</h2>
            </div>
            <Link to="/products" className="text-link">
              Explore all <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="category-grid">
            <Link to="/products" className="category-tile category-all">
              <span className="category-symbol">
                <Package size={26} />
              </span>
              <span>
                All good things<small>The complete collection</small>
              </span>
              <ArrowUpRight size={19} />
            </Link>
            {categories.data?.map((category) => {
              const Icon =
                categoryIcons[category.slug as keyof typeof categoryIcons] ||
                Package;
              return (
                <Link
                  key={category.slug}
                  to={`/products?category=${category.slug}`}
                  className="category-tile"
                >
                  <span className="category-symbol">
                    <Icon />
                  </span>
                  <span>
                    {category.name}
                    <small>Discover the collection</small>
                  </span>
                  <ArrowUpRight size={19} />
                </Link>
              );
            })}
          </div>
          {categories.isError && (
            <p className="muted">
              Categories are unavailable.{" "}
              <Link to="/status">Check service status.</Link>
            </p>
          )}
        </section>
        <section className="edit-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE EVERYDAY EDIT</span>
              <h2>Small upgrades. Big difference.</h2>
              <p>
                Meet a few things that make the ordinary feel a little better.
              </p>
            </div>
            <Link to="/products?featured=true" className="text-link">
              Shop the edit <ArrowUpRight size={17} />
            </Link>
          </div>
          {products.isPending ? (
            <ProductSkeletons />
          ) : products.isError ? (
            <QueryError retry={() => void products.refetch()} />
          ) : products.data.items.length ? (
            <div className="product-grid">
              {products.data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="query-state">
              No featured products yet.{" "}
              <Link to="/products">Browse the catalog</Link>.
            </div>
          )}
        </section>
        <RecommendationSection />
        <section className="discovery-banner">
          <div className="discovery-copy">
            <span className="eyebrow">
              <Sparkles size={14} /> FIND YOUR NEXT FAVORITE
            </span>
            <h2>
              Your taste.
              <br />A little AI magic.
            </h2>
            <p>
              Tell us what you have in mind and what you’d like to spend.
              Your shopping sidekick will find real options from our catalog.
            </p>
            <button className="button primary" onClick={openAssistant}>
              Meet your shopping sidekick <ArrowUpRight size={17} />
            </button>
            <span className="banner-note">
              Your needs. Your budget. A few thoughtful suggestions.
            </span>
          </div>
          <div className="discovery-art">
            <img
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=85"
              loading="lazy"
              alt="A bright, thoughtfully arranged workspace with natural light"
            />
            <span className="discovery-tag">
              <Sparkles size={17} /> A little more you.
            </span>
          </div>
        </section>
        <div className="end-note">
          <span>Made for the way you live.</span>
          <Link to="/products">
            Discover your next good thing <ArrowRight size={17} />
          </Link>
          <ArrowDown size={20} />
        </div>
      </main>
    </>
  );
}
