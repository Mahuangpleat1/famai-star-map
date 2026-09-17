import { useCallback, useState } from "react";

/**
 * useRelationVisible —— 节点间关系 beam (从概念到概念) 在 3D 场景中是否可见。
 * 与 useSatelliteVisible 对称,独立成 hook,方便在 HUD 上独立切换。
 */
export function useRelationVisible(initial = true) {
  const [relationVisible, setRelationVisible] = useState<boolean>(initial);
  const toggleRelations = useCallback(() => setRelationVisible((v) => !v), []);
  return { relationVisible, setRelationVisible, toggleRelations };
}
