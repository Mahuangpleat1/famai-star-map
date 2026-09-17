import { useCallback, useMemo, useState } from "react";
import type { LegalUniverseSceneFilter } from "../legalUniverseSceneUtils";
import type { LegalUniverseNodeType, LegalUniverseSourceCategory, LegalUniverseUrlState } from "../legalUniverseUrlState";

/**
 * useFilters 的内部 state shape:
 *   - nodeTypes: 允许的节点类型白名单(null = 不限)
 *   - levels: 允许的层级白名单(null = 不限)
 *   - sourceCategories: 允许的来源类别白名单(null = 不限)
 *
 * 这三个白名单直接来自 URL hash 解析结果,变化时同步到 sceneFilter(Set,用于场景里查表)。
 */
export interface LegalUniverseFilterState {
  nodeTypes: LegalUniverseNodeType[] | null;
  levels: number[] | null;
  sourceCategories: LegalUniverseSourceCategory[] | null;
}

/**
 * useFilters —— 3D 场景的"白名单过滤"状态。
 *
 * 职责:
 *   - 维护 filterState
 *   - 暴露 handleFilterChange(替换整个 state,给 FilterBar 用)
 *   - 暴露 handleFilterClear(全清)
 *   - 派生 sceneFilter(Set 版,O(1) 查询,给 Scene 渲染用)
 */
export function useFilters(initialUrlState: LegalUniverseUrlState) {
  const [filterState, setFilterState] = useState<LegalUniverseFilterState>({
    nodeTypes: initialUrlState.nodeTypes,
    levels: initialUrlState.levels,
    sourceCategories: initialUrlState.sourceCategories
  });

  const handleFilterChange = useCallback((next: LegalUniverseFilterState) => {
    setFilterState(next);
  }, []);

  const handleFilterClear = useCallback(() => {
    setFilterState({ nodeTypes: null, levels: null, sourceCategories: null });
  }, []);

  const sceneFilter = useMemo<LegalUniverseSceneFilter>(
    () => ({
      nodeTypes: filterState.nodeTypes ? new Set(filterState.nodeTypes) : null,
      levels: filterState.levels ? new Set(filterState.levels) : null,
      sourceCategories: filterState.sourceCategories ? new Set(filterState.sourceCategories) : null
    }),
    [filterState]
  );

  return { filterState, setFilterState, handleFilterChange, handleFilterClear, sceneFilter };
}
