/**
 * 重复概念合并控制 —— Phase 2.6。
 *
 * 在详情面板内显示：
 * - "X 个重复" badge
 * - 展开合并区：列出其他重复 satellite + "合并到 →" 按钮
 * - 触发合并：删除其他 concept + 关系重写指向主 satellite
 */

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Merge, Trash2 } from "lucide-react";
import type { ReviewableSatellite } from "./useUserSatellites";
import type { DuplicateGroup } from "./useDuplicateGroups";
import { listExtractions, replaceExtractions } from "./legalUniverseUserDb";
import { planConceptMerge } from "./legalUniverseConceptIdentity";
import type { UserExtraction } from "./userDataTypes";
import "./css/law-universe-lab-panels.css";

interface LawUniverseMergeControlProps {
  satellite: ReviewableSatellite;
  /** 当前 satellite 所属的重复组（如果有）。 */
  group: DuplicateGroup | null;
  /** 当前 satellite 的完整 extraction（用于读 concepts / relations）。 */
  extraction: UserExtraction;
  /** 合并完成后回调（让 LabPage 重新 load satellites + undo 栈）。 */
  onMerged: () => void;
  /** 撤销栈 push 操作。 */
  pushUndo: (op: import("./useUndoStack").UndoOperation) => void;
}

export function LawUniverseMergeControl({ satellite, group, onMerged, pushUndo }: LawUniverseMergeControlProps) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const duplicates = useMemo(() => {
    if (!group) return [];
    return group.satellites.filter((s) => s.id !== satellite.id);
  }, [group, satellite.id]);

  if (!group || duplicates.length === 0) {
    return null;
  }

  const handleMerge = async (other: ReviewableSatellite) => {
    if (busy) return;
    setBusy(true);
    try {
      setError(null);
      const current = await listExtractions();
      const { before, after } = planConceptMerge(current, satellite.id, other.id);
      await replaceExtractions(before, after);
      pushUndo({ type: "merge", before, after, at: Date.now() });
      onMerged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "合并失败，请重试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="law-universe-merge-control" data-testid="law-universe-merge-control">
      <header className="law-universe-merge-control__head">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="law-universe-merge-control__toggle"
          aria-expanded={expanded}
        >
          {expanded ? <ChevronDown aria-hidden="true" size={12} /> : <ChevronRight aria-hidden="true" size={12} />}
          <Merge aria-hidden="true" size={12} />
          <span>重复概念 · {duplicates.length}</span>
        </button>
      </header>
      {error ? <p role="alert">{error}</p> : null}
      {expanded ? (
        <ul className="law-universe-merge-control__list">
          {duplicates.map((d) => (
            <li key={d.id} className="law-universe-merge-control__item" data-testid="law-universe-merge-row">
              <p className="law-universe-merge-control__item-title">{d.concept.title}</p>
              <p className="law-universe-merge-control__item-meta">
                {d.extractionId} · 置信度 {d.confidence}
              </p>
              <button
                type="button"
                onClick={() => void handleMerge(d)}
                disabled={busy}
                className="law-universe-merge-control__btn"
                aria-label={`合并 ${d.concept.title} 到 ${satellite.concept.title}`}
                data-testid="law-universe-merge-btn"
              >
                <Trash2 aria-hidden="true" size={11} /> 合并到当前
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
