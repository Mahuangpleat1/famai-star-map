import { type CSSProperties, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  findLegalUniversePath,
  getLegalUniverseNodeById,
  legalUniverseEdges,
  legalUniverseIntroCopy,
  legalUniverseNodes,
  type LegalUniversePath
} from "../../data/legalUniverseData";
import { useCommandPaletteHotkey } from "./hooks/useCommandPaletteHotkey";
import { legalUniverseLearningPaths } from "../../data/legalUniverseLearningPaths";
import { LawUniverseFilterBar } from "./LawUniverseFilterBar";
import { LawUniverseDetailPanel } from "./LawUniverseDetailPanel";
import { LawUniverseHud } from "./LawUniverseHud";
import { usePathProgress } from "./hooks/usePathProgress";
import { useUserSatellites, type ReviewableSatellite } from "./useUserSatellites";
import { useUserRelations } from "./useUserRelations";
import { useDuplicateGroups } from "./useDuplicateGroups";
import { useUndoStack } from "./useUndoStack";
import { useToast } from "./useToast";
import { ToastStack } from "./ToastStack";
import { getLegalUniverseViewMode, shouldRenderLegalUniverseEdge } from "./legalUniverseSceneUtils";
import { useCinematicIntro } from "./useCinematicIntro";
import { useUrlHashState } from "./useUrlHashState";
import { getConceptId } from "./legalUniverseConceptIdentity";
import { applyLearningUndo } from "./legalUniverseUndo";
import { getExtraction, putExtraction } from "./legalUniverseUserDb";
import { OnboardingHint } from "./OnboardingHint";
import { SkipLink } from "./SkipLink";
import "./css/law-universe-lab-skiplink.css";
import {
  useFocusState
} from "./hooks/useFocusState";
import { useHoverState } from "./hooks/useHoverState";
import { useMotionState } from "./hooks/useMotionState";
import { useZoomState } from "./hooks/useZoomState";
import { useCameraFrame } from "./hooks/useCameraFrame";
import { useFilters } from "./hooks/useFilters";
import { usePath } from "./hooks/usePath";
import { useModals } from "./hooks/useModals";
import { useSatellite } from "./hooks/useSatellite";
import { useSatelliteVisible } from "./hooks/useSatelliteVisible";
import { useRelationVisible } from "./hooks/useRelationVisible";
import { useMistakes } from "./hooks/useMistakes";
import { useQuizReview } from "./hooks/useQuizReview";
import { useStorageQuota } from "./hooks/useStorageQuota";
import { PanelLoadingShell } from "./PanelLoadingShell";
import "./css/law-universe-lab-base.css";
import "./css/law-universe-lab-onboarding.css";
import "./css/law-universe-lab-scene.css";

// Keep the scene's footprint while its renderer downloads; real detail text
// and navigation can paint without waiting for Three.js or WebGL startup.
const LawUniverseScene = lazy(() =>
  import("./LawUniverseScene").then((module) => ({ default: module.LawUniverseScene }))
);

/** @deprecated 兼容导出,改用 useFilters。 */
export type { LegalUniverseFilterState } from "./hooks/useFilters";

/* -------------------------------------------------------------------------- */
/* Panel code-split                                                            */
/* -------------------------------------------------------------------------- */
// 这些面板都是按需打开(⌘K / Quiz / Workbench / 学习路径等),
// 第一次打开时才下载对应 chunk,LabPage 主入口保持 thin。
// Suspense fallback 由 PanelLoadingShell 统一提供,跟现有 pre-shell 风格一致。
const LawUniverseCommandPalette = lazy(() =>
  import("./LawUniverseCommandPalette").then((m) => ({ default: m.LawUniverseCommandPalette }))
);
const LawUniverseQuiz = lazy(() =>
  import("./LawUniverseQuiz").then((m) => ({ default: m.LawUniverseQuiz }))
);
const LawUniverseQuizSession = lazy(() =>
  import("./LawUniverseQuizSession").then((m) => ({ default: m.LawUniverseQuizSession }))
);
const LawUniverseFavoritesPanel = lazy(() =>
  import("./LawUniverseFavoritesPanel").then((m) => ({ default: m.LawUniverseFavoritesPanel }))
);
const LawUniverseWorkbenchPanel = lazy(() =>
  import("./LawUniverseWorkbenchPanel").then((m) => ({ default: m.LawUniverseWorkbenchPanel }))
);
const LawUniverseLearningPathPanel = lazy(() =>
  import("./LawUniverseLearningPathPanel").then((m) => ({ default: m.LawUniverseLearningPathPanel }))
);
const LawUniversePathPanel = lazy(() =>
  import("./LawUniversePathPanel").then((m) => ({ default: m.LawUniversePathPanel }))
);
const LawUniverseSatelliteDetailPanel = lazy(() =>
  import("./LawUniverseSatelliteDetailPanel").then((m) => ({ default: m.LawUniverseSatelliteDetailPanel }))
);
const LawUniverseRelationLegend = lazy(() =>
  import("./LawUniverseRelationLegend").then((m) => ({ default: m.LawUniverseRelationLegend }))
);
const KeyboardCheatsheet = lazy(() =>
  import("./KeyboardCheatsheet").then((m) => ({ default: m.KeyboardCheatsheet }))
);

