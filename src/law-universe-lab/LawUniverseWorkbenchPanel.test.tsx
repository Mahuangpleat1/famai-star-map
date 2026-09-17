/**
 * LawUniverseWorkbenchPanel PDF 上传集成测试 —— Phase 3 C。
 *
 * 3 个测试覆盖:
 * 1. upload hint 不再含 "PDF 留 TODO"
 * 2. native-text PDF 成功上传(parsePdf 被调)
 * 3. scanned PDF 显示扫描件错误提示
 *
 * mock 策略:
 * - parsePdf:vi.mock factory 返回 mock parsePdf
 * - legalUniverseUserDb:vi.spyOn 替换列表/put/getLLM 接口(参考 LawUniverseLabPage.test.tsx 模式)
 *
 * 注意事项:
 * - jsdom 25 的 File 没有 arrayBuffer() / text() 方法,需要 polyfill。
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LawUniverseWorkbenchPanel } from "./LawUniverseWorkbenchPanel";
import * as userDb from "./legalUniverseUserDb";
import { DEFAULT_LLM_PROVIDER_CONFIG } from "./userDataTypes";

// jsdom 25 的 File 没有 arrayBuffer() / text() 方法,需要 polyfill
if (typeof window !== "undefined") {
  const Proto = (window as unknown as { File: { prototype: File } }).File.prototype;
  if (Proto && typeof (Proto as unknown as { arrayBuffer?: unknown }).arrayBuffer !== "function") {
    Object.defineProperty(Proto, "arrayBuffer", {
      value(this: File) {
        // 把 Blob 部分转成 ArrayBuffer(File 继承 Blob)
        return new Promise<ArrayBuffer>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.readAsArrayBuffer(this);
        });
      }
    });
  }
  if (Proto && typeof (Proto as unknown as { text?: unknown }).text !== "function") {
    Object.defineProperty(Proto, "text", {
      value(this: File) {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsText(this);
        });
      }
    });
  }
}

// mock parsePdf (必须在 import 前)
vi.mock("./legalUniversePdf", () => ({
  parsePdf: vi.fn(),
  PdfTooLargeError: class extends Error {
    constructor(public sizeBytes: number, public limitMB = 100) {
      super(`PDF 文件超过 ${limitMB}MB`);
      this.name = "PdfTooLargeError";
    }
  },
  ScannedPdfError: class extends Error {
    constructor(public fileName: string, public pageCount: number) {
      super(`${fileName} 扫描件`);
      this.name = "ScannedPdfError";
    }
  }
}));

import { parsePdf } from "./legalUniversePdf";

beforeEach(() => {
  // 默认 mock:列表接口返回空数组,putSourceDoc 不实际写库
  vi.spyOn(userDb, "listSourceDocs").mockResolvedValue([]);
  vi.spyOn(userDb, "listExtractions").mockResolvedValue([]);
  vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
  vi.spyOn(userDb, "putSourceDoc").mockImplementation(async (d) => d);
  vi.spyOn(userDb, "getLLMProviderConfig").mockResolvedValue({
    ...DEFAULT_LLM_PROVIDER_CONFIG,
    updatedAt: 0
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LawUniverseWorkbenchPanel PDF 上传", () => {
  it("upload hint 不再含 'PDF 留 TODO'", async () => {
    render(<LawUniverseWorkbenchPanel open={true} onClose={() => undefined} />);
    await waitFor(() => {
      expect(screen.getByText(/支持 \.txt \/ \.md \/ \.pdf/)).toBeInTheDocument();
    });
    expect(screen.queryByText(/PDF 留 TODO/)).not.toBeInTheDocument();
  });

  it("native-text PDF 成功上传", async () => {
    (parsePdf as ReturnType<typeof vi.fn>).mockResolvedValue({
      text: "民法典是民事基本法律",
      method: "native-text",
      pageCount: 1
    });
    const { container } = render(<LawUniverseWorkbenchPanel open={true} onClose={() => undefined} />);
    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "false"));
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["mock"], "test.pdf", { type: "application/pdf" });
    Object.defineProperty(input, "files", { value: [file], writable: false });
    fireEvent.change(input);
    await waitFor(() => {
      expect(parsePdf).toHaveBeenCalled();
    });
  });

  it("scanned PDF 显示错误", async () => {
    (parsePdf as ReturnType<typeof vi.fn>).mockResolvedValue({
      text: "",
      method: "scanned-empty",
      pageCount: 3
    });
    const { container } = render(<LawUniverseWorkbenchPanel open={true} onClose={() => undefined} />);
    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "false"));
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["mock"], "scan.pdf", { type: "application/pdf" });
    Object.defineProperty(input, "files", { value: [file], writable: false });
    fireEvent.change(input);
    await waitFor(() => {
      expect(screen.getByText(/扫描件/)).toBeInTheDocument();
    });
  });
});
