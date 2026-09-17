import { useCallback, useState } from "react";

export type PathMode = "idle" | "awaiting-to";

export interface PathEndpoints {
  from: string;
  to: string;
}

/**
 * usePath —— 用户在 3D 场景里点两下连成一条学习路径:
 *   - pathMode: 当前是否在等用户点第二个端点
 *   - pathEndpoints: 起讫两个节点 id
 *   - activePathId: 已被选中展示在 PathPanel 的路径
 *
 * initialEndpoints 用于从 URL hash 还原(用户分享带 p=...~... 的链接,首次打开即显示路径)。
 */
export function usePath(initialEndpoints: PathEndpoints | null = null) {
  const [pathEndpoints, setPathEndpoints] = useState<PathEndpoints | null>(initialEndpoints);
  const [pathMode, setPathMode] = useState<PathMode>("idle");
  const [activePathId, setActivePathId] = useState<string | null>(null);

  // 用户在节点上点第一下:进入"等待第二个端点"态(由 LabPage 的 click handler 调)
  const startPathFrom = useCallback((_id: string) => {
    setPathMode("awaiting-to");
  }, []);

  return {
    pathEndpoints,
    setPathEndpoints,
    pathMode,
    setPathMode,
    activePathId,
    setActivePathId,
    startPathFrom
  };
}
