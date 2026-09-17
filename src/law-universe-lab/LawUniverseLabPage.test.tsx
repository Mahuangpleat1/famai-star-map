/**
 * LawUniverseLabPage 集成测试 —— Phase 3 polish。
 *
 * 重点:useToast 在 LabPage 级别的真实使用场景。
 * - listQuizItems 失败 → 弹 error toast
 * - 正常加载 → 不弹 toast
 * - dueCount >= 3 → 弹 info toast (24h 节流)
 *
 * 注:渲染整个 LabPage 会触发 Three.js / WebGL,这里通过 mock LawUniverseScene
 * 完全跳过 3D 渲染,只测 React 子树 + useToast 集成。
 */

import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LawUniverseLabPage } from "./LawUniverseLabPage";
import * as userDb from "./legalUniverseUserDb";
import type { UserQuizItem } from "./userDataTypes";

// 跳过 Three.js / WebGL 渲染(只测 React 子树 + useToast 集成)
const sceneState = vi.hoisted(() => ({ blocked: false }));
vi.mock("./LawUniverseScene", () => ({
  LawUniverseScene: () => {
    if (sceneState.blocked) throw new Promise(() => {});
    return <div data-testid="test-scene" />;
  }
}));

// 防御性 mock:虽然 LabPage 不直接 import,子组件(LawUniverseSatelliteDetailPanel)会调 LLM
vi.mock("./legalUniverseLLM", () => ({
  extractLegalConcepts: vi.fn()
}));

// jsdom 不提供 matchMedia,多个子组件会调,polyfill 一下(用普通函数,避免 vi.restoreAllMocks 影响)
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
  // 默认 mock:无题无错
  vi.spyOn(userDb, "listQuizItems").mockResolvedValue([]);
  vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
});

afterEach(() => {
  sceneState.blocked = false;
  vi.restoreAllMocks();
  // 清掉 auto-prompt 24h 闸,避免跨测试污染
  try {
    localStorage.removeItem("law-universe:quiz-auto-prompt:v1");
    // OnboardingHint 会写自己的"已看过"标记,避免跨测试污染
    localStorage.removeItem("law-universe:onboarding:v1");
    localStorage.removeItem("law-universe:cheatsheet-seen:v1");
  } catch {
    /* ignore */
  }
});

function makeDueItem(id: string, conceptId: string, conceptTitle: string, now: number): UserQuizItem {
  return {
    id,
    conceptId,
    conceptTitle,
    payload: { type: "choice", stem: "x", options: ["a"], correctIndex: 0 },
    spacedRepetition: { easeFactor: 2.5, interval: 0, repetitions: 0, dueAt: now - 1000 },
    createdAt: 0
  };
}

describe("LawUniverseLabPage useToast 集成", () => {
  it("paints real page content before starting the scene on the next paint opportunity", async () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => frames.push(callback));
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    render(<LawUniverseLabPage />);
    await act(async () => {});
    expect(screen.getByTestId("law-universe-detail")).toBeInTheDocument();
    expect(screen.queryByTestId("test-scene")).not.toBeInTheDocument();
    await act(async () => { frames[0](0); });
    expect(screen.queryByTestId("test-scene")).not.toBeInTheDocument();
    await act(async () => { frames[1](16); });
    expect(await screen.findByTestId("test-scene")).toBeInTheDocument();
  });

  it("cancels the pending scene frame when unmounted between paint callbacks", async () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => frames.push(callback));
    const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const { unmount } = render(<LawUniverseLabPage />);
    await act(async () => { frames[0](0); });
    unmount();
    expect(cancel).toHaveBeenCalledWith(2);
  });

  it("keeps the real detail and controls visible while the 3D scene is loading", async () => {
    sceneState.blocked = true;
    render(<LawUniverseLabPage />);
    expect(screen.getByTestId("law-universe-detail")).toHaveAttribute("data-visible-node", "universe-core");
    expect(screen.getByTestId("law-universe-filter-bar")).toBeInTheDocument();
    await act(async () => {});
  });
  it("listQuizItems 失败时弹 error toast 包含「加载失败」", async () => {
    vi.spyOn(userDb, "listQuizItems").mockRejectedValue(new Error("db fail"));
    render(<LawUniverseLabPage />);
    await waitFor(() => {
      expect(screen.getByTestId("toast-error")).toBeInTheDocument();
    });
    expect(screen.getByTestId("toast-error")).toHaveTextContent("加载失败");
  });

  it("正常加载时不弹 toast", async () => {
    render(<LawUniverseLabPage />);
    // 等异步 effect 跑完
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });
    expect(screen.queryByTestId("toast-stack")).not.toBeInTheDocument();
  });

  it("dueCount >= 3 弹 info toast (24h 节流闸清空情况下)", async () => {
    const now = Date.now();
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([
      makeDueItem("1", "1", "c1", now),
      makeDueItem("2", "2", "c2", now),
      makeDueItem("3", "3", "c3", now)
    ]);
    // beforeEach 已清过,这里再确保一次
    localStorage.removeItem("law-universe:quiz-auto-prompt:v1");
    render(<LawUniverseLabPage />);
    await waitFor(() => {
      expect(screen.getByTestId("toast-info")).toBeInTheDocument();
    });
    expect(screen.getByTestId("toast-info")).toHaveTextContent("3 题到期");
  });

  it("useToast 解构稳定:多次 render 不重复弹 auto-prompt toast", async () => {
    const now = Date.now();
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([
      makeDueItem("1", "1", "c1", now),
      makeDueItem("2", "2", "c2", now),
      makeDueItem("3", "3", "c3", now)
    ]);
    localStorage.removeItem("law-universe:quiz-auto-prompt:v1");
    render(<LawUniverseLabPage />);
    // 等第一个 toast 出现
    await waitFor(() => {
      expect(screen.getByTestId("toast-info")).toBeInTheDocument();
    });
    const initialToasts = screen.getAllByTestId("toast-info").length;
    // 模拟一些 rerender 触发 (等 100ms 覆盖所有 effect 抖动)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });
    // auto-prompt 应该只弹 1 次 (24h 节流)
    const finalToasts = screen.getAllByTestId("toast-info").length;
    expect(finalToasts).toBe(initialToasts);
  });
});
