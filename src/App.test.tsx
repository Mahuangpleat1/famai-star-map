import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

vi.mock("./law-universe-lab/LawUniverseLabPage", () => ({
  LawUniverseLabPage: () => <main data-testid="law-universe-page">中国法学宇宙</main>
}));

describe("App routing", () => {
  it("renders the initial page without waiting for a dynamic page chunk", () => {
    render(<App />);
    expect(screen.getByTestId("law-universe-page")).toBeInTheDocument();
  });
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it.each(["/", "/law-universe-lab", "/legacy-route"])(
    "opens the Chinese legal universe as the only retained site version at %s",
    async (path) => {
      window.history.pushState({}, "", path);

      render(<App />);

      expect(await screen.findByTestId("law-universe-page")).toBeInTheDocument();
    }
  );

});
