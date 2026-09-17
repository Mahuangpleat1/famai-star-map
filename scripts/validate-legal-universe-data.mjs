import {
  getLegalUniverseNodeById,
  legalUniverseEdges,
  legalUniverseNodes,
  validateLegalUniverseData
} from "../data/legalUniverseData.ts";

const requiredSystems = new Map([
  ["system-jurisprudence", 10],
  ["system-constitution", 12],
  ["system-administrative", 12],
  ["system-civil", 20],
  ["system-commercial", 12],
  ["system-criminal", 18],
  ["system-procedure", 18],
  ["system-economic", 12],
  ["system-social", 10],
  ["system-international", 10],
  ["system-legal-history", 12]
]);

const requiredConcepts = new Map([
  ["system-criminal", ["犯罪构成", "正当防卫", "刑罚体系"]],
  ["system-constitution", ["公民基本权利", "国家机构"]],
  ["system-civil", ["民法典", "物权编", "合同编", "人格权编", "违约责任", "个人信息保护"]],
  ["system-procedure", ["民事诉讼", "刑事诉讼", "行政诉讼", "管辖", "证据", "执行"]]
]);

function fail(message) {
  throw new Error(message);
}

const validationErrors = validateLegalUniverseData();
if (validationErrors.length > 0) {
  fail(`Legal universe data has structural errors:\n${validationErrors.map((error) => `- ${error}`).join("\n")}`);
}

const systemSuns = legalUniverseNodes.filter((node) => node.type === "system-sun");
if (systemSuns.length !== requiredSystems.size) {
  fail(`Expected exactly ${requiredSystems.size} system suns, got ${systemSuns.length}`);
}

for (const [systemId, minimumCount] of requiredSystems) {
  const system = getLegalUniverseNodeById(systemId);
  if (!system || system.type !== "system-sun") {
    fail(`Missing required system-sun: ${systemId}`);
  }

  const children = legalUniverseNodes.filter((node) => node.parentId === systemId);
  if (children.length < minimumCount) {
    fail(`${system.title} requires at least ${minimumCount} concept nodes, got ${children.length}`);
  }
}

for (const [systemId, conceptTitles] of requiredConcepts) {
  const titles = new Set([
    getLegalUniverseNodeById(systemId)?.title,
    ...legalUniverseNodes.filter((node) => node.parentId === systemId).map((node) => node.title)
  ]);

  for (const title of conceptTitles) {
    if (!titles.has(title)) {
      fail(`${systemId} is missing required concept: ${title}`);
    }
  }
}

const crossSystemEdges = legalUniverseEdges.filter((edge) => {
  const source = getLegalUniverseNodeById(edge.source);
  const target = getLegalUniverseNodeById(edge.target);
  return edge.type !== "belongs-to" && source && target && source.systemId !== target.systemId;
});

if (crossSystemEdges.length < 20) {
  fail(`Expected at least 20 cross-system edges, got ${crossSystemEdges.length}`);
}

// ===== 上线前提醒(非阻塞,仅 console.warn) =====

// 1) pending-manual-check 节点:标记为"待人工补来源"的上线前必补
const pendingNodes = legalUniverseNodes.filter((node) =>
  Array.isArray(node.sourceRefs) && node.sourceRefs.includes("pending-manual-check")
);
if (pendingNodes.length > 0) {
  console.warn(
    `[validate] ⚠ ${pendingNodes.length} 节点含 pending-manual-check 占位,` +
      `上线前需补具体来源(flk.npc.gov.cn / court.gov.cn / spp.gov.cn / moe.gov.cn / 公开期刊):`
  );
  for (const node of pendingNodes.slice(0, 5)) {
    console.warn(`  - ${node.id} (${node.title})`);
  }
  if (pendingNodes.length > 5) {
    console.warn(`  ... and ${pendingNodes.length - 5} more`);
  }
}

// 2) http:// 源(非 https):合规警告
const insecureSources = legalUniverseNodes
  .flatMap((node) => node.sourceRefs ?? [])
  .filter((source) => typeof source === "string" && /^http:\/\//.test(source));
if (insecureSources.length > 0) {
  console.warn(`[validate] ⚠ ${insecureSources.length} 非 https 源,考虑升级:`);
  for (const src of new Set(insecureSources).values()) {
    console.warn(`  - ${src}`);
  }
}

console.log(
  [
    "Legal universe data is valid.",
    `Nodes: ${legalUniverseNodes.length}`,
    `Edges: ${legalUniverseEdges.length}`,
    `System suns: ${systemSuns.length}`,
    `Cross-system edges: ${crossSystemEdges.length}`
  ].join("\n")
);
