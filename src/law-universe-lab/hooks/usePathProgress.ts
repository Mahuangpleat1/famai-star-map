/**
 * usePathProgress —— 学习路径的步骤进度(localStorage 持久化)。
 *
 * 数据形态:Record<pathId, Set<stepIndex>>,localStorage 用数组序列化避免 Set 不可 JSON 化。
 *
 * 设计:
 * - 只在 LabPage 顶层使用。Track G 把它从 LawUniverseLearningPathPanel.tsx 拆出来,
 *   让 panel 单独走 React.lazy 拆 chunk,不被 hook 拽进主入口。
 * - 路径进度面板 LawUniverseLearningPathPanel 通过 prop (completedSteps) 接收数据,
 *   不直接 import 这个 hook(避免 panel chunk 重复打包 hook 代码)。
 */

import { useEffect, useState } from "react";

const PROGRESS_STORAGE_KEY = "law-universe:path-progress:v1";

function readProgress(): Record<string, Set<number>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number[]>;
    return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, new Set(v)]));
  } catch {
    return {};
  }
}

function writeProgress(progress: Record<string, Set<number>>): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = Object.fromEntries(Object.entries(progress).map(([k, v]) => [k, [...v].sort((a, b) => a - b)]));
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    /* localStorage might be disabled in some sandbox; ignore */
  }
}

export function usePathProgress() {
  const [progress, setProgress] = useState<Record<string, Set<number>>>({});

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  const markStepComplete = (pathId: string, stepIndex: number) => {
    setProgress((current) => {
      const next = { ...current, [pathId]: new Set([...(current[pathId] ?? []), stepIndex]) };
      writeProgress(next);
      return next;
    });
  };

  const resetPath = (pathId: string) => {
    setProgress((current) => {
      const next = { ...current };
      delete next[pathId];
      writeProgress(next);
      return next;
    });
  };

  return { progress, markStepComplete, resetPath };
}
