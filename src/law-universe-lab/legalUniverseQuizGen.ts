/**
 * 题型生成器 —— Phase 3。
 *
 * 3 种模板（v1 不调 LLM）：
 *   - choice: 4 选 1，干扰项从其他 system 随机选
 *   - fill:   summary 中 title 替换为 ____
 *   - essay:  模板句式 + summary 作 modelAnswer
 *
 * 复用 IndexedDB：直接返回 payload，由调用方 putQuizItem 存储。
 */

import type {
  ChoiceQuizPayload,
  EssayQuizPayload,
  FillQuizPayload,
  QuizItemPayload,
  SpacedRepetitionState,
  UserExtractedConcept,
  UserQuizItem
} from "./userDataTypes";

/** SM-2 初始状态。 */
export function initialSpacedRepetition(): SpacedRepetitionState {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    dueAt: Date.now()
  };
}

/** 简单 uuid。 */
function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Fisher-Yates shuffle (in place)。 */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** 选 3 个其他 system 的 concept title 作为干扰项。 */
function pickDistractors(
  target: UserExtractedConcept,
  allConcepts: UserExtractedConcept[],
  count = 3
): string[] {
  const others = allConcepts.filter(
    (c) => c.title !== target.title && c.system !== target.system && c.title.trim().length > 0
  );
  return shuffle(others)
    .slice(0, count)
    .map((c) => c.title);
}

/**
 * 生成选择题。
 * 干扰项不足时降级：用同 system 概念、空白、相似词等。
 */
export function generateChoiceQuiz(
  target: UserExtractedConcept,
  allConcepts: UserExtractedConcept[]
): ChoiceQuizPayload {
  const distractors = pickDistractors(target, allConcepts, 3);
  // 不足 3 个时填充
  while (distractors.length < 3) {
    distractors.push(`干扰项 ${distractors.length + 1}`);
  }
  const options = shuffle([target.title, ...distractors]);
  const correctIndex = options.indexOf(target.title);
  return {
    type: "choice",
    stem: `${target.title} 的核心含义是？`,
    options,
    correctIndex
  };
}

/**
 * 生成填空题。
 * summary 中 title 替换为 ____（不区分出现位置）。
 */
export function generateFillQuiz(target: UserExtractedConcept): FillQuizPayload {
  const summary = target.summary?.trim() || `${target.title} 是中国法律体系中的重要概念。`;
  const stem = summary.includes(target.title)
    ? summary.replace(new RegExp(escapeRegExp(target.title), "g"), "____")
    : `____ 是${summary}`;
  return {
    type: "fill",
    stem,
    correctAnswer: target.title
  };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 生成简答题。
 * 模板句式 + summary 作 modelAnswer。
 */
export function generateEssayQuiz(target: UserExtractedConcept): EssayQuizPayload {
  return {
    type: "essay",
    stem: `请简述 "${target.title}" 的核心要点。`,
    modelAnswer: target.summary?.trim() || `${target.title} 是中国法律体系中的重要概念。`
  };
}

/** 一次性生成 3 种题（按顺序）。 */
export function generateAllQuizForConcept(
  target: UserExtractedConcept,
  allConcepts: UserExtractedConcept[]
): QuizItemPayload[] {
  return [
    generateChoiceQuiz(target, allConcepts),
    generateFillQuiz(target),
    generateEssayQuiz(target)
  ];
}

/** 把 payload 包装成 UserQuizItem（含 SR 初始状态）。 */
export function wrapAsQuizItem(
  conceptId: string,
  conceptTitle: string,
  payload: QuizItemPayload
): UserQuizItem {
  return {
    id: uuid(),
    conceptId,
    conceptTitle,
    payload,
    spacedRepetition: initialSpacedRepetition(),
    createdAt: Date.now()
  };
}
