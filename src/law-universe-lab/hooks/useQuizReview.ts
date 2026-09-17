/**
 * useQuizReview —— 复习题加载与 dueCount 计算。
 *
 * Phase 3 续:统计 IndexedDB 中到期的 quiz items。
 * 触发时机: 错题变化 (mistakesVersion) 或 复习会话关闭 (quizSessionOpen false→true→false) 或 reloadTrigger 变化。
 *
 * 设计边界:
 * - 不持有 quizSessionOpen 状态 (useModals 已拥有),通过 prop 传入避免重复源。
 * - 不调用 setQuizSessionOpen,LabPage 用 useModals 暴露的 openQuizSession / closeQuizSession。
 * - 错误 toast 的"重试"动作调用 orchestrator 传入的 onRetry(orchestrator 负责 bump reloadTrigger)。
 * - 只暴露 { dueCount, setDueCount },供 LabPage 渲染 badge / 自动提示 toast。
 */

import { useEffect, useState } from "react";
import { listQuizItems } from "../legalUniverseUserDb";
import type { UseToast } from "../useToast";

export function useQuizReview(
  toast: UseToast,
  quizSessionOpen: boolean,
  mistakesVersion: number,
  reloadTrigger: number,
  onRetry: () => void
): { dueCount: number; setDueCount: React.Dispatch<React.SetStateAction<number>> } {
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listQuizItems()
      .then((items) => {
        if (cancelled) return;
        setDueCount(items.filter((it) => it.spacedRepetition.dueAt <= Date.now()).length);
      })
      .catch(() => {
        if (cancelled) return;
        toast.push({
          kind: "error",
          message: "复习题加载失败，点击重试",
          duration: 0,
          action: { label: "重试", onClick: onRetry }
        });
      });
    return () => {
      cancelled = true;
    };
    // 只依赖稳定的 push / onRetry(都是 useCallback 包装的);toast 整体对象在 re-render
    // 时引用会变(toasts 数组更新导致),若依赖 toast 会让 effect 抖动 + 重复弹 toast。
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast 整体对象引用不稳,只取 toast.push 已足够
  }, [mistakesVersion, quizSessionOpen, reloadTrigger, toast.push, onRetry]);

  return { dueCount, setDueCount };
}
