/**
 * useDragProjection 单元测试 —— 仅测纯函数 findNearestSystem。
 * useDragProjection 本身需要 R3F Canvas 环境（jsdom 不支持 WebGL），
 * 拖拽核心逻辑通过组件级 e2e 验证（Phase 2.5）。
 */

import { describe, expect, it } from "vitest";
import { findNearestSystem } from "./useDragProjection";

describe("findNearestSystem", () => {
  const systems = [
    { id: "civil", position: [10, 0, 0] as [number, number, number] },
    { id: "criminal", position: [-10, 0, 0] as [number, number, number] },
    { id: "constitution", position: [0, 0, 10] as [number, number, number] }
  ];

  it("距离 < 阈值时返回最近系统", () => {
    const result = findNearestSystem([10, 0, 0], systems, 4);
    expect(result).toEqual({ id: "civil", distance: 0 });
  });

  it("距离 > 阈值时返回 null", () => {
    const result = findNearestSystem([50, 0, 0], systems, 4);
    expect(result).toBeNull();
  });

  it("多个候选时返回最近的", () => {
    const result = findNearestSystem([6, 0, 6], systems, 10);
    // civil 距离 4，constitution 距离 4，criminal 距离 16
    // 第一个距离 < 10 的：civil (4) vs constitution (4)，按循环顺序取 first
    expect(result?.id).toBe("civil");
  });

  it("阈值边界：等于阈值时也算命中（< 严格小于不命中）", () => {
    // findNearestSystem 用 d < threshold 严格小于
    const result = findNearestSystem([10, 0, 4], systems, 4);
    expect(result).toBeNull();
  });

  it("3D 距离正确计算", () => {
    // civil 在 (10, 0, 0)，查询 (10, 0, 3)：距离 3
    const result = findNearestSystem([10, 0, 3], systems, 4);
    expect(result?.id).toBe("civil");
    expect(result?.distance).toBe(3);
  });
});
