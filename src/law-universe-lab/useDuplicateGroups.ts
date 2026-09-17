/**
 * 重复概念分组 hook —— Phase 2.6。
 *
 * 归一化 title（去空格、转小写、去尾部标点）+ system 相等 → 同一组。
 * 派生 DuplicateGroup[]，每组 satellite 按 extractionId 排序（最早出现的为"主"）。
 */

import { useMemo } from "react";
import type { ReviewableSatellite } from "./useUserSatellites";

export interface DuplicateGroup {
  normalizedTitle: string;
  /** 选最长的原始 title 作为 displayTitle。 */
  displayTitle: string;
  satellites: ReviewableSatellite[];
  /** 主 satellite（最早 extraction 出现的 concept）。 */
  primary: ReviewableSatellite;
}

function normalizeTitle(t: string): string {
  return t
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[。.,，]+$/, "");
}

function pickPrimary(satellites: ReviewableSatellite[]): ReviewableSatellite {
  return [...satellites].sort((a, b) => {
    if (a.extractionId !== b.extractionId) return a.extractionId.localeCompare(b.extractionId);
    const ai = Number(a.id.slice(a.id.lastIndexOf("::") + 2));
    const bi = Number(b.id.slice(b.id.lastIndexOf("::") + 2));
    return ai - bi;
  })[0];
}

export function useDuplicateGroups(satellites: ReviewableSatellite[]): DuplicateGroup[] {
  return useMemo(() => {
    const groups = new Map<string, ReviewableSatellite[]>();
    for (const s of satellites) {
      const key = `${normalizeTitle(s.concept.title)}::${s.displaySystem}`;
      const list = groups.get(key) ?? [];
      list.push(s);
      groups.set(key, list);
    }
    const result: DuplicateGroup[] = [];
    for (const [key, list] of groups) {
      if (list.length < 2) continue;
      const primary = pickPrimary(list);
      const displayTitle = list.reduce(
        (acc, s) => (s.concept.title.length > acc.length ? s.concept.title : acc),
        list[0].concept.title
      );
      result.push({
        normalizedTitle: key.split("::")[0],
        displayTitle,
        satellites: list,
        primary
      });
    }
    return result.sort((a, b) => b.satellites.length - a.satellites.length);
  }, [satellites]);
}
