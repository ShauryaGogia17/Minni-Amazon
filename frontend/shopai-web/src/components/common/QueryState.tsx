import { ArrowUpRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
export function QueryError({ retry }: { retry: () => void }) {
  return (
    <div className="query-state" role="alert">
      <h3>Our catalog is taking a moment.</h3>
      <p>
        We couldn’t reach the Product Service. Check the connection and try
        again.
      </p>
      <button className="button secondary" onClick={retry}>
        <RefreshCw size={16} /> Try again
      </button>
      <Link to="/status" className="text-link">
        View service status <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
export function ProductSkeletons({ count = 4 }: { count?: number }) {
  return (
    <div
      className="product-grid"
      aria-label="Loading products"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-image" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      ))}
    </div>
  );
}
