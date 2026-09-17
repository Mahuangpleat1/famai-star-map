import { afterEach, describe, expect, it, vi } from "vitest";
import { generateStudyReport } from "./legalUniverseStudy";
import { DEFAULT_LLM_PROVIDER_CONFIG, type UserExtraction, type UserSourceDoc } from "./userDataTypes";
const config = { ...DEFAULT_LLM_PROVIDER_CONFIG, apiKey: "secret-key" };
const docs: UserSourceDoc[] = ["A", "B"].map((id) => ({ id, fileName: `${id}.txt`, mimeType: "text/plain", sizeBytes: 2, content: `${id}原文`, uploadedAt: 0, status: "extracted" }));
const extractions: UserExtraction[] = docs.map((doc) => ({ id: `ext-${doc.id}`, sourceDocId: doc.id, status: "succeeded", startedAt: 0, reviewed: false, concepts: [{ title: `概念${doc.id}`, type: "principle", system: "civil", importance: 70, summary: "概念解释", keyPoints: [] }], relations: [] }));
afterEach(() => vi.unstubAllGlobals());
describe("integrated study report", () => {
  it("integrates all sources with traceable identifiers and a caution", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: "# 学习报告\n比较两份资料。" } }] })));
    vi.stubGlobal("fetch", fetcher);
    const markdown = await generateStudyReport(config, extractions, docs);
    const request = JSON.parse(fetcher.mock.calls[0][1].body);
    for (const value of ["A.txt", "B.txt", "ext-A::0", "ext-B::0"]) expect(request.messages[1].content).toContain(value);
    expect(request.messages[1].content).toMatch(/学习计划/);
    expect(markdown).toContain("比较两份资料");
    expect(markdown).toContain("AI");
    expect(markdown).toContain("A.txt");
    expect(markdown).toContain("B.txt");
  });
  it("rejects missing source attribution before fetch", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    await expect(generateStudyReport(config, extractions, docs.slice(0, 1))).rejects.toThrow(/来源|资料/);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects oversized context explicitly without silently dropping documents", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    await expect(generateStudyReport(config, extractions.map((e) => ({ ...e, concepts: e.concepts.map((c) => ({ ...c, summary: "法".repeat(100000) })) })), docs)).rejects.toThrow(/上限|过长|减少/);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("does not send failed or empty extractions as a report", async () => {
    vi.stubGlobal("fetch", vi.fn());
    await expect(generateStudyReport(config, [], docs)).rejects.toThrow();
  });
  it("supports cancellation", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    const controller = new AbortController();
    const pending = expect(generateStudyReport(config, extractions, docs, controller.signal)).rejects.toMatchObject({ name: "AbortError" });
    controller.abort(); await pending;
  });
  it("sends only succeeded extraction summaries and source identifiers, never document text", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: "# 报告" } }] })));
    vi.stubGlobal("fetch", fetcher);
    const pending: UserSourceDoc = { ...docs[0], id: "pending", fileName: "pending-private.txt", status: "pending", content: "PENDING_RAW_SENTINEL" };
    const failed: UserExtraction = { ...extractions[0], id: "failed", sourceDocId: "pending", status: "failed", concepts: [{ ...extractions[0].concepts[0], summary: "FAILED_SUMMARY_SENTINEL" }] };
    const report = await generateStudyReport(config, [...extractions, failed], [...docs, pending]);
    const body = fetcher.mock.calls[0][1].body;
    for (const omitted of ["PENDING_RAW_SENTINEL", "pending-private.txt", "FAILED_SUMMARY_SENTINEL", "A原文", "B原文"]) expect(body).not.toContain(omitted);
    expect(report).not.toContain("pending-private.txt");
    expect(report).toContain("未重新核验原文");
  });
  it("can summarize a long source using its extraction summary", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: "# 报告" } }] }))));
    await expect(generateStudyReport(config, extractions, docs.map((d) => ({ ...d, content: "原文".repeat(100000) })))).resolves.toContain("报告");
  });

  it("uses persisted concept ids and explicitly requests department-grouped study", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: "# 报告" } }] })));
    vi.stubGlobal("fetch", fetcher);
    await generateStudyReport(config, extractions.map((e) => ({ ...e, concepts: e.concepts.map((c) => ({ ...c, id: `${e.id}::5` })) })), docs);
    const prompt = JSON.parse(fetcher.mock.calls[0][1].body).messages[1].content;
    expect(prompt).toContain("ext-A::5");
    expect(prompt).toContain("按部门法/星系分组");
  });

  it("rejects a provider-truncated Markdown report rather than reporting success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ finish_reason: "length", message: { content: "# 尚未完成的报告" } }] }))));
    await expect(generateStudyReport(config, extractions, docs)).rejects.toThrow(/截断.*maxTokens/i);
  });

});
