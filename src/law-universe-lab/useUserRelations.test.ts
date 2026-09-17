/**
 * useUserRelations 单元测试。
 */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { __resetDBForTests, putExtraction, putSourceDoc } from "./legalUniverseUserDb";
import type { UserExtraction, UserSourceDoc } from "./userDataTypes";
import { useUserRelations } from "./useUserRelations";

const baseDoc = (overrides: Partial<UserSourceDoc> = {}): UserSourceDoc => ({
  id: "doc1",
  fileName: "a.md",
  mimeType: "text/markdown",
  sizeBytes: 1,
  content: "",
  uploadedAt: 1,
  status: "extracted",
  ...overrides
});

const baseExt = (overrides: Partial<UserExtraction> = {}): UserExtraction => ({
  id: "ext1",
  sourceDocId: "doc1",
  status: "succeeded",
  startedAt: 1,
  concepts: [],
  relations: [],
  reviewed: false,
  ...overrides
});

describe("useUserRelations", () => {
  beforeEach(async () => {
    await __resetDBForTests();
  });

  it("初始空数组", async () => {
    const { result } = renderHook(() => useUserRelations());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.relations).toEqual([]);
  });

  it("按 extraction.status === 'succeeded' 过滤", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(
      baseExt({
        relations: [{ source: "A", target: "B", type: "依据", strength: 80, citation: "" }]
      })
    );
    await putExtraction(
      baseExt({
        id: "ext2",
        status: "failed",
        relations: [{ source: "X", target: "Y", type: "依据", strength: 50, citation: "" }]
      })
    );
    const { result } = renderHook(() => useUserRelations());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.relations).toHaveLength(1);
    expect(result.current.relations[0].source).toBe("A");
  });

  it("空 source / target 被过滤", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(
      baseExt({
        relations: [
          { source: "", target: "B", type: "依据", strength: 50, citation: "" },
          { source: "A", target: "", type: "依据", strength: 50, citation: "" },
          { source: "A", target: "B", type: "依据", strength: 50, citation: "" }
        ]
      })
    );
    const { result } = renderHook(() => useUserRelations());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.relations).toHaveLength(1);
  });

  it("自环（source === target）被过滤", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(
      baseExt({
        relations: [
          { source: "A", target: "A", type: "依据", strength: 50, citation: "" },
          { source: "A", target: "B", type: "依据", strength: 50, citation: "" }
        ]
      })
    );
    const { result } = renderHook(() => useUserRelations());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.relations).toHaveLength(1);
  });

  it("strength clamp 到 1-100", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(
      baseExt({
        relations: [
          { source: "A", target: "B", type: "依据", strength: -10, citation: "" },
          { source: "C", target: "D", type: "依据", strength: 200, citation: "" }
        ]
      })
    );
    const { result } = renderHook(() => useUserRelations());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.relations[0].strength).toBe(1);
    expect(result.current.relations[1].strength).toBe(100);
  });

  it("id 稳定且包含 extractionId 和 index", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(
      baseExt({
        id: "ext-abc",
        relations: [
          { source: "A", target: "B", type: "依据", strength: 80, citation: "" },
          { source: "C", target: "D", type: "依据", strength: 80, citation: "" }
        ]
      })
    );
    const { result } = renderHook(() => useUserRelations());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.relations[0].id).toBe("ext-abc::0");
    expect(result.current.relations[1].id).toBe("ext-abc::1");
  });

  it("fileName 兜底'已删除的源资料'", async () => {
    await putExtraction(
      baseExt({
        sourceDocId: "missing-doc",
        relations: [{ source: "A", target: "B", type: "依据", strength: 50, citation: "" }]
      })
    );
    const { result } = renderHook(() => useUserRelations());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.relations[0].fileName).toBe("已删除的源资料");
  });
  it("preserves cross-document ids and same-title edges between distinct concepts", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(baseExt({ relations: [
      { source: "合同", target: "合同", sourceConceptId: "old::0", targetConceptId: "ext1::0", type: "解释", strength: 70, citation: "比较" },
      { source: "旧名", target: "新名", sourceConceptId: "old::0", targetConceptId: "old::0", type: "解释", strength: 70, citation: "自环" }
    ] }));
    const { result } = renderHook(() => useUserRelations());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.relations).toHaveLength(1);
    expect(result.current.relations[0]).toMatchObject({ sourceConceptId: "old::0", targetConceptId: "ext1::0", source: "合同", target: "合同" });
  });

});
