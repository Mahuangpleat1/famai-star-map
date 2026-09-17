import { describe, expect, it } from "vitest";
import {
  findLegalUniversePath,
  legalUniverseEdges,
  legalUniverseNodes
} from "./legalUniverseData";
import type { LegalUniverseEdge, LegalUniverseNode } from "../src/law-universe-lab/types";

const nodeIndex = new Map<string, LegalUniverseNode>(legalUniverseNodes.map((node) => [node.id, node]));

function edgeExists(source: string, target: string, edges: LegalUniverseEdge[]): boolean {
  return edges.some((edge) => (edge.source === source && edge.target === target) || (edge.source === target && edge.target === source));
}

describe("findLegalUniversePath", () => {
  it("returns a zero-hop path when from and to are the same node", () => {
    const path = findLegalUniversePath("system-civil", "system-civil");
    expect(path).toEqual({ nodeIds: ["system-civil"], steps: [], totalWeight: 0, hopCount: 0 });
  });

  it("finds a direct edge between two directly connected nodes", () => {
    const directEdge = legalUniverseEdges.find(
      (edge) =>
        (edge.source === "system-civil" && edge.target === "civil-contract-book") ||
        (edge.source === "civil-contract-book" && edge.target === "system-civil")
    );
    expect(directEdge).toBeDefined();

    const path = findLegalUniversePath("system-civil", "civil-contract-book");
    expect(path).not.toBeNull();
    expect(path!.hopCount).toBe(1);
    expect(path!.nodeIds).toEqual(["system-civil", "civil-contract-book"]);
    expect(edgeExists("system-civil", "civil-contract-book", path!.steps.map((step) => step.edge))).toBe(true);
  });

  it("finds a multi-hop path across systems when no direct edge exists", () => {
    // 法人 (civil) → 行政许可 (行政法). The two systems are connected by a
    // couple of cross-domain edges and concepts.
    const path = findLegalUniversePath("civil-juristic-act", "administrative-03", legalUniverseEdges, { maxHops: 6 });
    expect(path).not.toBeNull();
    expect(path!.nodeIds[0]).toBe("civil-juristic-act");
    expect(path!.nodeIds[path!.nodeIds.length - 1]).toBe("administrative-03");
    expect(path!.hopCount).toBeLessThanOrEqual(6);
    for (const step of path!.steps) {
      expect(nodeIndex.has(step.from)).toBe(true);
      expect(nodeIndex.has(step.to)).toBe(true);
    }
  });

  it("returns null when there is no path under the hop limit", () => {
    const path = findLegalUniversePath("system-civil", "criminal-justifiable-defense", [], { maxHops: 1 });
    expect(path).toBeNull();
  });

  it("respects the weight floor", () => {
    // With a high weight floor, low-weight edges should be excluded, and a connected
    // pair may fall back to a longer path or to null when the cap is tight.
    const reachable = findLegalUniversePath("system-civil", "civil-contract-book", legalUniverseEdges, { requireWeightFloor: 50 });
    expect(reachable).not.toBeNull();
    for (const step of reachable!.steps) {
      expect(step.edge.weight).toBeGreaterThanOrEqual(50);
    }
  });

  it("prefers stronger edges when multiple paths exist", () => {
    const path = findLegalUniversePath("system-civil", "civil-contract-book");
    // The unique direct edge from system-civil to civil-contract-book has weight >= 80
    // (a foundational structure relationship). A weaker indirect path would be longer.
    expect(path!.hopCount).toBe(1);
    expect(path!.steps[0].edge.weight).toBeGreaterThanOrEqual(80);
  });
});
