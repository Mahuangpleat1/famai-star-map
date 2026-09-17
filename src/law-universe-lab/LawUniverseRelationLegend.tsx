/**
 * 关系连边图例 —— Phase 2.5。
 *
 * 屏幕角落小卡片：8 种 type + 颜色 + 当前抽取中的计数。
 */

import { ALL_RELATION_TYPES, RELATION_COLORS } from "./lawUniverseRelationColors";
import type { RenderableRelation } from "./useUserRelations";
import "./css/law-universe-lab-panels.css";

interface LawUniverseRelationLegendProps {
  relations: RenderableRelation[];
}

export function LawUniverseRelationLegend({ relations }: LawUniverseRelationLegendProps) {
  // 统计每种 type 的数量
  const counts: Record<string, number> = {};
  for (const t of ALL_RELATION_TYPES) counts[t] = 0;
  for (const rel of relations) {
    if (counts[rel.type] !== undefined) {
      counts[rel.type] += 1;
    }
  }
  const total = relations.length;

  return (
    <aside className="law-universe-relation-legend" aria-label="关系类型图例" data-testid="law-universe-relation-legend">
      <header className="law-universe-relation-legend__head">
        <span className="law-universe-relation-legend__title">关系 · {total}</span>
      </header>
      <ul className="law-universe-relation-legend__list">
        {ALL_RELATION_TYPES.map((type) => (
          <li
            key={type}
            className="law-universe-relation-legend__item"
            data-testid={`law-universe-relation-legend-${type}`}
          >
            <span
              className="law-universe-relation-legend__swatch"
              style={{ background: RELATION_COLORS[type] }}
              aria-hidden="true"
            />
            <span className="law-universe-relation-legend__label">{type}</span>
            <span className="law-universe-relation-legend__count">{counts[type]}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
