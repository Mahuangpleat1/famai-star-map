/**
 * lawUniverseRelationColors 单元测试。
 */

import { describe, expect, it } from "vitest";
import {
  ALL_RELATION_TYPES,
  RELATION_COLORS,
  getRelationColor,
  strengthToOpacity,
  strengthToWidth
} from "./lawUniverseRelationColors";

describe("lawUniverseRelationColors", () => {
  describe("getRelationColor", () => {
    it("8 种 type 都返回有效颜色", () => {
      for (const t of ALL_RELATION_TYPES) {
        const color = getRelationColor(t);
        expect(color).toBe(RELATION_COLORS[t]);
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it("非法 type 降级为灰色", () => {
      expect(getRelationColor("invalid")).toBe("#888888");
      expect(getRelationColor("")).toBe("#888888");
    });
  });

  describe("strengthToWidth", () => {
    it("strength=1 → 0.01", () => {
      expect(strengthToWidth(1)).toBeCloseTo(0.01, 5);
    });

    it("strength=100 → 0.06", () => {
      expect(strengthToWidth(100)).toBeCloseTo(0.06, 5);
    });

    it("strength=50 → ~0.0347", () => {
      // 0.01 + (49/99) * 0.05 = 0.01 + 0.0247... ≈ 0.0347
      expect(strengthToWidth(50)).toBeCloseTo(0.0347, 3);
    });

    it("越界 clamp 到 1-100", () => {
      expect(strengthToWidth(0)).toBeCloseTo(0.01, 5);
      expect(strengthToWidth(-50)).toBeCloseTo(0.01, 5);
      expect(strengthToWidth(200)).toBeCloseTo(0.06, 5);
    });

    it("非数字 fallback 到 1", () => {
      expect(strengthToWidth(Number.NaN)).toBeCloseTo(0.01, 5);
    });
  });

  describe("strengthToOpacity", () => {
    it("strength=1 → 0.3", () => {
      expect(strengthToOpacity(1)).toBeCloseTo(0.3, 5);
    });

    it("strength=100 → 0.9", () => {
      expect(strengthToOpacity(100)).toBeCloseTo(0.9, 5);
    });

    it("strength=50 → ~0.597", () => {
      // 0.3 + (49/99) * 0.6 = 0.3 + 0.2969... ≈ 0.597
      expect(strengthToOpacity(50)).toBeCloseTo(0.597, 3);
    });

    it("越界 clamp", () => {
      expect(strengthToOpacity(0)).toBeCloseTo(0.3, 5);
      expect(strengthToOpacity(200)).toBeCloseTo(0.9, 5);
    });
  });
});
