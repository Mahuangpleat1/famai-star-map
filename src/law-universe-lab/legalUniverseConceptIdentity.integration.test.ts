import { beforeEach, describe, expect, it } from "vitest";
import { __resetDBForTests, listExtractions, putExtraction, replaceExtractions } from "./legalUniverseUserDb";
import { getConceptId, planConceptMerge } from "./legalUniverseConceptIdentity";
import { resolveRelationEndpoints } from "./legalUniverseRelationResolver";
import type { UserExtraction } from "./userDataTypes";
const extraction = (id: string, titles: string[]): UserExtraction => ({ id, sourceDocId: id, status: "succeeded", startedAt: 0, reviewed: false, concepts: titles.map((title) => ({ title, type: "principle", system: "civil", importance: 50, summary: "", keyPoints: [] })), relations: [] });
beforeEach(() => __resetDBForTests());
describe("atomic concept merge and undo", () => {
  it("persists correct cross-document merge, stable surviving identity and restores exact snapshots", async () => {
    const keep = extraction("keep", ["合同"]), other = extraction("other", ["合同", "责任"]), third = extraction("third", ["损害"]);
    third.relations = [{ source: "责任", target: "损害", sourceConceptId: "other::1", targetConceptId: "third::0", type: "依据", strength: 70, citation: "第2条" }];
    other.relations = [{ source: "合同", target: "责任", type: "依据", strength: 70, citation: "第1条" }];
    for (const ext of [keep, other, third]) await putExtraction(ext);
    const initial = await listExtractions();
    const plan = planConceptMerge(initial, "keep::0", "other::0");
    await replaceExtractions(plan.before, plan.after);
    const stored = await listExtractions();
    expect(stored.find((e) => e.id === "other")?.concepts[0]).toMatchObject({ id: "other::1", title: "责任" });
    const nodes = stored.flatMap((e) => e.concepts.map((concept, i) => ({ id: getConceptId(e.id, concept, i), extractionId: e.id, concept })));
    const relation = stored.find((e) => e.id === "other")!.relations[0];
    expect(resolveRelationEndpoints({ ...relation, extractionId: "other" }, nodes)?.source.id).toBe("keep::0");
    const secondMerge = planConceptMerge(stored, "third::0", "other::1");
    expect(secondMerge.after.find((e) => e.id === "other")?.concepts).toHaveLength(0);
    await replaceExtractions(plan.after, plan.before);
    expect(await listExtractions()).toEqual(initial);
  });
  it("rejects stale snapshots without corrupting another affected source", async () => {
    await putExtraction(extraction("a", ["合同"])); await putExtraction(extraction("b", ["合同", "责任"]));
    const plan = planConceptMerge(await listExtractions(), "a::0", "b::0");
    await putExtraction({ ...plan.before.find((e) => e.id === "b")!, reviewed: true });
    await expect(replaceExtractions(plan.before, plan.after)).rejects.toThrow();
    const stored = await listExtractions();
    expect(stored.find((e) => e.id === "a")?.concepts[0].id).toBeUndefined();
    expect(stored.find((e) => e.id === "b")?.concepts).toHaveLength(2);
  });
});
