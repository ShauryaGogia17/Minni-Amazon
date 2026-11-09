import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../types/catalog";
import { currency } from "../../utils/currency";
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link className="product-card group" to={`/products/${product.id}`}>
      <div className="product-image">
        <img
          src={product.images[0] || "/favicon.svg"}
          alt={product.name}
          loading="lazy"
        />
        {product.featured && (
          <span className="product-badge">THE EVERYDAY EDIT</span>
        )}
        <span className="product-open">
          <ArrowUpRight size={19} />
        </span>
      </div>
      <div className="product-meta">
        <span>{product.brand}</span>
        <span>{product.category.name}</span>
      </div>
      <h3>{product.name}</h3>
      <p className="product-price">
        {currency(product.price, product.currency)}
      </p>
    </Link>
  );
}
