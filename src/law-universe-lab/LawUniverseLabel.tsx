import { Html } from "@react-three/drei";
import { useEffect, useState, type CSSProperties } from "react";
import type { LegalUniverseNode } from "./types";
import "./css/law-universe-lab-scene.css";

interface LawUniverseLabelProps {
  node: LegalUniverseNode;
  selectedNodeId: string;
  isSelected: boolean;
  isDimmed: boolean;
  isVisible: boolean;
  onSelectNode: (id: string) => void;
}

type LabelStyle = CSSProperties & Record<"--universe-label-opacity", string>;

function useCompactViewport(): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 720px)");
    const update = () => setCompact(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return compact;
}

export function LawUniverseLabel({
  node,
  selectedNodeId,
  isSelected,
  isDimmed,
  isVisible,
  onSelectNode
}: LawUniverseLabelProps) {
  const compactViewport = useCompactViewport();
  const usePlainMobileOverviewName = compactViewport && selectedNodeId === "universe-core" && node.type === "system-sun";
  const usePlainMobileConceptName =
    compactViewport && selectedNodeId !== "universe-core" && node.type !== "system-sun" && node.type !== "universe-core";
  const labelClassName = [
    "law-universe-label",
    `is-${node.type}`,
    `is-level-${node.level}`,
    isSelected ? "is-selected" : "",
    isDimmed ? "is-dimmed" : "",
    isVisible ? "is-visible" : "is-hidden"
  ]
    .filter(Boolean)
    .join(" ");
  const labelStyle: LabelStyle = {
    "--universe-label-opacity": String(isSelected ? 1 : isDimmed ? 0.2 : selectedNodeId === "universe-core" ? 0.78 : 0.92)
  };

  return (
    <Html
      center
      distanceFactor={node.type === "system-sun" ? 11.6 : node.type === "universe-core" ? 13 : 7.4}
      zIndexRange={[14, 0]}
    >
      <button
        type="button"
        className={labelClassName}
        data-node-id={node.id}
        data-node-kind={node.type}
        data-domain={node.domain}
        data-label-visible={isVisible ? "true" : "false"}
        aria-label={usePlainMobileOverviewName || usePlainMobileConceptName ? undefined : `聚焦 ${node.title}`}
        style={labelStyle}
        onClick={(event) => {
          event.stopPropagation();
          onSelectNode(node.id);
        }}
      >
        <span>{node.title}</span>
      </button>
    </Html>
  );
}
