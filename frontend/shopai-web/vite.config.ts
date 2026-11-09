import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api/v1/ai": {
        target: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
      },
      "/api": {
        target: process.env.PRODUCT_SERVICE_URL || "http://127.0.0.1:8081",
      },
      "/health/ai": {
        target: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
        rewrite: (p) => p.replace("/health/ai", "/health"),
      },
      "/health/catalog": {
        target: process.env.PRODUCT_SERVICE_URL || "http://127.0.0.1:8081",
        rewrite: () => "/actuator/health/readiness",
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
});
