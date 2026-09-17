import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LawUniverseStudyPanel } from "./LawUniverseStudyPanel";
import { generateStudyReport } from "./legalUniverseStudy";
import { DEFAULT_LLM_PROVIDER_CONFIG, type UserExtraction, type UserSourceDoc } from "./userDataTypes";
vi.mock("./legalUniverseStudy", () => ({ generateStudyReport: vi.fn() }));
const source: UserSourceDoc = { id: "doc", fileName: "学习笔记.md", mimeType: "text/markdown", sizeBytes: 10, content: "合同", uploadedAt: 1, status: "extracted" };
const extraction: UserExtraction = { id: "ext", sourceDocId: "doc", startedAt: 1, status: "succeeded", reviewed: false, concepts: [{title: "合同", type: "principle", system: "civil", summary: "双方约定", keyPoints: [], importance: 50}], relations: [] };
beforeEach(() => vi.mocked(generateStudyReport).mockResolvedValue("# 学习报告\n\n合同与违约责任\n<script>untrusted</script>"));
describe("学习报告", () => {
  it("显式点击后生成，可预览纯文本并下载 Markdown", async () => {
    render(<LawUniverseStudyPanel config={DEFAULT_LLM_PROVIDER_CONFIG} extractions={[extraction]} sourceDocs={[source]} disabled={false} onBusyChange={() => {}} />);
    expect(generateStudyReport).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "生成学习报告" }));
    await screen.findByText(/合同与违约责任/);
    expect(screen.getByRole("button", { name: "下载 Markdown" })).toBeEnabled();
    expect(document.querySelector("script")).toBeNull();
  });
  it("资料变化清除旧报告，防止把旧总结当作当前资料的结果", async () => {
    const { rerender } = render(<LawUniverseStudyPanel config={DEFAULT_LLM_PROVIDER_CONFIG} extractions={[extraction]} sourceDocs={[source]} disabled={false} onBusyChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "生成学习报告" }));
    await screen.findByText(/合同与违约责任/);
    rerender(<LawUniverseStudyPanel config={DEFAULT_LLM_PROVIDER_CONFIG} extractions={[]} sourceDocs={[source]} disabled={false} onBusyChange={() => {}} />);
    await waitFor(() => expect(screen.queryByRole("button", { name: "下载 Markdown" })).toBeNull());
  });
  it("可缩小报告范围，只发送选中的抽取", async () => {
    const second = { ...extraction, id: "second", sourceDocId: "second-doc" };
    render(<LawUniverseStudyPanel config={DEFAULT_LLM_PROVIDER_CONFIG} extractions={[extraction, second]} sourceDocs={[source, { ...source, id: "second-doc", fileName: "第二份.md" }]} disabled={false} onBusyChange={() => {}} />);
    fireEvent.click(screen.getByText("报告资料范围（已选 2 份）"));
    fireEvent.click(screen.getByRole("checkbox", { name: "第二份.md" }));
    fireEvent.click(screen.getByRole("button", { name: "生成学习报告" }));
    await waitFor(() => expect(generateStudyReport).toHaveBeenLastCalledWith(expect.anything(), [extraction], expect.anything(), expect.anything()));
  });

});
