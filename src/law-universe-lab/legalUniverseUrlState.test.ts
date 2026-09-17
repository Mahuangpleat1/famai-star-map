import { describe, expect, it } from "vitest";
import {
  ALL_LEVELS,
  ALL_NODE_TYPES,
  ALL_SOURCE_CATEGORIES,
  isLevelAllowed,
  isNodeTypeAllowed,
  isSourceCategoryAllowed,
  parseUrlState,
  serializeUrlState,
  type LegalUniverseUrlState
} from "./legalUniverseUrlState";

describe("legalUniverseUrlState", () => {
  it("returns an empty state for an empty hash", () => {
    expect(parseUrlState("")).toEqual({
      selectedNodeId: null,
      zoomLevel: null,
      nodeTypes: null,
      levels: null,
      sourceCategories: null,
      path: null
    });
  });

  it("ignores unknown node ids, levels, and categories", () => {
    const state = parseUrlState("#n=does-not-exist&z=9&f=ghost&l=42&s=bogus&p=foo~bar");
    expect(state).toEqual({
      selectedNodeId: null,
      zoomLevel: null,
      nodeTypes: null,
      levels: null,
      sourceCategories: null,
      path: null
    });
  });

  it("parses a real, well-formed hash", () => {
    const state = parseUrlState("#n=system-civil&z=2&f=concept,law&l=1,2&s=official&p=system-civil~civil-contract-book");
    expect(state.selectedNodeId).toBe("system-civil");
    expect(state.zoomLevel).toBe(2);
    expect(state.nodeTypes).toEqual(["concept", "law"]);
    expect(state.levels).toEqual([1, 2]);
    expect(state.sourceCategories).toEqual(["official"]);
    expect(state.path).toEqual({ from: "system-civil", to: "civil-contract-book" });
  });

  it("rejects a self path", () => {
    const state = parseUrlState("#p=system-civil~system-civil");
    expect(state.path).toBeNull();
  });

  it("round-trips through serialize", () => {
    const next: Partial<LegalUniverseUrlState> = {
      selectedNodeId: "system-criminal",
      zoomLevel: 1,
      nodeTypes: ["law", "concept"],
      levels: [1, 2],
      sourceCategories: ["official"],
      path: { from: "system-criminal", to: "system-civil" }
    };
    const serialized = serializeUrlState(next);
    expect(serialized.startsWith("#")).toBe(true);
    const parsed = parseUrlState(serialized);
    expect(parsed.selectedNodeId).toBe(next.selectedNodeId);
    expect(parsed.zoomLevel).toBe(next.zoomLevel);
    expect(parsed.nodeTypes).toEqual(["law", "concept"]);
    expect(parsed.levels).toEqual([1, 2]);
    expect(parsed.sourceCategories).toEqual(["official"]);
    expect(parsed.path).toEqual(next.path);
  });

  it("omits absent fields from the serialized hash", () => {
    const serialized = serializeUrlState({
      selectedNodeId: null,
      zoomLevel: null,
      nodeTypes: null,
      levels: null,
      sourceCategories: null,
      path: null
    });
    expect(serialized).toBe("");
  });

  it("exposes the canonical lists", () => {
    expect(ALL_NODE_TYPES.length).toBeGreaterThan(0);
    expect(ALL_LEVELS).toEqual([0, 1, 2, 3]);
    expect(ALL_SOURCE_CATEGORIES).toContain("official");
  });

  it("isNodeTypeAllowed passes everything when no filter is set", () => {
    expect(isNodeTypeAllowed("law", null)).toBe(true);
    expect(isNodeTypeAllowed("law", [])).toBe(true);
  });

  it("isNodeTypeAllowed filters down to the allowlist", () => {
    expect(isNodeTypeAllowed("law", ["law"])).toBe(true);
    expect(isNodeTypeAllowed("concept", ["law"])).toBe(false);
  });

  it("isLevelAllowed honors the level allowlist", () => {
    expect(isLevelAllowed(1, [1, 2])).toBe(true);
    expect(isLevelAllowed(3, [1, 2])).toBe(false);
  });

  it("isSourceCategoryAllowed matches any source ref category", () => {
    expect(isSourceCategoryAllowed(["flk-constitution-2018"], ["official"])).toBe(true);
    expect(isSourceCategoryAllowed(["flk-constitution-2018"], ["textbook"])).toBe(false);
    expect(isSourceCategoryAllowed(["flk-constitution-2018"], null)).toBe(true);
  });
});
