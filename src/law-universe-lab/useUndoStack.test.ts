/**
 * useUndoStack 单元测试。
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { invertOperation, isMoveOp, useUndoStack } from "./useUndoStack";

const STORAGE_KEY = "law-universe:undo-stack:v1";

describe("useUndoStack", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  });

  afterEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  });

  it("初始 stack 为空", () => {
    const { result } = renderHook(() => useUndoStack());
    expect(result.current.stack).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  it("push 后 canUndo 为 true", () => {
    const { result } = renderHook(() => useUndoStack());
    act(() => {
      result.current.push({
        type: "move",
        extractionId: "ext1",
        conceptIndex: 0,
        fromSystem: "unclassified",
        toSystem: "civil",
        at: Date.now()
      });
    });
    expect(result.current.stack).toHaveLength(1);
    expect(result.current.canUndo).toBe(true);
  });

  it("pop 返回顶部 op 并清空", () => {
    const { result } = renderHook(() => useUndoStack());
    const op = {
      type: "move" as const,
      extractionId: "ext1",
      conceptIndex: 0,
      fromSystem: "unclassified",
      toSystem: "civil",
      at: Date.now()
    };
    act(() => {
      result.current.push(op);
    });
    let popped;
    act(() => {
      popped = result.current.pop();
    });
    expect(popped).toEqual(op);
    expect(result.current.stack).toHaveLength(0);
  });

  it("LIFO 顺序", () => {
    const { result } = renderHook(() => useUndoStack());
    act(() => {
      result.current.push({ type: "move", extractionId: "ext1", conceptIndex: 0, fromSystem: "a", toSystem: "b", at: 1 });
      result.current.push({ type: "move", extractionId: "ext1", conceptIndex: 0, fromSystem: "b", toSystem: "c", at: 2 });
    });
    const top = result.current.stack[0];
    expect(isMoveOp(top)).toBe(true);
    if (isMoveOp(top)) expect(top.toSystem).toBe("c"); // 最新在前
  });

  it("50 上限", () => {
    const { result } = renderHook(() => useUndoStack());
    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.push({
          type: "move",
          extractionId: "ext1",
          conceptIndex: 0,
          fromSystem: "a",
          toSystem: "b",
          at: i
        });
      }
    });
    expect(result.current.stack).toHaveLength(50);
  });

  it("clear 清空", () => {
    const { result } = renderHook(() => useUndoStack());
    act(() => {
      result.current.push({
        type: "move",
        extractionId: "ext1",
        conceptIndex: 0,
        fromSystem: "a",
        toSystem: "b",
        at: 1
      });
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.stack).toEqual([]);
  });

  it("持久化到 localStorage", () => {
    const { result } = renderHook(() => useUndoStack());
    act(() => {
      result.current.push({
        type: "move",
        extractionId: "ext1",
        conceptIndex: 0,
        fromSystem: "a",
        toSystem: "b",
        at: 1
      });
    });
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(1);
    }
  });

  it("跨刷新保留", () => {
    const { result: r1, unmount } = renderHook(() => useUndoStack());
    act(() => {
      r1.current.push({
        type: "move",
        extractionId: "ext1",
        conceptIndex: 0,
        fromSystem: "a",
        toSystem: "b",
        at: 1
      });
    });
    unmount();
    const { result: r2 } = renderHook(() => useUndoStack());
    expect(r2.current.stack).toHaveLength(1);
  });

  it("连续 pop 后 localStorage 与内存一致(避免闭包过期 bug)", () => {
    const { result } = renderHook(() => useUndoStack());
    act(() => {
      result.current.push({ type: "move", extractionId: "e1", conceptIndex: 0, fromSystem: "a", toSystem: "b", at: 1 });
      result.current.push({ type: "move", extractionId: "e2", conceptIndex: 0, fromSystem: "c", toSystem: "d", at: 2 });
      result.current.push({ type: "move", extractionId: "e3", conceptIndex: 0, fromSystem: "e", toSystem: "f", at: 3 });
    });
    expect(result.current.stack).toHaveLength(3);
    // 连续 pop 3 次:每次 pop 后立即用 isMoveOp narrow,避免 let 重赋值丢 narrow。
    act(() => {
      const popped = result.current.pop();
      if (popped && isMoveOp(popped)) {
        expect(popped.extractionId).toBe("e3");
      } else {
        throw new Error("expected a move op on first pop");
      }
    });
    act(() => {
      const popped = result.current.pop();
      if (popped && isMoveOp(popped)) {
        expect(popped.extractionId).toBe("e2");
      } else {
        throw new Error("expected a move op on second pop");
      }
    });
    act(() => {
      const popped = result.current.pop();
      if (popped && isMoveOp(popped)) {
        expect(popped.extractionId).toBe("e1");
      } else {
        throw new Error("expected a move op on third pop");
      }
    });
    expect(result.current.stack).toHaveLength(0);
    // localStorage 也应该被清空
    const stored = window.localStorage.getItem("law-universe:undo-stack:v1");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual([]);
  });

  it("pop 多次后 localStorage 与 stack 同步(避免 race condition 写入错误)", () => {
    const { result } = renderHook(() => useUndoStack());
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.push({
          type: "move",
          extractionId: `e${i}`,
          conceptIndex: 0,
          fromSystem: "a",
          toSystem: "b",
          at: i
        });
      }
    });
    expect(result.current.stack).toHaveLength(5);
    act(() => {
      result.current.pop();
      result.current.pop();
    });
    expect(result.current.stack).toHaveLength(3);
    const stored = window.localStorage.getItem("law-universe:undo-stack:v1");
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(3);
    // 顺序:最新 push 的 e4 在顶部,剩下 e2 e1 e0
    expect(parsed[0].extractionId).toBe("e2");
    expect(parsed[1].extractionId).toBe("e1");
    expect(parsed[2].extractionId).toBe("e0");
  });

  it("peek 不修改 stack 和 localStorage", () => {
    const { result } = renderHook(() => useUndoStack());
    act(() => {
      result.current.push({ type: "move", extractionId: "e1", conceptIndex: 0, fromSystem: "a", toSystem: "b", at: 1 });
    });
    const before = JSON.parse(window.localStorage.getItem("law-universe:undo-stack:v1")!);
    const top = result.current.peek();
    expect(top && isMoveOp(top) && top.extractionId).toBe("e1");
    expect(result.current.stack).toHaveLength(1);
    const after = JSON.parse(window.localStorage.getItem("law-universe:undo-stack:v1")!);
    expect(after).toEqual(before);
  });
});

describe("invertOperation", () => {
  it("move 反向", () => {
    const op = {
      type: "move" as const,
      extractionId: "ext1",
      conceptIndex: 0,
      fromSystem: "a",
      toSystem: "b",
      at: 1
    };
    const inv = invertOperation(op);
    expect(isMoveOp(inv)).toBe(true);
    if (isMoveOp(inv)) {
      expect(inv.fromSystem).toBe("b");
      expect(inv.toSystem).toBe("a");
    }
  });

  it("confidence 反向", () => {
    const op = {
      type: "confidence" as const,
      extractionId: "ext1",
      conceptIndex: 0,
      oldConfidence: 50,
      newConfidence: 80,
      at: 1
    };
    const inv = invertOperation(op);
    expect(inv.type).toBe("confidence");
    if (inv.type === "confidence") {
      expect(inv.oldConfidence).toBe(80);
      expect(inv.newConfidence).toBe(50);
    }
  });
});
