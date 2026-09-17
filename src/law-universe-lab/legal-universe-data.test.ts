import { describe, expect, it } from "vitest";
import {
  getLegalUniverseNodeById,
  getLegalUniverseRelationsForNode,
  legalUniverseEdges,
  legalUniverseNodes,
  legalUniverseSourceRefs,
  legalUniverseSystems,
  validateLegalUniverseData
} from "../../data/legalUniverseData";
import { getLegalUniverseWorldPosition } from "./legalUniverseLayout";
import { shouldRenderLegalUniverseEdge } from "./legalUniverseSceneUtils";

const requiredSystemTitles = [
  "法理学",
  "宪法",
  "行政法",
  "民法典",
  "商法",
  "刑法",
  "诉讼法",
  "经济法",
  "社会法",
  "国际法",
  "中国法律史"
];

describe("legal universe data", () => {
  it("contains a bounded multi-system first edition", () => {
    expect(legalUniverseNodes.length).toBeGreaterThanOrEqual(200);
    expect(legalUniverseNodes.length).toBeLessThanOrEqual(1200);
    expect(legalUniverseEdges.length).toBeGreaterThanOrEqual(200);
    expect(legalUniverseEdges.length).toBeLessThanOrEqual(2000);

    const systemSunTitles = legalUniverseNodes
      .filter((node) => node.type === "system-sun")
      .map((node) => node.title);

    for (const title of requiredSystemTitles) {
      expect(systemSunTitles).toContain(title);
    }

    expect(systemSunTitles).toHaveLength(requiredSystemTitles.length);
    expect(systemSunTitles).not.toContain("债权 / 合同");
    expect(systemSunTitles).not.toContain("物权");
    expect(systemSunTitles).not.toContain("人格权与数据权利");
  });

  it("gives every required legal solar system its own concept planets", () => {
    const minimumConceptsBySystem: Record<string, number> = {
      "system-jurisprudence": 10,
      "system-constitution": 12,
      "system-administrative": 12,
      "system-civil": 20,
      "system-commercial": 12,
      "system-criminal": 18,
      "system-procedure": 18,
      "system-economic": 12,
      "system-social": 10,
      "system-international": 10,
      "system-legal-history": 12
    };

    for (const [systemId, minimumCount] of Object.entries(minimumConceptsBySystem)) {
      const children = legalUniverseNodes.filter((node) => node.parentId === systemId);
      expect(children.length, systemId).toBeGreaterThanOrEqual(minimumCount);
    }

    const civilConceptTitles = legalUniverseNodes.filter((node) => node.parentId === "system-civil").map((node) => node.title);
    expect(civilConceptTitles).toEqual(expect.arrayContaining(["物权编", "合同编", "人格权编", "违约责任", "个人信息保护"]));

    const procedureConceptTitles = legalUniverseNodes.filter((node) => node.parentId === "system-procedure").map((node) => node.title);
    expect(procedureConceptTitles).toEqual(expect.arrayContaining(["民事诉讼", "刑事诉讼", "行政诉讼", "管辖", "证据", "执行", "再审"]));
  });

  it("keeps cross-system bridges broad enough without hidden sub-solar-system shortcuts", () => {
    const crossSystemEdges = legalUniverseEdges.filter((edge) => {
      const source = getLegalUniverseNodeById(edge.source);
      const target = getLegalUniverseNodeById(edge.target);
      return edge.type !== "belongs-to" && source?.systemId !== target?.systemId;
    });

    expect(crossSystemEdges.length).toBeGreaterThanOrEqual(20);
    expect(crossSystemEdges.some((edge) => edge.source === "system-criminal" && edge.target === "system-procedure")).toBe(true);
    expect(crossSystemEdges.some((edge) => edge.source === "system-constitution" && edge.target === "system-administrative")).toBe(true);
    expect(crossSystemEdges.some((edge) => edge.source === "system-civil" && edge.target === "system-commercial")).toBe(true);
    expect(crossSystemEdges.some((edge) => edge.source === "system-jurisprudence" && edge.target === "system-civil")).toBe(true);
    expect(crossSystemEdges.some((edge) => edge.source === "system-legal-history" && edge.target === "system-constitution")).toBe(true);
  });

  it("keeps every node and edge source-aware and internally valid", () => {
    expect(validateLegalUniverseData()).toEqual([]);

    const sourceIds = new Set(legalUniverseSourceRefs.map((source) => source.id));
    const systemIds = new Set(legalUniverseSystems.map((system) => system.id));

    for (const node of legalUniverseNodes) {
      expect(node.title.trim(), node.id).not.toHaveLength(0);
      expect(node.shortDescription.trim(), node.id).not.toHaveLength(0);
      expect(node.sourceRefs.length, node.id).toBeGreaterThan(0);
      expect(systemIds.has(node.systemId), `${node.id} systemId should be registered`).toBe(true);
      for (const sourceRef of node.sourceRefs) {
        expect(sourceIds.has(sourceRef), `${node.id} sourceRef ${sourceRef} should exist`).toBe(true);
      }
    }

    for (const edge of legalUniverseEdges) {
      expect(getLegalUniverseNodeById(edge.source), edge.source).toBeTruthy();
      expect(getLegalUniverseNodeById(edge.target), edge.target).toBeTruthy();
      expect(edge.label.trim(), `${edge.source}->${edge.target}`).not.toHaveLength(0);
      expect(edge.evidenceLevel.trim(), `${edge.source}->${edge.target}`).not.toHaveLength(0);
      expect(edge.sourceRefs.length, `${edge.source}->${edge.target}`).toBeGreaterThan(0);
      for (const sourceRef of edge.sourceRefs) {
        expect(sourceIds.has(sourceRef), `${edge.source}->${edge.target} sourceRef ${sourceRef} should exist`).toBe(true);
      }
    }
  });

  it("places system suns in stable three-dimensional clusters instead of one flat pile", () => {
    const systemSunPositions = legalUniverseNodes
      .filter((node) => node.type === "system-sun")
      .map((node) => getLegalUniverseWorldPosition(node));

    expect(systemSunPositions.length).toBe(requiredSystemTitles.length);
    expect(systemSunPositions).toEqual(
      legalUniverseNodes
        .filter((node) => node.type === "system-sun")
        .map((node) => getLegalUniverseWorldPosition(node))
    );

    const xs = systemSunPositions.map((position) => position[0]);
    const ys = systemSunPositions.map((position) => position[1]);
    const zs = systemSunPositions.map((position) => position[2]);
    const range = (values: number[]) => Math.max(...values) - Math.min(...values);

    expect(range(xs)).toBeGreaterThan(16);
    expect(range(ys)).toBeGreaterThan(5);
    expect(range(zs)).toBeGreaterThan(12);
  });

  it("exposes meaningful cross-domain relations for focus panels and active edge filtering", () => {
    const criminalLaw = getLegalUniverseNodeById("system-criminal");
    const civilCode = getLegalUniverseNodeById("system-civil");
    const constitution = getLegalUniverseNodeById("system-constitution");

    expect(criminalLaw?.title).toBe("刑法");
    expect(civilCode?.title).toBe("民法典");
    expect(constitution?.title).toBe("宪法");

    const criminalRelations = getLegalUniverseRelationsForNode("system-criminal");
    const civilRelations = getLegalUniverseRelationsForNode("system-civil");

    expect(criminalRelations.some(({ relation }) => relation.type === "cross-domain")).toBe(true);
    expect(civilRelations.some(({ node }) => node.id === "system-commercial" || node.id === "system-procedure")).toBe(true);
  });

  it("keeps overview relation beams at system level so edges do not point at hidden concept nodes", () => {
    const overviewEdges = legalUniverseEdges.filter((edge) => shouldRenderLegalUniverseEdge(edge, "universe-core"));

    expect(overviewEdges.length).toBeGreaterThanOrEqual(12);

    for (const edge of overviewEdges) {
      const source = getLegalUniverseNodeById(edge.source);
      const target = getLegalUniverseNodeById(edge.target);

      expect(["universe-core", "system-sun"]).toContain(source?.type);
      expect(["universe-core", "system-sun"]).toContain(target?.type);
    }
  });
});
