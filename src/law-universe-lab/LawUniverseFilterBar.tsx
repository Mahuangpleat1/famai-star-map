import { useEffect, useMemo, useState } from "react";
import { legalUniverseSourceRefs } from "../../data/legalUniverseData";
import {
  ALL_LEVELS,
  ALL_NODE_TYPES,
  ALL_SOURCE_CATEGORIES,
  type LegalUniverseNodeType,
  type LegalUniverseSourceCategory
} from "./legalUniverseUrlState";
import type { LegalUniverseFilterState } from "./LawUniverseLabPage";
import "./css/law-universe-lab-panels.css";

interface LawUniverseFilterBarProps {
  filterState: LegalUniverseFilterState;
  filteredNodeCount: number;
  totalNodeCount: number;
  onChange: (next: LegalUniverseFilterState) => void;
  onClear: () => void;
}

const TYPE_LABEL: Record<LegalUniverseNodeType, string> = {
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

const SOURCE_LABEL: Record<LegalUniverseSourceCategory, string> = {
  official: "官方文本",
  education: "学科目录",
  textbook: "教材",
  product: "产品占位"
};

const TYPE_ORDER: LegalUniverseNodeType[] = [
  "code",
  "law",
  "field",
  "concept",
  "rule",
  "institution",
  "procedure",
  "history",
  "theory",
  "case-method"
];

const LEVEL_LABEL: Record<number, string> = {
  0: "L0 锚点",
  1: "L1 总则",
  2: "L2 分论",
  3: "L3 细节"
};

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

function toggleValue<T>(list: T[] | null, value: T): T[] | null {
  const current = list ?? [];
  const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
  return next.length === 0 ? null : next;
}

export function LawUniverseFilterBar({
  filterState,
  filteredNodeCount,
  totalNodeCount,
  onChange,
  onClear
}: LawUniverseFilterBarProps) {
  const compactViewport = useCompactViewport();
  const [collapsed, setCollapsed] = useState(false);
  const hasActiveFilter =
    (filterState.nodeTypes !== null && filterState.nodeTypes.length > 0) ||
    (filterState.levels !== null && filterState.levels.length > 0) ||
    (filterState.sourceCategories !== null && filterState.sourceCategories.length > 0);

  useEffect(() => {
    if (compactViewport) {
      setCollapsed(true);
    }
  }, [compactViewport]);

  const typesAllowed = filterState.nodeTypes;
  const levelsAllowed = filterState.levels;
  const sourcesAllowed = filterState.sourceCategories;

  const knownCategoryIds = useMemo(() => new Set(legalUniverseSourceRefs.map((ref) => ref.id)), []);
  const isCategoryInUse = (category: LegalUniverseSourceCategory) =>
    legalUniverseSourceRefs.some((ref) => ref.category === category && knownCategoryIds.has(ref.id));

  return (
    <aside
      className={`law-universe-filter-bar ${compactViewport && collapsed ? "is-collapsed" : ""}`}
      data-testid="law-universe-filter-bar"
      data-active-filter={String(hasActiveFilter)}
      data-filtered-node-count={filteredNodeCount}
      aria-label="法学节点筛选"
    >
      <header className="law-universe-filter-bar__head">
        <span className="law-universe-filter-bar__title">筛选节点</span>
        <span className="law-universe-filter-bar__count" data-testid="law-universe-filter-bar-count">
          {filteredNodeCount} / {totalNodeCount}
        </span>
        <button
          type="button"
          className="law-universe-filter-bar__toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "展开筛选" : "折叠筛选"}
        >
          {collapsed ? "展开" : "折叠"}
        </button>
      </header>

      {(!collapsed) && (
        <div className="law-universe-filter-bar__groups">
          <div className="law-universe-filter-bar__group" role="group" aria-label="按节点类型筛选">
            <span className="law-universe-filter-bar__group-label">类型</span>
            <div className="law-universe-filter-bar__chips">
              {TYPE_ORDER.map((type) => {
                const active = typesAllowed === null || typesAllowed.includes(type);
                const filterActive = typesAllowed !== null && typesAllowed.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    className={`law-universe-filter-bar__chip ${active ? "is-active" : ""} ${filterActive ? "is-filtered" : ""}`}
                    onClick={() => onChange({ ...filterState, nodeTypes: toggleValue(typesAllowed, type) })}
                    aria-pressed={filterActive}
                    data-testid={`law-universe-filter-type-${type}`}
                  >
                    {TYPE_LABEL[type]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="law-universe-filter-bar__group" role="group" aria-label="按层级筛选">
            <span className="law-universe-filter-bar__group-label">层级</span>
            <div className="law-universe-filter-bar__chips">
              {ALL_LEVELS.map((level) => {
                const active = levelsAllowed === null || levelsAllowed.includes(level);
                const filterActive = levelsAllowed !== null && levelsAllowed.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    className={`law-universe-filter-bar__chip ${active ? "is-active" : ""} ${filterActive ? "is-filtered" : ""}`}
                    onClick={() => onChange({ ...filterState, levels: toggleValue(levelsAllowed, level) })}
                    aria-pressed={filterActive}
                    data-testid={`law-universe-filter-level-${level}`}
                  >
                    {LEVEL_LABEL[level]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="law-universe-filter-bar__group" role="group" aria-label="按来源类别筛选">
            <span className="law-universe-filter-bar__group-label">来源</span>
            <div className="law-universe-filter-bar__chips">
              {ALL_SOURCE_CATEGORIES.filter(isCategoryInUse).map((category) => {
                const active = sourcesAllowed === null || sourcesAllowed.includes(category);
                const filterActive = sourcesAllowed !== null && sourcesAllowed.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    className={`law-universe-filter-bar__chip ${active ? "is-active" : ""} ${filterActive ? "is-filtered" : ""}`}
                    onClick={() => onChange({ ...filterState, sourceCategories: toggleValue(sourcesAllowed, category) })}
                    aria-pressed={filterActive}
                    data-testid={`law-universe-filter-source-${category}`}
                  >
                    {SOURCE_LABEL[category]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="law-universe-filter-bar__actions">
            <button
              type="button"
              className="law-universe-filter-bar__clear"
              onClick={onClear}
              disabled={!hasActiveFilter}
              data-testid="law-universe-filter-clear"
            >
              清空筛选
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export const ALL_FILTERED_NODE_TYPES: readonly LegalUniverseNodeType[] = ALL_NODE_TYPES;
