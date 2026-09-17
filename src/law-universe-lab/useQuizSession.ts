/**
 * 刷题会话状态机 —— Phase 3 续。
 *
 * 状态: idle → loading → asking ⇄ revealing → finished
 * 提交时: 判分 → SM-2 → 落库 → 错题入 mistakes。
 */

import { useCallback, useState } from "react";
import { listMistakes, listQuizItems, putMistake, putQuizItem } from "./legalUniverseUserDb";
import { updateSM2 } from "./legalUniverseSM2";
import { judgeChoice, judgeFill, judgeEssay, type JudgeResult } from "./legalUniverseQuizJudge";
import { orderSession } from "./legalUniverseSessionOrder";
import type { UserMistake, UserQuizItem } from "./userDataTypes";

export type SessionState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "asking"; index: number; total: number }
  | { phase: "revealing"; index: number; total: number; lastResult: JudgeResult; userAnswer: string | number }
  | { phase: "finished"; correct: number; total: number; nextDueAt: number | null };

export interface UseQuizSession {
  state: SessionState;
  current: UserQuizItem | null;
  open: () => Promise<void>;
  submit: (answer: string | number) => Promise<void>;
  next: () => void;
  close: () => void;
}

export function useQuizSession(): UseQuizSession {
  const [state, setState] = useState<SessionState>({ phase: "idle" });
  const [queue, setQueue] = useState<UserQuizItem[]>([]);
  const [allItems, setAllItems] = useState<UserQuizItem[]>([]);
  const [correctCount, setCorrectCount] = useState(0);

  const open = useCallback(async () => {
    setState({ phase: "loading" });
    try {
      const [items, mistakes] = await Promise.all([listQuizItems(), listMistakes()]);
      const ordered = orderSession(items, mistakes);
      setAllItems(items);
      if (ordered.length === 0) {
        setQueue([]);
        setCorrectCount(0);
        setState({ phase: "finished", correct: 0, total: 0, nextDueAt: null });
        return;
      }
      setQueue(ordered);
      setCorrectCount(0);
      setState({ phase: "asking", index: 0, total: ordered.length });
    } catch {
      setQueue([]);
      setState({ phase: "idle" });
    }
  }, []);

  const submit = useCallback(
    async (answer: string | number) => {
      // 从闭包读最新 state。submit 总是从事件 handler 调,React 串行处理,
      // 闭包 state 不会比真实状态更老。setState 之后立即读 outer var 是不行的:
      // React 18 下 updater 是异步调用的,updater 没跑 outer var 还是 null。
      if (state.phase !== "asking") return;
      const item = queue[state.index];
      if (!item) return;
      let result: JudgeResult;
      if (item.payload.type === "choice") {
        result = judgeChoice(item.payload, typeof answer === "number" ? answer : -1);
      } else if (item.payload.type === "fill") {
        result = judgeFill(item.payload, typeof answer === "string" ? answer : "");
      } else {
        result = judgeEssay(item.payload, typeof answer === "string" ? answer : "");
      }
      if (result.isCorrect) setCorrectCount((c) => c + 1);
      setState({
        phase: "revealing",
        index: state.index,
        total: state.total,
        lastResult: result,
        userAnswer: answer
      });
      // 副作用在 setState 之外,StrictMode 双调用 updater 时也只跑一次。
      const newSr = updateSM2(item.spacedRepetition, result.q);
      const updated: UserQuizItem = { ...item, spacedRepetition: newSr };
      putQuizItem(updated).catch(() => undefined);
      if (!result.isCorrect) {
        const correctAnswer =
          item.payload.type === "choice"
            ? item.payload.options[item.payload.correctIndex]
            : item.payload.type === "fill"
              ? item.payload.correctAnswer
              : item.payload.modelAnswer;
        const mistake: UserMistake = {
          id: `m-${item.id}-${Date.now()}`,
          quizItemId: item.id,
          conceptTitle: item.conceptTitle,
          questionType: item.payload.type,
          questionStem: item.payload.stem,
          userAnswer: String(answer),
          correctAnswer,
          at: Date.now(),
          attempts: 1
        };
        putMistake(mistake).catch(() => undefined);
      }
    },
    [state, queue]
  );

  const next = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "revealing") return prev;
      const nextIndex = prev.index + 1;
      if (nextIndex >= queue.length) {
        // 计算 nextDueAt:全部 items 中最早的未来 dueAt
        // 用 allItems 而非 queue:orderSession 只保留 dueAt<=now 的题,
        // queue 内全部为过去项,filter(d => d > now) 恒为空,语义不正确。
        const now = Date.now();
        const future = allItems
          .map((it) => it.spacedRepetition.dueAt)
          .filter((d) => d > now);
        const nextDueAt = future.length > 0 ? Math.min(...future) : null;
        return {
          phase: "finished",
          correct: correctCount,
          total: prev.total,
          nextDueAt
        };
      }
      return { phase: "asking", index: nextIndex, total: prev.total };
    });
  }, [queue, correctCount, allItems]);

  const close = useCallback(() => {
    setQueue([]);
    setAllItems([]);
    setCorrectCount(0);
    setState({ phase: "idle" });
  }, []);

  const current =
    state.phase === "asking" || state.phase === "revealing" ? queue[state.index] ?? null : null;

  return { state, current, open, submit, next, close };
}
