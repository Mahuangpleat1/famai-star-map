/**
 * Obsidian vault 同步 —— Phase 4 F.2。
 *
 * 3 个纯函数:
 *   - scanVaultFiles: 递归扫 vault 目录
 *   - parseVaultMarkdown: 反向解析 F.1 生成的 .md
 *   - computeSyncPlan: 3-way 比较 local vs vault vs mappings
 *
 * 所有函数无副作用,可在 vitest 直接测试。
 */

import type { UserExtractedConcept, UserExtractedRelation, VaultMapping } from "./userDataTypes";

/** 扫描 vault 目录得到的单个 .md 文件元数据。 */
export interface VaultFile {
  /** vault 内的相对路径, e.g. "civil/合同.md"。 */
  fileName: string;
  /** .md 全文。 */
  content: string;
  /** 文件最后修改时间戳 (ms),来自 File.lastModified。 */
  lastModified: number;
  /** File System Access API 句柄 —— 用于 hook 层重写或删除。 */
  fileHandle: FileSystemFileHandle;
}

/** parseVaultMarkdown 反向解析得到的一个概念。 */
export interface ParsedVaultConcept {
  title: string;
  type: UserExtractedConcept["type"];
  system: UserExtractedConcept["system"];
  importance: number;
  confidence?: number;
  summary: string;
  keyPoints: string[];
  relations: UserExtractedRelation[];
}

/** 3-way 比较结果。 */
export interface SyncPlan {
  /** 本地新 / 改的,需导出到 vault。 */
  toExport: ParsedVaultConcept[];
  /** vault 新 / 改的,需回流到本地。 */
  toImport: ParsedVaultConcept[];
  /** 本地 & vault 同时改且 hash 不一致 —— 当前 plan 简化,未实现。 */
  conflicts: { conceptId: string; fileName: string; reason: "both-changed" }[];
}

/** 简单字符串 hash (FNV-1a 32-bit) —— 用于跳过未变更的内容。 */
export function contentHash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

/** 递归扫 vault 目录,读所有 .md 文件 —— File System Access API。
 *  TypeScript 5.7 lib 不含 entries() (更新的 API),用 cast 桥接。 */
export async function scanVaultFiles(
  dirHandle: FileSystemDirectoryHandle,
  prefix: string = ""
): Promise<VaultFile[]> {
  const results: VaultFile[] = [];
  // FileSystemDirectoryHandle.entries() 在更新的 DOM lib 中可用,这里用结构化 cast 兼容老 lib
  const iterable = (dirHandle as unknown as {
    entries: () => AsyncIterableIterator<[string, FileSystemHandle]>;
  }).entries();
  for await (const [name, handle] of iterable) {
    const path = prefix ? `${prefix}/${name}` : name;
    if (handle.kind === "directory") {
      const sub = await scanVaultFiles(handle as FileSystemDirectoryHandle, path);
      results.push(...sub);
    } else if (handle.kind === "file" && name.endsWith(".md")) {
      const file = handle as FileSystemFileHandle;
      const fileObj = await file.getFile();
      const content = await fileObj.text();
      results.push({
        fileName: path,
        content,
        lastModified: fileObj.lastModified,
        fileHandle: file
      });
    }
  }
  return results;
}

/** 解析 F.1 生成的 .md → 概念数据。格式不符返回 null。 */
export function parseVaultMarkdown(content: string): ParsedVaultConcept | null {
  if (!content.trim()) return null;
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return null;
  const fm = fmMatch[1];
  const body = fmMatch[2];

  // 解析 frontmatter YAML (key: value 行, value 可能 quoted)
  const meta: Record<string, string> = {};
  for (const line of fm.split("\n")) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  if (!meta.id || !meta.system) return null;

  // 解析 body
  const titleMatch = body.match(/^# (.+)$/m);
  if (!titleMatch) return null;
  const title = titleMatch[1].trim();

  const summaryMatch = body.match(/## Summary\s*\n+([\s\S]*?)(?=\n## |\n*$)/);
  const summary = (summaryMatch?.[1] ?? "").trim() || "_No summary_";

  const keyPointsMatch = body.match(/## Key Points\s*\n+([\s\S]*?)(?=\n## |\n*$)/);
  const keyPoints: string[] = [];
  if (keyPointsMatch) {
    for (const line of keyPointsMatch[1].split("\n")) {
      const m = line.match(/^- (.+)$/);
      if (m) keyPoints.push(m[1].trim());
    }
  }

  const relations: UserExtractedRelation[] = [];
  const relMatch = body.match(/## Relations\s*\n+([\s\S]*?)(?=\n## |\n*$)/);
  if (relMatch) {
    for (const line of relMatch[1].split("\n")) {
      const m = line.match(/^- \[\[([^\]]+)\]\]\s*\((\S+)\)/);
      if (m) {
        relations.push({
          source: title,
          target: m[1],
          type: m[2] as UserExtractedRelation["type"],
          strength: 70,
          citation: ""
        });
      }
    }
  }

  return {
    title,
    type: (meta.type ?? "concept") as UserExtractedConcept["type"],
    system: meta.system as UserExtractedConcept["system"],
    importance: Number(meta.importance ?? 50),
    ...(meta.confidence ? { confidence: Number(meta.confidence) } : {}),
    summary,
    keyPoints,
    relations
  };
}

/** 3-way 比较 local concepts vs vault files vs mappings → SyncPlan。
 *  `now` 保留给未来冲突检测 (当前 plan 简化版未使用)。 */
export function computeSyncPlan(
  localConcepts: UserExtractedConcept[],
  vaultFiles: VaultFile[],
  mappings: VaultMapping[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  now: number = Date.now()
): SyncPlan {
  const toExport: ParsedVaultConcept[] = [];
  const toImport: ParsedVaultConcept[] = [];
  const conflicts: SyncPlan["conflicts"] = [];

  const mappingByFile = new Map(mappings.map((m) => [m.fileName, m]));

  // 1. 本地 concepts → 判断是否需要 export
  for (const c of localConcepts) {
    const fileName = `${c.system}/${c.title.replace(/[/\\:*?"<>|]/g, "_")}.md`;
    const m = mappingByFile.get(fileName);
    if (!m) {
      // 全新概念,从未导出过
      toExport.push({ ...c, relations: [] });
      continue;
    }
    // hash 比对:本地内容与上次导出一致则跳过
    const localHash = contentHash(JSON.stringify({ title: c.title, summary: c.summary, importance: c.importance }));
    if (localHash !== m.contentHash) {
      toExport.push({ ...c, relations: [] });
    }
  }

  // 2. vault files → 判断是否需要 import
  for (const vf of vaultFiles) {
    const parsed = parseVaultMarkdown(vf.content);
    if (!parsed) continue;
    const m = mappingByFile.get(vf.fileName);
    if (!m) {
      // 新文件,从未见过
      toImport.push(parsed);
      continue;
    }
    // mtime 比对:vault 文件被外部修改过
    if (vf.lastModified > m.lastSyncedAt) {
      toImport.push(parsed);
    }
  }

  return { toExport, toImport, conflicts };
}
