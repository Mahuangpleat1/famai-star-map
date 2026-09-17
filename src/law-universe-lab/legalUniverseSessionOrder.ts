/**
 * 题序算法 —— Phase 3 续 刷题会话。
 *
 * 规则(用户 2026-07-31 拍板):
 *   1. 过滤 dueAt <= now
 *   2. 分两组:错题组(quizItemId 命中 mistakes 集合)、非错题组
 *   3. 错题组按 dueAt asc
 *   4. 非错题组按 dueAt asc
 *   5. 拼接:[错题组, 非错题组]
 *   6. limit 作用于拼接后整体截断,非各组独立截断
 */

import type { UserMistake, UserQuizItem } from "./userDataTypes";

const DEFAULT_SESSION_LIMIT = 20;

export function orderSession(
  allItems: UserQuizItem[],
  mistakes: UserMistake[],
  now: number = Date.now(),
  limit: number = DEFAULT_SESSION_LIMIT
): UserQuizItem[] {
  const mistakeIds = new Set<string>();
  for (const m of mistakes) {
    mistakeIds.add(m.quizItemId);
  }
  const due = allItems.filter((it) => it.spacedRepetition.dueAt <= now);
  const mistakeQueue: UserQuizItem[] = [];
  const normalQueue: UserQuizItem[] = [];
  for (const it of due) {
    if (mistakeIds.has(it.id)) mistakeQueue.push(it);
    else normalQueue.push(it);
  }
  const byDueAsc = (a: UserQuizItem, b: UserQuizItem) =>
    a.spacedRepetition.dueAt - b.spacedRepetition.dueAt;
  mistakeQueue.sort(byDueAsc);
  normalQueue.sort(byDueAsc);
  return [...mistakeQueue, ...normalQueue].slice(0, limit);
}
