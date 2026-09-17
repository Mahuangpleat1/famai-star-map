/**
 * Lightweight search for the Law Universe Lab.
 *
 * - Case-insensitive substring match on title, tags, and short description.
 * - Pinyin initials supported for the most common system titles so typing
 *   "mfd" lands on 民法典. We only do initials for the title field; this is
 *   a UI affordance, not a linguistic claim.
 * - Each candidate gets a numeric score; results are sorted desc and
 *   truncated to a reasonable limit. We do not call out to any fuzzy-match
 *   library to keep the bundle stable.
 */

import type { LegalUniverseNode } from "./types";

const PINYIN_INITIALS: Record<string, string> = {
  民法典: "mfd",
  宪法: "xf",
  刑法: "xf",
  行政法: "xzf",
  商法: "sf",
  诉讼法: "ssf",
  经济法: "jjf",
  社会法: "shf",
  国际法: "gjf",
  法理学: "flx",
  中国法律史: "zgflfs"
};

export interface LegalUniverseSearchHit {
  node: LegalUniverseNode;
  score: number;
  matchedField: "title" | "tag" | "description" | "system";
}

function normalize(input: string): string {
  return input.toLowerCase().trim();
}

function initialsFor(title: string): string {
  if (PINYIN_INITIALS[title]) {
    return PINYIN_INITIALS[title];
  }
  // Best-effort: take first character of each CJK word boundary; we don't
  // try to transliterate arbitrary CJK to pinyin. Users who know pinyin
  // for the 11 system suns are covered by the table above.
  return title.toLowerCase();
}

export function searchLegalUniverse(
  query: string,
  nodes: LegalUniverseNode[],
  limit = 12
): LegalUniverseSearchHit[] {
  const q = normalize(query);
  if (!q) {
    return [];
  }
  const initialsQ = normalize(initialsFor(q));
  const hits: LegalUniverseSearchHit[] = [];

  for (const node of nodes) {
    const title = node.title;
    const lowerTitle = title.toLowerCase();
    const initials = initialsFor(title);

    if (lowerTitle === q || initials === q) {
      hits.push({ node, score: 100, matchedField: "title" });
      continue;
    }
    if (lowerTitle.startsWith(q)) {
      hits.push({ node, score: 90, matchedField: "title" });
      continue;
    }
    if (initials.startsWith(initialsQ) && initialsQ.length >= 2) {
      hits.push({ node, score: 80, matchedField: "title" });
      continue;
    }
    if (lowerTitle.includes(q)) {
      hits.push({ node, score: 70, matchedField: "title" });
      continue;
    }
    const tagHit = node.tags.find((tag) => tag.toLowerCase().includes(q));
    if (tagHit) {
      hits.push({ node, score: 55, matchedField: "tag" });
      continue;
    }
    if (node.shortDescription.toLowerCase().includes(q)) {
      hits.push({ node, score: 40, matchedField: "description" });
      continue;
    }
    if (node.systemId.toLowerCase().includes(q)) {
      hits.push({ node, score: 30, matchedField: "system" });
      continue;
    }
  }

  hits.sort((a, b) => b.score - a.score || a.node.title.localeCompare(b.node.title, "zh-Hans-CN"));
  return hits.slice(0, limit);
}
