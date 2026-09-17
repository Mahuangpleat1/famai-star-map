import { describe, expect, it } from "vitest";
import { orderSession } from "./legalUniverseSessionOrder";
import type { UserMistake, UserQuizItem } from "./userDataTypes";

function mkItem(id: string, dueAt: number, conceptId = "c1"): UserQuizItem {
  return {
    id,
    conceptId,
    conceptTitle: id,
    payload: { type: "choice", stem: "x", options: ["a"], correctIndex: 0 },
    spacedRepetition: { easeFactor: 2.5, interval: 1, repetitions: 1, dueAt },
    createdAt: 0
  };
}

function mkMistake(quizItemId: string, at = 0): UserMistake {
  return {
    id: `m-${quizItemId}`,
    quizItemId,
    conceptTitle: "x",
    questionType: "choice",
    questionStem: "x",
    userAnswer: "x",
    correctAnswer: "x",
    at,
    attempts: 1
  };
}

describe("orderSession", () => {
  const now = 1000;

  it("empty input returns []", () => {
    expect(orderSession([], [], now)).toEqual([]);
  });

  it("filters items not yet due", () => {
    const items = [mkItem("a", 500), mkItem("b", 2000)];
    const out = orderSession(items, [], now);
    expect(out.map((i) => i.id)).toEqual(["a"]);
  });

  it("due items sorted by dueAt asc", () => {
    const items = [mkItem("a", 500), mkItem("b", 100), mkItem("c", 800)];
    const out = orderSession(items, [], now);
    expect(out.map((i) => i.id)).toEqual(["b", "a", "c"]);
  });

  it("mistake items pushed to head, group-internal dueAt asc", () => {
    const items = [
      mkItem("normal-old", 100),
      mkItem("mistake-newer", 800),
      mkItem("normal-newer", 500),
      mkItem("mistake-older", 200)
    ];
    const mistakes = [mkMistake("mistake-newer"), mkMistake("mistake-older")];
    const out = orderSession(items, mistakes, now);
    expect(out.map((i) => i.id)).toEqual(["mistake-older", "mistake-newer", "normal-old", "normal-newer"]);
  });

  it("limit caps the result", () => {
    const items = Array.from({ length: 5 }, (_, i) => mkItem(`i${i}`, 100 + i));
    const out = orderSession(items, [], now, 3);
    expect(out).toHaveLength(3);
    expect(out.map((i) => i.id)).toEqual(["i0", "i1", "i2"]);
  });

  it("only counts mistakes matching quizItemId", () => {
    const items = [mkItem("a", 100), mkItem("b", 200)];
    const mistakes = [mkMistake("b")];
    const out = orderSession(items, mistakes, now);
    expect(out.map((i) => i.id)).toEqual(["b", "a"]);
  });

  it("multiple mistakes on same item keep it in mistake queue", () => {
    const items = [mkItem("a", 100), mkItem("b", 200)];
    const mistakes = [mkMistake("a"), mkMistake("a")];
    const out = orderSession(items, mistakes, now);
    expect(out.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("limit still slices after concatenation", () => {
    const items = [
      mkItem("m1", 100),
      mkItem("m2", 200),
      mkItem("n1", 300),
      mkItem("n2", 400)
    ];
    const mistakes = [mkMistake("m1"), mkMistake("m2")];
    const out = orderSession(items, mistakes, now, 2);
    expect(out.map((i) => i.id)).toEqual(["m1", "m2"]);
  });

  it("filters out mistake items that are not yet due", () => {
    const items = [mkItem("a", 5000)];
    const mistakes = [mkMistake("a")];
    const out = orderSession(items, mistakes, now);
    expect(out).toEqual([]);
  });

  it("preserves input order for items with equal dueAt (stable sort)", () => {
    const items = [
      mkItem("m1", 500),
      mkItem("m2", 500),
      mkItem("n1", 500),
      mkItem("n2", 500)
    ];
    const mistakes = [mkMistake("m1"), mkMistake("m2")];
    const out = orderSession(items, mistakes, now);
    expect(out.map((i) => i.id)).toEqual(["m1", "m2", "n1", "n2"]);
  });
});
