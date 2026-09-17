import type { UserExtractedConcept, UserExtraction } from "./userDataTypes";
import { resolveConceptReference } from "./legalUniverseRelationResolver";

/** Persisted identity survives array edits; legacy data keeps its original indexed identity. */
export function getConceptId(extractionId: string, concept: UserExtractedConcept, index: number): string {
  return typeof concept.id === "string" && concept.id.trim() ? concept.id : `${extractionId}::${index}`;
}

/** Plan against one complete snapshot. The DB compares and atomically commits these changes. */
export function planConceptMerge(extractions: UserExtraction[], keepId: string, removeId: string): { before: UserExtraction[]; after: UserExtraction[] } {
  const nodes = extractions.filter((e) => e.status === "succeeded").flatMap((e) => e.concepts.map((concept, index) => ({
    id: getConceptId(e.id, concept, index), extractionId: e.id, concept
  })));
  if (new Set(nodes.map((node) => node.id)).size !== nodes.length) throw new Error("概念标识重复，请检查导入资料");
  const keep = nodes.find((n) => n.id === keepId), removed = nodes.find((n) => n.id === removeId);
  if (!keep || !removed || keepId === removeId) throw new Error("合并概念已变化，请刷新后重试");
  const before: UserExtraction[] = [], after: UserExtraction[] = [];
  for (const extraction of extractions) {
    // Fix ids before removing anything, including every surviving indexed concept.
    const concepts = extraction.id === keep.extractionId || extraction.id === removed.extractionId
      ? extraction.concepts.map((concept, index) => ({ ...concept, id: getConceptId(extraction.id, concept, index) })).filter((concept) => concept.id !== removeId)
      : extraction.concepts;
    const relations = extraction.relations.flatMap((relation) => {
      const source = resolveConceptReference(extraction.id, relation.source, relation.sourceConceptId, nodes);
      const target = resolveConceptReference(extraction.id, relation.target, relation.targetConceptId, nodes);
      // Preserve pre-merge ambiguity: removing a duplicate must not invent a new global-title match.
      const sourceId = source?.id ?? relation.sourceConceptId ?? (nodes.filter((n) => n.concept.title === relation.source).length > 1 ? "" : undefined);
      const targetId = target?.id ?? relation.targetConceptId ?? (nodes.filter((n) => n.concept.title === relation.target).length > 1 ? "" : undefined);
      const nextSourceId = sourceId === removeId ? keepId : sourceId;
      const nextTargetId = targetId === removeId ? keepId : targetId;
      if (nextSourceId && nextSourceId === nextTargetId) return [];
      return [{
        ...relation,
        ...(nextSourceId !== undefined ? { sourceConceptId: nextSourceId } : {}),
        ...(nextTargetId !== undefined ? { targetConceptId: nextTargetId } : {}),
        ...(sourceId === removeId ? { source: keep.concept.title } : {}),
        ...(targetId === removeId ? { target: keep.concept.title } : {})
      }];
    });
    const next = { ...extraction, concepts, relations };
    if (JSON.stringify(next) !== JSON.stringify(extraction)) { before.push(extraction); after.push(next); }
  }
  return { before, after };
}
