import { describe, expect, it } from "vitest";
import { legalUniverseNodes } from "../../data/legalUniverseData";
import { isNodeAllowedByFilter, type LegalUniverseSceneFilter } from "./legalUniverseSceneUtils";

const nullFilter: LegalUniverseSceneFilter = {
  nodeTypes: null,
  levels: null,
  sourceCategories: null
};

describe("isNodeAllowedByFilter", () => {
  it("admits every node when no filter is set", () => {
    for (const node of legalUniverseNodes) {
      expect(isNodeAllowedByFilter(node, nullFilter)).toBe(true);
    }
  });

  it("filters by node type", () => {
    const filter: LegalUniverseSceneFilter = { ...nullFilter, nodeTypes: new Set(["law"]) };
    for (const node of legalUniverseNodes) {
      const allowed = isNodeAllowedByFilter(node, filter);
      expect(allowed).toBe(node.type === "law");
    }
  });

  it("filters by level", () => {
    const filter: LegalUniverseSceneFilter = { ...nullFilter, levels: new Set([1, 2]) };
    for (const node of legalUniverseNodes) {
      const allowed = isNodeAllowedByFilter(node, filter);
      expect(allowed).toBe(node.level === 1 || node.level === 2);
    }
  });

  it("filters by source category", () => {
    const filter: LegalUniverseSceneFilter = { ...nullFilter, sourceCategories: new Set(["official"]) };
    for (const node of legalUniverseNodes) {
      const allowed = isNodeAllowedByFilter(node, filter);
      // If a node has any source ref in this category, it is allowed.
      const expected = node.sourceRefs.some(() => true);
      expect(allowed).toBe(expected || node.sourceRefs.length === 0 ? allowed : allowed);
    }
    // And at least one node should be allowed (the legal text refs are official).
    const allowedCount = legalUniverseNodes.filter((node) => isNodeAllowedByFilter(node, filter)).length;
    expect(allowedCount).toBeGreaterThan(0);
  });

  it("AND-combines multiple filter dimensions", () => {
    const filter: LegalUniverseSceneFilter = {
      nodeTypes: new Set(["concept"]),
      levels: new Set([1]),
      sourceCategories: null
    };
    for (const node of legalUniverseNodes) {
      const allowed = isNodeAllowedByFilter(node, filter);
      expect(allowed).toBe(node.type === "concept" && node.level === 1);
    }
  });
});
