/**
 * useQuizSession 单元测试 —— 刷题会话状态机。
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, StrictMode, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as userDb from "./legalUniverseUserDb";
import * as sm2 from "./legalUniverseSM2";
import { useQuizSession } from "./useQuizSession";
import type { UserMistake, UserQuizItem } from "./userDataTypes";

const NOW = 1_700_000_000_000;

function mkItem(id: string, dueAt: number, conceptTitle = "c"): UserQuizItem {
  return {
    id,
    conceptId: `${id}-concept`,
    conceptTitle,
    payload: { type: "choice", stem: "s", options: ["a", "b"], correctIndex: 0 },
    spacedRepetition: { easeFactor: 2.5, interval: 1, repetitions: 1, dueAt },
    createdAt: 0
  };
}

const sampleItem: UserQuizItem = mkItem("q1", NOW - 100, "民法典");

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(NOW);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useQuizSession", () => {
  it("starts in idle phase", () => {
    const { result } = renderHook(() => useQuizSession());
    expect(result.current.state.phase).toBe("idle");
    expect(result.current.current).toBeNull();
  });

  it("open() loads due items ordered by dueAt asc", async () => {
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([
      sampleItem,
      mkItem("q2", NOW - 50),
      mkItem("q3", NOW + 1000)
    ]);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    const { result } = renderHook(() => useQuizSession());
    await act(async () => {
      await result.current.open();
    });
    await waitFor(() => expect(result.current.state.phase).toBe("asking"));
    if (result.current.state.phase === "asking") {
      expect(result.current.state.total).toBe(2);
    }
    expect(result.current.current?.id).toBe("q1");
  });

  it("submit() with correct answer applies q=5 and skips mistake write", async () => {
    const spyPutQuiz = vi.spyOn(userDb, "putQuizItem").mockResolvedValue(sampleItem);
    const spyPutMistake = vi.spyOn(userDb, "putMistake").mockResolvedValue({} as UserMistake);
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([sampleItem]);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    vi.spyOn(sm2, "updateSM2").mockReturnValue({
      easeFactor: 2.6,
      interval: 6,
      repetitions: 2,
      dueAt: NOW + 6 * 86400000
    });
    const { result } = renderHook(() => useQuizSession());
    await act(async () => {
      await result.current.open();
    });
    await act(async () => {
      await result.current.submit(0);
    });
    expect(spyPutQuiz).toHaveBeenCalledOnce();
    expect(spyPutQuiz.mock.calls[0][0].spacedRepetition.interval).toBe(6);
    expect(spyPutMistake).not.toHaveBeenCalled();
    expect(result.current.state.phase).toBe("revealing");
  });

  it("submit() with wrong answer writes a mistake and applies q=1", async () => {
    const spyPutQuiz = vi.spyOn(userDb, "putQuizItem").mockResolvedValue(sampleItem);
    const spyPutMistake = vi.spyOn(userDb, "putMistake").mockResolvedValue({} as UserMistake);
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([sampleItem]);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    vi.spyOn(sm2, "updateSM2").mockReturnValue({
      easeFactor: 1.3,
      interval: 1,
      repetitions: 0,
      dueAt: NOW + 86400000
    });
    const { result } = renderHook(() => useQuizSession());
    await act(async () => {
      await result.current.open();
    });
    await act(async () => {
      await result.current.submit(1);
    });
    expect(spyPutQuiz).toHaveBeenCalledOnce();
    expect(spyPutQuiz.mock.calls[0][0].spacedRepetition.repetitions).toBe(0);
    expect(spyPutMistake).toHaveBeenCalledOnce();
    const mistakeArg = spyPutMistake.mock.calls[0][0];
    expect(mistakeArg.quizItemId).toBe("q1");
    expect(mistakeArg.attempts).toBe(1);
  });

  it("essay submit uses jaccard q=5 when score high", async () => {
    const essayItem: UserQuizItem = {
      ...sampleItem,
      payload: { type: "essay", stem: "q", modelAnswer: "民法典是民事基本法律" }
    };
    const spyPutQuiz = vi.spyOn(userDb, "putQuizItem").mockResolvedValue(essayItem);
    const spyPutMistake = vi.spyOn(userDb, "putMistake").mockResolvedValue({} as UserMistake);
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([essayItem]);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    vi.spyOn(sm2, "updateSM2").mockReturnValue({
      easeFactor: 2.6,
      interval: 6,
      repetitions: 2,
      dueAt: NOW + 6 * 86400000
    });
    const { result } = renderHook(() => useQuizSession());
    await act(async () => {
      await result.current.open();
    });
    await act(async () => {
      await result.current.submit("民法典是基本民事法律");
    });
    expect(spyPutQuiz).toHaveBeenCalled();
    expect(spyPutMistake).not.toHaveBeenCalled();
  });

  it("essay submit with low jaccard applies q=1 and writes mistake", async () => {
    const essayItem: UserQuizItem = {
      ...sampleItem,
      payload: { type: "essay", stem: "q", modelAnswer: "民法典是民事基本法律" }
    };
    const spyPutQuiz = vi.spyOn(userDb, "putQuizItem").mockResolvedValue(essayItem);
    const spyPutMistake = vi.spyOn(userDb, "putMistake").mockResolvedValue({} as UserMistake);
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([essayItem]);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    vi.spyOn(sm2, "updateSM2").mockReturnValue({
      easeFactor: 1.3, interval: 1, repetitions: 0, dueAt: NOW + 86400000
    });
    const { result } = renderHook(() => useQuizSession());
    await act(async () => {
      await result.current.open();
    });
    await act(async () => {
      await result.current.submit("今天天气真好");
    });
    expect(spyPutQuiz).toHaveBeenCalled();
    expect(spyPutMistake).toHaveBeenCalledOnce();
    const mistakeArg = spyPutMistake.mock.calls[0][0];
    expect(mistakeArg.questionType).toBe("essay");
    expect(mistakeArg.userAnswer).toBe("今天天气真好");
  });

  it("putQuizItem throw does not block state transition", async () => {
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([sampleItem]);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    vi.spyOn(userDb, "putQuizItem").mockRejectedValue(new Error("db write fail"));
    vi.spyOn(userDb, "putMistake").mockResolvedValue({} as UserMistake);
    vi.spyOn(sm2, "updateSM2").mockReturnValue({
      easeFactor: 2.6, interval: 6, repetitions: 2, dueAt: NOW + 6 * 86400000
    });
    const { result } = renderHook(() => useQuizSession());
    await act(async () => {
      await result.current.open();
    });
    await act(async () => {
      await result.current.submit(0);
    });
    // 即便 putQuizItem reject,状态仍推进到 revealing
    expect(result.current.state.phase).toBe("revealing");
  });

  it("next() advances index, finished() when empty", async () => {
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([sampleItem]);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    vi.spyOn(userDb, "putQuizItem").mockResolvedValue(sampleItem);
    vi.spyOn(sm2, "updateSM2").mockReturnValue({
      easeFactor: 2.5,
      interval: 6,
      repetitions: 1,
      dueAt: NOW + 6 * 86400000
    });
    const { result } = renderHook(() => useQuizSession());
    await act(async () => {
      await result.current.open();
    });
    await act(async () => {
      await result.current.submit(0);
    });
    act(() => result.current.next());
    await waitFor(() => expect(result.current.state.phase).toBe("finished"));
    if (result.current.state.phase === "finished") {
      expect(result.current.state.total).toBe(1);
      expect(result.current.state.correct).toBe(1);
    }
  });

  it("listQuizItems failure → state returns to idle", async () => {
    vi.spyOn(userDb, "listQuizItems").mockRejectedValue(new Error("db fail"));
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    const { result } = renderHook(() => useQuizSession());
    await act(async () => {
      await result.current.open();
    });
    expect(result.current.state.phase).toBe("idle");
  });

  it("close() resets to idle", async () => {
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([sampleItem]);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    const { result } = renderHook(() => useQuizSession());
    await act(async () => {
      await result.current.open();
    });
    act(() => result.current.close());
    expect(result.current.state.phase).toBe("idle");
  });

  it("empty due list → state = finished with total 0", async () => {
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([]);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    const { result } = renderHook(() => useQuizSession());
    await act(async () => {
      await result.current.open();
    });
    expect(result.current.state.phase).toBe("finished");
  });

  it("fill submit correct answer applies q=5 and skips mistake", async () => {
    const fillItem: UserQuizItem = {
      ...sampleItem,
      payload: { type: "fill", stem: "____ 是民事基本法律", correctAnswer: "民法典" }
    };
    const spyPutQuiz = vi.spyOn(userDb, "putQuizItem").mockResolvedValue(fillItem);
    const spyPutMistake = vi.spyOn(userDb, "putMistake").mockResolvedValue({} as UserMistake);
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([fillItem]);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    vi.spyOn(sm2, "updateSM2").mockReturnValue({
      easeFactor: 2.6, interval: 6, repetitions: 2, dueAt: NOW + 6 * 86400000
    });
    const { result } = renderHook(() => useQuizSession());
    await act(async () => {
      await result.current.open();
    });
    await act(async () => {
      await result.current.submit("民法典");
    });
    expect(spyPutQuiz).toHaveBeenCalledOnce();
    expect(spyPutMistake).not.toHaveBeenCalled();
  });

  it("fill submit wrong answer writes a mistake with correctAnswer", async () => {
    const fillItem: UserQuizItem = {
      ...sampleItem,
      payload: { type: "fill", stem: "____", correctAnswer: "民法典" }
    };
    const spyPutQuiz = vi.spyOn(userDb, "putQuizItem").mockResolvedValue(fillItem);
    const spyPutMistake = vi.spyOn(userDb, "putMistake").mockResolvedValue({} as UserMistake);
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([fillItem]);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    vi.spyOn(sm2, "updateSM2").mockReturnValue({
      easeFactor: 1.3, interval: 1, repetitions: 0, dueAt: NOW + 86400000
    });
    const { result } = renderHook(() => useQuizSession());
    await act(async () => {
      await result.current.open();
    });
    await act(async () => {
      await result.current.submit("刑法");
    });
    expect(spyPutQuiz).toHaveBeenCalledOnce();
    const mistakeArg = spyPutMistake.mock.calls[0][0];
    expect(mistakeArg.questionType).toBe("fill");
    expect(mistakeArg.correctAnswer).toBe("民法典");
    expect(mistakeArg.userAnswer).toBe("刑法");
  });

  it("StrictMode double-invoke does not double-write IndexedDB", async () => {
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([sampleItem]);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    vi.spyOn(userDb, "putQuizItem").mockResolvedValue(sampleItem);
    const spyPutMistake = vi.spyOn(userDb, "putMistake").mockResolvedValue({} as UserMistake);
    vi.spyOn(sm2, "updateSM2").mockReturnValue({
      easeFactor: 1.3, interval: 1, repetitions: 0, dueAt: NOW + 86400000
    });
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(StrictMode, null, children);
    const { result } = renderHook(() => useQuizSession(), { wrapper });
    await act(async () => {
      await result.current.open();
    });
    await act(async () => {
      await result.current.submit(1);
    });
    // 错答场景下,StrictMode 双调用 updater 不会让 putMistake 跑两次
    expect(spyPutMistake).toHaveBeenCalledOnce();
  });

  it("finished sets nextDueAt to earliest future dueAt in items", async () => {
    const items = [
      mkItem("q1", NOW - 100),
      mkItem("q2", NOW - 50),
      mkItem("q3", NOW + 6 * 86400000),  // future
      mkItem("q4", NOW + 1 * 86400000)   // earlier future
    ];
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue(items);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    vi.spyOn(userDb, "putQuizItem").mockResolvedValue(items[0]);
    vi.spyOn(sm2, "updateSM2").mockReturnValue({
      easeFactor: 2.5, interval: 6, repetitions: 1, dueAt: NOW + 6 * 86400000
    });
    const { result } = renderHook(() => useQuizSession());
    await act(async () => { await result.current.open(); });
    // queue = [q1, q2] (orderSession 过滤掉 future 项),需答完 2 题才 finished
    await act(async () => { await result.current.submit(0); });
    act(() => result.current.next());
    await act(async () => { await result.current.submit(1); });
    act(() => result.current.next());
    await waitFor(() => expect(result.current.state.phase).toBe("finished"));
    if (result.current.state.phase === "finished") {
      // nextDueAt 从全部 items 找最早的未来 dueAt(= q4)
      expect(result.current.state.nextDueAt).toBe(NOW + 1 * 86400000);
    }
  });

  it("finished with no future dueAt sets nextDueAt null", async () => {
    const item = mkItem("q1", NOW - 100);
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([item]);
    vi.spyOn(userDb, "listMistakes").mockResolvedValue([]);
    vi.spyOn(userDb, "putQuizItem").mockResolvedValue(item);
    vi.spyOn(sm2, "updateSM2").mockReturnValue({
      easeFactor: 2.5, interval: 1, repetitions: 0, dueAt: NOW + 1 * 86400000
    });
    const { result } = renderHook(() => useQuizSession());
    await act(async () => { await result.current.open(); });
    await act(async () => { await result.current.submit(0); });
    act(() => result.current.next());
    await waitFor(() => expect(result.current.state.phase).toBe("finished"));
    // 注:queue 来自 orderSession(items, mistakes),orderSession 只保留 dueAt<=now 的题。
    // 单题场景:orderSession 返 [item],item.spacedRepetition.dueAt = NOW-100(过去)。
    // 提交后 putQuizItem 更新 spacedRepetition.dueAt = NOW+1day(未来),但 state.queue 仍持有旧 item。
    // 因此 nextDueAt 应该 = 旧 item 的 dueAt = NOW-100 (过去,不算 future)
    if (result.current.state.phase === "finished") {
      expect(result.current.state.nextDueAt).toBeNull();
    }
  });
});
