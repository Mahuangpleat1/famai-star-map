/**
 * SM-2 算法单元测试。
 */

import { describe, expect, it } from "vitest";
import { isDue, updateSM2 } from "./legalUniverseSM2";
import { initialSpacedRepetition } from "./legalUniverseQuizGen";
import type { SpacedRepetitionState } from "./userDataTypes";

describe("updateSM2", () => {
  it("q=0: 重置 + EF 衰减 + dueAt = now + 1d", () => {
    const before = Date.now();
    const next = updateSM2(initialSpacedRepetition(), 0);
    const after = Date.now();
    expect(next.repetitions).toBe(0);
    expect(next.interval).toBe(1);
    expect(next.easeFactor).toBeLessThan(2.5);
    expect(next.dueAt).toBeGreaterThanOrEqual(before + 86400000);
    expect(next.dueAt).toBeLessThanOrEqual(after + 86400000 + 10);
  });

  it("q=5 第 1 次: repetitions=1 interval=1", () => {
    const next = updateSM2(initialSpacedRepetition(), 5);
    expect(next.repetitions).toBe(1);
    expect(next.interval).toBe(1);
    expect(next.easeFactor).toBeGreaterThan(2.5); // 完美答 EF 上升
  });

  it("q=5 第 2 次: repetitions=2 interval=6", () => {
    let s = updateSM2(initialSpacedRepetition(), 5);
    s = updateSM2(s, 5);
    expect(s.repetitions).toBe(2);
    expect(s.interval).toBe(6);
  });

  it("q=5 第 3 次起: interval = prev * easeFactor", () => {
    let s = updateSM2(initialSpacedRepetition(), 5); // r=1
    s = updateSM2(s, 5); // r=2 interval=6
    s = updateSM2(s, 5); // r=3 interval=6*EF
    const expected = Math.round(6 * s.easeFactor);
    expect(s.interval).toBe(expected);
  });

  it("q=2 (< 3): 重置 repetitions=0 interval=1", () => {
    let s = updateSM2(initialSpacedRepetition(), 5);
    s = updateSM2(s, 5);
    s = updateSM2(s, 5);
    expect(s.repetitions).toBe(3);
    s = updateSM2(s, 2);
    expect(s.repetitions).toBe(0);
    expect(s.interval).toBe(1);
  });

  it("EF 下限 1.3", () => {
    let s = initialSpacedRepetition();
    for (let i = 0; i < 20; i++) s = updateSM2(s, 0);
    expect(s.easeFactor).toBe(1.3);
  });

  it("EF 上限 5.0", () => {
    let s = initialSpacedRepetition();
    for (let i = 0; i < 100; i++) s = updateSM2(s, 5);
    expect(s.easeFactor).toBeLessThanOrEqual(5.0);
  });

  it("quality 越界 clamp 0-5", () => {
    const s1 = updateSM2(initialSpacedRepetition(), -5);
    const s2 = updateSM2(initialSpacedRepetition(), 10);
    // q=-5 clamp 到 0，q=10 clamp 到 5
    // q=0 vs q=5 EF 变化不同
    expect(s1.easeFactor).not.toBe(s2.easeFactor);
  });
});

describe("isDue", () => {
  it("dueAt <= now → true", () => {
    const state: SpacedRepetitionState = { easeFactor: 2.5, interval: 0, repetitions: 0, dueAt: 100 };
    expect(isDue(state, 1000)).toBe(true);
  });
  it("dueAt > now → false", () => {
    const state: SpacedRepetitionState = { easeFactor: 2.5, interval: 0, repetitions: 0, dueAt: 100000 };
    expect(isDue(state, 1000)).toBe(false);
  });
});
