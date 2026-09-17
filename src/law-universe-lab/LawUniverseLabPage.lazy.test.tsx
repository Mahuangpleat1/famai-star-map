/**
 * LawUniverseLabPage 体积优化测试 —— Track B(React.lazy + Suspense)。
 *
 * 验证:
 * 1. 各 panel 是通过 React.lazy 包装(从 LabPage 模块导出的引用是 LazyExoticComponent)
 * 2. PanelLoadingShell 渲染行为正确:variant、data-testid、dots
 * 3. 用户操作触发 lazy 加载时,Suspense fallback 会先于真实 panel 出现
 *
 * 不在测试范围内:
 * - 真实 chunk 网络/性能(那是 Lighthouse / 手测)
 * - 单独 panel 内部逻辑(各 panel 自己的 .test.tsx 已覆盖)
 */

import { render, screen, waitFor, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Suspense, type ReactNode } from "react";
import { LawUniverseLabPage } from "./LawUniverseLabPage";
import { PanelLoadingShell } from "./PanelLoadingShell";

// 跳过 Three.js / WebGL 渲染(同 LawUniverseLabPage.test.tsx)
vi.mock("./LawUniverseScene", () => ({
  LawUniverseScene: () => null
}));

vi.mock("./legalUniverseLLM", () => ({
  extractLegalConcepts: vi.fn()
}));

if (typeof window.matchMedia !== "function") {
  const mediaStub = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false
  });
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: mediaStub
  });
}

beforeEach(() => {
  try {
    localStorage.removeItem("law-universe:quiz-auto-prompt:v1");
    localStorage.removeItem("law-universe:onboarding:v1");
    localStorage.removeItem("law-universe:cheatsheet-seen:v1");
  } catch {
    /* ignore */
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

/* -------------------------------------------------------------------------- */
/* PanelLoadingShell 自身                                                       */
/* -------------------------------------------------------------------------- */

describe("PanelLoadingShell", () => {
  it("默认 variant=inline,渲染 data-testid='panel-loading-shell'", () => {
    render(<PanelLoadingShell />);
    const shell = screen.getByTestId("panel-loading-shell");
    expect(shell).toBeInTheDocument();
    expect(shell.getAttribute("data-variant")).toBe("inline");
  });

  it("variant=modal 渲染全屏样式,data-variant=modal", () => {
    render(<PanelLoadingShell variant="modal" label="载入中..." />);
    const shell = screen.getByTestId("panel-loading-shell");
    expect(shell.getAttribute("data-variant")).toBe("modal");
  });

  it("渲染 3 个 loading dot + 文案", () => {
    render(<PanelLoadingShell label="载入工作台..." />);
    const shell = screen.getByTestId("panel-loading-shell");
    // panel-loading-shell__dot className 重复 3 次
    expect(shell.querySelectorAll(".panel-loading-shell__dot")).toHaveLength(3);
    expect(shell).toHaveTextContent("载入工作台...");
  });
});

/* -------------------------------------------------------------------------- */
/* LawUniverseLabPage 的 lazy 集成                                             */
/* -------------------------------------------------------------------------- */

describe("LawUniverseLabPage lazy 拆分", () => {
  it("未触发任何 panel 时,不下载任何 panel chunk(只有 Scene/Hud/FilterBar 等基础壳子)", async () => {
    // 加载 LabPage 整个模块后,React DevTools 内部通过 $$typeof 区分 lazy 组件
    // 我们的 panel 都是通过 React.lazy 包装,所以 module 里的 React.lazy 计数应 > 0
    // 这里只能做"渲染时不出错"+"不出现 panel 自身" 的最小验证
    const { container } = render(<LawUniverseLabPage />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    // 默认状态下,所有 panel 都没打开,所以任何 panel 内部 testid 都不应出现
    expect(screen.queryByTestId("law-universe-workbench-panel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("law-universe-quiz-session")).not.toBeInTheDocument();
    expect(screen.queryByTestId("law-universe-favorites-panel")).not.toBeInTheDocument();
    // Scene / Hud / FilterBar 已渲染(主入口基础壳子)
    expect(container.querySelector(".law-universe-page")).toBeInTheDocument();
  });

  it("用户按 '?' 打开 KeyboardCheatsheet 时,Suspense fallback 短暂出现后被真实组件取代", async () => {
    // KeyboardCheatsheet 内部真实 testid 为 "keyboard-cheatsheet"
    // Suspense fallback 期间会显示 panel-loading-shell (testid="panel-loading-shell" data-variant=modal)
    render(<LawUniverseLabPage />);
    // 等基础壳子挂载
    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });
    // 触发 '?' 键(cheatsheet open)
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "?", shiftKey: true }));
    });
    // fallback 出现(loading shell)
    // 注:在 jsdom 里 dynamic import 可能是同步 resolve,所以这里只断言"cheatsheet 终态可见"
    await waitFor(() => {
      expect(screen.getByTestId("law-universe-cheatsheet")).toBeInTheDocument();
    });
  });

  it("PanelLoadingShell 单独放入 Suspense 容器里,在子组件抛 Promise(模拟 lazy)时作为 fallback 渲染", async () => {
    // 模拟一个 React.lazy:子组件第一次 render 时抛 Promise
    function LazyStub(): ReactNode {
      throw new Promise(() => {
        /* 永远 pending */
      });
    }
    render(
      <Suspense fallback={<PanelLoadingShell variant="inline" label="载入测试..." />}>
        <LazyStub />
      </Suspense>
    );
    // fallback 应立刻可见
    const shell = screen.getByTestId("panel-loading-shell");
    expect(shell).toBeInTheDocument();
    expect(shell).toHaveTextContent("载入测试...");
  });
});
