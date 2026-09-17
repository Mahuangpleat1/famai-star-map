export type LegalUniverseDomain =
  | "universe"
  | "jurisprudence"
  | "constitution"
  | "administrative"
  | "civil"
  | "obligation"
  | "property"
  | "personality"
  | "commercial"
  | "criminal"
  | "procedure"
  | "economic"
  | "social"
  | "international"
  | "legal-history";

export type LegalUniverseNodeType =
  | "universe-core"
  | "system-sun"
  | "code"
  | "law"
  | "field"
  | "concept"
  | "rule"
  | "institution"
  | "procedure"
  | "history"
  | "theory"
  | "case-method";

export type LegalUniverseEdgeType =
  | "belongs-to"
  | "subfield-of"
  | "concept-of"
  | "supports"
  | "limits"
  | "conflicts-with"
  | "procedural-remedy"
  | "cross-domain"
  | "historical-influence"
  | "theoretical-foundation";

export type LegalUniverseColorKey =
  | "universe"
  | "jurisprudence"
  | "constitution"
  | "administrative"
  | "civil"
  | "obligation"
  | "property"
  | "personality"
  | "commercial"
  | "criminal"
  | "procedure"
  | "economic"
  | "social"
  | "international"
  | "legal-history";

export type LegalUniverseVector = [number, number, number];

export interface LegalUniverseSourceRef {
  id: string;
  title: string;
  url?: string;
  category: "official" | "education" | "textbook" | "product";
  note: string;
}

/**
 * 严格进源节点内容字段 —— 每个字段都引真实公开材料。
 * 来源 URL 必须是 flk.npc.gov.cn / 最高法官网 / 最高检 / 教育部 / 公开期刊 等可查入口。
 */
export interface LegalUniverseStatuteRef {
  lawTitle: string;
  article: string;
  url?: string;
  note?: string;
}

export interface LegalUniverseJudicialInterpretation {
  title: string;
  year: number;
  issuer: string;
  documentNumber?: string;
  summary: string;
  url?: string;
}

export interface LegalUniverseLandmarkCase {
  caseNumber: string;
  year: number;
  court: string;
  title: string;
  summary: string;
  url?: string;
}

export interface LegalUniverseHistoricalMilestone {
  year: string;
  event: string;
}

export interface LegalUniverseNodeContent {
  statuteRefs?: LegalUniverseStatuteRef[];
  judicialInterpretations?: LegalUniverseJudicialInterpretation[];
  practicePoints?: string[];
  landmarkCases?: LegalUniverseLandmarkCase[];
  historicalEvolution?: LegalUniverseHistoricalMilestone[];
}

export interface LegalUniverseComment {
  speaker: string;
  text: string;
}

export interface LegalUniverseSystem {
  id: string;
  title: string;
  domain: LegalUniverseDomain;
  colorKey: LegalUniverseColorKey;
  systemPosition: LegalUniverseVector;
  systemRadius: number;
  systemInclination: number;
  shortDescription: string;
  sourceRefs: string[];
}

export interface LegalUniverseNode {
  id: string;
  title: string;
  type: LegalUniverseNodeType;
  domain: LegalUniverseDomain;
  systemId: string;
  parentId?: string;
  cluster: string;
  level: 0 | 1 | 2 | 3;
  importance: number;
  size: number;
  colorKey: LegalUniverseColorKey;
  shortDescription: string;
  relationToSystem: string;
  momentCopy: string;
  comments: LegalUniverseComment[];
  sourceRefs: string[];
  tags: string[];
  content?: LegalUniverseNodeContent;
}

export interface LegalUniverseEdge {
  source: string;
  target: string;
  type: LegalUniverseEdgeType;
  weight: number;
  domain: LegalUniverseDomain;
  colorKey: LegalUniverseColorKey;
  label: string;
  description: string;
  evidenceLevel: string;
  sourceRefs: string[];
}

export interface LegalUniverseFocusState {
  selectedNodeId: string;
  focusedNodeId: string;
  cameraState: "idle" | "focusing" | "focused";
  focusKey: number;
}
