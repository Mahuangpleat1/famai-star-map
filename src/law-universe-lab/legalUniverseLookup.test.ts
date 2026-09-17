import { describe, expect, it } from "vitest";
import { getLegalUniverseNodeById, getLegalUniverseRelationsForNode, getTopLegalUniverseSystems, legalUniverseNodes } from "../../data/legalUniverseData";

describe("static graph lookups", () => {
  it("uses custom nodes instead of the bundled index when supplied", () => {
    const original = legalUniverseNodes[0];
    const custom = { ...original, title: "Custom graph root" };
    expect(getLegalUniverseNodeById(original.id)).toBe(original);
    expect(getLegalUniverseNodeById(original.id, [custom])).toBe(custom);
    expect(getLegalUniverseNodeById(original.id, [])).toBeUndefined();
    expect(getLegalUniverseNodeById("does-not-exist")).toBeUndefined();
  });
  it("resolves custom relation endpoints against the supplied graph", () => {
    const node = { ...legalUniverseNodes[1], title: "Custom endpoint" };
    const relations = getLegalUniverseRelationsForNode("universe-core", [node]);
    expect(relations.length).toBeGreaterThan(0);
    expect(relations.every((entry) => entry.node === node)).toBe(true);
  });
  it("preserves ranked system order and returns an independently editable list", () => {
    const expected = legalUniverseNodes.filter((node) => node.type === "system-sun").sort((a, b) => b.importance - a.importance || a.title.localeCompare(b.title, "zh-Hans-CN"));
    expect(getTopLegalUniverseSystems()).toEqual(expected);
    expect(getTopLegalUniverseSystems(3)).toEqual(expected.slice(0, 3));
    const list = getTopLegalUniverseSystems(); list.pop();
    expect(getTopLegalUniverseSystems()).toHaveLength(expected.length);
  });
});
