/**
 * 个人卫星详情面板 —— Phase 1。
 *
 * 显示内容（spec §5.2）：
 * - title / type / system / importance / summary / keyPoints
 * - 状态 badge（已审核 / 未审核）
 * - 来源 fileName + 启动时间
 * - "标记已审核 / 取消审核" 按钮
 * - "跳转到抽取结果" 按钮
 */

import { BookmarkPlus, CheckCircle2, CircleDashed, FileText, MapPin, Sparkles, Undo2, X } from "lucide-react";
import { useRef } from "react";
import { putExtraction, putMistake, putQuizItem } from "./legalUniverseUserDb";
import { LawUniverseRelationEditor } from "./LawUniverseRelationEditor";
import { LawUniverseMergeControl } from "./LawUniverseMergeControl";
import { generateAllQuizForConcept, wrapAsQuizItem } from "./legalUniverseQuizGen";
import { useFocusTrap } from "./hooks/useFocusTrap";
import type { UserExtraction, UserMistake } from "./userDataTypes";
import type { ReviewableSatellite } from "./useUserSatellites";
import type { DuplicateGroup } from "./useDuplicateGroups";
import type { UndoOperation } from "./useUndoStack";
import "./css/law-universe-lab-satellites.css";

interface LawUniverseSatelliteDetailPanelProps {
  satellite: ReviewableSatellite;
  extraction: UserExtraction;
  onClose: () => void;
  onJumpToExtraction: (extractionId: string) => void;
  onReviewedChange: () => void;
  /** Phase 2: 5 秒内可撤销上次归类，传 undefined 时按钮隐藏。 */
  onUndoMove?: () => void;
  undoSecondsLeft?: number;
  /** Phase 2.6: 重复概念合并控制。 */
  duplicateGroup?: DuplicateGroup | null;
  pushUndo?: (op: UndoOperation) => void;
  onMerged?: () => void;
  /** Phase 3: 出题（生成 quizItems）。 */
  onQuizGenerated?: () => void;
  /** Phase 3: 手动加入错题本。 */
  onAddToMistakes?: () => void;
}

const SYSTEM_LABEL: Record<string, string> = {
  unclassified: "未分类",
  civil: "民法典",
  criminal: "刑法",
  administrative: "行政法",
  constitution: "宪法",
  jurisprudence: "法理学",
  commercial: "商法",
  procedure: "诉讼法",
  economic: "经济法",
  social: "社会法",
  international: "国际法",
  "legal-history": "中国法律史",
  obligation: "债法",
  property: "物权法",
  personality: "人格权法"
};

const TYPE_LABEL: Record<string, string> = {
  statute: "法条",
  principle: "原则",
  case: "案例",
  doctrine: "学说",
  theory: "理论"
};

