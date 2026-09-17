/**
 * Toast hook —— Phase 3 polish (9.1)。
 *
 * 简单 useState 栈 + setTimeout 自动 dismiss。
 * 颜色 / 位置由 ToastStack 组件控制,本 hook 只管生命周期。
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type ToastKind = "info" | "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
  /** ms,默认 4000,0 = 不自动消失 */
  duration: number;
  action?: { label: string; onClick: () => void };
}

export interface UseToast {
  toasts: ToastItem[];
  push: (item: Omit<ToastItem, "id" | "duration"> & { duration?: number }) => string;
  dismiss: (id: string) => void;
  success: (message: string, opts?: { duration?: number; action?: { label: string; onClick: () => void } }) => string;
  error: (message: string, opts?: { duration?: number; action?: { label: string; onClick: () => void } }) => string;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useToast(): UseToast {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (item: Omit<ToastItem, "id" | "duration"> & { duration?: number }): string => {
      const id = uuid();
      const duration = item.duration ?? 4000;
      const toast: ToastItem = { ...item, id, duration };
      setToasts((prev) => [...prev, toast]);
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string, opts?: { duration?: number; action?: { label: string; onClick: () => void } }) =>
      push({ kind: "success", message, ...(opts ?? {}) }),
    [push]
  );

  const error = useCallback(
    (message: string, opts?: { duration?: number; action?: { label: string; onClick: () => void } }) =>
      push({ kind: "error", message, ...(opts ?? {}) }),
    [push]
  );

  useEffect(() => {
    const timersRef = timers.current;
    return () => {
      timersRef.forEach((timer) => clearTimeout(timer));
      timersRef.clear();
    };
  }, []);

  return { toasts, push, dismiss, success, error };
}
