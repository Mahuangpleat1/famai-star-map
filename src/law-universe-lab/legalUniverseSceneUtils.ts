import { getLegalUniverseNodeById, legalUniverseEdges, legalUniverseNodes, legalUniverseSourceRefs } from "../../data/legalUniverseData";
import type { LegalUniverseEdge, LegalUniverseNode } from "./types";

export type LegalUniverseViewMode = "overview" | "system" | "concept";

export function getLegalUniverseViewMode(selectedNodeId: string): LegalUniverseViewMode {
  const selected = getLegalUniverseNodeById(selectedNodeId);

  if (!selected || selected.type === "universe-core") {
    return "overview";
  }
  if (selected.type === "system-sun") {
    return "system";
  }
  return "concept";
}

export interface LegalUniverseSceneFilter {
  nodeTypes: Set<string> | null;
  levels: Set<number> | null;
  sourceCategories: Set<string> | null;
}

export function isNodeAllowedByFilter(node: LegalUniverseNode, filter: LegalUniverseSceneFilter): boolean {
  if (filter.nodeTypes && !filter.nodeTypes.has(node.type)) {
    return false;
  }
  if (filter.levels && !filter.levels.has(node.level)) {
    return false;
  }
  if (filter.sourceCategories) {
    const ref = node.sourceRefs
      .map((id) => legalUniverseSourceRefs.find((source) => source.id === id))
      .find((source) => source && filter.sourceCategories!.has(source.category));
    if (!ref) {
      return false;
    }
  }
  return true;
}

export function getRelatedLegalUniverseNodeIds(selectedNodeId: string, hoveredNodeId?: string | null): Set<string> {
  const anchorId = hoveredNodeId ?? selectedNodeId;
  const anchorNode = getLegalUniverseNodeById(anchorId);
  const related = new Set<string>(["universe-core", anchorId, selectedNodeId]);

  if (anchorNode?.systemId) {
    related.add(anchorNode.systemId);
  }
  if (anchorNode?.parentId) {
    related.add(anchorNode.parentId);
  }

  if (anchorNode?.type === "system-sun") {
    for (const node of legalUniverseNodes) {
      if (node.systemId === anchorNode.id && node.importance >= 84) {
        related.add(node.id);
      }
    }
  }

  if (anchorNode?.parentId) {
    const siblings = legalUniverseNodes
      .filter((node) => node.parentId === anchorNode.parentId && node.id !== anchorNode.id)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3);
    for (const sibling of siblings) {
      related.add(sibling.id);
    }
  }

  for (const relation of legalUniverseEdges) {
    if (relation.source === anchorId) {
      related.add(relation.target);
    }
    if (relation.target === anchorId) {
      related.add(relation.source);
    }
  }

  return related;
}

export function isLegalUniverseEdgeActive(edge: LegalUniverseEdge, selectedNodeId: string, hoveredNodeId?: string | null): boolean {
  const anchorId = hoveredNodeId ?? selectedNodeId;
  return edge.source === anchorId || edge.target === anchorId;
}

export function shouldRenderLegalUniverseEdge(edge: LegalUniverseEdge, selectedNodeId: string, hoveredNodeId?: string | null): boolean {
  const viewMode = getLegalUniverseViewMode(selectedNodeId);

  if (isLegalUniverseEdgeActive(edge, selectedNodeId, hoveredNodeId)) {
    return true;
  }

  if (viewMode === "overview") {
    const source = getLegalUniverseNodeById(edge.source);
    const target = getLegalUniverseNodeById(edge.target);
    const systemLevel =
      (source?.type === "system-sun" || source?.type === "universe-core") &&
      (target?.type === "system-sun" || target?.type === "universe-core");

    return (
      systemLevel &&
      edge.weight >= 70 &&
      (edge.type === "cross-domain" ||
        edge.type === "subfield-of" ||
        edge.type === "procedural-remedy" ||
        edge.type === "supports" ||
        edge.type === "limits" ||
        edge.type === "historical-influence" ||
        edge.type === "theoretical-foundation")
    );
  }

  const selected = getLegalUniverseNodeById(selectedNodeId);
  const systemId = selected?.type === "system-sun" ? selected.id : selected?.systemId;
  if (!systemId) {
    return false;
  }

  const source = getLegalUniverseNodeById(edge.source);
  const target = getLegalUniverseNodeById(edge.target);
  if (!source || !target) {
    return false;
  }

  if (viewMode === "system") {
    return source.systemId === systemId && target.systemId === systemId && edge.weight >= 82;
  }

  return source.id === selectedNodeId || target.id === selectedNodeId || source.id === systemId || target.id === systemId;
}

export function shouldDimLegalUniverseNode(
  node: LegalUniverseNode,
  selectedNodeId: string,
  relatedNodeIds: Set<string>,
  hoveredNodeId?: string | null
): boolean {
  if (selectedNodeId === "universe-core" && !hoveredNodeId) {
    return node.type !== "universe-core" && node.type !== "system-sun";
  }

  return !relatedNodeIds.has(node.id);
}

export function getLegalUniverseLabelVisible(
  node: LegalUniverseNode,
  selectedNodeId: string,
  relatedNodeIds: Set<string>,
  hoveredNodeId?: string | null
): boolean {
  if (node.type === "universe-core") {
    return true;
  }

  if (node.type === "system-sun") {
    if (selectedNodeId === "universe-core" && !hoveredNodeId) {
      return true;
    }

    return node.id === selectedNodeId || node.id === hoveredNodeId || relatedNodeIds.has(node.id);
  }

  if (node.id === hoveredNodeId || node.id === selectedNodeId) {
    return true;
  }

  if (selectedNodeId === "universe-core" && !hoveredNodeId) {
    return false;
  }

  const selected = getLegalUniverseNodeById(selectedNodeId);
  const systemId = selected?.type === "system-sun" ? selected.id : selected?.systemId;

  if (selected?.type === "system-sun") {
    return node.systemId === selected.id && node.importance >= 86;
  }

  if (selected?.parentId) {
    return relatedNodeIds.has(node.id) && node.id === selected.parentId;
  }

  return Boolean(systemId) && node.systemId === systemId && relatedNodeIds.has(node.id);
}
