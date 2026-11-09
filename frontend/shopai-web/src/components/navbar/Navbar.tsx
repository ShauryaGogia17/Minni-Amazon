import {
  ArrowUpRight,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  q: z
    .string()
    .trim()
    .max(120, "Please keep your search under 120 characters."),
});
export function Navbar({ openAssistant }: { openAssistant: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const catalogActive =
    location.pathname === "/products" ||
    location.pathname.startsWith("/products/");
  const editActive =
    location.pathname === "/products" &&
    new URLSearchParams(location.search).get("featured") === "true";
  const [menu, setMenu] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return (
    <>
      <div className="announcement">
        <span>Good finds. Brighter everydays.</span>
        <Link to="/status">
          Explore the ShopAI foundation <ArrowUpRight size={12} />
        </Link>
      </div>
      <header className="header">
        <div className="nav-container">
          <Link to="/" className="brand" aria-label="ShopAI home">
            <span className="brand-icon">
              <ShoppingBag size={23} strokeWidth={1.7} />
            </span>
            shop<span className="brand-ai">ai</span>
            <span className="brand-dot" aria-hidden="true" />
          </Link>
          <nav
            aria-label="Main navigation"
            className={menu ? "main-nav open" : "main-nav"}
            onClick={() => setMenu(false)}
          >
            <NavLink to="/" end>
              Discover
            </NavLink>
            <Link
              to="/products"
              className={catalogActive && !editActive ? "active" : undefined}
              aria-current={catalogActive && !editActive ? "page" : undefined}
            >
              Shop all
            </Link>
            <Link
              to="/products?featured=true"
              className={editActive ? "active" : undefined}
              aria-current={editActive ? "page" : undefined}
            >
              The edit <span className="nav-new">NEW</span>
            </Link>
          </nav>
          <form
            className="search-form"
            role="search"
            onSubmit={handleSubmit(({ q }) => {
              navigate(`/products?q=${encodeURIComponent(q)}`);
              setMenu(false);
            })}
          >
            <Search size={18} />
            <input
              aria-label="Search products"
              placeholder="Find your next favorite"
              {...register("q")}
            />
            <button type="submit" aria-label="Submit search">
              <ArrowUpRight size={17} />
            </button>
            {errors.q && (
              <span className="search-error" role="alert">
                {errors.q.message}
              </span>
            )}
          </form>
          <button className="assistant-nav" onClick={openAssistant}>
            <Sparkles size={17} />
            <span>Meet your AI</span>
          </button>
          <button
            className="mobile-menu icon-button"
            onClick={() => setMenu(!menu)}
            aria-label="Toggle navigation"
            aria-expanded={menu}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}
