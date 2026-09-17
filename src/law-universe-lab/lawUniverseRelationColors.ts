/**
 * 关系类型 3D 渲染颜色 / 强度 helper —— Phase 2.5。
 *
 * 8 种关系类型（spec §3.4）各自颜色，强度 1-100 → 线宽 + 透明度。
 * 纯函数，单测覆盖所有边界。
 */

import type { UserExtractedRelation } from "./userDataTypes";

export const RELATION_COLORS: Record<UserExtractedRelation["type"], string> = {
  依据: "#d8c47a", // 金
  解释: "#7ab3d8", // 蓝
  修正: "#d87575", // 红
  适用: "#8fcf8f", // 绿
  类推: "#b38fd8", // 紫
  冲突: "#d8a575", // 橙
  继承: "#9a9a9a", // 灰
  发展: "#d8d8d8" // 白
};

const VALID_TYPES = new Set<UserExtractedRelation["type"]>(Object.keys(RELATION_COLORS) as UserExtractedRelation["type"][]);

const FALLBACK_COLOR = "#888888";

/** 给定 type 返回颜色。非法 type 降级为灰色。 */
export function getRelationColor(type: string): string {
  if (VALID_TYPES.has(type as UserExtractedRelation["type"])) {
    return RELATION_COLORS[type as UserExtractedRelation["type"]];
  }
  return FALLBACK_COLOR;
}

/** 强度 1-100 → 线宽 0.01-0.06。strength=1 → 0.01, strength=100 → 0.06。 */
export function strengthToWidth(strength: number): number {
  const clamped = clamp(strength, 1, 100);
  return 0.01 + ((clamped - 1) / 99) * 0.05;
}

/** 强度 1-100 → 透明度 0.3-0.9。strength=1 → 0.3, strength=100 → 0.9。 */
export function strengthToOpacity(strength: number): number {
  const clamped = clamp(strength, 1, 100);
  return 0.3 + ((clamped - 1) / 99) * 0.6;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

/** 列出所有 8 种 type（用于 legend）。 */
export const ALL_RELATION_TYPES: UserExtractedRelation["type"][] = [
  "依据",
  "解释",
  "修正",
  "适用",
  "类推",
  "冲突",
  "继承",
  "发展"
];
