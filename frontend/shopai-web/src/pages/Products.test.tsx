import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { Products } from "./Products";
import * as service from "../services/products";
vi.mock("../services/products");
function mount() {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
describe("Catalog queries", () => {
  it("sends category and price sorting to the backend", async () => {
    vi.mocked(service.getCategories).mockResolvedValue([
      { slug: "electronics", name: "Electronics" },
    ]);
    vi.mocked(service.getProducts).mockResolvedValue({
      items: [],
      page: 0,
      size: 8,
      totalElements: 0,
      totalPages: 0,
    });
    mount();
    await userEvent.click(await screen.findByLabelText("Electronics"));
    await waitFor(() =>
      expect(service.getProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: "electronics" }),
        expect.any(AbortSignal),
      ),
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "price-asc");
    await waitFor(() =>
      expect(service.getProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: "price-asc", page: 0 }),
        expect.any(AbortSignal),
      ),
    );
    expect(screen.getByText("No finds just yet.")).toBeInTheDocument();
  });
  it("shows a recoverable API error without substituting fake products", async () => {
    vi.mocked(service.getProducts).mockRejectedValue(new Error("offline"));
    vi.mocked(service.getCategories).mockResolvedValue([]);
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "couldn’t reach the Product Service",
    );
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });
});
