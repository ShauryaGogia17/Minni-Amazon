import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CheckCircle2, Circle, RefreshCw } from "lucide-react";
import { api } from "../services/api";
import { getCapabilities } from "../services/products";

export function Status() {
  const catalog = useQuery({
    queryKey: ["catalog-health"],
    queryFn: async () => (await api.get("/health/catalog")).data,
    refetchInterval: 15000,
    retry: false,
  });
  const ai = useQuery({
    queryKey: ["ai-health"],
    queryFn: async () => (await api.get("/health/ai/ready")).data,
    refetchInterval: 15000,
    retry: false,
  });
  const capabilities = useQuery({
    queryKey: ["ai-capabilities"],
    queryFn: getCapabilities,
  });
  return (
    <main className="container status-page">
      <span className="eyebrow">BUILT WITH INTENTION</span>
      <h1>
        A foundation for
        <br />
        better everyday.
      </h1>
      <p>
        Phase 1 connects the storefront to real catalog APIs, PostgreSQL, Redis,
        and the AI service foundation.
      </p>
      <div className="status-cards">
        {[
          {
            name: "Product Service",
            query: catalog,
            text: "Spring Boot · PostgreSQL · Redis",
          },
          {
            name: "AI foundation",
            query: ai,
            text: "FastAPI · dependency readiness",
          },
        ].map(({ name, query, text }) => (
          <div className="status-card" key={name}>
            {query.isSuccess ? (
              <CheckCircle2 className="status-good" />
            ) : (
              <Circle className="status-wait" />
            )}
            <h2>{name}</h2>
            <p>{text}</p>
            <strong>
              {query.isPending
                ? "Checking…"
                : query.isSuccess
                  ? "Ready"
                  : "Not ready"}
            </strong>
            <button className="text-link" onClick={() => void query.refetch()}>
              <RefreshCw size={13} />
              Check again
            </button>
          </div>
        ))}
      </div>
      <h2>What’s taking shape</h2>
      <div className="roadmap-list">
        {capabilities.data?.agents.map((agent) => (
          <div key={agent.id}>
            <span>{agent.name}</span>
            <span>
              {agent.available ? "Available" : `Phase ${agent.planned_phase}`} <ArrowUpRight size={15} />
            </span>
          </div>
        ))}
      </div>
      <p className="phase-note">
        Development seed catalog. Authentication arrives in Phase 2; cart and
        checkout in Phase 3; events and payments in Phase 4. Shopping and catalog
        recommendations are available now; other AI agents are planned. No payment integration is active.
      </p>
    </main>
  );
}
