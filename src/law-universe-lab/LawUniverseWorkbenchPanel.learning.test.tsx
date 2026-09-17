import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { LawUniverseWorkbenchPanel } from "./LawUniverseWorkbenchPanel";
import * as db from "./legalUniverseUserDb";
import * as llm from "./legalUniverseLLM";
import { DEFAULT_LLM_PROVIDER_CONFIG, type UserSourceDoc, type UserExtraction } from "./userDataTypes";

vi.mock("./legalUniversePdf", () => ({ parsePdf: vi.fn(), PdfTooLargeError: class extends Error {}, ScannedPdfError: class extends Error {} }));
vi.mock("./LawUniverseObsidianExportPanel", () => ({ LawUniverseObsidianExportPanel: () => null }));
vi.mock("./LawUniverseBackupPanel", () => ({ LawUniverseBackupPanel: () => null }));
let docs: UserSourceDoc[];
let extractions: UserExtraction[];
const config = { ...DEFAULT_LLM_PROVIDER_CONFIG, apiKey: "test-only-key" };
const makeDoc = (id: string): UserSourceDoc => ({ id, fileName: `${id}.md`, mimeType: "text/markdown", content: "学习资料：合同的订立与履行。", sizeBytes: 30, uploadedAt: 1, status: "pending" });

beforeEach(() => {
  docs = []; extractions = [];
  vi.spyOn(db, "listSourceDocs").mockImplementation(async () => [...docs]);
  vi.spyOn(db, "listExtractions").mockImplementation(async () => [...extractions]);
  vi.spyOn(db, "listMistakes").mockResolvedValue([]);
  vi.spyOn(db, "getLLMProviderConfig").mockResolvedValue(config);
  vi.spyOn(db, "getLLMProviderKeyRemembered").mockResolvedValue(false);
  vi.spyOn(db, "setLLMProviderConfig").mockImplementation(async c => c);
  vi.spyOn(db, "putSourceDoc").mockImplementation(async d => { docs = [...docs.filter(x => x.id !== d.id), d]; return d; });
  vi.spyOn(db, "putExtraction").mockImplementation(async e => { extractions = [...extractions.filter(x => x.id !== e.id), e]; return e; });
  vi.spyOn(db, "deleteExtraction").mockImplementation(async id => { extractions = extractions.filter(x => x.id !== id); });
  vi.spyOn(llm, "extractLegalConcepts").mockResolvedValue({ concepts: [{ title: "合同", type: "principle", system: "civil", importance: 80, summary: "合同学习要点", keyPoints: ["订立", "履行"] }], relations: [], rawResponse: "{}" });
});
afterEach(() => vi.restoreAllMocks());

