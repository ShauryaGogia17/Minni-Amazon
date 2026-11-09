import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div>
          <Link className="brand" to="/">
            <span className="brand-icon">
              <ShoppingBag size={23} strokeWidth={1.7} />
            </span>
            shop<span className="brand-ai">ai</span>
          </Link>
          <p>Good finds. Better everyday.</p>
        </div>
        <div className="footer-links">
          <Link to="/products">
            Explore the catalog <ArrowUpRight size={14} />
          </Link>
          <Link to="/status">
            Platform status <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} ShopAI. Made for a more thoughtful
          everyday.
        </span>
        <span>Development catalog · Phase 1</span>
      </div>
    </footer>
  );
}
