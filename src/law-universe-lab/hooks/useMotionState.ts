import { useCallback, useState } from "react";

/**
 * useMotionState —— 3D 场景 motion (粒子 / 标签漂浮 / 镜头微动) 是否暂停。
 * 开场 cinematic intro 阶段通常 motionPaused=true,intro 结束后才放开。
 */
export function useMotionState() {
  const [motionPaused, setMotionPaused] = useState(false);
  const toggleMotion = useCallback(() => setMotionPaused((p) => !p), []);
  return { motionPaused, setMotionPaused, toggleMotion };
}
