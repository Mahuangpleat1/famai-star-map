/**
 * 用户数据模型 —— Phase 0（个人法学宇宙引擎）专用。
 *
 * 数据流：
 *   1. 用户上传 .txt / .md 资料 → UserSourceDoc
 *   2. 调 LLM 抽取 → UserExtraction（带抽取的概念和关系）
 *   3. Phase 1 再把审核通过的概念作为"卫星节点"挂到 3D 宇宙
 *
 * 所有数据本地优先（IndexedDB），用户拥有数据，可导出/删除。
 */

import type { LegalUniverseDomain } from "./types";

/** 用户上传的原始资料（已解析为纯文本）。 */
export interface UserSourceDoc {
  id: string;
  fileName: string;
  mimeType: "text/plain" | "text/markdown" | "application/pdf";
  sizeBytes: number;
  /** 解析后的纯文本内容（不含文件二进制）。 */
  content: string;
  uploadedAt: number;
  status: "pending" | "extracting" | "extracted" | "failed";
  /** 关联到一次抽取任务。 */
  extractionId?: string;
  errorMessage?: string;
  /** Phase 3-c 新增: PDF 解析方法。`native-text`=pdfjs 抽出文本,`scanned-empty`=扫描件/无文本。 */
  extractionMethod?: "native-text" | "scanned-empty";
}

/** LLM 抽取出的一个概念（未审核）。 */
export interface UserExtractedConcept {
  /** Persisted identity; legacy rows derive extractionId::originalIndex until first structural edit. */
  id?: string;
  title: string;
  type: "statute" | "principle" | "case" | "doctrine" | "theory";
  /** 11 太阳系 domain 之一；不属于 11 系统则填 "new"，等 Phase 2 归类。 */
  system: LegalUniverseDomain | "new";
  importance: number; // 1-100
  summary: string;
  keyPoints: string[];
  /** Phase 2 用户/AI 置信度 0-100。可选：旧数据无此字段，读取时 fallback 50。 */
  confidence?: number;
}

/** LLM 抽取出的一个关系（未审核）。 */
export interface UserExtractedRelation {
  source: string;
  target: string;
  /** Stable satellite ids for cross-document relations; absent on legacy/local edges. */
  sourceConceptId?: string;
  targetConceptId?: string;
  type: "依据" | "解释" | "修正" | "适用" | "类推" | "冲突" | "继承" | "发展";
  strength: number; // 1-100
  /** 原文出处（页码/章节/条号/文字片段）。 */
  citation: string;
}

/** 一次抽取任务。 */
export interface UserExtraction {
  id: string;
  sourceDocId: string;
  status: "running" | "succeeded" | "failed";
  startedAt: number;
  completedAt?: number;
  concepts: UserExtractedConcept[];
  relations: UserExtractedRelation[];
  /** LLM 原始返回（用于调试 / 重新解析）。 */
  rawResponse?: string;
  errorMessage?: string;
  /** Phase 0 简易审核标记（Phase 2 会升级为完整工作流）。 */
  reviewed: boolean;
}

/** LLM provider 配置（OpenAI 兼容格式）。 */
export interface LLMProviderConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  temperature: number; // 0-1
  maxTokens: number; // 256-32768
  updatedAt: number;
}

/** 抽取结果统计（用于 UI 展示）。 */
export interface UserExtractionStats {
  totalSourceDocs: number;
  totalExtractions: number;
  totalConcepts: number;
  totalRelations: number;
  pendingReview: number;
}

// ==============================================================
// Phase 3 法考学习
// ==============================================================

/** 间隔重复状态（SM-2）。 */
export interface SpacedRepetitionState {
  easeFactor: number; // 初始 2.5，下限 1.3
  interval: number; // 天数
  repetitions: number; // 连续答对次数
  dueAt: number; // 下次到期时间戳
}

/** 选择题 payload。 */
export interface ChoiceQuizPayload {
  type: "choice";
  stem: string;
  options: string[]; // 4 个
  correctIndex: number; // 0-3
}

/** 填空题 payload。 */
export interface FillQuizPayload {
  type: "fill";
  stem: string;
  correctAnswer: string;
}

/** 简答题 payload。 */
export interface EssayQuizPayload {
  type: "essay";
  stem: string;
  modelAnswer: string;
}

/** QuizItem 三种类型 union。 */
export type QuizItemPayload = ChoiceQuizPayload | FillQuizPayload | EssayQuizPayload;

/** IndexedDB quizItems store 单条。 */
export interface UserQuizItem {
  id: string;
  /** 关联的 satellite id（"extractionId::conceptIndex"）。 */
  conceptId: string;
  /** 概念 title（冗余存，方便错题本回链显示）。 */
  conceptTitle: string;
  payload: QuizItemPayload;
  spacedRepetition: SpacedRepetitionState;
  createdAt: number;
}

/** IndexedDB mistakes store 单条。 */
export interface UserMistake {
  id: string;
  quizItemId: string;
  conceptTitle: string;
  questionType: "choice" | "fill" | "essay";
  questionStem: string;
  userAnswer: string;
  correctAnswer: string;
  at: number;
  attempts: number; // 同一题错几次累加
}

// ==============================================================
// Phase 4 F.2 · Obsidian 双向同步
// ==============================================================

/** Obsidian vault 同步映射 —— 记录"本地概念 ↔ vault 文件"对应关系。
 *  key: conceptId (`extractionId::conceptIndex` 或 `local::index` 等自定义形式)。 */
export interface VaultMapping {
  conceptId: string;
  /** vault 内的相对路径, e.g. "civil/合同.md"。 */
  fileName: string;
  /** 本地最后一次写入 vault 的时间戳 (ms)。 */
  lastSyncedAt: number;
  /** 上次导出内容的 hash,内容未变则跳过重写。 */
  contentHash: number;
  /** vault 文件最后观察到的 mtime (ms),用于判断用户是否在 Obsidian 里改过。 */
  fileModifiedAt: number;
}

/** 默认 LLM provider 配置 —— 用户可在设置面板里改。 */
export const DEFAULT_LLM_PROVIDER_CONFIG: LLMProviderConfig = {
  baseURL: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
  temperature: 0.2,
  maxTokens: 4096,
  updatedAt: 0
};

/** Integrated, source-attributed study report in Markdown. */
export type UserStudyReport = string;
