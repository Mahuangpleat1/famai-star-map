import { useCallback, useState } from "react";

/**
 * useModals —— LabPage 里所有"开关式"弹窗(命令面板 / Quiz / 收藏 / 工作台 / 复习会话)。
 *
 * 每对 (openX / closeX) 是稳定的 useCallback 引用,适合放进 useEffect 依赖。
 * 每个 modal 初始 false;settleCinematicIntro 等"打开时副作用"由 LabPage 自行加,
 * 保持本 hook 单纯管可见性,避免 hook 间耦合。
 */
export interface UseModalsReturn {
  searchOpen: boolean;
  quizOpen: boolean;
  quizSessionOpen: boolean;
  favoritesOpen: boolean;
  workbenchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  openQuiz: () => void;
  closeQuiz: () => void;
  openQuizSession: () => void;
  closeQuizSession: () => void;
  openFavorites: () => void;
  closeFavorites: () => void;
  openWorkbench: () => void;
  closeWorkbench: () => void;
}

export function useModals(): UseModalsReturn {
  const [searchOpen, setSearchOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizSessionOpen, setQuizSessionOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [workbenchOpen, setWorkbenchOpen] = useState(false);

  return {
    searchOpen,
    quizOpen,
    quizSessionOpen,
    favoritesOpen,
    workbenchOpen,
    openSearch: useCallback(() => setSearchOpen(true), []),
    closeSearch: useCallback(() => setSearchOpen(false), []),
    openQuiz: useCallback(() => setQuizOpen(true), []),
    closeQuiz: useCallback(() => setQuizOpen(false), []),
    openQuizSession: useCallback(() => setQuizSessionOpen(true), []),
    closeQuizSession: useCallback(() => setQuizSessionOpen(false), []),
    openFavorites: useCallback(() => setFavoritesOpen(true), []),
    closeFavorites: useCallback(() => setFavoritesOpen(false), []),
    openWorkbench: useCallback(() => setWorkbenchOpen(true), []),
    closeWorkbench: useCallback(() => setWorkbenchOpen(false), [])
  };
}
