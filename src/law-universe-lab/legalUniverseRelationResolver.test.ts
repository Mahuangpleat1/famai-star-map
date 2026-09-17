import { describe, expect, it } from "vitest";
import { resolveRelationEndpoints } from "./legalUniverseRelationResolver";
const nodes = [
  { id: "old::0", extractionId: "old", concept: { title: "合同" } },
  { id: "new::0", extractionId: "new", concept: { title: "合同" } },
  { id: "new::1", extractionId: "new", concept: { title: "责任" } },
];
const relation = { extractionId: "new", source: "合同", target: "责任" };
describe("stable relation endpoints", () => {
  it("prefers explicit ids even when title changed", () => {
    expect(resolveRelationEndpoints({ ...relation, source: "旧名称", sourceConceptId: "old::0" }, nodes)?.source.id).toBe("old::0");
  });
  it("prefers same extraction title over a duplicate global title", () => {
    expect(resolveRelationEndpoints(relation, nodes)?.source.id).toBe("new::0");
  });
  it("allows only unique global title fallback", () => {
    expect(resolveRelationEndpoints({ ...relation, extractionId: "missing" }, nodes)).toBeNull();
    expect(resolveRelationEndpoints({ ...relation, extractionId: "missing" }, nodes.slice(1))?.source.id).toBe("new::0");
  });
  it("never falls back when an explicit id was deleted", () => {
    expect(resolveRelationEndpoints({ ...relation, sourceConceptId: "deleted::0" }, nodes)).toBeNull();
  });
  it("does not render resolved self loops", () => {
    expect(resolveRelationEndpoints({ ...relation, targetConceptId: "new::0" }, nodes)).toBeNull();
  });
  it("supports equal titles with different explicit ids", () => {
    expect(resolveRelationEndpoints({ ...relation, target: "合同", sourceConceptId: "old::0", targetConceptId: "new::0" }, nodes)?.target.id).toBe("new::0");
  });
});
