import { BookOpen, CheckCircle2, Circle, X } from "lucide-react";
import { useMemo } from "react";
import { getLegalUniverseNodeById } from "../../data/legalUniverseData";
import { legalUniverseLearningPaths, type LearningPath, type LearningPathStep } from "../../data/legalUniverseLearningPaths";
import "./css/law-universe-lab-panels.css";

interface LawUniverseLearningPathPanelProps {
  activePathId: string | null;
  completedSteps: Record<string, Set<number>>;
  onStart: (pathId: string) => void;
  onSelectNode: (nodeId: string) => void;
  onAdvance: (pathId: string) => void;
  onClose: () => void;
  onMarkStepComplete: (pathId: string, stepIndex: number) => void;
}

function pathProgressPercent(path: LearningPath, completed: Set<number>): number {
  if (path.steps.length === 0) return 0;
  return Math.round((completed.size / path.steps.length) * 100);
}

interface StepRowProps {
  path: LearningPath;
  step: LearningPathStep;
  index: number;
  isCurrent: boolean;
  isComplete: boolean;
  onSelectNode: (id: string) => void;
  onMarkComplete: () => void;
}

function StepRow({ path, step, index, isCurrent, isComplete, onSelectNode, onMarkComplete }: StepRowProps) {
  const node = getLegalUniverseNodeById(step.nodeId);
  return (
    <li
      className={`law-universe-learning-path__step ${isCurrent ? "is-current" : ""} ${isComplete ? "is-complete" : ""}`}
      data-testid={`law-universe-learning-path-step-${path.id}-${index}`}
      data-step-current={String(isCurrent)}
      data-step-complete={String(isComplete)}
    >
      <div className="law-universe-learning-path__step-marker">
        {isComplete ? (
          <CheckCircle2 aria-hidden="true" size={14} strokeWidth={2} />
        ) : (
          <Circle aria-hidden="true" size={14} strokeWidth={2} />
        )}
        <span className="law-universe-learning-path__step-index">{index + 1}</span>
      </div>
      <div className="law-universe-learning-path__step-body">
        <button
          type="button"
          className="law-universe-learning-path__step-title"
          onClick={() => onSelectNode(step.nodeId)}
          data-testid={`law-universe-learning-path-step-node-${path.id}-${index}`}
        >
          {node?.title ?? step.nodeId}
        </button>
        <p className="law-universe-learning-path__step-why">{step.why}</p>
        <div className="law-universe-learning-path__step-actions">
          {!isComplete ? (
            <button
              type="button"
              className="law-universe-learning-path__step-complete"
              onClick={onMarkComplete}
              data-testid={`law-universe-learning-path-step-complete-${path.id}-${index}`}
            >
              标记已学
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function LawUniverseLearningPathPanel({
  activePathId,
  completedSteps,
  onStart,
  onSelectNode,
  onAdvance,
  onClose,
  onMarkStepComplete
}: LawUniverseLearningPathPanelProps) {
  const activePath = useMemo(() => legalUniverseLearningPaths.find((p) => p.id === activePathId) ?? null, [activePathId]);
  const completed = activePath ? completedSteps[activePath.id] ?? new Set<number>() : new Set<number>();
  const currentIndex = activePath ? completed.size : 0;
  const percent = activePath ? pathProgressPercent(activePath, completed) : 0;

  return (
    <aside
      className="law-universe-learning-path"
      data-testid="law-universe-learning-path-panel"
      data-active-path={activePathId ?? ""}
      aria-label="中国法学宇宙学习路径"
    >
      <header className="law-universe-learning-path__head">
        <BookOpen aria-hidden="true" size={16} strokeWidth={1.8} />
        <span className="law-universe-learning-path__title">学习路径</span>
        {activePath ? (
          <span className="law-universe-learning-path__progress" data-testid="law-universe-learning-path-progress">
            {completed.size} / {activePath.steps.length} · {percent}%
          </span>
        ) : null}
        <button
          type="button"
          className="law-universe-learning-path__close"
          onClick={onClose}
          aria-label="关闭学习路径"
          data-testid="law-universe-learning-path-close"
        >
          <X aria-hidden="true" size={13} strokeWidth={1.8} />
        </button>
      </header>

      {!activePath ? (
        <div className="law-universe-learning-path__list" data-testid="law-universe-learning-path-list">
          {legalUniverseLearningPaths.map((path) => {
            const completedForPath = completedSteps[path.id] ?? new Set<number>();
            const pathPercent = pathProgressPercent(path, completedForPath);
            return (
              <article key={path.id} className="law-universe-learning-path__card" data-testid={`law-universe-learning-path-card-${path.id}`}>
                <h3>{path.title}</h3>
                <p className="law-universe-learning-path__audience">{path.audience} · {path.estimatedTime}</p>
                <p>{path.description}</p>
                <footer>
                  <span className="law-universe-learning-path__progress">{completedForPath.size} / {path.steps.length} · {pathPercent}%</span>
                  <button type="button" onClick={() => onStart(path.id)} data-testid={`law-universe-learning-path-start-${path.id}`}>
                    {completedForPath.size > 0 ? "继续" : "开始"}
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="law-universe-learning-path__active" data-testid="law-universe-learning-path-active">
          <p className="law-universe-learning-path__audience">{activePath.audience} · {activePath.estimatedTime}</p>
          <h2>{activePath.title}</h2>
          <p>{activePath.description}</p>
          <ol className="law-universe-learning-path__steps">
            {activePath.steps.map((step, index) => (
              <StepRow
                key={`${activePath.id}-${index}-${step.nodeId}`}
                path={activePath}
                step={step}
                index={index}
                isCurrent={index === currentIndex}
                isComplete={completed.has(index)}
                onSelectNode={onSelectNode}
                onMarkComplete={() => onMarkStepComplete(activePath.id, index)}
              />
            ))}
          </ol>
          {currentIndex < activePath.steps.length ? (
            <button
              type="button"
              className="law-universe-learning-path__next"
              onClick={() => onAdvance(activePath.id)}
              data-testid="law-universe-learning-path-next"
            >
              跳到下一步: {getLegalUniverseNodeById(activePath.steps[currentIndex]?.nodeId ?? "")?.title ?? "—"}
            </button>
          ) : (
            <p className="law-universe-learning-path__finished">本路径已完成。返回路径列表查看其他主题。</p>
          )}
        </div>
      )}
    </aside>
  );
}
