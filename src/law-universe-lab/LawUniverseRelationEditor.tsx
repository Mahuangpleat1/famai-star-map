/**
 * LawUniverseRelationEditor —— Phase 2 关系类型编辑。
 *
 * 显示与当前 concept 相关的关系（source 或 target 命中 concept.title），
 * 每条可编辑 type / strength / citation，写回整个 extraction。
 */

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { putExtraction } from "./legalUniverseUserDb";
import type { UserExtraction, UserExtractedRelation } from "./userDataTypes";
import "./css/law-universe-lab-panels.css";

const RELATION_TYPES: UserExtractedRelation["type"][] = ["依据", "解释", "修正", "适用", "类推", "冲突", "继承", "发展"];

interface LawUniverseRelationEditorProps {
  conceptTitle: string;
  extraction: UserExtraction;
  onExtractionChanged: () => void;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function LawUniverseRelationEditor({ conceptTitle, extraction, onExtractionChanged }: LawUniverseRelationEditorProps) {
  // 筛选与当前 concept 标题相关的关系（任一方向）
  const related = extraction.relations
    .map((r, index) => ({ relation: r, index }))
    .filter(({ relation }) => relation.source === conceptTitle || relation.target === conceptTitle);

  if (related.length === 0) {
    return (
      <section className="law-universe-relation-editor" data-testid="law-universe-relation-editor">
        <h3>关系</h3>
        <p className="law-universe-relation-editor__empty">本概念暂无相关关系。</p>
      </section>
    );
  }

  return (
    <section className="law-universe-relation-editor" data-testid="law-universe-relation-editor">
      <h3>关系 · {related.length}</h3>
      <ul className="law-universe-relation-editor__list">
        {related.map(({ relation, index }) => (
          <RelationRow
            key={`${relation.source}::${relation.target}::${index}`}
            relation={relation}
            index={index}
            extraction={extraction}
            onExtractionChanged={onExtractionChanged}
          />
        ))}
      </ul>
    </section>
  );
}

interface RelationRowProps {
  relation: UserExtractedRelation;
  index: number;
  extraction: UserExtraction;
  onExtractionChanged: () => void;
}

function RelationRow({ relation, index, extraction, onExtractionChanged }: RelationRowProps) {
  const [draftType, setDraftType] = useState(relation.type);
  const [draftStrength, setDraftStrength] = useState(relation.strength);
  const [draftCitation, setDraftCitation] = useState(relation.citation);

  const handleSave = async () => {
    const newRelations = extraction.relations.map((r, i) =>
      i === index
        ? { ...r, type: draftType, strength: clamp(draftStrength, 1, 100), citation: draftCitation }
        : r
    );
    await putExtraction({ ...extraction, relations: newRelations });
    onExtractionChanged();
  };

  const handleDelete = async () => {
    const newRelations = extraction.relations.filter((_, i) => i !== index);
    await putExtraction({ ...extraction, relations: newRelations });
    onExtractionChanged();
  };

  return (
    <li className="law-universe-relation-editor__item" data-testid="law-universe-relation-item">
      <p className="law-universe-relation-editor__pair">
        <span>{relation.source}</span> → <span>{relation.target}</span>
      </p>
      <div className="law-universe-relation-editor__type-buttons" role="group" aria-label="关系类型">
        {RELATION_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setDraftType(t)}
            className={`law-universe-relation-editor__type-btn ${draftType === t ? "is-active" : ""}`}
            aria-pressed={draftType === t}
            data-testid={`law-universe-relation-type-${t}`}
          >
            {t}
          </button>
        ))}
      </div>
      <label className="law-universe-relation-editor__field">
        <span>强度</span>
        <input
          type="range"
          min={1}
          max={100}
          value={draftStrength}
          onChange={(e) => setDraftStrength(Number(e.target.value))}
          data-testid="law-universe-relation-strength"
        />
        <output>{draftStrength}</output>
      </label>
      <label className="law-universe-relation-editor__field">
        <span>出处</span>
        <textarea
          value={draftCitation}
          onChange={(e) => setDraftCitation(e.target.value)}
          rows={2}
          data-testid="law-universe-relation-citation"
        />
      </label>
      <div className="law-universe-relation-editor__actions">
        <button
          type="button"
          onClick={handleSave}
          className="law-universe-relation-editor__btn law-universe-relation-editor__btn--primary"
          data-testid="law-universe-relation-save"
        >
          保存
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="law-universe-relation-editor__btn"
          aria-label={`删除关系 ${relation.source} → ${relation.target}`}
        >
          <Trash2 aria-hidden="true" size={11} />
        </button>
      </div>
    </li>
  );
}
