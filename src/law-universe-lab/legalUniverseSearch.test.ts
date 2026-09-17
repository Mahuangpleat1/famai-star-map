import { describe, expect, it } from "vitest";
import { legalUniverseNodes } from "../../data/legalUniverseData";
import { searchLegalUniverse } from "./legalUniverseSearch";

describe("searchLegalUniverse", () => {
  it("returns nothing for an empty query", () => {
    expect(searchLegalUniverse("", legalUniverseNodes)).toEqual([]);
    expect(searchLegalUniverse("   ", legalUniverseNodes)).toEqual([]);
  });

  it("matches exact title", () => {
    const hits = searchLegalUniverse("民法典", legalUniverseNodes, 5);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].node.title).toBe("民法典");
    expect(hits[0].matchedField).toBe("title");
  });

  it("matches by pinyin initials", () => {
    const hits = searchLegalUniverse("mfd", legalUniverseNodes);
    expect(hits.some((hit) => hit.node.title === "民法典")).toBe(true);
  });

  it("matches by tag", () => {
    const hits = searchLegalUniverse("商法", legalUniverseNodes);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((hit) => hit.matchedField === "title" || hit.matchedField === "tag" || hit.matchedField === "description")).toBe(true);
  });

  it("matches by short description", () => {
    const hits = searchLegalUniverse("法律关系", legalUniverseNodes);
    expect(hits.length).toBeGreaterThan(0);
  });

  it("returns a stable, score-ordered slice", () => {
    const hits = searchLegalUniverse("法", legalUniverseNodes, 5);
    expect(hits.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < hits.length; i += 1) {
      expect(hits[i - 1].score).toBeGreaterThanOrEqual(hits[i].score);
    }
  });
});
