import { useCallback, useState } from "react";

/**
 * useSatelliteVisible —— 个人抽取的"卫星节点"在 3D 场景中是否可见。
 * 默认 true;HUD 切换按钮调 toggleSatellites。
 */
export function useSatelliteVisible(initial = true) {
  const [satelliteVisible, setSatelliteVisible] = useState<boolean>(initial);
  const toggleSatellites = useCallback(() => setSatelliteVisible((v) => !v), []);
  return { satelliteVisible, setSatelliteVisible, toggleSatellites };
}
