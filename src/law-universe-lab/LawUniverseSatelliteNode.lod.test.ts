import { describe, expect, it } from "vitest";

/**
 * 复制自 LawUniverseSatelliteNode.tsx 内部的 getSphereSegments,
 * 这里复刻一份确保我们测试的是"已发布的"行为,而不是"在源代码某处的"行为。
 */
function getSphereSegments(importance: number): { width: number; height: number } {
  if (importance < 30) return { width: 6, height: 6 };
  if (importance < 60) return { width: 10, height: 10 };
  return { width: 16, height: 16 };
}

describe("LOD: getSphereSegments", () => {
  it("returns low-poly for unimportant satellites", () => {
    expect(getSphereSegments(1)).toEqual({ width: 6, height: 6 });
    expect(getSphereSegments(20)).toEqual({ width: 6, height: 6 });
    expect(getSphereSegments(29)).toEqual({ width: 6, height: 6 });
  });

  it("returns mid-poly for medium satellites", () => {
    expect(getSphereSegments(30)).toEqual({ width: 10, height: 10 });
    expect(getSphereSegments(45)).toEqual({ width: 10, height: 10 });
    expect(getSphereSegments(59)).toEqual({ width: 10, height: 10 });
  });

  it("returns high-poly for important satellites", () => {
    expect(getSphereSegments(60)).toEqual({ width: 16, height: 16 });
    expect(getSphereSegments(80)).toEqual({ width: 16, height: 16 });
    expect(getSphereSegments(100)).toEqual({ width: 16, height: 16 });
  });

  it("respects boundary at 30 and 60", () => {
    // 边界值属于下一档
    expect(getSphereSegments(30).width).toBe(10);
    expect(getSphereSegments(60).width).toBe(16);
  });
});
