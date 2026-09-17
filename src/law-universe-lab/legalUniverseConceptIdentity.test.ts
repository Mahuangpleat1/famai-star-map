import { describe, expect, it } from "vitest";
import { getConceptId, planConceptMerge } from "./legalUniverseConceptIdentity";
import type { UserExtraction, UserExtractedConcept } from "./userDataTypes";
const concept = (title: string): UserExtractedConcept => ({ title, type: "principle", system: "civil", importance: 50, summary: title, keyPoints: [] });
const extraction = (id: string, titles: string[]): UserExtraction => ({ id, sourceDocId: id, status: "succeeded", startedAt: 0, reviewed: false, concepts: titles.map(concept), relations: [] });
const relation = (source: string, target: string) => ({ source, target, type: "依据" as const, strength: 70, citation: "依据" });
describe("stable concept identity and merge planning", () => {
  it("retains persisted identity when index changes", () => {
    expect(getConceptId("ext", { ...concept("C"), id: "ext::2" }, 1)).toBe("ext::2");
    expect(getConceptId("ext", concept("A"), 0)).toBe("ext::0");
  });
  it("removes from correct extraction and freezes survivor ids before splicing", () => {
    const first = extraction("first", ["主概念", "不应被删除"]);
    const other = extraction("other", ["删除概念", "保留概念"]);
    const { before, after } = planConceptMerge([first, other], "first::0", "other::0");
    expect(after.find((e) => e.id === "first")?.concepts.map((c) => c.title)).toEqual(["主概念", "不应被删除"]);
    const survivor = after.find((e) => e.id === "other")!.concepts[0];
    expect(survivor).toMatchObject({ id: "other::1", title: "保留概念" });
    expect(before).toEqual([first, other]);
    expect(other.concepts).toHaveLength(2);
  });
  it("rewrites exact ids across documents and resolves historical edges before removal", () => {
    const keep = extraction("keep", ["合同"]);
    const remove = extraction("remove", ["合同", "责任"]);
    const unrelated = extraction("unrelated", ["合同", "损害"]);
    remove.relations = [relation("合同", "责任")];
    unrelated.relations = [relation("合同", "损害"), { ...relation("合同", "损害"), sourceConceptId: "remove::0" }];
    const { after } = planConceptMerge([keep, remove, unrelated], "keep::0", "remove::0");
    expect(after.find((e) => e.id === "remove")?.relations[0]).toMatchObject({ sourceConceptId: "keep::0", targetConceptId: "remove::1" });
    expect(after.find((e) => e.id === "unrelated")?.relations[0].sourceConceptId).toBe("unrelated::0");
    expect(after.find((e) => e.id === "unrelated")?.relations[1].sourceConceptId).toBe("keep::0");
  });
  it("drops self loops formed by merging and does not guess ambiguous legacy endpoints", () => {
    const a = extraction("a", ["共同", "删除"]);
    const b = extraction("b", ["共同"]);
    const c = extraction("c", ["其他"]);
    a.relations = [relation("删除", "共同")];
    c.relations = [relation("共同", "其他")];
    const { after } = planConceptMerge([a, b, c], "a::0", "a::1");
    expect(after.find((e) => e.id === "a")?.relations).toEqual([]);
    expect(after.find((e) => e.id === "c")?.relations[0].sourceConceptId).toBe("");
  });
  it("retains a deleted explicit reference rather than attaching a same-title node", () => {
    const a = extraction("a", ["共同", "删除"]);
    a.relations = [{ ...relation("共同", "删除"), sourceConceptId: "gone::0" }];
    const { after } = planConceptMerge([a], "a::0", "a::1");
    expect(after[0].relations[0]).toMatchObject({ sourceConceptId: "gone::0", targetConceptId: "a::0" });
  });
  it("rejects missing, repeated or identical identity without mutating data", () => {
    const a = extraction("a", ["A", "B"]);
    expect(() => planConceptMerge([a], "a::0", "missing")).toThrow();
    expect(() => planConceptMerge([a], "a::0", "a::0")).toThrow();
    expect(() => planConceptMerge([a, a], "a::0", "a::1")).toThrow();
  });
  it("does not turn a previously ambiguous global title into a guessed edge after merging", () => {
    const a = extraction("a", ["合同"]), b = extraction("b", ["合同"]), c = extraction("c", ["其他"]);
    c.relations = [relation("合同", "其他")];
    const { after } = planConceptMerge([a, b, c], "a::0", "b::0");
    // An explicit missing reference prevents later global-title fallback from inventing attribution.
    expect(after.find((e) => e.id === "c")?.relations[0].sourceConceptId).toBe("");
  });

});
