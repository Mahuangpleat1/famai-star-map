/**
 * useUserRelations —— Phase 2.5 关系数据 hook。
 *
 * 从 IndexedDB extractions 派生 succeeded 的 relations，
 * 标注 source / target concept title（用于 3D beams 查找对应 satellite）。
 */

import { useCallback, useEffect, useState } from "react";
import { listExtractions, listSourceDocs } from "./legalUniverseUserDb";
import type { UserExtraction, UserExtractedRelation } from "./userDataTypes";

export interface RenderableRelation {
  id: string; // ${extractionId}::${relationIndex}
  extractionId: string;
  sourceConceptId?: string;
  targetConceptId?: string;
  source: string; // concept title
  target: string; // concept title
  type: UserExtractedRelation["type"];
  strength: number; // 1-100
  citation: string;
  sourceDocId: string;
  fileName: string;
}

function deriveRelations(extractions: UserExtraction[], fileNames: Map<string, string>): RenderableRelation[] {
  const out: RenderableRelation[] = [];
  for (const ext of extractions) {
    if (ext.status !== "succeeded") continue;
    ext.relations.forEach((rel, index) => {
      if (!rel.source || !rel.target) return;
      if (rel.sourceConceptId !== undefined && rel.targetConceptId !== undefined
        ? rel.sourceConceptId === rel.targetConceptId
        : rel.sourceConceptId === undefined && rel.targetConceptId === undefined && rel.source === rel.target) return;
      const strength = Number.isFinite(rel.strength) ? Math.max(1, Math.min(100, Math.round(rel.strength))) : 50;
      out.push({
        id: `${ext.id}::${index}`,
        extractionId: ext.id,
        source: rel.source,
        target: rel.target,
        sourceConceptId: rel.sourceConceptId,
        targetConceptId: rel.targetConceptId,
        type: rel.type,
        strength,
        citation: rel.citation,
        sourceDocId: ext.sourceDocId,
        fileName: fileNames.get(ext.sourceDocId) ?? "已删除的源资料"
      });
    });
  }
  return out;
}

export interface UseUserRelationsResult {
  relations: RenderableRelation[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useUserRelations(): UseUserRelationsResult {
  const [relations, setRelations] = useState<RenderableRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [extractions, sourceDocs] = await Promise.all([listExtractions(), listSourceDocs()]);
      const fileNames = new Map(sourceDocs.map((d) => [d.id, d.fileName]));
      setRelations(deriveRelations(extractions, fileNames));
    } catch (err) {
      setError((err as Error).message);
      setRelations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { relations, loading, error, reload };
}
