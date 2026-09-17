import { BookOpen, Brain, Database, HelpCircle, Pause, Play, Route, RotateCcw, Satellite, Search, Share2, Star, Trophy, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getLegalUniverseNodeById, getTopLegalUniverseSystems } from "../../data/legalUniverseData";
import "./css/law-universe-lab-hud.css";

interface LawUniverseHudProps {
  selectedNodeId: string;
  motionPaused: boolean;
  zoomLevel: number;
  satelliteVisible: boolean;
  relationVisible: boolean;
  onSelectNode: (id: string) => void;
  onReset: () => void;
  onToggleMotion: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onOpenSearch: () => void;
  onStartPathFrom: (id: string) => void;
  onOpenLearningPath: () => void;
  onOpenQuiz: () => void;
  onOpenFavorites: () => void;
  onOpenWorkbench: () => void;
  onToggleSatellites: () => void;
  onToggleRelations: () => void;
  /** Phase 2.6: 全局 undo 按钮（5 秒内可点）。 */
  onUndo?: () => void;
  canUndo?: boolean;
  undoSecondsLeft?: number;
  pathMode: "idle" | "awaiting-to";
  /** Phase 3 续: 复习 N 题按钮。 */
  dueCount: number;
  onStartQuizSession: () => void;
  /** 打开 / 关闭快捷键面板 */
  onToggleCheatsheet?: () => void;
}

const topSystems = getTopLegalUniverseSystems();

function useCompactViewport(): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 720px)");
    const update = () => setCompact(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return compact;
}

