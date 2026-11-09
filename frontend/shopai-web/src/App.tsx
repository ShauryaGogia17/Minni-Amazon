import { useState, useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "./components/navbar/Navbar";
import { Footer } from "./components/footer/Footer";
import { AssistantDialog } from "./components/chatbot/AssistantDialog";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { ProductDetails } from "./pages/ProductDetails";
import { Status } from "./pages/Status";

export default function App() {
  const [assistant, setAssistant] = useState(false);
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  return (
    <>
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      <Navbar openAssistant={() => setAssistant(true)} />
      <div id="content">
        <Routes>
          <Route
            path="/"
            element={<Home openAssistant={() => setAssistant(true)} />}
          />
          <Route path="/products" element={<Products />} />
          <Route
            path="/products/:id"
            element={
              <ProductDetails openAssistant={() => setAssistant(true)} />
            }
          />
          <Route path="/status" element={<Status />} />
          <Route
            path="*"
            element={
              <main className="container query-state">
                <h1>This page wandered off.</h1>
                <Link className="button primary" to="/">
                  Back to good things
                </Link>
              </main>
            }
          />
        </Routes>
      </div>
      <Footer />
      <button className="assistant-launcher" onClick={() => setAssistant(true)} aria-label="Open shopping assistant">
        <span aria-hidden="true">✦</span> Ask ShopAI
      </button>
      <AssistantDialog open={assistant} close={() => setAssistant(false)} />
    </>
  );
}
