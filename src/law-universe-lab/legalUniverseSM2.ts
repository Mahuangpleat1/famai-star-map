/**
 * SM-2 算法 —— Phase 3 间隔重复。
 *
 * 经典 Anki 间隔重复算法（SuperMemo 2）：
 *   - q: 用户自评 0-5（0=完全错, 5=完美）
 *   - q < 3: 重置 repetitions, interval = 1 天
 *   - q >= 3: 增长 interval，repetitions += 1
 *   - easeFactor 更新（衰减下限 1.3）
 *
 * 公式：
 *   EF' = max(1.3, EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02)))
 */

import type { SpacedRepetitionState } from "./userDataTypes";

const DAY_MS = 86400000;
const EF_MIN = 1.3;
const EF_MAX = 5.0;

export function updateSM2(
  state: SpacedRepetitionState,
  quality: number
): SpacedRepetitionState {
  if (!Number.isFinite(quality)) return state;
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  let { easeFactor, interval, repetitions } = state;

  // EF 更新（公式对 q 在 [0,5] 都合法，但 q < 3 时通常伴随重置）
  const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  easeFactor = Math.max(EF_MIN, Math.min(EF_MAX, easeFactor + efDelta));

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.max(1, Math.round(interval * easeFactor));
  }

  return {
    easeFactor,
    interval,
    repetitions,
    dueAt: Date.now() + interval * DAY_MS
  };
}

/** 给定 dueAt，判断是否到期（now >= dueAt）。 */
export function isDue(state: SpacedRepetitionState, now: number = Date.now()): boolean {
  return state.dueAt <= now;
}
