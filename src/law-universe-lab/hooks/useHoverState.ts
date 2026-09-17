import { useState } from "react";

/**
 * useHoverState —— 3D 场景里当前 hover 的节点 id。
 * LabPage 唯一所有权,无副作用、无跨 hook 依赖。
 */
export function useHoverState() {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  return { hoveredNodeId, setHoveredNodeId };
}
