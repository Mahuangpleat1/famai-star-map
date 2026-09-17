/**
 * useCinematicIntro —— 9.6s 开场动画状态机。
 *
 * 进入页面时返回 "intro" 状态;9.6s 后(或 prefers-reduced-motion)自动切到 "settled"。
 * LabPage 调用 settle() 可手动提前结束(任何用户主动操作都会调)。
 *
 * 设计:每个 LabPage 实例独立持有自己的 mode,不会跨页面共享。
 */
import { useCallback, useEffect, useState } from "react";

export type CinematicMode = "intro" | "settled";

export function useCinematicIntro(timeoutMs = 9_600): [CinematicMode, () => void] {
  const [mode, setMode] = useState<CinematicMode>("intro");

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      setMode("settled");
      return undefined;
    }

    const timer = window.setTimeout(() => setMode("settled"), timeoutMs);
    return () => window.clearTimeout(timer);
  }, [timeoutMs]);

  const settle = useCallback(() => setMode("settled"), []);

  return [mode, settle];
}
