/**
 * LawUniverseObsidianExportPanel 集成测试 —— Phase 4 F.1。
 *
 * 3 个测试覆盖:
 * 1. scope dropdown 渲染
 * 2. 点击 generate 触发 createZipBlob + createElement("a") + 成功提示
 * 3. empty extractions 时 generate 按钮 disabled
 *
 * 注意事项:
 * - jsdom 25 没有 URL.createObjectURL/revokeObjectURL,需要 polyfill(否则会抛错)
 *   Plan 中用 vi.spyOn(document, "createElement") 验证 createElement("a") 被调用,
 *   不依赖 Blob.arrayBuffer()(因为 jsdom Blob 也没有 arrayBuffer)。
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LawUniverseObsidianExportPanel } from "./LawUniverseObsidianExportPanel";
import type { UserExtraction } from "./userDataTypes";

// jsdom 25 没有 URL.createObjectURL / revokeObjectURL,加最小 polyfill
if (typeof window !== "undefined" && typeof window.URL.createObjectURL !== "function") {
  Object.defineProperty(window.URL, "createObjectURL", {
    value: (_blob: Blob) => "blob:mock-url",
    writable: true,
    configurable: true
  });
  Object.defineProperty(window.URL, "revokeObjectURL", {
    value: (_url: string) => undefined,
    writable: true,
    configurable: true
  });
}

const sampleExt: UserExtraction = {
  id: "e1", sourceDocId: "doc1", status: "succeeded",
  startedAt: 0, completedAt: 0, reviewed: true,
  concepts: [
    { title: "合同", type: "principle", system: "civil", importance: 75, summary: "合同摘要。", keyPoints: ["要点"], confidence: 80 }
  ],
  relations: []
};

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  // F.2 测试需要 showDirectoryPicker 存在 (mode toggle 按钮 + 降级测试)
  // jsdom 25 默认没有,useObsidianVault 的 isSupported 读 useRef 在 mount 时检测
  (window as unknown as { showDirectoryPicker?: () => Promise<unknown> }).showDirectoryPicker = vi.fn();
});

describe("LawUniverseObsidianExportPanel", () => {
  it("renders scope dropdown", () => {
    render(<LawUniverseObsidianExportPanel open={true} onClose={() => undefined} extractions={[sampleExt]} sourceDocsMap={new Map()} />);
    expect(screen.getByTestId("obsidian-export-scope")).toBeInTheDocument();
  });

  it("clicking generate calls createZipBlob and triggers download", async () => {
    const createElementSpy = vi.spyOn(document, "createElement");
    render(<LawUniverseObsidianExportPanel open={true} onClose={() => undefined} extractions={[sampleExt]} sourceDocsMap={new Map()} />);
    fireEvent.click(screen.getByTestId("obsidian-export-generate"));
    await waitFor(() => expect(screen.getByTestId("obsidian-export-ok")).toBeInTheDocument());
    expect(createElementSpy).toHaveBeenCalledWith("a");
  });

  it("empty extractions disables generate button", () => {
    render(<LawUniverseObsidianExportPanel open={true} onClose={() => undefined} extractions={[]} sourceDocsMap={new Map()} />);
    expect(screen.getByTestId("obsidian-export-generate")).toBeDisabled();
  });
});

// === Phase 4 F.2 集成测试 ===

describe("LawUniverseObsidianExportPanel (F.2 双向同步)", () => {
  it("mode toggle switches between zip and vault", () => {
    render(<LawUniverseObsidianExportPanel open={true} onClose={() => undefined} extractions={[sampleExt]} sourceDocsMap={new Map()} />);
    // 默认 zip 模式
    expect(screen.queryByTestId("obsidian-pick-vault")).not.toBeInTheDocument();
    // 切到 vault
    fireEvent.click(screen.getByText("双向同步"));
    expect(screen.getByTestId("obsidian-pick-vault")).toBeInTheDocument();
  });

  it("vault mode requires user to pick a directory", () => {
    render(<LawUniverseObsidianExportPanel open={true} onClose={() => undefined} extractions={[sampleExt]} sourceDocsMap={new Map()} />);
    fireEvent.click(screen.getByText("双向同步"));
    expect(screen.queryByTestId("obsidian-export-to-vault")).not.toBeInTheDocument();
    expect(screen.getByTestId("obsidian-pick-vault")).toBeInTheDocument();
  });

  it("hides vault mode when File System Access API unavailable", () => {
    const original = (window as unknown as { showDirectoryPicker?: () => Promise<unknown> }).showDirectoryPicker;
    delete (window as unknown as { showDirectoryPicker?: () => Promise<unknown> }).showDirectoryPicker;
    render(<LawUniverseObsidianExportPanel open={true} onClose={() => undefined} extractions={[sampleExt]} sourceDocsMap={new Map()} />);
    expect(screen.queryByText("双向同步")).not.toBeInTheDocument();
    (window as unknown as { showDirectoryPicker?: () => Promise<unknown> }).showDirectoryPicker = original;
  });
});
