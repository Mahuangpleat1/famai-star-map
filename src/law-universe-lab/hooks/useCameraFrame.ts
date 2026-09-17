import { useEffect, useState } from "react";
import { getLawUniverseCameraFrame, type LawUniverseCameraFrame } from "../lawUniverseCameraFrame";

/**
 * useCameraFrame —— 封装 cameraFrame state,与 (selectedNodeId, zoomLevel) 同步。
 *
 * selectedNodeId 或 zoomLevel 变化时重新计算相机位置/目标点(并触发相机过场动画)。
 * Scene 的 onCameraFrame 回调可以覆盖 cameraFrame(给出"实际渲染中"的当前帧位置),
 * 通过 setCameraFrame 暴露给 LabPage。
 */
export function useCameraFrame(selectedNodeId: string, zoomLevel: number) {
  const [cameraFrame, setCameraFrame] = useState<LawUniverseCameraFrame>(() =>
    getLawUniverseCameraFrame(selectedNodeId, zoomLevel)
  );

  useEffect(() => {
    setCameraFrame(getLawUniverseCameraFrame(selectedNodeId, zoomLevel));
  }, [selectedNodeId, zoomLevel]);

  return { cameraFrame, setCameraFrame };
}