export function LawUniverseHud({
  selectedNodeId,
  motionPaused,
  zoomLevel,
  onSelectNode,
  onReset,
  onToggleMotion,
  onZoomIn,
  onZoomOut,
  onOpenSearch,
  onStartPathFrom,
  onOpenLearningPath,
  onOpenQuiz,
  onOpenFavorites,
  onOpenWorkbench,
  onToggleSatellites,
  onToggleRelations,
  onUndo,
  canUndo,
  undoSecondsLeft,
  satelliteVisible,
  relationVisible,
  pathMode,
  dueCount,
  onStartQuizSession,
  onToggleCheatsheet
}: LawUniverseHudProps) {
  const compactViewport = useCompactViewport();
  const pathArmed = pathMode === "awaiting-to";

  return (
    <>
      <header className="law-universe-hud" aria-label="中国法学宇宙悬浮控制">
        <div className="law-universe-hud__controls" role="group" aria-label="中国法学宇宙控制">
          <button type="button" className="law-universe-icon-button" onClick={onReset} aria-label="重置到中国法学宇宙总览" title="重置">
            <RotateCcw aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
          <button type="button" className="law-universe-icon-button" onClick={onOpenSearch} aria-label="打开中国法学宇宙节点搜索（Cmd/Ctrl + K）" title="搜索 ⌘K">
            <Search aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="law-universe-icon-button"
            onClick={onOpenLearningPath}
            aria-label="打开中国法学宇宙学习路径"
            title="学习路径"
            data-testid="law-universe-hud-learning-path"
          >
            <BookOpen aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className={`law-universe-icon-button ${dueCount > 0 ? "is-active" : ""}`}
            onClick={onStartQuizSession}
            disabled={dueCount === 0}
            aria-label={dueCount > 0 ? `开始复习会话,${dueCount} 题到期` : "暂无到期题"}
            title={dueCount > 0 ? `复习 ${dueCount} 题` : "暂无到期题"}
            data-testid="law-universe-hud-quiz"
          >
            <Brain aria-hidden="true" size={15} strokeWidth={1.8} />
            {dueCount > 0 ? <span className="law-universe-hud__quiz-badge" data-testid="law-universe-hud-quiz-badge">{dueCount}</span> : null}
          </button>
          <button
            type="button"
            className="law-universe-icon-button"
            onClick={onOpenQuiz}
            aria-label="打开法学快速抽查模式"
            title="快速抽查"
            data-testid="law-universe-hud-quick-quiz"
          >
            <Trophy aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="law-universe-icon-button"
            onClick={onOpenFavorites}
            aria-label="打开我的收藏与笔记"
            title="收藏 / 笔记"
            data-testid="law-universe-hud-favorites"
          >
            <Star aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className={`law-universe-icon-button ${pathArmed ? "is-active" : ""}`}
            onClick={() => onStartPathFrom(selectedNodeId)}
            aria-label={pathArmed ? "路径模式已开启，再点一个节点作为终点" : "从当前节点开始 A→B 路径发现"}
            aria-pressed={pathArmed}
            title={pathArmed ? "路径模式：等待终点" : "从当前节点出发 ⤳"}
            data-testid="law-universe-hud-path-arm"
          >
            <Route aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="law-universe-icon-button"
            onClick={onOpenWorkbench}
            aria-label="打开个人法学宇宙工作台：上传资料、抽取概念、配置 LLM"
            title="个人工作台"
            data-testid="law-universe-hud-workbench"
          >
            <Database aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className={`law-universe-icon-button ${satelliteVisible ? "is-active" : ""}`}
            onClick={onToggleSatellites}
            aria-label={satelliteVisible ? "隐藏我上传抽取的卫星节点" : "显示我上传抽取的卫星节点"}
            aria-pressed={satelliteVisible}
            title={satelliteVisible ? "卫星：显示中" : "卫星：已隐藏"}
            data-testid="law-universe-hud-toggle-satellites"
          >
            <Satellite aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className={`law-universe-icon-button ${relationVisible ? "is-active" : ""}`}
            onClick={onToggleRelations}
            aria-label={relationVisible ? "隐藏我抽取的关系连边" : "显示我抽取的关系连边"}
            aria-pressed={relationVisible}
            title={relationVisible ? "关系：显示中" : "关系：已隐藏"}
            data-testid="law-universe-hud-toggle-relations"
          >
            <Share2 aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="law-universe-icon-button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label={canUndo ? `撤销最近操作（剩余 ${undoSecondsLeft ?? 0} 秒）` : "无操作可撤销"}
            title={canUndo ? `撤销 (${undoSecondsLeft ?? 0}s)` : "无操作"}
            data-testid="law-universe-hud-undo"
          >
            <Undo2 aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="law-universe-icon-button"
            onClick={onZoomIn}
            aria-label="放大法学宇宙视角"
            title="放大"
            disabled={zoomLevel >= 2}
          >
            <ZoomIn aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="law-universe-icon-button"
            onClick={onZoomOut}
            aria-label="缩小法学宇宙视角"
            title="缩小"
            disabled={zoomLevel <= 0}
          >
            <ZoomOut aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="law-universe-icon-button"
            onClick={onToggleMotion}
            aria-label={motionPaused ? "播放法学宇宙动效" : "暂停法学宇宙动效"}
            title={motionPaused ? "播放" : "暂停"}
          >
            {motionPaused ? <Play aria-hidden="true" size={15} strokeWidth={1.8} /> : <Pause aria-hidden="true" size={15} strokeWidth={1.8} />}
          </button>
          {onToggleCheatsheet ? (
            <button
              type="button"
              className="law-universe-icon-button"
              onClick={onToggleCheatsheet}
              aria-label="查看快捷键面板（?）"
              title="快捷键 (?)"
              data-testid="law-universe-hud-cheatsheet"
            >
              <HelpCircle aria-hidden="true" size={15} strokeWidth={1.8} />
            </button>
          ) : null}
        </div>
      </header>

      <nav className="law-universe-system-index" aria-label="法学太阳系索引">
        <span className="law-universe-system-index__prefix">太阳系：</span>
        {topSystems.map((node, index) => {
          // a11y:不仅当选中节点就是该 system 时高亮,当选中节点在该 system 内时也高亮。
          // 例如选中「合同」(在 民法典 下),民法典的 system 按钮也标记 aria-current="true",
          // 屏幕阅读器用户能清楚知道当前所在 system。
          // 视觉态(is-selected)也同步更新,避免键盘焦点和视觉态分裂。
          const isCurrentSystem = selectedNodeId === node.id;
          const selectedNode = selectedNodeId ? getLegalUniverseNodeById(selectedNodeId) : undefined;
          const isAncestorOfSelection = selectedNode?.systemId === node.id && !isCurrentSystem;
          const isHighlighted = isCurrentSystem || isAncestorOfSelection;
          return (
            <span className="law-universe-system-index__item" key={node.id}>
              {index > 0 ? <span className="law-universe-system-index__separator"> / </span> : null}
              <button
                type="button"
                className={isHighlighted ? "is-selected" : ""}
                onClick={() => onSelectNode(node.id)}
                aria-label={selectedNodeId !== "universe-core" || compactViewport ? `聚焦 ${node.title}` : undefined}
                aria-current={isHighlighted ? "true" : undefined}
              >
                {node.title}
              </button>
            </span>
          );
        })}
      </nav>
    </>
  );
}
