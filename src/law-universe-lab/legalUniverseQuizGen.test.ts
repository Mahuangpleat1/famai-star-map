/**
 * 题型生成器 + SR 初始状态 单测。
 */

import { describe, expect, it } from "vitest";
import {
  generateAllQuizForConcept,
  generateChoiceQuiz,
  generateEssayQuiz,
  generateFillQuiz,
  initialSpacedRepetition,
  wrapAsQuizItem
} from "./legalUniverseQuizGen";
import type { UserExtractedConcept } from "./userDataTypes";

const target = (overrides: Partial<UserExtractedConcept> = {}): UserExtractedConcept => ({
  title: "善意取得",
  type: "principle",
  system: "civil",
  importance: 80,
  summary: "善意取得指无权处分人将动产或不动产转让给善意第三人时，善意第三人在符合条件下取得所有权。",
  keyPoints: [],
  ...overrides
});

describe("initialSpacedRepetition", () => {
  it("初始 easeFactor=2.5 interval=0 repetitions=0 dueAt≈now", () => {
    const before = Date.now();
    const sr = initialSpacedRepetition();
    const after = Date.now();
    expect(sr.easeFactor).toBe(2.5);
    expect(sr.interval).toBe(0);
    expect(sr.repetitions).toBe(0);
    expect(sr.dueAt).toBeGreaterThanOrEqual(before);
    expect(sr.dueAt).toBeLessThanOrEqual(after);
  });
});

describe("generateChoiceQuiz", () => {
  it("4 个选项，correctIndex 指向 target.title", () => {
    const all = [target(), target({ title: "A", system: "criminal" }), target({ title: "B", system: "criminal" }), target({ title: "C", system: "criminal" })];
    const payload = generateChoiceQuiz(target(), all);
    expect(payload.type).toBe("choice");
    expect(payload.options).toHaveLength(4);
    expect(payload.options[payload.correctIndex]).toBe("善意取得");
  });

  it("干扰项不足 3 个时填充占位", () => {
    const payload = generateChoiceQuiz(target(), []);
    expect(payload.options).toHaveLength(4);
    expect(payload.options[payload.correctIndex]).toBe("善意取得");
  });

  it("不重复选 target 自己作为干扰项", () => {
    const all = [target(), target({ title: "善意取得" }), target({ title: "A", system: "criminal" })];
    const payload = generateChoiceQuiz(target(), all);
    const targetCount = payload.options.filter((o) => o === "善意取得").length;
    expect(targetCount).toBe(1);
  });
});

describe("generateFillQuiz", () => {
  it("summary 含 title 时替换为 ____", () => {
    const payload = generateFillQuiz(target());
    expect(payload.type).toBe("fill");
    expect(payload.stem).toContain("____");
    expect(payload.stem).not.toContain("善意取得");
    expect(payload.correctAnswer).toBe("善意取得");
  });

  it("summary 不含 title 时填空句首", () => {
    const payload = generateFillQuiz(target({ summary: "重要原则" }));
    expect(payload.stem).toMatch(/^____/);
    expect(payload.correctAnswer).toBe("善意取得");
  });

  it("无 summary 时用兜底句", () => {
    const payload = generateFillQuiz(target({ summary: "" }));
    expect(payload.stem).toContain("____");
    expect(payload.correctAnswer).toBe("善意取得");
  });
});

describe("generateEssayQuiz", () => {
  it("包含 title 引用 + modelAnswer=summary", () => {
    const payload = generateEssayQuiz(target());
    expect(payload.type).toBe("essay");
    expect(payload.stem).toContain("善意取得");
    expect(payload.modelAnswer).toContain("善意取得");
    expect(payload.modelAnswer.length).toBeGreaterThan(0);
  });
});

describe("generateAllQuizForConcept", () => {
  it("返回 3 种类型", () => {
    const all = [target()];
    const list = generateAllQuizForConcept(target(), all);
    expect(list).toHaveLength(3);
    expect(list.map((p) => p.type)).toEqual(["choice", "fill", "essay"]);
  });
});

describe("wrapAsQuizItem", () => {
  it("包装成 UserQuizItem 含 SR 初始状态", () => {
    const item = wrapAsQuizItem("ext1::0", "善意取得", {
      type: "choice",
      stem: "test",
      options: ["a", "b"],
      correctIndex: 0
    });
    expect(item.id).toBeTruthy();
    expect(item.conceptId).toBe("ext1::0");
    expect(item.conceptTitle).toBe("善意取得");
    expect(item.spacedRepetition.easeFactor).toBe(2.5);
    expect(item.payload.type).toBe("choice");
  });
});
