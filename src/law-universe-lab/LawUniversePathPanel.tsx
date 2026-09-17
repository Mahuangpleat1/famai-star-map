import { ArrowRight, X } from "lucide-react";
import { getLegalUniverseNodeById } from "../../data/legalUniverseData";
import type { LegalUniversePath } from "../../data/legalUniverseData";
import type { LegalUniverseNode } from "./types";
import "./css/law-universe-lab-panels.css";

interface LawUniversePathPanelProps {
  path: LegalUniversePath | null;
  fromNode: LegalUniverseNode | null;
  toNode: LegalUniverseNode | null;
  onSelectNode: (id: string) => void;
  onClear: () => void;
}

const TYPE_LABEL: Record<LegalUniverseNode["type"], string> = {
  "universe-core": "总览",
  "system-sun": "太阳系",
  code: "法典结构",
  law: "法律",
  field: "领域",
  concept: "概念",
  rule: "规则",
  institution: "制度",
  procedure: "程序",
  history: "历史",
  theory: "理论",
  "case-method": "方法"
};

function nodeLabel(node: LegalUniverseNode | undefined): string {
  if (!node) return "—";
  return node.title;
}

export function LawUniversePathPanel({ path, fromNode, toNode, onSelectNode, onClear }: LawUniversePathPanelProps) {
  if (!path || path.nodeIds.length === 0) {
    return null;
  }

  const reachable = path.hopCount > 0;

  return (
    <section
      className="law-universe-path-panel"
      data-testid="law-universe-path-panel"
      data-hop-count={path.hopCount}
      data-reachable={String(reachable)}
      aria-label="A 到 B 的法学节点路径"
    >
      <header className="law-universe-path-panel__head">
        <span className="law-universe-path-panel__title">路径</span>
        <span className="law-universe-path-panel__meta">
          {fromNode ? nodeLabel(fromNode) : "起点"}
          <ArrowRight aria-hidden="true" size={12} strokeWidth={1.8} />
          {toNode ? nodeLabel(toNode) : "终点"}
        </span>
        <span className="law-universe-path-panel__stat">
          {reachable ? `${path.hopCount} 跳` : "同节点"}
        </span>
        <button
          type="button"
          className="law-universe-path-panel__close"
          onClick={onClear}
          aria-label="关闭路径"
          data-testid="law-universe-path-panel-close"
        >
          <X aria-hidden="true" size={13} strokeWidth={1.8} />
        </button>
      </header>

      {reachable ? (
        <div className="law-universe-path-panel__chain" data-testid="law-universe-path-panel-chain">
          {path.nodeIds.map((nodeId, index) => {
            const node = getLegalUniverseNodeById(nodeId);
            const isFirst = index === 0;
            const isLast = index === path.nodeIds.length - 1;
            const step = isFirst ? null : path.steps[index - 1];
            return (
              <div className="law-universe-path-panel__row" key={`${nodeId}-${index}`}>
                {step ? (
                  <div className="law-universe-path-panel__step" data-testid="law-universe-path-panel-step">
                    <span className="law-universe-path-panel__step-label">{step.edge.label}</span>
                    <span className="law-universe-path-panel__step-weight">强度 {step.edge.weight}</span>
                  </div>
                ) : null}
                <button
                  type="button"
                  className={`law-universe-path-panel__chip ${isFirst ? "is-endpoint" : ""} ${isLast ? "is-endpoint" : ""}`}
                  onClick={() => onSelectNode(nodeId)}
                  data-testid={`law-universe-path-panel-node-${nodeId}`}
                >
                  <span className="law-universe-path-panel__chip-title">{nodeLabel(node)}</span>
                  <span className="law-universe-path-panel__chip-meta">
                    {node ? `${TYPE_LABEL[node.type]} · L${node.level}` : ""}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="law-universe-path-panel__empty">起点和终点相同，无路径。</p>
      )}
    </section>
  );
}