describe("开源学习工作台", () => {
  it("粘贴资料只保存到本地，未点击分析不发送给 AI", async () => {
    render(<LawUniverseWorkbenchPanel open onClose={() => {}} />);
    fireEvent.change(await screen.findByLabelText("资料标题"), { target: { value: "我的笔记" } });
    fireEvent.change(screen.getByLabelText("粘贴法律学习资料"), { target: { value: "合同双方约定交付时间与价款，讨论违约责任。" } });
    fireEvent.click(screen.getByRole("button", { name: "保存粘贴资料" }));
    await waitFor(() => expect(docs).toHaveLength(1));
    expect(docs[0].fileName).toBe("我的笔记.txt");
    expect(llm.extractLegalConcepts).not.toHaveBeenCalled();
  });
  it("一次分析待处理资料并传递已有概念，结束通知主星图", async () => {
    docs = [makeDoc("one"), makeDoc("two")];
    const changed = vi.fn();
    render(<LawUniverseWorkbenchPanel open onClose={() => {}} onDataChanged={changed} />);
    fireEvent.click(await screen.findByRole("button", { name: /分析待处理资料/ }));
    await waitFor(() => expect(extractions.filter(e => e.status === "succeeded")).toHaveLength(2));
    expect(docs.every(d => d.status === "extracted")).toBe(true);
    expect(changed).toHaveBeenCalled();
    expect(vi.mocked(llm.extractLegalConcepts).mock.calls[1][3]?.existingConcepts?.[0].id).toContain("::0");
  });
  it("删除抽取后原始资料重新成为可分析项目", async () => {
    docs = [{ ...makeDoc("one"), status: "extracted", extractionId: "ext-one" }];
    extractions = [{ id: "ext-one", sourceDocId: "one", status: "succeeded", startedAt: 1, reviewed: false, concepts: [], relations: [] }];
    render(<LawUniverseWorkbenchPanel open onClose={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: /one.md 成功/ }));
    fireEvent.click(screen.getByRole("button", { name: "删除该次抽取" }));
    await waitFor(() => expect(screen.getByTestId("law-universe-workbench-doc-item")).toBeInTheDocument());
    expect(docs[0].extractionId).toBeUndefined();
  });
  it("AI 失败后可重试并恢复成功状态", async () => {
    docs = [makeDoc("retry")];
    vi.mocked(llm.extractLegalConcepts).mockRejectedValueOnce(new llm.ExtractionError("auth", "鉴权失败"));
    render(<LawUniverseWorkbenchPanel open onClose={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: /分析待处理资料/ }));
    await screen.findByText(/抽取失败：鉴权失败/);
    fireEvent.click(screen.getByRole("button", { name: /分析待处理资料/ }));
    await waitFor(() => expect(extractions.filter(e => e.status === "succeeded")).toHaveLength(1));
    expect(docs[0].status).toBe("extracted");
  });
  it("保存设置默认不记住 API Key", async () => {
    render(<LawUniverseWorkbenchPanel open onClose={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: /LLM Provider 设置/ }));
    fireEvent.click(screen.getByRole("button", { name: "保存设置" }));
    await waitFor(() => expect(db.setLLMProviderConfig).toHaveBeenCalledWith(expect.anything(), { rememberKey: false }));
  });
  it("取消分析会停止当前请求与后续队列，仍保留资料供重试", async () => {
    docs = [makeDoc("one"), makeDoc("two")];
    vi.mocked(llm.extractLegalConcepts).mockImplementation((_config, _text, signal) => new Promise((_resolve, reject) => {
      signal?.addEventListener("abort", () => reject(new DOMException("cancelled", "AbortError")));
    }));
    render(<LawUniverseWorkbenchPanel open onClose={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: /分析待处理资料/ }));
    await waitFor(() => expect(llm.extractLegalConcepts).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "取消分析" }));
    await screen.findByText(/抽取失败：分析已取消/);
    expect(llm.extractLegalConcepts).toHaveBeenCalledTimes(1);
    expect(docs.find(d => d.id === "two")?.status).toBe("pending");
    expect(extractions[0].status).toBe("failed");
  });
  it("重复点击不启动重叠请求；关闭工作台取消在途分析", async () => {
    docs = [makeDoc("one")];
    let runningSignal: AbortSignal | undefined;
    vi.mocked(llm.extractLegalConcepts).mockImplementation((_config, _text, signal) => {
      runningSignal = signal;
      return new Promise((_resolve, reject) => signal?.addEventListener("abort", () => reject(new DOMException("cancelled", "AbortError"))));
    });
    const { unmount } = render(<LawUniverseWorkbenchPanel open onClose={() => {}} />);
    const button = await screen.findByRole("button", { name: /分析待处理资料/ });
    fireEvent.click(button); fireEvent.click(button);
    await waitFor(() => expect(llm.extractLegalConcepts).toHaveBeenCalledTimes(1));
    unmount();
    expect(runningSignal?.aborted).toBe(true);
    await waitFor(() => expect(extractions[0].status).toBe("failed"));
  });

  it("initial loading waits for documents, settings and mistakes, disables actions and avoids false empty state", async () => {
    let finishConfig!: (value: typeof config) => void;
    let finishMistakes!: (value: []) => void;
    vi.mocked(db.getLLMProviderConfig).mockReturnValue(new Promise(resolve => { finishConfig = resolve; }));
    vi.mocked(db.listMistakes).mockReturnValue(new Promise(resolve => { finishMistakes = resolve; }));
    docs = [makeDoc("saved")];
    render(<LawUniverseWorkbenchPanel open onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("加载");
    expect(screen.queryByText("还没有上传任何资料。")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /分析待处理资料/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "选择文件" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /LLM Provider 设置/ })).toBeDisabled();
    expect(db.listMistakes).toHaveBeenCalledTimes(1);
    await act(async () => { finishConfig(config); });
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("saved.md")).not.toBeInTheDocument();
    await act(async () => { finishMistakes([]); });
    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "false"));
    expect(screen.getByText("saved.md")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /分析待处理资料/ })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: /LLM Provider 设置/ }));
    expect(screen.getByLabelText("API Key", { exact: true })).toHaveValue("test-only-key");
    expect(screen.getByLabelText(/在此浏览器记住 API Key/)).not.toBeChecked();
  });
  it("load failure clears busy state and shows an error without pretending the library is empty", async () => {
    vi.mocked(db.listSourceDocs).mockRejectedValue(new Error("数据库读取失败"));
    render(<LawUniverseWorkbenchPanel open onClose={() => {}} />);
    await screen.findByRole("alert");
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "false");
    expect(screen.queryByText("还没有上传任何资料。")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /分析待处理资料/ })).toBeDisabled();
  });
  it("an obsolete deferred load cannot overwrite a reopened workbench", async () => {
    let finishOld!: (value: typeof config) => void;
    vi.mocked(db.getLLMProviderConfig).mockReturnValueOnce(new Promise(resolve => { finishOld = resolve; }));
    const { rerender } = render(<LawUniverseWorkbenchPanel open onClose={() => {}} />);
    rerender(<LawUniverseWorkbenchPanel open={false} onClose={() => {}} />);
    docs = [makeDoc("current")];
    rerender(<LawUniverseWorkbenchPanel open onClose={() => {}} />);
    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "false"));
    await act(async () => { finishOld({ ...config, apiKey: "obsolete-key" }); });
    fireEvent.click(screen.getByRole("button", { name: /LLM Provider 设置/ }));
    expect(screen.getByLabelText("API Key", { exact: true })).toHaveValue("test-only-key");
    expect(screen.getByText("current.md")).toBeInTheDocument();
  });

});
