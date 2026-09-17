/**
 * 判分器 —— Phase 3 续 刷题会话。
 *
 * 三型:
 *   - choice: 选项索引相等
 *   - fill:   归一化后字符串相等
 *   - essay:  Jaccard 词袋(含 bigram) + 中文停用词表,阈值 0.35
 *
 * 注:自动判分只产生 q=5(对)或 q=1(错),2-4 留给未来人工自评
 */

import type { ChoiceQuizPayload, EssayQuizPayload, FillQuizPayload } from "./userDataTypes";

export interface JudgeResult {
  isCorrect: boolean;
  q: 0 | 1 | 2 | 3 | 4 | 5;
  /** 仅 essay 返回 0-1。 */
  score?: number;
}

export function judgeChoice(payload: ChoiceQuizPayload, userIndex: number): JudgeResult {
  const isCorrect = userIndex === payload.correctIndex;
  return { isCorrect, q: isCorrect ? 5 : 1 };
}

function normalizeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[。.,，;；:：、!！?？]+$/g, "");
}

export function judgeFill(payload: FillQuizPayload, userAnswer: string): JudgeResult {
  const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(payload.correctAnswer);
  return { isCorrect, q: isCorrect ? 5 : 1 };
}

const STOP_WORDS = new Set<string>([
  "的", "是", "在", "和", "与", "或", "了", "也", "都", "及", "等",
  "为", "以", "对", "从", "到", "由", "把", "被", "使", "让",
  "一", "个", "一些", "这种", "那种", "什么", "怎么", "如何",
  "我", "你", "他", "她", "它", "我们", "你们", "他们",
  "有", "没", "会", "能", "可以", "应该", "需要", "这", "那", "之"
]);

/** 简化分词:单字 + 二元组合(bigram),去停用词。 */
function tokenize(s: string): Set<string> {
  const cleaned = s.replace(/[\p{P}\s\u3000]+/gu, " ").trim().toLowerCase();
  const chars = Array.from(cleaned);
  const tokens = new Set<string>();
  for (const c of chars) {
    if (!STOP_WORDS.has(c)) tokens.add(c);
  }
  for (let i = 0; i < chars.length - 1; i++) {
    const bigram = chars[i] + chars[i + 1];
    tokens.add(bigram);
  }
  return tokens;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

const ESSAY_THRESHOLD = 0.35;

export function judgeEssay(payload: EssayQuizPayload, userAnswer: string): JudgeResult {
  if (!userAnswer.trim()) return { isCorrect: false, q: 1, score: 0 };
  const a = tokenize(payload.modelAnswer);
  const b = tokenize(userAnswer);
  const score = jaccard(a, b);
  const isCorrect = score >= ESSAY_THRESHOLD;
  return { isCorrect, q: isCorrect ? 5 : 1, score };
}