export function LawUniverseLabPage() {
  const [initialUrlState, writeHash] = useUrlHashState();
  const [cinematicIntro, settleCinematicIntro] = useCinematicIntro();
  const toast = useToast();
  const [retryTrigger, setRetryTrigger] = useState(0);

  // state hooks (15)
  const focus = useFocusState(initialUrlState.selectedNodeId ?? undefined);
  const hover = useHoverState();
  const motion = useMotionState();
  const zoom = useZoomState(initialUrlState.zoomLevel ?? 1);
  const filters = useFilters(initialUrlState);
  const path = usePath();
  const modals = useModals();
  const satellite = useSatellite();
  const satVis = useSatelliteVisible();
  const relVis = useRelationVisible();
  const mistakes = useMistakes();
  const { cameraFrame, setCameraFrame } = useCameraFrame(focus.focusState.selectedNodeId, zoom.zoomLevel);
  // 用 useCallback 稳定 onRetry 引用,避免 useQuizReview 的 useEffect 每次 render 重跑
  // (依赖里包含 onRetry,inline arrow 会让 deps 抖动 + 重复弹 toast)。
  const handleRetryReview = useCallback(() => {
    setRetryTrigger((v) => v + 1);
  }, []);
  const quizReview = useQuizReview(
    toast,
    modals.quizSessionOpen,
    mistakes.mistakesVersion,
    retryTrigger,
    handleRetryReview
  );

  // 存储配额监控 —— 配额告警 / 危险时弹 toast(24h 节流)
  const storageQuota = useStorageQuota({ pollIntervalMs: 60_000, warningThreshold: 0.8, dangerThreshold: 0.95 });
  useEffect(() => {
    if (!storageQuota.supported) return;
    if (!storageQuota.warning) return;
    const key = `law-universe:quota-toast:${storageQuota.updatedAt}`;
    try {
      const last = Number(localStorage.getItem(key) ?? 0);
      if (Date.now() - last < 24 * 3600 * 1000) return;
      localStorage.setItem(key, String(Date.now()));
    } catch {
      /* ignore */
    }
    const ratioPct = Math.round(storageQuota.usageRatio * 100);
    toast.push({
      kind: storageQuota.danger ? "error" : "warning",
      message: storageQuota.danger
        ? `浏览器存储空间即将耗尽（已用 ${ratioPct}%），请尽快导出备份并清理旧资料`
        : `浏览器存储空间使用 ${ratioPct}%，建议导出备份`,
      duration: storageQuota.danger ? 0 : 8000
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast 整体对象引用不稳,只取 toast.push 已足够;usageRatio 由 updatedAt 变化间接覆盖
  }, [storageQuota.danger, storageQuota.warning, storageQuota.updatedAt, storageQuota.supported, toast]);

  // drag state (留 useState,跨 hook 协调太碎,留这里)
  const [isDragging, setIsDragging] = useState(false);

  // cheatsheet state
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  // onboarding tracking (用户在 4 步中的哪几步已经完成)
  const [onboardingKeys, setOnboardingKeys] = useState<Set<string>>(() => new Set());

  // user data hooks
  const { satellites: userSatellites, reload: reloadUserSatellites } = useUserSatellites();
  const { relations: userRelations, reload: reloadUserRelations } = useUserRelations();
  const duplicateGroups = useDuplicateGroups(userSatellites);
  const undoStack = useUndoStack();
  const { progress: pathProgress, markStepComplete } = usePathProgress();

  // path initial seeding from URL
  useEffect(() => {
    if (initialUrlState.path && !path.pathEndpoints) {
      path.setPathEndpoints(initialUrlState.path);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only 一次性 seeding;依赖 path 引用会让 effect 每次 render 重跑(污染初始状态)
  }, []);

  // derived
  const systemCount = useMemo(() => legalUniverseNodes.filter((n) => n.type === "system-sun").length, []);
  const activeEdgeCount = useMemo(
    () => legalUniverseEdges.filter((e) => shouldRenderLegalUniverseEdge(e, focus.focusState.selectedNodeId, hover.hoveredNodeId)).length,
    [focus.focusState.selectedNodeId, hover.hoveredNodeId]
  );
  const viewMode = getLegalUniverseViewMode(focus.focusState.selectedNodeId);
  const focusedSystemId = focus.selectedNode.type === "system-sun" ? focus.selectedNode.id : focus.selectedNode.type === "universe-core" ? "universe" : focus.selectedNode.systemId ?? "universe";
  const viewState = viewMode === "overview" ? "universeOverview" : viewMode === "system" ? "systemFocus" : "nodeFocus";

  const effectiveMotionPaused = motion.motionPaused || isDragging;
  const pageStyle: CSSProperties & { "--universe-scene-scale": string } = {
    "--universe-scene-scale": String(zoom.zoomLevel === 2 ? 1.08 : zoom.zoomLevel === 0 ? 0.94 : 1)
  };

  // URL hash 同步
  useEffect(() => {
    const timer = window.setTimeout(() => {
      writeHash({
        selectedNodeId: focus.focusState.selectedNodeId,
        zoomLevel: zoom.zoomLevel,
        nodeTypes: filters.filterState.nodeTypes,
        levels: filters.filterState.levels,
        sourceCategories: filters.filterState.sourceCategories,
        path: path.pathEndpoints
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [focus.focusState.selectedNodeId, zoom.zoomLevel, filters.filterState, path.pathEndpoints, writeHash]);

  // selectedSatellite 变化时加载 extraction
  useEffect(() => {
    if (!satellite.selectedSatellite) {
      satellite.setSatelliteExtraction(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const ext = await getExtraction(satellite.selectedSatellite!.extractionId);
      if (cancelled) return;
      satellite.setSatelliteExtraction(ext ?? null);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- satellite hook wrapper 整体对象引用不稳,只取 selectedSatellite/setSatelliteExtraction 已足够
  }, [satellite.selectedSatellite, satellite.setSatelliteExtraction]);

  // workbench 打开时刷新
  useEffect(() => {
    if (modals.workbenchOpen) {
      void reloadUserSatellites();
      void reloadUserRelations();
    }
  }, [modals.workbenchOpen, reloadUserSatellites, reloadUserRelations]);

  // onboarding 跟踪:用户的关键操作触发对应 key
  const trackOnboarding = useCallback((key: string) => {
    setOnboardingKeys((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  // 编排层包装: selectNode / resetView 加跨 hook 副作用
  // (focus/hover/motion/zoom 是 hook wrapper 整体对象,引用不稳,只取内部 setter 已足够 —— 都来自 useState dispatch,引用稳定)
  const selectNode = useCallback((id: string) => {
    settleCinematicIntro();
    hover.setHoveredNodeId(null);
    focus.selectNode(id);
    trackOnboarding("clicked-node");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settleCinematicIntro, hover.setHoveredNodeId, focus.selectNode, trackOnboarding]);

  const resetView = useCallback(() => {
    settleCinematicIntro();
    hover.setHoveredNodeId(null);
    motion.setMotionPaused(false);
    zoom.setZoomLevel(1);
    focus.resetView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settleCinematicIntro, hover.setHoveredNodeId, motion.setMotionPaused, zoom.setZoomLevel, focus.resetView]);

  // B: 挂载后 dueCount >= 3 弹 1 次 info toast + 24h 节流
  const PROMPT_KEY = "law-universe:quiz-auto-prompt:v1";
  const PROMPT_INTERVAL_MS = 24 * 3600 * 1000;
  useEffect(() => {
    if (quizReview.dueCount < 3) return;
    let lastPrompted = 0;
    try {
      lastPrompted = Number(localStorage.getItem(PROMPT_KEY) || 0);
    } catch {
      return;
    }
    if (Date.now() - lastPrompted < PROMPT_INTERVAL_MS) return;
    toast.push({
      kind: "info",
      message: `今天有 ${quizReview.dueCount} 题到期，点击开始复习`,
      duration: 6000,
      action: { label: "开始", onClick: () => modals.openQuizSession() }
    });
    try {
      localStorage.setItem(PROMPT_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- PROMPT_INTERVAL_MS 是模块级常量,toast/modals 都是 hook wrapper(引用不稳,只取内部 push/openQuizSession 已足够)
  }, [quizReview.dueCount, modals, toast]);

  // Esc → resetView;  ?  → cheatsheet
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !modals.searchOpen) {
        resetView();
        return;
      }
      // 任意文本输入态都屏蔽 '?' 快捷键
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
      }
      if (event.key === "?" || (event.shiftKey && event.key === "/")) {
        event.preventDefault();
        setCheatsheetOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetView, modals.searchOpen]);

  useCommandPaletteHotkey(modals.searchOpen, modals.openSearch);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- modals 是 hook wrapper,只取内部 setter 已足够
  const openSearch = useCallback(() => { settleCinematicIntro(); modals.openSearch(); trackOnboarding("opened-search"); }, [settleCinematicIntro, modals.openSearch, trackOnboarding]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- modals 是 hook wrapper,只取内部 setter 已足够
  const openQuiz = useCallback(() => { settleCinematicIntro(); modals.openQuiz(); trackOnboarding("started-quiz"); }, [settleCinematicIntro, modals.openQuiz, trackOnboarding]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- modals 是 hook wrapper,只取内部 setter 已足够
  const openWorkbench = useCallback(() => { settleCinematicIntro(); modals.openWorkbench(); trackOnboarding("opened-workbench"); }, [settleCinematicIntro, modals.openWorkbench, trackOnboarding]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- modals 是 hook wrapper,只取内部 setter 已足够
  const openQuizSession = useCallback(() => { settleCinematicIntro(); modals.openQuizSession(); trackOnboarding("started-quiz"); }, [settleCinematicIntro, modals.openQuizSession, trackOnboarding]);

  // 拖拽归类
  const commitSatelliteMove = useCallback(
    async (sat: ReviewableSatellite, targetSystemId: string) => {
      const ext = await getExtraction(sat.extractionId);
      if (!ext) return;
      const conceptIndex = ext.concepts.findIndex((c, i) => getConceptId(ext.id, c, i) === sat.id);
      if (conceptIndex < 0 || conceptIndex >= ext.concepts.length) return;
      const concept = ext.concepts[conceptIndex];
      if (concept.system === targetSystemId) return;
      const fromSystem = concept.system;
      const updatedConcepts = ext.concepts.map((c, i) =>
        i === conceptIndex ? { ...c, system: targetSystemId as typeof c.system } : c
      );
      await putExtraction({ ...ext, concepts: updatedConcepts });
      undoStack.push({ type: "move", extractionId: sat.extractionId, conceptId: sat.id, conceptIndex, fromSystem, toSystem: targetSystemId, at: Date.now() });
      await reloadUserSatellites();
    },
    [undoStack, reloadUserSatellites]
  );

  const undoBusyRef = useRef(false);
  const undoLastMove = useCallback(async () => {
    if (undoBusyRef.current) return;
    const op = undoStack.peek();
    if (!op || Date.now() - op.at > 5000) return;
    undoBusyRef.current = true;
    try {
      if (await applyLearningUndo(op)) {
        undoStack.pop();
        await Promise.all([reloadUserSatellites(), reloadUserRelations()]);
      }
    } catch (error) {
      toast.push({ kind: "error", message: (error as Error).message });
    } finally { undoBusyRef.current = false; }
  }, [undoStack, reloadUserSatellites, reloadUserRelations, toast.push]);

  // (modals/satellite 是 hook wrapper,只取内部 setter 已足够)
  const jumpToExtraction = useCallback((extractionId: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("law-universe:workbench-highlight", extractionId);
    }
    modals.openWorkbench();
    satellite.setSelectedSatellite(null);
    satellite.setSatelliteExtraction(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modals.openWorkbench, satellite.setSelectedSatellite, satellite.setSatelliteExtraction]);

  // (path 是 hook wrapper,只取内部 setter 已足够)
  const startLearningPath = useCallback((pathId: string) => {
    settleCinematicIntro();
    path.setActivePathId(pathId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settleCinematicIntro, path.setActivePathId]);
  // (path 是 hook wrapper,只取内部 setter 已足够)
  const closeLearningPath = useCallback(() => path.setActivePathId(null), [path.setActivePathId]); // eslint-disable-line react-hooks/exhaustive-deps
  const advanceLearningPath = useCallback((pathId: string) => pathId, []);

  const computedPath: LegalUniversePath | null = useMemo(() => {
    if (!path.pathEndpoints) return null;
    return findLegalUniversePath(path.pathEndpoints.from, path.pathEndpoints.to, legalUniverseEdges, { maxHops: 6, requireWeightFloor: 50 });
  }, [path.pathEndpoints]);

  // (path 是 hook wrapper,只取内部 setter 已足够)
  const setPathTo = useCallback((id: string) => {
    path.setPathEndpoints((current) => {
      if (!current) return current;
      if (id === current.from) return { from: current.from, to: current.from };
      return { from: current.from, to: id };
    });
    path.setPathMode("idle");
    selectNode(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path.setPathEndpoints, path.setPathMode, selectNode]);

  // (path 是 hook wrapper,只取内部 setter 已足够)
  const startPathFrom = useCallback((id: string) => {
    settleCinematicIntro();
    path.setPathMode("awaiting-to");
    path.setPathEndpoints({ from: id, to: id });
    selectNode(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settleCinematicIntro, path.setPathMode, path.setPathEndpoints, selectNode]);

  // (path 是 hook wrapper,只取内部 setter 已足够)
  const clearPath = useCallback(() => {
    path.setPathEndpoints(null);
    path.setPathMode("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path.setPathEndpoints, path.setPathMode]);

  // (path 是 hook wrapper,只取内部 setter 已足够;setPathTo 内部已选 pathId)
  const handlePathNodeClick = useCallback((id: string) => {
    if (path.pathMode === "awaiting-to" && path.pathEndpoints) {
      setPathTo(id);
      return;
    }
    selectNode(id);
  }, [path.pathMode, path.pathEndpoints, setPathTo, selectNode]);

  // (satellite 是 hook wrapper,只取内部 setter 已足够)
  const closeSatellitePanel = useCallback(() => {
    satellite.setSelectedSatellite(null);
    satellite.setSatelliteExtraction(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satellite.setSelectedSatellite, satellite.setSatelliteExtraction]);

  const undoAvailable = undoStack.canUndo;
  const undoSecondsLeft = 0;

  const filteredNodeCount = useMemo(() => legalUniverseNodes.length, []);  // simplified

  return (
    <main
      className="law-universe-page"
      style={pageStyle}
      data-testid="law-universe-page"
      data-selected-node={focus.focusState.selectedNodeId}
      data-focused-node={focus.focusState.focusedNodeId}
      data-camera-target-id={focus.focusState.selectedNodeId}
      data-camera-position={cameraFrame.position.join(",")}
      data-camera-target={cameraFrame.target.join(",")}
      data-camera-state={focus.focusState.cameraState}
      data-camera-focus-key={focus.focusState.focusKey}
      data-focused-system={focusedSystemId}
      data-view-state={viewState}
      data-motion-paused={String(motion.motionPaused)}
      data-view-mode={viewMode}
      data-zoom-level={zoom.zoomLevel}
      data-cinematic-mode={cinematicIntro}
      data-showcase-mode="cinematic-ready"
      data-focus-ignition-key={focus.focusState.focusKey}
      data-user-satellite-count={userSatellites.length}
      data-user-relation-count={userRelations.length}
      data-node-count={legalUniverseNodes.length}
      data-edge-count={legalUniverseEdges.length}
      data-system-count={systemCount}
      data-system-sun-count={systemCount}
      data-active-edge-count={activeEdgeCount}
      data-filtered-node-count={filteredNodeCount}
      data-filter-node-types={(filters.filterState.nodeTypes ?? []).join(",")}
      data-filter-levels={(filters.filterState.levels ?? []).join(",")}
      data-filter-sources={(filters.filterState.sourceCategories ?? []).join(",")}
      data-path-endpoints={path.pathEndpoints ? `${path.pathEndpoints.from}~${path.pathEndpoints.to}` : ""}
      data-path-mode={path.pathMode}
      data-path-hop-count={computedPath?.hopCount ?? 0}
      data-path-reachable={String(Boolean(computedPath && computedPath.hopCount > 0))}
    >
      <SkipLink targetId="law-universe-scene" />
      <Suspense fallback={<div className="law-universe-scene" id="law-universe-scene" aria-busy="true" aria-label="3D 星图正在加载" />}>
        <LawUniverseScene
          selectedNodeId={focus.focusState.selectedNodeId}
          hoveredNodeId={hover.hoveredNodeId}
          motionPaused={effectiveMotionPaused}
          cameraFocusKey={focus.focusState.focusKey}
          focusIgnitionKey={focus.focusState.focusKey}
          zoomLevel={zoom.zoomLevel}
          filter={filters.sceneFilter}
          path={computedPath}
          satellites={userSatellites}
          satelliteVisible={satVis.satelliteVisible}
          relations={userRelations}
          relationVisible={relVis.relationVisible}
          onSelectSatellite={satellite.setSelectedSatellite}
          onCommitSatelliteMove={commitSatelliteMove}
          onDragStateChange={setIsDragging}
          onSelectNode={selectNode}
          onHoverNode={hover.setHoveredNodeId}
          onReset={resetView}
          onFocusComplete={focus.markFocusComplete}
          onCameraState={focus.setCameraState}
          onCameraFrame={setCameraFrame}
        />
      </Suspense>
      <div className="law-universe-vignette" aria-hidden="true" />
      <div
        className="law-universe-cinematic-copy"
        data-testid="law-universe-cinematic-copy"
        aria-hidden={cinematicIntro === "settled" ? "true" : undefined}
      >
        <span>{legalUniverseIntroCopy.title}</span>
        <span>{legalUniverseIntroCopy.subtitle}</span>
        <span>{legalUniverseIntroCopy.description}</span>
      </div>
      <LawUniverseHud
        selectedNodeId={focus.focusState.selectedNodeId}
        motionPaused={effectiveMotionPaused}
        zoomLevel={zoom.zoomLevel}
        onSelectNode={selectNode}
        onReset={resetView}
        onToggleMotion={() => { settleCinematicIntro(); motion.toggleMotion(); }}
        onZoomIn={() => { settleCinematicIntro(); zoom.zoomIn(); }}
        onZoomOut={() => { settleCinematicIntro(); zoom.zoomOut(); }}
        onOpenSearch={openSearch}
        onStartPathFrom={startPathFrom}
        onOpenLearningPath={() => path.setActivePathId(legalUniverseLearningPaths[0]?.id ?? null)}
        onOpenQuiz={openQuiz}
        onOpenFavorites={modals.openFavorites}
        onOpenWorkbench={openWorkbench}
        onToggleSatellites={satVis.toggleSatellites}
        onToggleRelations={relVis.toggleRelations}
        onUndo={undoLastMove}
        canUndo={undoAvailable}
        undoSecondsLeft={undoSecondsLeft}
        satelliteVisible={satVis.satelliteVisible}
        relationVisible={relVis.relationVisible}
        pathMode={path.pathMode}
        dueCount={quizReview.dueCount}
        onStartQuizSession={openQuizSession}
        onToggleCheatsheet={() => setCheatsheetOpen((o) => !o)}
      />
      <LawUniverseFilterBar
        filterState={filters.filterState}
        filteredNodeCount={legalUniverseNodes.length}
        totalNodeCount={legalUniverseNodes.length}
        onChange={filters.handleFilterChange}
        onClear={filters.handleFilterClear}
      />
      {path.pathEndpoints && computedPath ? (
        <Suspense fallback={<PanelLoadingShell variant="inline" label="载入路径..." />}>
          <LawUniversePathPanel
            path={computedPath}
            fromNode={getLegalUniverseNodeById(path.pathEndpoints.from) ?? null}
            toNode={getLegalUniverseNodeById(path.pathEndpoints.to) ?? null}
            onSelectNode={handlePathNodeClick}
            onClear={clearPath}
          />
        </Suspense>
      ) : null}
      {path.activePathId ? (
        <Suspense fallback={<PanelLoadingShell variant="inline" label="载入学习路径..." />}>
          <LawUniverseLearningPathPanel
            activePathId={path.activePathId}
            completedSteps={pathProgress}
            onStart={startLearningPath}
            onSelectNode={selectNode}
            onAdvance={advanceLearningPath}
            onClose={closeLearningPath}
            onMarkStepComplete={markStepComplete}
          />
        </Suspense>
      ) : null}
      {focus.visibleDetailNode ? (
        <LawUniverseDetailPanel node={focus.visibleDetailNode} onSelectNode={selectNode} />
      ) : null}
      {modals.searchOpen ? (
        <Suspense fallback={<PanelLoadingShell variant="modal" label="载入搜索..." />}>
          <LawUniverseCommandPalette open={modals.searchOpen} onClose={modals.closeSearch} onSelectNode={selectNode} />
        </Suspense>
      ) : null}
      {modals.quizOpen ? (
        <Suspense fallback={<PanelLoadingShell variant="modal" label="载入出题..." />}>
          <LawUniverseQuiz open={modals.quizOpen} onClose={modals.closeQuiz} onSelectNode={selectNode} />
        </Suspense>
      ) : null}
      {modals.quizSessionOpen ? (
        <Suspense fallback={<PanelLoadingShell variant="modal" label="载入刷题..." />}>
          <LawUniverseQuizSession
            open={modals.quizSessionOpen}
            onClose={() => { modals.closeQuizSession(); mistakes.bumpMistakes(); }}
          />
        </Suspense>
      ) : null}
      {modals.favoritesOpen ? (
        <Suspense fallback={<PanelLoadingShell variant="modal" label="载入收藏..." />}>
          <LawUniverseFavoritesPanel open={modals.favoritesOpen} onClose={modals.closeFavorites} onSelectNode={selectNode} />
        </Suspense>
      ) : null}
      {modals.workbenchOpen ? (
        <Suspense fallback={<PanelLoadingShell variant="modal" label="载入工作台..." />}>
          <LawUniverseWorkbenchPanel
            open={modals.workbenchOpen}
            onClose={modals.closeWorkbench}
            onDataChanged={() => { void reloadUserSatellites(); void reloadUserRelations(); }}
            mistakesVersion={mistakes.mistakesVersion}
            pushToast={toast.push}
            onSelectMistake={(mistake) => {
              const sat = userSatellites.find((s) => s.concept.title === mistake.conceptTitle);
              if (sat) {
                satellite.setSelectedSatellite(sat);
                modals.closeWorkbench();
              }
            }}
          />
        </Suspense>
      ) : null}
      {satellite.selectedSatellite && satellite.satelliteExtraction ? (
        <Suspense fallback={<PanelLoadingShell variant="inline" label="载入卫星详情..." />}>
          <LawUniverseSatelliteDetailPanel
            satellite={satellite.selectedSatellite}
            extraction={satellite.satelliteExtraction}
            onClose={closeSatellitePanel}
            onJumpToExtraction={jumpToExtraction}
            onReviewedChange={async () => {
              const selected = satellite.selectedSatellite;
              if (!selected) return;
              const updated = await getExtraction(selected.extractionId);
              satellite.setSatelliteExtraction(updated ?? null);
              if (updated) {
                const concept = updated.concepts.find((c, i) => getConceptId(updated.id, c, i) === selected.id);
                satellite.setSelectedSatellite(concept ? { ...selected, concept, reviewed: updated.reviewed } : null);
              } else { satellite.setSelectedSatellite(null); }
              await Promise.all([reloadUserSatellites(), reloadUserRelations()]);
            }}
            onUndoMove={undoAvailable ? undoLastMove : undefined}
            undoSecondsLeft={undoSecondsLeft}
            duplicateGroup={duplicateGroups.find((g) => g.satellites.some((s) => s.id === satellite.selectedSatellite!.id)) ?? null}
            pushUndo={undoStack.push}
            onMerged={async () => { await reloadUserSatellites(); await reloadUserRelations(); closeSatellitePanel(); }}
            onQuizGenerated={() => {}}
            onAddToMistakes={() => { mistakes.bumpMistakes(); }}
          />
        </Suspense>
      ) : null}
      {relVis.relationVisible ? (
        <Suspense fallback={<PanelLoadingShell variant="inline" label="载入图例..." />}>
          <LawUniverseRelationLegend relations={userRelations} />
        </Suspense>
      ) : null}
      <ToastStack toasts={toast.toasts} onDismiss={toast.dismiss} />
      <OnboardingHint completedKeys={onboardingKeys} />
      {cheatsheetOpen ? (
        <Suspense fallback={<PanelLoadingShell variant="modal" label="载入快捷键..." />}>
          <KeyboardCheatsheet open={cheatsheetOpen} onClose={() => setCheatsheetOpen(false)} />
        </Suspense>
      ) : null}
    </main>
  );
}