function formatTime(ts: number): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function LawUniverseSatelliteDetailPanel({
  satellite,
  extraction,
  onClose,
  onJumpToExtraction,
  onReviewedChange,
  onUndoMove,
  undoSecondsLeft,
  duplicateGroup,
  pushUndo,
  onMerged,
  onQuizGenerated,
  onAddToMistakes
}: LawUniverseSatelliteDetailPanelProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  // 完整焦点陷阱
  useFocusTrap(containerRef, true, { onEscape: onClose });

  const handleToggleReviewed = async () => {
    await putExtraction({ ...extraction, reviewed: !extraction.reviewed });
    onReviewedChange();
  };

  const handleGenerateQuiz = async () => {
    const payloads = generateAllQuizForConcept(satellite.concept, extraction.concepts);
    for (const payload of payloads) {
      const item = wrapAsQuizItem(satellite.id, satellite.concept.title, payload);
      await putQuizItem(item);
    }
    onQuizGenerated?.();
  };

  const handleAddToMistakes = async () => {
    // 手动加入错题本：创建一个 essay 类型的 quizItem（占位）+ mistake 记录
    const essayPayload = generateAllQuizForConcept(satellite.concept, extraction.concepts).find((p) => p.type === "essay");
    if (!essayPayload) return;
    const quizItem = wrapAsQuizItem(satellite.id, satellite.concept.title, essayPayload);
    await putQuizItem(quizItem);
    const mistake: UserMistake = {
      id: `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      quizItemId: quizItem.id,
      conceptTitle: satellite.concept.title,
      questionType: "essay",
      questionStem: essayPayload.stem,
      userAnswer: "(手动加入)",
      correctAnswer: essayPayload.modelAnswer,
      at: Date.now(),
      attempts: 1
    };
    await putMistake(mistake);
    onAddToMistakes?.();
  };

  return (
    <aside ref={containerRef} className="law-universe-satellite-panel" role="dialog" aria-modal="true" aria-labelledby="law-universe-satellite-panel-title" aria-label="个人卫星节点详情">
      <header className="law-universe-satellite-panel__head">
        <span className="law-universe-satellite-panel__kind">个人卫星</span>
        <button
          type="button"
          onClick={onClose}
          className="law-universe-satellite-panel__close"
          aria-label="关闭卫星详情"
          title="关闭"
        >
          <X aria-hidden="true" size={14} strokeWidth={1.8} />
        </button>
      </header>
      <h2 id="law-universe-satellite-panel-title" className="law-universe-satellite-panel__title">{satellite.concept.title}</h2>
      <div className="law-universe-satellite-panel__badges">
        <span className="law-universe-satellite-panel__badge">
          {TYPE_LABEL[satellite.concept.type] ?? satellite.concept.type}
        </span>
        <span className="law-universe-satellite-panel__badge">
          <MapPin aria-hidden="true" size={10} strokeWidth={1.6} />{" "}
          {SYSTEM_LABEL[satellite.displaySystem] ?? satellite.displaySystem}
        </span>
        <span className="law-universe-satellite-panel__badge">重要度 {satellite.concept.importance}</span>
        {satellite.reviewed ? (
          <span className="law-universe-satellite-panel__badge law-universe-satellite-panel__badge--ok">
            <CheckCircle2 aria-hidden="true" size={10} strokeWidth={1.8} /> 已审核
          </span>
        ) : (
          <span className="law-universe-satellite-panel__badge law-universe-satellite-panel__badge--pending">
            <CircleDashed aria-hidden="true" size={10} strokeWidth={1.8} /> 未审核
          </span>
        )}
      </div>
      {satellite.concept.summary ? (
        <p className="law-universe-satellite-panel__summary">{satellite.concept.summary}</p>
      ) : null}
      {satellite.concept.keyPoints.length > 0 ? (
        <section className="law-universe-satellite-panel__section">
          <h3>要点</h3>
          <ul>
            {satellite.concept.keyPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <LawUniverseRelationEditor
        conceptTitle={satellite.concept.title}
        extraction={extraction}
        onExtractionChanged={() => {
          void onReviewedChange();
        }}
      />
      {duplicateGroup && pushUndo && onMerged ? (
        <LawUniverseMergeControl
          satellite={satellite}
          group={duplicateGroup}
          extraction={extraction}
          onMerged={onMerged}
          pushUndo={pushUndo}
        />
      ) : null}
      <footer className="law-universe-satellite-panel__foot">
        <p className="law-universe-satellite-panel__source">
          <FileText aria-hidden="true" size={11} strokeWidth={1.6} /> {satellite.fileName} · {formatTime(satellite.startedAt)}
        </p>
        <div className="law-universe-satellite-panel__actions">
          {onUndoMove ? (
            <button
              type="button"
              onClick={onUndoMove}
              className="law-universe-satellite-panel__btn law-universe-satellite-panel__btn--undo"
              data-testid="law-universe-satellite-undo-move"
              title="撤销最近一次拖拽归类"
            >
              <Undo2 aria-hidden="true" size={12} strokeWidth={1.8} /> 撤销归类 ({undoSecondsLeft ?? 0}s)
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handleGenerateQuiz()}
            className="law-universe-satellite-panel__btn"
            data-testid="law-universe-satellite-generate-quiz"
            title="基于本概念生成 3 道题（选择/填空/简答）"
          >
            <Sparkles aria-hidden="true" size={12} strokeWidth={1.8} /> 出题 (3)
          </button>
          {onAddToMistakes ? (
            <button
              type="button"
              onClick={() => void handleAddToMistakes()}
              className="law-universe-satellite-panel__btn"
              data-testid="law-universe-satellite-add-mistake"
              title="手动加入错题本"
            >
              <BookmarkPlus aria-hidden="true" size={12} strokeWidth={1.8} /> 错题本
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleToggleReviewed}
            className="law-universe-satellite-panel__btn"
            data-testid="law-universe-satellite-toggle-reviewed"
          >
            {satellite.reviewed ? "取消审核" : "标记已审核"}
          </button>
          <button
            type="button"
            onClick={() => onJumpToExtraction(satellite.extractionId)}
            className="law-universe-satellite-panel__btn law-universe-satellite-panel__btn--primary"
            data-testid="law-universe-satellite-jump"
          >
            跳转到抽取结果
          </button>
        </div>
      </footer>
    </aside>
  );
}
