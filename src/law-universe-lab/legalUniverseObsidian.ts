/**
 * Obsidian Markdown 生成器 —— Phase 4 F.1。
 *
 * 纯函数: input extractions + sourceDocs → output 1 .md per concept + index.md。
 * 文件结构: {system}/{title}.md + index.md。
 * Frontmatter: id / type / system / importance / confidence / createdAt / sourceDocId。
 * Relations: [[wikilink]] 引用其他 concept title。
 */

import type { UserExtraction, UserSourceDoc, UserExtractedConcept, UserExtractedRelation } from "./userDataTypes";

export interface ObsidianFile {
  filename: string;
  content: string;
}

export interface GenerateOptions {
  groupBySystem?: boolean;
  generateIndex?: boolean;
}

function filenameSafe(s: string): string {
  return s.replace(/[/\\:*?"<>|]/g, "_");
}

function renderFrontmatter(c: UserExtractedConcept, extId: string, sourceDocId: string): string {
  const lines = [
    "---",
    `id: ${extId}::${c.title}`,
    `type: ${c.type}`,
    `system: ${c.system}`,
    `importance: ${c.importance}`,
    ...(typeof c.confidence === "number" ? [`confidence: ${c.confidence}`] : []),
    `createdAt: ${new Date().toISOString()}`,
    `sourceDocId: ${sourceDocId}`,
    "---"
  ];
  return lines.join("\n") + "\n";
}

function renderRelationsSection(relations: UserExtractedRelation[], conceptTitle: string, allTitles: Set<string>): string {
  const lines: string[] = ["## Relations", ""];
  let hasAny = false;
  for (const r of relations) {
    if (r.source !== conceptTitle && r.target !== conceptTitle) continue;
    const other = r.source === conceptTitle ? r.target : r.source;
    if (!allTitles.has(other)) continue;
    lines.push(`- [[${other}]] (${r.type})`);
    hasAny = true;
  }
  if (!hasAny) lines.push("_No relations_");
  return lines.join("\n") + "\n";
}

function renderConcept(c: UserExtractedConcept, ext: UserExtraction, allTitles: Set<string>, sourceDocs: Map<string, UserSourceDoc>, groupBySystem: boolean): ObsidianFile {
  const safeTitle = filenameSafe(c.title);
  const filename = groupBySystem ? `${c.system}/${safeTitle}.md` : `${safeTitle}.md`;
  const body = [
    renderFrontmatter(c, ext.id, ext.sourceDocId),
    "",
    `# ${c.title}`,
    "",
    `**System**: ${c.system}`,
    `**Importance**: ${c.importance}`,
    "",
    "## Summary",
    "",
    c.summary || "_No summary_",
    "",
    "## Key Points",
    "",
    ...(c.keyPoints && c.keyPoints.length > 0 ? c.keyPoints.map((p) => `- ${p}`) : ["_No key points_"]),
    "",
    renderRelationsSection(ext.relations ?? [], c.title, allTitles).trimEnd(),
    "",
    "## Source",
    "",
    `extracted from: ${sourceDocs.get(ext.sourceDocId)?.fileName ?? ext.sourceDocId}`
  ].join("\n");
  return { filename, content: body };
}

function renderIndex(exts: UserExtraction[]): ObsidianFile {
  const lines: string[] = ["# 法脉星图导出", "", "## Concepts", ""];
  for (const ext of exts) {
    for (const c of ext.concepts ?? []) {
      const safeTitle = filenameSafe(c.title);
      const summary = (c.summary ?? "").slice(0, 60);
      lines.push(`- [[${c.system}/${safeTitle}|${c.title}]] — ${summary}…`);
    }
  }
  return { filename: "index.md", content: lines.join("\n") + "\n" };
}

export function generateMarkdownFiles(
  extractions: UserExtraction[],
  sourceDocs: Map<string, UserSourceDoc> = new Map(),
  options: GenerateOptions = {}
): ObsidianFile[] {
  const { groupBySystem = true, generateIndex = true } = options;
  if (extractions.length === 0) return [];
  const allTitles = new Set<string>();
  for (const ext of extractions) for (const c of ext.concepts ?? []) allTitles.add(c.title);

  const files: ObsidianFile[] = [];
  for (const ext of extractions) {
    for (const c of ext.concepts ?? []) {
      files.push(renderConcept(c, ext, allTitles, sourceDocs, groupBySystem));
    }
  }
  if (generateIndex) files.push(renderIndex(extractions));
  return files;
}
