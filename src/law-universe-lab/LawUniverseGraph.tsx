import { useMemo } from "react";
import { legalUniverseEdges, legalUniverseNodes } from "../../data/legalUniverseData";
import { LawUniverseNode } from "./LawUniverseNode";
import { LawUniverseRelationBeam } from "./LawUniverseRelationBeam";
import {
  getLegalUniverseLabelVisible,
  getLegalUniverseViewMode,
  getRelatedLegalUniverseNodeIds,
  isNodeAllowedByFilter,
  shouldDimLegalUniverseNode,
  shouldRenderLegalUniverseEdge,
  type LegalUniverseSceneFilter
} from "./legalUniverseSceneUtils";

interface LawUniverseGraphProps {
  selectedNodeId: string;
  hoveredNodeId: string | null;
  motionPaused: boolean;
  reducedMotion: boolean;
  introProgress: number;
  focusIgnitionKey: number;
  filter: LegalUniverseSceneFilter;
  onSelectNode: (id: string) => void;
  onHoverNode: (id: string | null) => void;
}

export function LawUniverseGraph({
  selectedNodeId,
  hoveredNodeId,
  motionPaused,
  reducedMotion,
  introProgress,
  focusIgnitionKey,
  filter,
  onSelectNode,
  onHoverNode
}: LawUniverseGraphProps) {
  const viewMode = getLegalUniverseViewMode(selectedNodeId);
  const relatedNodeIds = useMemo(() => getRelatedLegalUniverseNodeIds(selectedNodeId, hoveredNodeId), [hoveredNodeId, selectedNodeId]);
  const selectedNode = legalUniverseNodes.find((node) => node.id === selectedNodeId);
  const selectedSystemId = selectedNode?.type === "system-sun" ? selectedNode.id : selectedNode?.systemId;
  const motionScale = motionPaused || reducedMotion ? 0 : viewMode === "overview" ? 0.18 : 0.055;
  const filteredNodeIds = useMemo(
    () => new Set(legalUniverseNodes.filter((node) => isNodeAllowedByFilter(node, filter)).map((node) => node.id)),
    [filter]
  );
  const visibleEdges = legalUniverseEdges.filter(
    (edge) =>
      filteredNodeIds.has(edge.source) &&
      filteredNodeIds.has(edge.target) &&
      shouldRenderLegalUniverseEdge(edge, selectedNodeId, hoveredNodeId)
  );
  const visibleNodes = legalUniverseNodes.filter((node) => {
    if (!filteredNodeIds.has(node.id)) {
      return false;
    }
    if (viewMode === "overview") {
      return node.type === "universe-core" || node.type === "system-sun";
    }
    if (node.type === "universe-core" || node.type === "system-sun") {
      return true;
    }
    if (viewMode === "system") {
      return node.systemId === selectedSystemId;
    }
    return node.systemId === selectedSystemId || relatedNodeIds.has(node.id);
  });

  return (
    <group>
      {visibleEdges.map((edge) => (
        <LawUniverseRelationBeam
          key={`${edge.source}-${edge.target}`}
          edge={edge}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          introProgress={Math.max(0.22, introProgress)}
          focusIgnitionKey={focusIgnitionKey}
          onSelectNode={onSelectNode}
        />
      ))}
      {visibleNodes.map((node) => {
        const dimmed = shouldDimLegalUniverseNode(node, selectedNodeId, relatedNodeIds, hoveredNodeId);
        return (
          <LawUniverseNode
            key={node.id}
            node={node}
            selectedNodeId={selectedNodeId}
            hoveredNodeId={hoveredNodeId}
            isDimmed={dimmed}
            labelVisible={getLegalUniverseLabelVisible(node, selectedNodeId, relatedNodeIds, hoveredNodeId)}
            introProgress={introProgress}
            focusIgnitionKey={focusIgnitionKey}
            motionScale={motionScale}
            onSelectNode={onSelectNode}
            onHoverNode={onHoverNode}
          />
        );
      })}
    </group>
  );
}
