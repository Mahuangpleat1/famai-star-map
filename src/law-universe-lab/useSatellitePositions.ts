/**
 * 卫星位置计算 hook（共享给 Satellites 和 RelationBeams）。
 *
 * Phase 1 原 LawUniverseSatellites 用 Math.random() 算位置，渲染时机不同
 * 会跳变。Phase 2.5 抽出来用基于 satellite.id 的稳定 hash，保证：
 *   - 同一 satellite 每次渲染位置一致
 *   - 多个组件（Satellites / RelationBeams）算同一份位置
 */

import { useMemo } from "react";
import { getLegalUniverseSystemById } from "../../data/legalUniverseData";
import type { ReviewableSatellite } from "./useUserSatellites";

const UNCLASSIFIED_CENTER: [number, number, number] = [0, 5, 0];

function getSystemCenter(systemId: string): [number, number, number] {
  if (systemId === "unclassified") return UNCLASSIFIED_CENTER;
  const system = getLegalUniverseSystemById(systemId);
  if (system) return system.systemPosition;
  return [0, 0, 0];
}

/** 基于 string 的稳定 hash（djb2）。 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export interface SatellitePosition {
  id: string;
  displaySystem: string;
  position: [number, number, number];
}

export function useSatellitePositions(satellites: ReviewableSatellite[]): Map<string, SatellitePosition> {
  return useMemo(() => {
    const groups = new Map<string, ReviewableSatellite[]>();
    for (const s of satellites) {
      const list = groups.get(s.displaySystem) ?? [];
      list.push(s);
      groups.set(s.displaySystem, list);
    }
    const dict = new Map<string, SatellitePosition>();
    for (const [systemId, list] of groups) {
      const center = getSystemCenter(systemId);
      const N = list.length;
      list.forEach((satellite, i) => {
        const h = hashString(satellite.id);
        // 角度：(i / N) * 2π + jitter (基于 hash)
        const angle = (i / Math.max(1, N)) * Math.PI * 2 + ((h % 100) / 100) * 0.4;
        // 半径：2-3
        const radius = 2.0 + ((h * 7) % 100) / 100;
        // 高度：±0.4
        const yOffset = (((h * 13) % 100) / 100) * 0.8 - 0.4;
        const position: [number, number, number] = [
          center[0] + Math.cos(angle) * radius,
          center[1] + yOffset,
          center[2] + Math.sin(angle) * radius
        ];
        dict.set(satellite.id, { id: satellite.id, displaySystem: systemId, position });
      });
    }
    return dict;
  }, [satellites]);
}
