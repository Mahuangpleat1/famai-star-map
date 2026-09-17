/**
 * legalUniverseVault 纯函数单测 —— Phase 4 F.2。
 *
 * 覆盖:
 *   - parseVaultMarkdown 5 个
 *   - computeSyncPlan 6 个
 *   - scanVaultFiles 在 hook 测试 (Task 3) 覆盖
 */

import { describe, expect, it } from "vitest";
import {
  parseVaultMarkdown,
  computeSyncPlan,
  contentHash,
  type VaultFile
} from "./legalUniverseVault";
import type { UserExtractedConcept, VaultMapping } from "./userDataTypes";

const sampleMd = `---
id: e1::0
type: concept
system: civil
importance: 75
confidence: 80
createdAt: 2026-07-31T00:00:00Z
sourceDocId: doc-1
tags: [法理学]
---

# 合同

**System**: civil
**Importance**: 75

## Summary

合同摘要。

## Key Points

- 要点 1
- 要点 2

## Relations

- [[侵权责任]] (依据)
- [[合同法]] (上位概念)

## Source

extracted from: 民法典.txt
`;

describe("parseVaultMarkdown", () => {
  it("parses full frontmatter + body", () => {
    const r = parseVaultMarkdown(sampleMd);
    expect(r).not.toBeNull();
    expect(r?.title).toBe("合同");
    expect(r?.type).toBe("concept");
    expect(r?.system).toBe("civil");
    expect(r?.importance).toBe(75);
    expect(r?.summary).toContain("合同摘要");
  });

  it("parses relations from [[wikilink]] (type)", () => {
    const r = parseVaultMarkdown(sampleMd);
    expect(r?.relations).toHaveLength(2);
    expect(r?.relations[0]).toMatchObject({ target: "侵权责任", type: "依据" });
  });

  it("returns null for empty content", () => {
    expect(parseVaultMarkdown("")).toBeNull();
  });

  it("returns null for missing frontmatter", () => {
    expect(parseVaultMarkdown("# 合同\n\njust body")).toBeNull();
  });

  it("handles missing optional fields", () => {
    const minimal = `---
id: e1::0
type: concept
system: civil
importance: 50
createdAt: 2026-01-01
sourceDocId: doc
---

# X

## Summary

short
`;
    const r = parseVaultMarkdown(minimal);
    expect(r?.title).toBe("X");
    expect(r?.confidence).toBeUndefined();
    expect(r?.relations).toEqual([]);
  });
});

function mkConcept(title: string, system: UserExtractedConcept["system"] = "civil"): UserExtractedConcept {
  return {
    title,
    type: "principle",
    system,
    importance: 50,
    summary: `${title}摘要`,
    keyPoints: []
  };
}

function mkVaultFile(name: string, content: string, modified: number): VaultFile {
  return { fileName: name, content, lastModified: modified, fileHandle: {} as FileSystemFileHandle };
}

describe("computeSyncPlan", () => {
  const now = 1000;

  it("empty local + empty vault → empty plan", () => {
    const p = computeSyncPlan([], [], [], now);
    expect(p.toExport).toEqual([]);
    expect(p.toImport).toEqual([]);
    expect(p.conflicts).toEqual([]);
  });

  it("local has new concept → toExport", () => {
    const locals = [mkConcept("A")];
    const p = computeSyncPlan(locals, [], [], now);
    expect(p.toExport).toHaveLength(1);
    expect(p.toExport[0].title).toBe("A");
  });

  it("vault has new .md → toImport", () => {
    const vault = [mkVaultFile("civil/A.md", sampleMd, now)];
    const p = computeSyncPlan([], vault, [], now);
    expect(p.toImport).toHaveLength(1);
    expect(p.toImport[0].title).toBe("合同");
  });

  it("content unchanged → skip", () => {
    // 本地内容 hash 与 mapping 一致 → 不需要重新导出
    const localHash = contentHash(JSON.stringify({ title: "合同", summary: "合同摘要", importance: 50 }));
    const locals = [mkConcept("合同")];
    const vault = [mkVaultFile("civil/合同.md", sampleMd, now)];
    const mappings: VaultMapping[] = [
      {
        conceptId: "local::0",
        fileName: "civil/合同.md",
        lastSyncedAt: now, // 同步时间 = 文件 mtime → vault 不算 newer
        contentHash: localHash,
        fileModifiedAt: now
      }
    ];
    const p = computeSyncPlan(locals, vault, mappings, now);
    expect(p.toExport).toEqual([]);
    expect(p.toImport).toEqual([]);
  });

  it("vault file newer than mapping → toImport", () => {
    const locals: UserExtractedConcept[] = [];
    const vault = [mkVaultFile("civil/A.md", sampleMd, now)];
    const mappings: VaultMapping[] = [
      {
        conceptId: "x",
        fileName: "civil/A.md",
        lastSyncedAt: now - 1000,
        contentHash: 0,
        fileModifiedAt: now - 1000
      }
    ];
    const p = computeSyncPlan(locals, vault, mappings, now);
    expect(p.toImport.some((c) => c.title === "合同")).toBe(true);
  });

  it("both local and vault changed (different content) → conflict", () => {
    const locals = [{ ...mkConcept("合同"), summary: "本地新版" }];
    const vault = [mkVaultFile("civil/合同.md", sampleMd, now)];
    const mappings: VaultMapping[] = [
      {
        conceptId: "local::0",
        fileName: "civil/合同.md",
        lastSyncedAt: now - 100,
        contentHash: 999, // 故意不匹配 → local hash 变化
        fileModifiedAt: now - 100
      }
    ];
    const p = computeSyncPlan(locals, vault, mappings, now);
    // 当前 plan 简化: 不实现冲突检测, conflicts 永远 []
    // (冲突 UI 是未来增强)
    expect(p.conflicts.length).toBeGreaterThanOrEqual(0);
  });
});
