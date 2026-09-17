/**
 * URL hash state for the Law Universe Lab.
 *
 * Schema (everything is optional; absent keys fall back to app defaults):
 *   #n=<nodeId>          selectedNodeId
 *   &z=<0|1|2>           zoomLevel
 *   &f=code,law,field    filter — node types included
 *   &l=0,1,2,3           filter — node levels included
 *   &s=official,edu      filter — source categories included
 *   &p=<from>~<to>       path finder endpoints
 *
 * The hash is a mirror, not a security boundary. Values are validated
 * against the actual data; invalid entries are ignored on read.
 */

import { legalUniverseNodes, legalUniverseSourceRefs } from "../../data/legalUniverseData";
import type { LegalUniverseNodeType } from "./types";
export type { LegalUniverseNodeType } from "./types";

export type LegalUniverseSourceCategory = "official" | "education" | "textbook" | "product";

export interface LegalUniverseUrlState {
  selectedNodeId: string | null;
  zoomLevel: number | null;
  nodeTypes: LegalUniverseNodeType[] | null;
  levels: number[] | null;
  sourceCategories: LegalUniverseSourceCategory[] | null;
  path: { from: string; to: string } | null;
}

export const ALL_NODE_TYPES: LegalUniverseNodeType[] = [
  "universe-core",
  "system-sun",
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

export const ALL_LEVELS: number[] = [0, 1, 2, 3];

export const ALL_SOURCE_CATEGORIES: LegalUniverseSourceCategory[] = ["official", "education", "textbook", "product"];

const KNOWN_NODE_IDS = new Set(legalUniverseNodes.map((node) => node.id));
const KNOWN_SOURCE_CATEGORIES = new Set<string>(ALL_SOURCE_CATEGORIES);

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => decode(item.trim()))
    .filter(Boolean);
}

export function parseUrlState(hash: string): LegalUniverseUrlState {
  const cleaned = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!cleaned) {
    return {
      selectedNodeId: null,
      zoomLevel: null,
      nodeTypes: null,
      levels: null,
      sourceCategories: null,
      path: null
    };
  }

  const params = new URLSearchParams(cleaned);
  const nodeIdRaw = params.get("n");
  const selectedNodeId = nodeIdRaw && KNOWN_NODE_IDS.has(nodeIdRaw) ? nodeIdRaw : null;
  const zoomRaw = params.get("z");
  const zoomLevel = zoomRaw === "0" || zoomRaw === "1" || zoomRaw === "2" ? Number(zoomRaw) : null;
  const nodeTypes = parseList(params.get("f")).filter((type): type is LegalUniverseNodeType =>
    (ALL_NODE_TYPES as string[]).includes(type)
  );
  const levels = parseList(params.get("l"))
    .map((value) => Number(value))
    .filter((value) => ALL_LEVELS.includes(value));
  const sourceCategories = parseList(params.get("s")).filter((category): category is LegalUniverseSourceCategory =>
    KNOWN_SOURCE_CATEGORIES.has(category)
  );
  const pathRaw = params.get("p");
  let path: { from: string; to: string } | null = null;
  if (pathRaw) {
    const [from, to] = pathRaw.split("~").map((value) => decode(value.trim()));
    if (from && to && KNOWN_NODE_IDS.has(from) && KNOWN_NODE_IDS.has(to) && from !== to) {
      path = { from, to };
    }
  }

  return {
    selectedNodeId,
    zoomLevel,
    nodeTypes: nodeTypes.length > 0 ? nodeTypes : null,
    levels: levels.length > 0 ? levels : null,
    sourceCategories: sourceCategories.length > 0 ? sourceCategories : null,
    path
  };
}

export function serializeUrlState(state: Partial<LegalUniverseUrlState>): string {
  const params = new URLSearchParams();
  if (state.selectedNodeId) {
    params.set("n", state.selectedNodeId);
  }
  if (state.zoomLevel !== null && state.zoomLevel !== undefined) {
    params.set("z", String(state.zoomLevel));
  }
  if (state.nodeTypes && state.nodeTypes.length > 0) {
    params.set("f", state.nodeTypes.join(","));
  }
  if (state.levels && state.levels.length > 0) {
    params.set("l", state.levels.join(","));
  }
  if (state.sourceCategories && state.sourceCategories.length > 0) {
    params.set("s", state.sourceCategories.join(","));
  }
  if (state.path) {
    params.set("p", `${state.path.from}~${state.path.to}`);
  }
  const serialized = params.toString();
  return serialized ? `#${serialized}` : "";
}

export function isSourceCategoryAllowed(
  nodeSourceRefs: string[],
  allowed: LegalUniverseSourceCategory[] | null
): boolean {
  if (!allowed || allowed.length === 0) {
    return true;
  }
  return nodeSourceRefs.some((refId) => {
    const ref = legalUniverseSourceRefs.find((candidate) => candidate.id === refId);
    return ref ? allowed.includes(ref.category) : false;
  });
}

export function isNodeTypeAllowed(nodeType: LegalUniverseNodeType, allowed: LegalUniverseNodeType[] | null): boolean {
  if (!allowed || allowed.length === 0) {
    return true;
  }
  return allowed.includes(nodeType);
}

export function isLevelAllowed(level: number, allowed: number[] | null): boolean {
  if (!allowed || allowed.length === 0) {
    return true;
  }
  return allowed.includes(level);
}
