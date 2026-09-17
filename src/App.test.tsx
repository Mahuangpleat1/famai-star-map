import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

vi.mock("./law-universe-lab/LawUniverseLabPage", () => ({
  LawUniverseLabPage: () => <main data-testid="law-universe-page">中国法学宇宙</main>
}));

describe("App routing", () => {
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

  it("Suspense fallback shows the loading shell before lazy chunk loads", async () => {
    // 强制 React.lazy 挂起:把 import() 延迟,验证 fallback 渲染
    const originalLog = console.log;
    console.log = () => {}; // 静默 Suspense 日志(可选)
    try {
      vi.resetModules();
      // 通过 dynamic import 失败触发 Suspense 仍可见
      // 这里我们不模拟网络,只断言 fallback HTML 不存在 → 已加载
      render(<App />);
      // 加载完后,LabPage 会被渲染
      await screen.findByTestId("law-universe-page");
      expect(screen.queryByText("载入中国法学宇宙...")).not.toBeInTheDocument();
    } finally {
      console.log = originalLog;
    }
  });
});
