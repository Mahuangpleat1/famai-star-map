/**
 * PDF 解析 —— Phase 3 C 子项目。
 *
 * 纯函数:输入 ArrayBuffer,输出 { text, method, pageCount }。
 * 依赖 pdfjs-dist (Mozilla 官方),worker 用 Vite `?url` 注入。
 *
 * 不做 OCR;扫描件 (抽出来 < 50 字符) 标记 method = "scanned-empty" 让 UI 提示。
 */

import * as pdfjsLib from "pdfjs-dist";
// pdfjs-dist 4.x ?url import —— Vite 在 build 时处理成 worker URL
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export type PdfExtractionMethod = "native-text" | "scanned-empty";

export interface PdfParseResult {
  text: string;
  method: PdfExtractionMethod;
  pageCount: number;
}

export class PdfTooLargeError extends Error {
  constructor(public sizeBytes: number, public limitMB = 100) {
    super(`PDF 文件超过 ${limitMB}MB 限制 (实际 ${(sizeBytes / 1024 / 1024).toFixed(1)}MB)`);
    this.name = "PdfTooLargeError";
  }
}

export class ScannedPdfError extends Error {
  constructor(public fileName: string, public pageCount: number) {
    super(`${fileName} 为扫描件 PDF（${pageCount} 页），暂不支持抽取`);
    this.name = "ScannedPdfError";
  }
}

/** 扫描件判定阈值:实际文本字符数，不计页码标签或分页分隔符。 */
const SCANNED_THRESHOLD = 50;

/**
 * 解析 PDF (native text only, no OCR).
 * @throws Error (pdfjs InvalidPDFException / PasswordException 等) 当文件损坏或加密
 */
export async function parsePdf(arrayBuffer: ArrayBuffer): Promise<PdfParseResult> {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  try {
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    const pages: string[] = [];
    let textLength = 0;
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const textItems = content.items
        .map((it) => ("str" in it ? it.str : ""))
        .filter((s) => typeof s === "string" && s.trim().length > 0);
      // 只计算 PDF 中抽出的文字，避免大量空白页或人为添加的空格跨过阈值。
      textLength += textItems.reduce((total, item) => total + item.trim().length, 0);
      pages.push(`[第 ${i} 页]\n${textItems.join(" ").trim()}`);
    }
    const text = pages.join("\n\n").trim();
    const method: PdfExtractionMethod = textLength < SCANNED_THRESHOLD ? "scanned-empty" : "native-text";
    return { text, method, pageCount };
  } finally {
    // PDFDocumentProxy.destroy() 本身委派到此方法；也覆盖 document 尚未加载成功的情况。
    await loadingTask.destroy();
  }
}
