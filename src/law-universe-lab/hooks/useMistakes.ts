import { useCallback, useState } from "react";

/**
 * useMistakes —— 错题本版本号(单调递增)。
 * LabPage / useQuizReview 等"看到错题本变化"的下游逻辑依赖该值。
 * 不持有错题本数据本身,只暴露"是否变了"的信号。
 */
export function useMistakes() {
  const [mistakesVersion, setMistakesVersion] = useState(0);
  const bumpMistakes = useCallback(() => setMistakesVersion((v) => v + 1), []);
  return { mistakesVersion, setMistakesVersion, bumpMistakes };
}
