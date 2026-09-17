import { beforeEach, describe, expect, it, vi } from "vitest";

// mock pdfjs-dist (必须在 import 前)
vi.mock("pdfjs-dist", () => {
  const getDocument = vi.fn();
  return {
    getDocument,
    GlobalWorkerOptions: { workerSrc: "" }
  };
});

// mock worker import
vi.mock("pdfjs-dist/build/pdf.worker.min.mjs?url", () => ({
  default: "mock-worker-url"
}));

import * as pdfjsLib from "pdfjs-dist";
import { parsePdf, PdfTooLargeError, ScannedPdfError } from "./legalUniversePdf";

function mkPage(textItems: string[]) {
  return {
    getTextContent: vi.fn().mockResolvedValue({
      items: textItems.map((s) => ({ str: s }))
    })
  };
}

function mkPdf(pages: string[][]) {
  return {
    numPages: pages.length,
    getPage: vi.fn((i: number) => Promise.resolve(mkPage(pages[i - 1])))
  };
}

describe("parsePdf", () => {
  const destroy = vi.fn().mockResolvedValue(undefined);
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(pdfjsLib.getDocument).mockImplementation(() => ({
      promise: Promise.resolve(mkPdf([])),
      destroy
    }) as unknown as ReturnType<typeof pdfjsLib.getDocument>);
  });

  it("single page native text returns native-text method", async () => {
    // 凑够 50+ 字符以满足 native-text 阈值(>50,留出余量)
    const longEnough =
      "合同是民事主体之间设立、变更、终止民事法律关系的协议,本讲义系统介绍合同法的基本原理与司法实务要点精解。";
    (pdfjsLib.getDocument as ReturnType<typeof vi.fn>).mockReturnValue({
      destroy,
      promise: Promise.resolve(mkPdf([[longEnough]]))
    });
    const buf = new ArrayBuffer(8);
    const r = await parsePdf(buf);
    expect(r.method).toBe("native-text");
    expect(r.pageCount).toBe(1);
    expect(r.text).toContain("合同");
  });

  it("preserves a source page label before every page", async () => {
    (pdfjsLib.getDocument as ReturnType<typeof vi.fn>).mockReturnValue({
      destroy,
      promise: Promise.resolve(mkPdf([["第一页"], ["第二页"], ["第三页"]]))
    });
    const r = await parsePdf(new ArrayBuffer(8));
    expect(r.pageCount).toBe(3);
    expect(r.text).toBe("[第 1 页]\n第一页\n\n[第 2 页]\n第二页\n\n[第 3 页]\n第三页");
  });

  it("scanned PDF (no text) returns scanned-empty", async () => {
    (pdfjsLib.getDocument as ReturnType<typeof vi.fn>).mockReturnValue({
      destroy,
      promise: Promise.resolve(mkPdf([[""], [""], [""]]))
    });
    const r = await parsePdf(new ArrayBuffer(8));
    expect(r.method).toBe("scanned-empty");
    expect(r.pageCount).toBe(3);
  });

  it("below 50 chars total = scanned-empty", async () => {
    (pdfjsLib.getDocument as ReturnType<typeof vi.fn>).mockReturnValue({
      destroy,
      promise: Promise.resolve(mkPdf([["短文本"]]))
    });
    const r = await parsePdf(new ArrayBuffer(8));
    expect(r.method).toBe("scanned-empty");
  });

  it("at 50+ chars = native-text", async () => {
    const longText = "民法典".repeat(20); // 60 chars
    (pdfjsLib.getDocument as ReturnType<typeof vi.fn>).mockReturnValue({
      destroy,
      promise: Promise.resolve(mkPdf([[longText]]))
    });
    const r = await parsePdf(new ArrayBuffer(8));
    expect(r.method).toBe("native-text");
    expect(r.text).toContain("民法典");
  });

  it("text items with non-string fields are filtered", async () => {
    (pdfjsLib.getDocument as ReturnType<typeof vi.fn>).mockReturnValue({
      destroy,
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getTextContent: vi.fn().mockResolvedValue({
            items: [
              { str: "hello" },
              { str: "" },
              {}, // no str
              { str: "world" }
            ]
          })
        })
      })
    });
    const r = await parsePdf(new ArrayBuffer(8));
    expect(r.text).toBe("[第 1 页]\nhello world");
  });

  it("does not count page labels or page separators as scanned text", async () => {
    vi.mocked(pdfjsLib.getDocument).mockReturnValue({
      destroy,
      promise: Promise.resolve(mkPdf(Array.from({ length: 100 }, () => [" "])))
    } as unknown as ReturnType<typeof pdfjsLib.getDocument>);
    const result = await parsePdf(new ArrayBuffer(8));
    expect(result.method).toBe("scanned-empty");
    expect(result.pageCount).toBe(100);
  });

  it("counts only actual text near the native-text threshold", async () => {
    vi.mocked(pdfjsLib.getDocument).mockReturnValue({
      destroy,
      promise: Promise.resolve(mkPdf([["法".repeat(24)], ["律".repeat(25)]]))
    } as unknown as ReturnType<typeof pdfjsLib.getDocument>);
    expect((await parsePdf(new ArrayBuffer(8))).method).toBe("scanned-empty");
  });

  it("releases the document worker after successful parsing", async () => {
    vi.mocked(pdfjsLib.getDocument).mockReturnValue({
      destroy,
      promise: Promise.resolve(mkPdf([["法".repeat(50)]]))
    } as unknown as ReturnType<typeof pdfjsLib.getDocument>);
    expect((await parsePdf(new ArrayBuffer(8))).method).toBe("native-text");
    expect(destroy).toHaveBeenCalledOnce();
  });

  it("releases the worker when loading fails", async () => {
    vi.mocked(pdfjsLib.getDocument).mockReturnValue({
      destroy,
      promise: Promise.reject(new Error("Invalid PDF structure"))
    } as unknown as ReturnType<typeof pdfjsLib.getDocument>);
    await expect(parsePdf(new ArrayBuffer(8))).rejects.toThrow("Invalid PDF structure");
    expect(destroy).toHaveBeenCalledOnce();
  });

  it("releases the worker when extracting a page fails", async () => {
    const pdf = mkPdf([["text"]]);
    pdf.getPage.mockRejectedValue(new Error("Unreadable page"));
    vi.mocked(pdfjsLib.getDocument).mockReturnValue({
      destroy,
      promise: Promise.resolve(pdf)
    } as unknown as ReturnType<typeof pdfjsLib.getDocument>);
    await expect(parsePdf(new ArrayBuffer(8))).rejects.toThrow("Unreadable page");
    expect(destroy).toHaveBeenCalledOnce();
  });

  it("corrupted PDF throws", async () => {
    (pdfjsLib.getDocument as ReturnType<typeof vi.fn>).mockReturnValue({
      destroy,
      promise: Promise.reject(new Error("Invalid PDF structure"))
    });
    await expect(parsePdf(new ArrayBuffer(8))).rejects.toThrow("Invalid PDF");
  });

  it("PdfTooLargeError carries sizeBytes + limitMB", () => {
    const err = new PdfTooLargeError(150 * 1024 * 1024, 100);
    expect(err.name).toBe("PdfTooLargeError");
    expect(err.sizeBytes).toBe(150 * 1024 * 1024);
    expect(err.limitMB).toBe(100);
    expect(err.message).toContain("100MB");
  });

  it("ScannedPdfError carries fileName + pageCount", () => {
    const err = new ScannedPdfError("scan.pdf", 5);
    expect(err.name).toBe("ScannedPdfError");
    expect(err.fileName).toBe("scan.pdf");
    expect(err.pageCount).toBe(5);
    expect(err.message).toContain("扫描件");
  });
});
