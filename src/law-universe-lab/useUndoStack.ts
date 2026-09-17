/**
 * useUndoStack —— Phase 2.6 完整 undo 栈。
 *
 * 统一 union 操作类型 + localStorage 持久化 + 50 上限 + 跨刷新保留。
 *
 * 写操作前 push 旧状态，HUD 全局 undo 按钮 + 详情面板 undo 都用这个。
 */

import { useCallback, useEffect, useState } from "react";
import type { UserExtractedConcept, UserExtractedRelation, UserExtraction } from "./userDataTypes";

/** 统一的 undo 操作类型。 */
export type UndoOperation =
  | { type: "merge"; before: UserExtraction[]; after: UserExtraction[]; at: number; }
  | {
      type: "move";
      conceptId?: string;
      extractionId: string;
      conceptIndex: number;
      fromSystem: string;
      toSystem: string;
      at: number;
    }
  | {
      type: "confidence";
      extractionId: string;
      conceptIndex: number;
      oldConfidence: number;
      newConfidence: number;
      at: number;
    }
  | {
      type: "relation";
      extractionId: string;
      relationIndex: number;
      oldRelation: UserExtractedRelation;
      newRelation: UserExtractedRelation;
      at: number;
    }
  | {
      type: "review";
      extractionId: string;
      oldReviewed: boolean;
      newReviewed: boolean;
      at: number;
    }
  | {
      type: "delete-concepts";
      extractionId: string;
      deletedIndices: number[];
      deletedConcepts: UserExtractedConcept[];
      oldRelations: UserExtractedRelation[];
      at: number;
    };

const STORAGE_KEY = "law-universe:undo-stack:v1";
const MAX_SIZE = 50;

function readStorage(): UndoOperation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_SIZE) as UndoOperation[];
  } catch {
    return [];
  }
}

function writeStorage(stack: UndoOperation[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stack.slice(0, MAX_SIZE)));
  } catch {
    /* localStorage 可能满，忽略 */
  }
}

export interface UseUndoStackResult {
  stack: UndoOperation[];
  canUndo: boolean;
  push: (op: UndoOperation) => void;
  pop: () => UndoOperation | null;
  clear: () => void;
  /** 拿顶部 operation 不弹出。 */
  peek: () => UndoOperation | null;
}

export function useUndoStack(): UseUndoStackResult {
  const [stack, setStack] = useState<UndoOperation[]>([]);

  // 初始从 localStorage 加载
  useEffect(() => {
    setStack(readStorage());
  }, []);

  const persist = useCallback((next: UndoOperation[] | ((prev: UndoOperation[]) => UndoOperation[])) => {
    setStack((prev) => {
      const value = typeof next === "function" ? (next as (p: UndoOperation[]) => UndoOperation[])(prev) : next;
      const sliced = value.slice(0, MAX_SIZE);
      writeStorage(sliced);
      return sliced;
    });
  }, []);

  const push = useCallback(
    (op: UndoOperation) => {
      persist((prev) => [op, ...prev]);
    },
    [persist]
  );

  const pop = useCallback((): UndoOperation | null => {
    if (stack.length === 0) return null;
    const top = stack[0];
    // 修复:用 persist(prev => prev.slice(1)) 而不是 setStack + 闭包 stack.slice(1),
    // 避免连续 pop 时闭包 stack 过期导致 localStorage 写入错误数据。
    persist((prev) => prev.slice(1));
    return top;
  }, [stack, persist]);

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  const peek = useCallback((): UndoOperation | null => {
    return stack[0] ?? null;
  }, [stack]);

  return { stack, canUndo: stack.length > 0, push, pop, clear, peek };
}

/** 纯函数：应用一个 op 的"反向操作"生成逆 op。用于实现 undo。 */
export function invertOperation(op: UndoOperation): UndoOperation {
  switch (op.type) {
    case "merge":
      return { ...op, before: op.after, after: op.before };
    case "move":
      return { ...op, fromSystem: op.toSystem, toSystem: op.fromSystem };
    case "confidence":
      return { ...op, oldConfidence: op.newConfidence, newConfidence: op.oldConfidence };
    case "relation":
      return { ...op, oldRelation: op.newRelation, newRelation: op.oldRelation };
    case "review":
      return { ...op, oldReviewed: op.newReviewed, newReviewed: op.oldReviewed };
    case "delete-concepts":
      return { ...op }; // 删除的逆操作是恢复（具体恢复在 undoApply 里处理）
    default: {
      // 防御性 fallback
      const exhaustive: never = op;
      void exhaustive;
      return op;
    }
  }
}

/** 类型守卫 + utility。 */
export function isMoveOp(op: UndoOperation): op is Extract<UndoOperation, { type: "move" }> {
  return op.type === "move";
}
export function isConfidenceOp(op: UndoOperation): op is Extract<UndoOperation, { type: "confidence" }> {
  return op.type === "confidence";
}
export function isRelationOp(op: UndoOperation): op is Extract<UndoOperation, { type: "relation" }> {
  return op.type === "relation";
}
export function isReviewOp(op: UndoOperation): op is Extract<UndoOperation, { type: "review" }> {
  return op.type === "review";
}
export function isDeleteConceptsOp(op: UndoOperation): op is Extract<UndoOperation, { type: "delete-concepts" }> {
  return op.type === "delete-concepts";
}
