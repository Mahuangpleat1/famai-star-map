import { describe, expect, it } from "vitest";
import { generateMarkdownFiles } from "./legalUniverseObsidian";
import type { UserExtraction, UserSourceDoc, UserExtractedConcept, UserExtractedRelation } from "./userDataTypes";

function mkConcept(overrides: Partial<UserExtractedConcept> & { title: string; system: UserExtractedConcept["system"]; importance?: number }): UserExtractedConcept {
  return {
    type: "principle",
    importance: overrides.importance ?? 50,
    summary: `${overrides.title} 的摘要。`,
    keyPoints: ["要点 1", "要点 2"],
    confidence: 80,
    ...overrides
  };
}

function mkRelation(source: string, target: string, type: string = "依据"): UserExtractedRelation {
  return { source, target, type: type as UserExtractedRelation["type"], strength: 70, citation: "出处" };
}

function mkExtraction(id: string, sourceDocId: string, concepts: UserExtractedConcept[], relations: UserExtractedRelation[] = []): UserExtraction {
  return {
    id, sourceDocId,
    status: "succeeded", startedAt: 0, completedAt: 0, reviewed: true,
    concepts, relations
  };
}

describe("generateMarkdownFiles", () => {
  it("empty extractions returns []", () => {
    expect(generateMarkdownFiles([], new Map())).toEqual([]);
  });

  it("1 extraction with 3 concepts → 3 .md files", () => {
    const ext = mkExtraction("e1", "doc1", [
      mkConcept({ title: "合同", system: "civil" }),
      mkConcept({ title: "侵权责任", system: "civil" }),
      mkConcept({ title: "正当防卫", system: "criminal" })
    ]);
    const files = generateMarkdownFiles([ext], new Map());
    expect(files).toHaveLength(4); // 3 concepts + 1 index.md
  });

  it("concept .md starts with --- frontmatter", () => {
    const ext = mkExtraction("e1", "doc1", [mkConcept({ title: "合同", system: "civil", importance: 75 })]);
    const files = generateMarkdownFiles([ext], new Map());
    const contract = files.find((f) => f.filename.includes("合同"));
    expect(contract?.content).toMatch(/^---\n/);
    expect(contract?.content).toMatch(/importance: 75/);
    expect(contract?.content).toMatch(/system: civil/);
  });

  it("concept .md has # title heading", () => {
    const ext = mkExtraction("e1", "doc1", [mkConcept({ title: "合同", system: "civil" })]);
    const files = generateMarkdownFiles([ext], new Map());
    const contract = files.find((f) => f.filename.includes("合同"));
    expect(contract?.content).toMatch(/\n# 合同\n/);
  });

  it("concept .md has Summary, Key Points, Relations sections", () => {
    const ext = mkExtraction("e1", "doc1", [mkConcept({ title: "合同", system: "civil" })]);
    const files = generateMarkdownFiles([ext], new Map());
    const contract = files.find((f) => f.filename.includes("合同"));
    expect(contract?.content).toMatch(/## Summary/);
    expect(contract?.content).toMatch(/## Key Points/);
    expect(contract?.content).toMatch(/## Relations/);
  });

  it("relations use [[wikilink]] to other concept titles", () => {
    const ext = mkExtraction("e1", "doc1", [
      mkConcept({ title: "合同", system: "civil" }),
      mkConcept({ title: "侵权责任", system: "civil" })
    ], [mkRelation("合同", "侵权责任", "依据")]);
    const files = generateMarkdownFiles([ext], new Map());
    const contract = files.find((f) => f.filename.includes("合同"));
    expect(contract?.content).toMatch(/\[\[侵权责任\]\]/);
  });

  it("files grouped by system in directory", () => {
    const ext = mkExtraction("e1", "doc1", [
      mkConcept({ title: "合同", system: "civil" }),
      mkConcept({ title: "正当防卫", system: "criminal" })
    ]);
    const files = generateMarkdownFiles([ext], new Map());
    expect(files.some((f) => f.filename.startsWith("civil/"))).toBe(true);
    expect(files.some((f) => f.filename.startsWith("criminal/"))).toBe(true);
  });

  it("index.md lists all concepts", () => {
    const ext = mkExtraction("e1", "doc1", [
      mkConcept({ title: "合同", system: "civil" }),
      mkConcept({ title: "侵权责任", system: "civil" })
    ]);
    const files = generateMarkdownFiles([ext], new Map());
    const index = files.find((f) => f.filename === "index.md");
    expect(index).toBeDefined();
    expect(index?.content).toMatch(/合同/);
    expect(index?.content).toMatch(/侵权责任/);
  });

  it("multiple extractions → all concepts combined", () => {
    const ext1 = mkExtraction("e1", "doc1", [mkConcept({ title: "A", system: "civil" })]);
    const ext2 = mkExtraction("e2", "doc2", [mkConcept({ title: "B", system: "criminal" })]);
    const files = generateMarkdownFiles([ext1, ext2], new Map());
    expect(files.some((f) => f.filename.includes("A"))).toBe(true);
    expect(files.some((f) => f.filename.includes("B"))).toBe(true);
  });

  it("sourceDoc filename embedded as Source", () => {
    const ext = mkExtraction("e1", "doc1", [mkConcept({ title: "合同", system: "civil" })]);
    const docs = new Map<string, UserSourceDoc>([["doc1", { id: "doc1", fileName: "民法典讲义.txt", mimeType: "text/plain", sizeBytes: 100, content: "", uploadedAt: 0, status: "extracted" }]]);
    const files = generateMarkdownFiles([ext], docs);
    const contract = files.find((f) => f.filename.includes("合同"));
    expect(contract?.content).toMatch(/民法典讲义\.txt/);
  });

  it("filename uses .md extension", () => {
    const ext = mkExtraction("e1", "doc1", [mkConcept({ title: "合同", system: "civil" })]);
    const files = generateMarkdownFiles([ext], new Map());
    expect(files.every((f) => f.filename.endsWith(".md"))).toBe(true);
  });

  it("special chars in title escaped in filename", () => {
    const ext = mkExtraction("e1", "doc1", [mkConcept({ title: "C++ 编程", system: "civil" })]);
    const files = generateMarkdownFiles([ext], new Map());
    const cpp = files.find((f) => f.content.includes("C++"));
    expect(cpp).toBeDefined();
  });
});
