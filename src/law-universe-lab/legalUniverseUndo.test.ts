import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyLearningUndo } from "./legalUniverseUndo";
import * as db from "./legalUniverseUserDb";
import type { UserExtraction } from "./userDataTypes";
vi.mock("./legalUniverseUserDb", () => ({ getExtraction: vi.fn(), replaceExtractions: vi.fn() }));
const original: UserExtraction = { id: "ext", sourceDocId: "doc", status: "succeeded", startedAt: 1, reviewed: false, concepts: [{ id: "ext::2", title: "合同", type: "principle", system: "criminal", importance: 50, summary: "学习", keyPoints: [] }], relations: [] };
beforeEach(() => vi.clearAllMocks());
describe("学习操作撤销", () => {
  it("合并撤销原子恢复全部相关抽取", async () => {
    const after = { ...original, concepts: [] };
    await expect(applyLearningUndo({ type: "merge", before: [original], after: [after], at: Date.now() })).resolves.toBe(true);
    expect(db.replaceExtractions).toHaveBeenCalledWith([after], [original]);
  });
  it("数组位置变化后移动撤销仍按不可变ID找到概念", async () => {
    vi.mocked(db.getExtraction).mockResolvedValue(original);
    await applyLearningUndo({ type: "move", extractionId: "ext", conceptIndex: 2, conceptId: "ext::2", fromSystem: "civil", toSystem: "criminal", at: Date.now() });
    expect(db.replaceExtractions).toHaveBeenCalledWith([original], [expect.objectContaining({ concepts: [expect.objectContaining({id: "ext::2", system: "civil"})] })]);
  });
  it("被其他操作改动的概念不能被过期撤销覆盖", async () => {
    vi.mocked(db.getExtraction).mockResolvedValue(original);
    await expect(applyLearningUndo({ type: "move", extractionId: "ext", conceptIndex: 0, conceptId: "ext::2", fromSystem: "civil", toSystem: "economic", at: Date.now() })).rejects.toThrow();
    expect(db.replaceExtractions).not.toHaveBeenCalled();
  });
});
