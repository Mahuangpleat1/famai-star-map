import { useState } from "react";
import type { UserExtraction } from "../userDataTypes";
import type { ReviewableSatellite } from "../useUserSatellites";

/**
 * useSatellite —— 用户点击 3D 卫星节点时,LabPage 持有的两件东西:
 *   - selectedSatellite: 被点中的卫星(用来展示 SatelliteDetailPanel)
 *   - satelliteExtraction: 该卫星所属的抽取任务(用来给面板回链到抽取审阅)
 */
export function useSatellite() {
  const [selectedSatellite, setSelectedSatellite] = useState<ReviewableSatellite | null>(null);
  const [satelliteExtraction, setSatelliteExtraction] = useState<UserExtraction | null>(null);
  return {
    selectedSatellite,
    setSelectedSatellite,
    satelliteExtraction,
    setSatelliteExtraction
  };
}
