import { getLegalUniverseNodeById, getLegalUniverseSystemById } from "../../data/legalUniverseData";
import type { LegalUniverseNode } from "./types";

const STORAGE_KEY = "law-universe:favorites-notes:v1";

export interface NodeNote {
  nodeId: string;
  note: string;
  favorited: boolean;
  updatedAt: number;
}

export interface StorageState {
  nodes: Record<string, NodeNote>;
}

function readStorage(): StorageState {
  if (typeof window === "undefined") return { nodes: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { nodes: {} };
    const parsed = JSON.parse(raw) as StorageState;
    return parsed && parsed.nodes ? parsed : { nodes: {} };
  } catch {
    return { nodes: {} };
  }
}

function writeStorage(state: StorageState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* localStorage may be disabled; ignore */
  }
}

export function loadAllNotes(): Record<string, NodeNote> {
  return readStorage().nodes;
}

export function loadNodeNote(nodeId: string): NodeNote {
  return readStorage().nodes[nodeId] ?? { nodeId, note: "", favorited: false, updatedAt: 0 };
}

export function setNodeNote(nodeId: string, note: string): void {
  const state = readStorage();
  const current = state.nodes[nodeId] ?? { nodeId, note: "", favorited: false, updatedAt: 0 };
  state.nodes[nodeId] = { ...current, note, updatedAt: Date.now() };
  writeStorage(state);
}

export function toggleNodeFavorite(nodeId: string): boolean {
  const state = readStorage();
  const current = state.nodes[nodeId] ?? { nodeId, note: "", favorited: false, updatedAt: 0 };
  const nextFavorited = !current.favorited;
  state.nodes[nodeId] = { ...current, favorited: nextFavorited, updatedAt: Date.now() };
  writeStorage(state);
  return nextFavorited;
}

export function listFavorites(): Array<{ node: LegalUniverseNode; note: NodeNote }> {
  const state = readStorage();
  const favorites: Array<{ node: LegalUniverseNode; note: NodeNote }> = [];
  for (const [nodeId, note] of Object.entries(state.nodes)) {
    if (note.favorited) {
      const node = getLegalUniverseNodeById(nodeId);
      if (node) favorites.push({ node, note });
    }
  }
  return favorites;
}

export function clearAllStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function buildMarkdownForNode(nodeId: string): string {
  const node = getLegalUniverseNodeById(nodeId);
  if (!node) return "";
  const note = loadNodeNote(nodeId);
  const systemTitle = getLegalUniverseSystemById(node.systemId)?.title ?? "中国法学体系";
  const lines: string[] = [];
  lines.push(`# ${node.title}`);
  lines.push("");
  lines.push(`> ${node.shortDescription}`);
  lines.push("");
  lines.push(`**所属太阳系**: ${systemTitle}  `);
  lines.push(`**类型**: ${node.type}  `);
  lines.push(`**重要性**: ${node.importance} / 100  `);
  if (node.tags.length > 0) {
    lines.push(`**标签**: ${node.tags.join("、")}  `);
  }
  lines.push("");

  if (node.content?.statuteRefs && node.content.statuteRefs.length > 0) {
    lines.push("## 法条引用");
    for (const ref of node.content.statuteRefs) {
      lines.push(`- **${ref.lawTitle}** · ${ref.article}${ref.url ? ` · [原文](${ref.url})` : ""}`);
      if (ref.note) lines.push(`  - ${ref.note}`);
    }
    lines.push("");
  }

  if (node.content?.judicialInterpretations && node.content.judicialInterpretations.length > 0) {
    lines.push("## 司法解释");
    for (const item of node.content.judicialInterpretations) {
      lines.push(`- **${item.title}**（${item.year} · ${item.issuer}${item.documentNumber ? ` · ${item.documentNumber}` : ""}）${item.url ? ` · [原文](${item.url})` : ""}`);
      lines.push(`  - ${item.summary}`);
    }
    lines.push("");
  }

  if (node.content?.practicePoints && node.content.practicePoints.length > 0) {
    lines.push("## 实务要点");
    for (const point of node.content.practicePoints) {
      lines.push(`- ${point}`);
    }
    lines.push("");
  }

  if (node.content?.landmarkCases && node.content.landmarkCases.length > 0) {
    lines.push("## 指导案例 / 典型案例");
    for (const item of node.content.landmarkCases) {
      lines.push(`- **${item.title}**（${item.year} · ${item.court} · ${item.caseNumber}）${item.url ? ` · [原文](${item.url})` : ""}`);
      lines.push(`  - ${item.summary}`);
    }
    lines.push("");
  }

  if (node.content?.historicalEvolution && node.content.historicalEvolution.length > 0) {
    lines.push("## 历史沿革");
    for (const item of node.content.historicalEvolution) {
      lines.push(`- **${item.year}** — ${item.event}`);
    }
    lines.push("");
  }

  if (note.note.trim().length > 0) {
    lines.push("## 我的笔记");
    lines.push(note.note);
    lines.push("");
  }

  lines.push("---");
  lines.push(`*来自中国法学宇宙 · 节点 ID: \`${node.id}\` · 生成时间: ${new Date().toISOString().slice(0, 10)}*`);

  return lines.join("\n");
}

export function downloadMarkdownForNode(nodeId: string): void {
  if (typeof window === "undefined") return;
  const markdown = buildMarkdownForNode(nodeId);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const node = getLegalUniverseNodeById(nodeId);
  const safeName = (node?.title ?? nodeId).replace(/[\\/:*?"<>|]/g, "_");
  a.download = `法脉-${safeName}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
