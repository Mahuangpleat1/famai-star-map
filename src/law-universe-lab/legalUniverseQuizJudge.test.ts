import { describe, expect, it } from "vitest";
import { judgeChoice, judgeFill, judgeEssay } from "./legalUniverseQuizJudge";

describe("judgeChoice", () => {
  it("returns q=5 when user picks correct index", () => {
    const r = judgeChoice({ type: "choice", stem: "x", options: ["a", "b", "c", "d"], correctIndex: 2 }, 2);
    expect(r).toEqual({ isCorrect: true, q: 5 });
  });
  it("returns q=1 when user picks wrong index", () => {
    const r = judgeChoice({ type: "choice", stem: "x", options: ["a", "b", "c", "d"], correctIndex: 2 }, 0);
    expect(r).toEqual({ isCorrect: false, q: 1 });
  });
});

describe("judgeFill", () => {
  it("exact match returns q=5", () => {
    const r = judgeFill({ type: "fill", stem: "____ is law", correctAnswer: "法" }, "法");
    expect(r.isCorrect).toBe(true);
    expect(r.q).toBe(5);
  });
  it("case + whitespace + trailing punctuation normalizes", () => {
    const r = judgeFill({ type: "fill", stem: "____", correctAnswer: "民法典" }, "  民法典。  ");
    expect(r.isCorrect).toBe(true);
  });
  it("different content returns q=1", () => {
    const r = judgeFill({ type: "fill", stem: "____", correctAnswer: "民法典" }, "刑法");
    expect(r.isCorrect).toBe(false);
    expect(r.q).toBe(1);
  });
  it("internal punctuation is not normalized (conservative)", () => {
    expect(judgeFill({ type: "fill", stem: "_", correctAnswer: "民法典" }, "民法典，是").isCorrect).toBe(false);
  });
});

describe("judgeEssay", () => {
  it("empty userAnswer returns q=1, score=0", () => {
    const r = judgeEssay({ type: "essay", stem: "q", modelAnswer: "民法典是中国民事法律的集合" }, "  ");
    expect(r.isCorrect).toBe(false);
    expect(r.q).toBe(1);
    expect(r.score).toBe(0);
  });
  it("identical text returns q=5, score=1", () => {
    const text = "民法典是中国民事法律的集合";
    const r = judgeEssay({ type: "essay", stem: "q", modelAnswer: text }, text);
    expect(r.isCorrect).toBe(true);
    expect(r.q).toBe(5);
    expect(r.score).toBe(1);
  });
  it("completely unrelated text returns q=1, low score", () => {
    const r = judgeEssay(
      { type: "essay", stem: "q", modelAnswer: "民法典是中国民事法律的集合" },
      "今天天气真好啊我们去公园玩吧"
    );
    expect(r.isCorrect).toBe(false);
    expect(r.q).toBe(1);
    expect(r.score).toBeLessThan(0.35);
  });
  it("mostly overlapping text passes threshold", () => {
    const model = "民法典调整平等主体之间的财产关系和人身关系，是民事基本法律";
    const user = "民法典是调整财产关系和人身关系的基本民事法律，规定平等主体";
    const r = judgeEssay({ type: "essay", stem: "q", modelAnswer: model }, user);
    expect(r.score).toBeGreaterThanOrEqual(0.35);
    expect(r.isCorrect).toBe(true);
    expect(r.q).toBe(5);
  });
  it("only stop words returns q=1", () => {
    const r = judgeEssay(
      { type: "essay", stem: "q", modelAnswer: "民法典是民事基本法律" },
      "是的是的的"
    );
    expect(r.isCorrect).toBe(false);
    expect(r.q).toBe(1);
  });
  it("stop words removed (e.g. '的' should not affect)", () => {
    const r = judgeEssay(
      { type: "essay", stem: "q", modelAnswer: "民法典的调整对象" },
      "民法典调整对象"
    );
    expect(r.isCorrect).toBe(true);
  });
});
