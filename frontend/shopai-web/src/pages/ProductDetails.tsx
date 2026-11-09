import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Package,
  Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useProduct } from "../hooks/useCatalog";
import { QueryError } from "../components/common/QueryState";
import { currency } from "../utils/currency";
import { useEffect } from "react";
import { recordProductView } from "../hooks/useBrowsingHistory";
import { RecommendationSection } from "../components/products/RecommendationSection";
export function ProductDetails({
  openAssistant,
}: {
  openAssistant: () => void;
}) {
  const { id = "" } = useParams();
  const product = useProduct(id);
  useEffect(() => { if (product.data) recordProductView(product.data.id); }, [product.data?.id]);
  return (
    <main className="container detail-page">
      <Link to="/products" className="text-link">
        <ArrowLeft size={16} />
        Back to all good things
      </Link>
      {product.isPending ? (
        <div className="query-state" role="status">
          Finding your good thing…
        </div>
      ) : product.isError ? (
        <QueryError retry={() => void product.refetch()} />
      ) : (
        <div className="detail-grid">
          <div className="detail-image">
            <img
              src={product.data.images[0] || "/favicon.svg"}
              alt={product.data.name}
            />
          </div>
          <div className="detail-info">
            <span className="eyebrow">
              {product.data.brand} / {product.data.category.name}
            </span>
            <h1>{product.data.name}</h1>
            <p className="detail-price">
              {currency(product.data.price, product.data.currency)}
            </p>
            <p className="detail-description">{product.data.description}</p>
            <div className="product-development">
              <Package size={20} />
              <div>
                <strong>A first look at what’s to come.</strong>
                <p>
                  This is a development catalog product. Stock and checkout will
                  be connected in Phase 3.
                </p>
              </div>
            </div>
            <Link
              className="button primary"
              to={`/products?category=${product.data.category.slug}`}
            >
              Explore the collection <ArrowUpRight size={17} />
            </Link>
            <div className="specifications">
              <h2>The details that matter</h2>
              {Object.entries(product.data.specifications).map(
                ([key, value]) => (
                  <div key={key}>
                    <span>{key}</span>
                    <strong>{value}</strong>
                  </div>
                ),
              )}
              <div>
                <span>Product information</span>
                <strong>
                  <Check size={14} /> From our catalog
                </strong>
              </div>
            </div>
            <button className="text-link" onClick={openAssistant}>
              <Sparkles size={16} />
              Ask your shopping assistant{" "}
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      )}
      {product.isSuccess && <RecommendationSection productId={product.data.id} />}
    </main>
  );
}
