import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { getLegalUniverseNodeById, legalUniverseEdges } from "../../data/legalUniverseData";
import { getLegalUniverseWorldPosition } from "./legalUniverseLayout";
import { createLawUniverseBeamStrands, createLawUniverseStarField, getLawUniverseFocusIgnition } from "./legalUniverseVisuals";

function getNodeVector(nodeId: string): THREE.Vector3 {
  const node = getLegalUniverseNodeById(nodeId);
  if (!node) {
    throw new Error(`Missing legal universe node ${nodeId}`);
  }

  const position = getLegalUniverseWorldPosition(node);
  return new THREE.Vector3(position[0], position[1], position[2]);
}

describe("legal universe visual geometry", () => {
  it("renders relation beams as multiple thin spatial silk strands", () => {
    const edge = legalUniverseEdges.find((candidate) => candidate.source === "system-criminal" && candidate.target === "system-procedure");
    expect(edge).toBeTruthy();

    const source = getNodeVector(edge!.source);
    const target = getNodeVector(edge!.target);
    const strands = createLawUniverseBeamStrands(source, target, {
      active: true,
      seed: edge!.source.length + edge!.target.length,
      weight: edge!.weight
    });
    const directMidpoint = source.clone().lerp(target, 0.5);
    const midpointDeviation = Math.max(
      ...strands.map((strand) => strand.points[Math.floor(strand.points.length / 2)].distanceTo(directMidpoint))
    );

    expect(strands.length).toBeGreaterThanOrEqual(4);
    expect(strands.every((strand) => strand.points.length >= 56)).toBe(true);
    expect(midpointDeviation).toBeGreaterThan(1.2);
    expect(Math.max(...strands.map((strand) => strand.lineWidth))).toBeLessThanOrEqual(0.36);
    expect(strands.some((strand) => strand.opacity < 0.2)).toBe(true);
  });

  it("creates deep low-saturation star fields with varied micro color", () => {
    const starField = createLawUniverseStarField({
      count: 160,
      radius: 34,
      seedOffset: 19,
      verticalScale: 0.74,
      saturation: 0.22
    });
    const uniqueColorTriples = new Set<string>();
    for (let index = 0; index < starField.colors.length; index += 3) {
      uniqueColorTriples.add(
        `${starField.colors[index].toFixed(3)},${starField.colors[index + 1].toFixed(3)},${starField.colors[index + 2].toFixed(3)}`
      );
    }
    const yValues = Array.from({ length: starField.positions.length / 3 }, (_, index) => starField.positions[index * 3 + 1]);

    expect(starField.positions).toHaveLength(480);
    expect(starField.colors).toHaveLength(480);
    expect(uniqueColorTriples.size).toBeGreaterThan(16);
    expect(Math.max(...yValues) - Math.min(...yValues)).toBeGreaterThan(22);
  });

  it("shapes focus ignition as a short bright peak that settles back down", () => {
    const start = getLawUniverseFocusIgnition(0);
    const peak = getLawUniverseFocusIgnition(0.22);
    const expanding = getLawUniverseFocusIgnition(0.42);
    const settled = getLawUniverseFocusIgnition(0.72);

    expect(peak.coreBoost).toBeGreaterThan(start.coreBoost);
    expect(peak.lineBoost).toBeGreaterThan(0.22);
    expect(expanding.haloBoost).toBeGreaterThan(peak.haloBoost);
    expect(expanding.radiusScale).toBeGreaterThan(1.12);
    expect(settled.coreBoost).toBeLessThan(0.06);
    expect(settled.lineBoost).toBeLessThan(0.08);
  });
});
