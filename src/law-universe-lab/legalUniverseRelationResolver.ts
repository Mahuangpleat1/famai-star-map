/** Stable ids win; legacy title-only edges must resolve without ambiguity. */
interface RelationNode { id: string; extractionId: string; concept: { title: string } }
interface RelationReference {
  extractionId: string;
  source: string;
  target: string;
  sourceConceptId?: string;
  targetConceptId?: string;
}
export function resolveConceptReference<T extends RelationNode>(extractionId: string, title: string, explicitId: string | undefined, nodes: T[]): T | undefined {
  if (explicitId !== undefined) return nodes.find((node) => node.id === explicitId);
  const local = nodes.filter((node) => node.extractionId === extractionId && node.concept.title === title);
  if (local.length) return local.length === 1 ? local[0] : undefined;
  const global = nodes.filter((node) => node.concept.title === title);
  return global.length === 1 ? global[0] : undefined;
}

export function resolveRelationEndpoints<T extends RelationNode>(relation: RelationReference, nodes: T[]): { source: T; target: T } | null {
  const source = resolveConceptReference(relation.extractionId, relation.source, relation.sourceConceptId, nodes);
  const target = resolveConceptReference(relation.extractionId, relation.target, relation.targetConceptId, nodes);
  return source && target && source.id !== target.id ? { source, target } : null;
}
