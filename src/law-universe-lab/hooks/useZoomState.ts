import { useCallback, useState } from "react";

/**
 * useZoomState —— 当前 HUD 缩放档位(0/1/2),3 档离散。
 * zoomIn/zoomOut 自带 clamp,不会越界。
 */
export function useZoomState(initial = 1) {
  const [zoomLevel, setZoomLevel] = useState<number>(initial);
  const zoomIn = useCallback(() => setZoomLevel((z) => Math.min(2, z + 1)), []);
  const zoomOut = useCallback(() => setZoomLevel((z) => Math.max(0, z - 1)), []);
  return { zoomLevel, setZoomLevel, zoomIn, zoomOut };
}
