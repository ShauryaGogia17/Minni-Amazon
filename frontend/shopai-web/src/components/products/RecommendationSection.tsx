import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { getRecommendations } from "../../services/shopping";
import { clearBrowsingHistory, useBrowsingHistory } from "../../hooks/useBrowsingHistory";
import { ProductCard } from "./ProductCard";
import { ProductSkeletons } from "../common/QueryState";

export function RecommendationSection({ productId }: { productId?: string }) {
  const viewed = useBrowsingHistory();
  const query = useQuery({
    queryKey: ["recommendations", productId, viewed],
    queryFn: ({ signal }) => getRecommendations(viewed, productId, signal),
    retry: false,
  });
  if (query.isSuccess && !query.data.items.length) return null;
  return (
    <section className="recommendation-section" aria-label={productId ? "Complementary products" : "Personal recommendations"}>
      <div className="section-heading">
        <div>
          <span className="eyebrow"><Sparkles size={14} /> {productId ? "MAKE A GOOD THING BETTER" : "PICKED WITH YOU IN MIND"}</span>
          <h2>{query.data?.title || (productId ? "Goes well with your find." : "Your next good find.")}</h2>
          <p>{productId
            ? "Complementary catalog picks to explore alongside this product."
            : viewed.length ? "Inspired by what you’ve viewed. Your browsing history stays in this browser for 30 days."
            : "Explore a few products. Your suggestions will adapt as you browse."}</p>
        </div>
        {!productId && viewed.length > 0 && <button className="text-link" onClick={clearBrowsingHistory}>Reset suggestions</button>}
      </div>
      {query.isPending ? <ProductSkeletons /> : query.isError ? (
        <div className="recommendation-error" role="alert">
          Suggestions are temporarily unavailable. <button className="text-link" onClick={() => void query.refetch()}>Try again</button>
        </div>
      ) : <div className="product-grid">{query.data.items.map(({ product, reason }) => (
        <div key={product.id}><ProductCard product={product} /><p className="recommendation-reason">{reason}</p></div>
      ))}</div>}
    </section>
  );
}
