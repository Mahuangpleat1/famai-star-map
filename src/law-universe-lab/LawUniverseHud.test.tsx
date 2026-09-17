/**
 * LawUniverseHud system index aria-current 测试。
 *
 * a11y 行为:
 * - 选中节点 = 某个 system-sun → 该 system 按钮标 aria-current="true"
 * - 选中节点 = system 内的 concept → 该 system 按钮也标 aria-current="true"(让屏幕阅读器用户
 *   知道当前所在 system)
 */
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LawUniverseHud } from "./LawUniverseHud";
import { getTopLegalUniverseSystems } from "../../data/legalUniverseData";

// jsdom 不提供 matchMedia,useCompactViewport 会调,polyfill 一下
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
  Object.defineProperty(window, "matchMedia", { writable: true, configurable: true, value: mediaStub });
}

// 极简 props 默认值,只测 system index 行为
function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    selectedNodeId: "universe-core",
    motionPaused: false,
    zoomLevel: 1,
    satelliteVisible: false,
    relationVisible: false,
    pathMode: "idle" as const,
    dueCount: 0,
    onSelectNode: vi.fn(),
    onReset: vi.fn(),
    onToggleMotion: vi.fn(),
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onOpenSearch: vi.fn(),
    onStartPathFrom: vi.fn(),
    onOpenLearningPath: vi.fn(),
    onOpenQuiz: vi.fn(),
    onOpenFavorites: vi.fn(),
    onOpenWorkbench: vi.fn(),
    onToggleSatellites: vi.fn(),
    onToggleRelations: vi.fn(),
    onStartQuizSession: vi.fn(),
    ...overrides
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LawUniverseHud system index aria-current", () => {
  it("selectedNodeId 是 universe-core 时,没有任何 system 标 aria-current", () => {
    render(<LawUniverseHud {...baseProps({ selectedNodeId: "universe-core" })} />);
    const nav = screen.getByLabelText("法学太阳系索引");
    const buttons = nav.querySelectorAll("button[aria-current]");
    expect(buttons.length).toBe(0);
  });

  it("selectedNodeId 是某个 system-sun 时,该 system 标 aria-current", () => {
    const systems = getTopLegalUniverseSystems();
    const civilSystem = systems.find((s) => s.id === "system-civil");
    expect(civilSystem).toBeDefined();
    render(<LawUniverseHud {...baseProps({ selectedNodeId: "system-civil" })} />);
    const nav = screen.getByLabelText("法学太阳系索引");
    const civilButton = nav.querySelector('button[aria-current="true"]');
    expect(civilButton).not.toBeNull();
    expect(civilButton?.textContent).toContain("民法典");
  });

  it("selectedNodeId 是 system 内的 concept 时,该 system 仍然标 aria-current(祖先高亮)", () => {
    // civil-subject 是 system-civil 下的一个 concept
    render(<LawUniverseHud {...baseProps({ selectedNodeId: "civil-subject" })} />);
    const nav = screen.getByLabelText("法学太阳系索引");
    const civilButton = nav.querySelector('button[aria-current="true"]');
    expect(civilButton).not.toBeNull();
    expect(civilButton?.textContent).toContain("民法典");
  });
});
