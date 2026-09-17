/**
 * useUserSatellites —— Phase 1 hook。
 *
 * 从 IndexedDB extractions 派生 ReviewableSatellite[]，按规则过滤 / 排序 / 软上限警告。
 * 不写回 IndexedDB，是纯派生。
 */

import { useCallback, useEffect, useState } from "react";
import { getConceptId } from "./legalUniverseConceptIdentity";
import { listExtractions, listSourceDocs } from "./legalUniverseUserDb";
import type { UserExtractedConcept, UserExtraction } from "./userDataTypes";

/** 单颗"个人卫星"——一个被 LLM 抽出的概念。 */
export interface ReviewableSatellite {
  /** 合成稳定 id：`${extractionId}::${conceptIndex}`，用于 React key。 */
  id: string;
  extractionId: string;
  sourceDocId: string;
  fileName: string;
  concept: UserExtractedConcept;
  reviewed: boolean;
  startedAt: number;
  /** 渲染分组用。system: "new" 走 "unclassified" 虚拟分组。 */
  displaySystem: string;
  /** Phase 2 归一化后的置信度 0-100（来自 concept.confidence，缺省 50）。 */
  confidence: number;
}

const SOFT_LIMIT = 500;

const DEFAULT_CONFIDENCE = 50;

function clampConfidence(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_CONFIDENCE;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function deriveSatellites(extractions: UserExtraction[], fileNames: Map<string, string>): ReviewableSatellite[] {
  const satellites: ReviewableSatellite[] = [];
  for (const ext of extractions) {
    if (ext.status !== "succeeded") continue;
    ext.concepts.forEach((concept, index) => {
      if (!concept.title || concept.title.trim().length === 0) return;
      satellites.push({
        id: getConceptId(ext.id, concept, index),
        extractionId: ext.id,
        sourceDocId: ext.sourceDocId,
        fileName: fileNames.get(ext.sourceDocId) ?? "已删除的源资料",
        concept,
        reviewed: ext.reviewed,
        startedAt: ext.startedAt,
        displaySystem: concept.system === "new" ? "unclassified" : concept.system,
        confidence: clampConfidence(concept.confidence)
      });
    });
  }
  satellites.sort((a, b) => b.startedAt - a.startedAt);
  if (satellites.length > SOFT_LIMIT) {
    console.warn(`[Phase 1] 卫星节点数 ${satellites.length} 超过软上限 ${SOFT_LIMIT}，3D 性能可能下降。建议审核或删除部分抽取结果。`);
  }
  return satellites;
}

export interface UseUserSatellitesResult {
  satellites: ReviewableSatellite[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useUserSatellites(): UseUserSatellitesResult {
  const [satellites, setSatellites] = useState<ReviewableSatellite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [extractions, sourceDocs] = await Promise.all([listExtractions(), listSourceDocs()]);
      const fileNames = new Map(sourceDocs.map((d) => [d.id, d.fileName]));
      setSatellites(deriveSatellites(extractions, fileNames));
    } catch (err) {
      setError((err as Error).message);
      setSatellites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { satellites, loading, error, reload };
}
