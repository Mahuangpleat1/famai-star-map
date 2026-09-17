import {
  getLegalUniverseNodeById,
  getLegalUniverseRelationsForNode,
  getLegalUniverseSystemById,
  legalUniverseSourceRefs
} from "../../data/legalUniverseData";
import "./css/law-universe-lab-panels.css";
import { Download, Star } from "lucide-react";
import { useEffect, useState } from "react";
import {
  downloadMarkdownForNode,
  loadNodeNote,
  setNodeNote,
  toggleNodeFavorite
} from "./legalUniverseStorage";
import type { LegalUniverseNode, LegalUniverseNodeContent } from "./types";

interface LawUniverseDetailPanelProps {
  node: LegalUniverseNode;
  onSelectNode: (id: string) => void;
}

const typeLabel: Record<LegalUniverseNode["type"], string> = {
  "universe-core": "体系总览",
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

type CollapsibleKey = "statute" | "interpretation" | "practice" | "case" | "history";

function getSystemTitle(node: LegalUniverseNode): string {
  return getLegalUniverseSystemById(node.systemId)?.title ?? getLegalUniverseNodeById(node.systemId)?.title ?? "中国法学体系";
}

function getSourceStatus(node: LegalUniverseNode): string {
  const refs = node.sourceRefs
    .map((id) => legalUniverseSourceRefs.find((source) => source.id === id))
    .filter(Boolean);
  const official = refs.filter((source) => source?.category === "official").length;
  const education = refs.filter((source) => source?.category === "education" || source?.category === "textbook").length;

  if (official > 0 && education > 0) {
    return "法律文本 / 学科体系混合来源";
  }
  if (official > 0) {
    return "法律文本 / 行政法规直接来源";
  }
  if (education > 0) {
    return "学科目录来源";
  }
  return "教材体系归纳";
}

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

interface CollapsibleSectionProps {
  id: CollapsibleKey;
  title: string;
  count: number;
  openByDefault: boolean;
  testId: string;
  children: React.ReactNode;
}

function CollapsibleSection({ id, title, count, openByDefault, testId, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(openByDefault);
  if (count === 0) {
    return null;
  }
  return (
    <section className="law-universe-detail__collapsible" data-testid={testId} data-open={String(open)}>
      <button
        type="button"
        className="law-universe-detail__collapsible-head"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={`detail-${id}`}
      >
        <span>{title}</span>
        <span className="law-universe-detail__collapsible-count">{count}</span>
        <span className="law-universe-detail__collapsible-caret" aria-hidden="true">{open ? "▾" : "▸"}</span>
      </button>
      {open ? <div id={`detail-${id}`} className="law-universe-detail__collapsible-body">{children}</div> : null}
    </section>
  );
}

function ContentList({ content }: { content: LegalUniverseNodeContent | undefined }) {
  if (!content) {
    return <p className="law-universe-detail__content-empty">该节点暂未补充法条/实务要点等结构化内容。来源锚点见上方体系位置。</p>;
  }
  const statuteCount = content.statuteRefs?.length ?? 0;
  const interpCount = content.judicialInterpretations?.length ?? 0;
  const practiceCount = content.practicePoints?.length ?? 0;
  const caseCount = content.landmarkCases?.length ?? 0;
  const historyCount = content.historicalEvolution?.length ?? 0;

  return (
    <div className="law-universe-detail__content" data-testid="law-universe-detail-content">
      <CollapsibleSection id="statute" title="法条引用" count={statuteCount} openByDefault={true} testId="detail-statute">
        <ul className="law-universe-detail__statute-list">
          {(content.statuteRefs ?? []).map((ref, index) => (
            <li key={`${ref.lawTitle}-${ref.article}-${index}`} className="law-universe-detail__statute">
              <strong>{ref.lawTitle}</strong>
              <span className="law-universe-detail__article">{ref.article}</span>
              {ref.note ? <small>{ref.note}</small> : null}
              {ref.url ? (
                <a href={ref.url} target="_blank" rel="noreferrer noopener" className="law-universe-detail__external-link">
                  查原文 ↗
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection id="interpretation" title="司法解释" count={interpCount} openByDefault={false} testId="detail-interpretation">
        <ul className="law-universe-detail__interp-list">
          {(content.judicialInterpretations ?? []).map((item, index) => (
            <li key={`${item.title}-${index}`} className="law-universe-detail__interp">
              <div className="law-universe-detail__interp-head">
                <strong>{item.title}</strong>
                <span className="law-universe-detail__interp-meta">
                  {item.year} · {item.issuer}
                  {item.documentNumber ? ` · ${item.documentNumber}` : ""}
                </span>
              </div>
              <p>{item.summary}</p>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noreferrer noopener" className="law-universe-detail__external-link">
                  查原文 ↗
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection id="practice" title="实务要点" count={practiceCount} openByDefault={true} testId="detail-practice">
        <ul className="law-universe-detail__practice-list">
          {(content.practicePoints ?? []).map((point, index) => (
            <li key={`practice-${index}`}>{point}</li>
          ))}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection id="case" title="指导案例 / 典型案例" count={caseCount} openByDefault={false} testId="detail-case">
        <ul className="law-universe-detail__case-list">
          {(content.landmarkCases ?? []).map((item, index) => (
            <li key={`${item.caseNumber}-${index}`} className="law-universe-detail__case">
              <div className="law-universe-detail__case-head">
                <strong>{item.title}</strong>
                <span className="law-universe-detail__case-meta">
                  {item.year} · {item.court} · {item.caseNumber}
                </span>
              </div>
              <p>{item.summary}</p>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noreferrer noopener" className="law-universe-detail__external-link">
                  查原文 ↗
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection id="history" title="历史沿革" count={historyCount} openByDefault={false} testId="detail-history">
        <ol className="law-universe-detail__history-list">
          {(content.historicalEvolution ?? []).map((item, index) => (
            <li key={`history-${index}`}>
              <span className="law-universe-detail__history-year">{item.year}</span>
              <span>{item.event}</span>
            </li>
          ))}
        </ol>
      </CollapsibleSection>
    </div>
  );
}

export function LawUniverseDetailPanel({ node, onSelectNode }: LawUniverseDetailPanelProps) {
  const compactViewport = useCompactViewport();
  const relations = getLegalUniverseRelationsForNode(node.id).slice(0, node.type === "universe-core" ? 8 : 6);
  const [note, setNote] = useState<string>(() => loadNodeNote(node.id).note);
  const [favorited, setFavorited] = useState<boolean>(() => loadNodeNote(node.id).favorited);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    const stored = loadNodeNote(node.id);
    setNote(stored.note);
    setFavorited(stored.favorited);
    setSaveStatus("idle");
  }, [node.id]);

  const handleNoteChange = (next: string) => {
    setNote(next);
    setSaveStatus("saving");
    setNodeNote(node.id, next);
    window.setTimeout(() => setSaveStatus("saved"), 250);
  };

  const handleToggleFavorite = () => {
    const next = toggleNodeFavorite(node.id);
    setFavorited(next);
  };

  const handleDownload = () => {
    downloadMarkdownForNode(node.id);
  };

  return (
    // a11y:这是侧边详情面板(非 modal),没有 close 按钮,持续显示。
    // 不加 useFocusTrap —— 焦点陷阱会阻止用户用 Tab 走到场景 HUD,反而伤害 a11y。
    // 已经有 aria-labelledby(指向 <h2> 节点标题)+ aria-live="polite"(节点切换时朗读),足够。
    <aside className="law-universe-detail" data-testid="law-universe-detail" data-visible-node={node.id} aria-labelledby="law-universe-detail-title" aria-live="polite">
      <span className="law-universe-detail__drawer-handle" aria-hidden="true" />

      <div className="law-universe-detail__eyebrow">
        <span>法学星际档案</span>
        <span>{typeLabel[node.type]}</span>
      </div>

      <header className="law-universe-detail__profile">
        <span className="law-universe-detail__avatar" aria-hidden="true">
          {node.title.slice(0, 1)}
        </span>
        <div>
          <p className="law-universe-detail__meta">
            {getSystemTitle(node)} / {node.domain} / L{node.level}
          </p>
          <h2 id="law-universe-detail-title">{node.title}</h2>
          <p className="law-universe-detail__tag">{node.tags.slice(0, 3).join(" · ")}</p>
        </div>
        <div className="law-universe-detail__profile-actions">
          <button
            type="button"
            className={`law-universe-detail__action ${favorited ? "is-favorite" : ""}`}
            onClick={handleToggleFavorite}
            aria-pressed={favorited}
            aria-label={favorited ? "取消收藏" : "收藏此节点"}
            title={favorited ? "已收藏" : "收藏"}
            data-testid="law-universe-detail-favorite"
          >
            <Star aria-hidden="true" size={14} strokeWidth={1.8} fill={favorited ? "currentColor" : "none"} />
            <span>{favorited ? "已收藏" : "收藏"}</span>
          </button>
          <button
            type="button"
            className="law-universe-detail__action"
            onClick={handleDownload}
            aria-label="导出该节点为 markdown 笔记"
            title="导出 markdown"
            data-testid="law-universe-detail-export"
          >
            <Download aria-hidden="true" size={14} strokeWidth={1.8} />
            <span>导出</span>
          </button>
        </div>
      </header>

      <p className="law-universe-detail__positioning">{node.shortDescription}</p>

      <section className="law-universe-detail__archive">
        <h3>体系位置</h3>
        <dl>
          <div>
            <dt>所属太阳系</dt>
            <dd>{getSystemTitle(node)}</dd>
          </div>
          <div>
            <dt>类型</dt>
            <dd>{typeLabel[node.type]}</dd>
          </div>
          <div>
            <dt>关系</dt>
            <dd>{node.relationToSystem}</dd>
          </div>
          <div>
            <dt>来源状态</dt>
            <dd>{getSourceStatus(node)}</dd>
          </div>
        </dl>
      </section>

      <section className="law-universe-detail__feed">
        <h3>短句解释</h3>
        <article>
          <p>{node.momentCopy}</p>
        </article>
      </section>

      <ContentList content={node.content} />

      <section className="law-universe-detail__note" data-testid="law-universe-detail-note-section">
        <h3>我的笔记</h3>
        <textarea
          value={note}
          onChange={(event) => handleNoteChange(event.target.value)}
          placeholder="在这里记下对这个节点的理解 / 案例 / 联想... (自动保存到本地)"
          aria-label={`${node.title} 的笔记`}
          aria-describedby="law-universe-detail-note-status"
          data-testid="law-universe-detail-note-input"
          rows={3}
        />
        <p id="law-universe-detail-note-status" className="law-universe-detail__note-status" data-testid="law-universe-detail-note-status">
          {saveStatus === "saving" ? "保存中..." : saveStatus === "saved" ? "已保存到本地" : note.trim() ? "本地已保存" : "笔记仅保存在你的浏览器"}
        </p>
      </section>

      <section className="law-universe-detail__social">
        <h3>相关节点</h3>
        <div className="law-universe-detail__comments">
          {node.comments.map((comment) => (
            <p key={`${comment.speaker}-${comment.text}`}>
              <strong>{comment.speaker}</strong>
              <span>{comment.text}</span>
            </p>
          ))}
        </div>
        <div className="law-universe-detail__relations" aria-label={`${node.title} 的相关节点`}>
          {relations.map(({ node: relatedNode, relation }) => (
            <button
              key={`${relation.source}-${relation.target}`}
              type="button"
              onClick={() => onSelectNode(relatedNode.id)}
              aria-label={
                compactViewport && node.type === "system-sun" && relatedNode.type !== "system-sun"
                  ? `面板聚焦 ${relatedNode.title}`
                  : `查看 ${relatedNode.title}，关系强度 ${relation.weight}`
              }
            >
              <span>{relatedNode.title}</span>
              <small>{relation.label}</small>
              <strong>{relation.weight}</strong>
            </button>
          ))}
        </div>
      </section>

      <p className="law-universe-detail__disclaimer">本页面为法学知识可视化创意展示，不构成法律意见。法条链接指向官方公开来源（flk.npc.gov.cn / 最高法官网 / 国务院）。</p>
    </aside>
  );
}
