/**
 * useUserSatellites 单元测试。
 * 依赖 fake-indexeddb/auto（在 src/test/setup.ts 引入）。
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { __resetDBForTests, putExtraction, putSourceDoc } from "./legalUniverseUserDb";
import { useUserSatellites } from "./useUserSatellites";
import type { UserExtraction, UserSourceDoc } from "./userDataTypes";

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

const baseExtraction = (overrides: Partial<UserExtraction> = {}): UserExtraction => ({
  id: "ext1",
  sourceDocId: "doc1",
  status: "succeeded",
  startedAt: 1,
  concepts: [],
  relations: [],
  reviewed: false,
  ...overrides
});

describe("useUserSatellites", () => {
  beforeEach(async () => {
    await __resetDBForTests();
  });

  it("初始返回空数组", async () => {
    const { result } = renderHook(() => useUserSatellites());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.satellites).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("按 extraction.status === 'succeeded' 过滤", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(
      baseExtraction({
        concepts: [{ title: "善意取得", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] }]
      })
    );
    await putExtraction(
      baseExtraction({
        id: "ext2",
        status: "failed",
        concepts: [{ title: "无效", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] }]
      })
    );
    await putExtraction(
      baseExtraction({
        id: "ext3",
        status: "running",
        concepts: [{ title: "抽取中", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] }]
      })
    );
    const { result } = renderHook(() => useUserSatellites());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.satellites).toHaveLength(1);
    expect(result.current.satellites[0].concept.title).toBe("善意取得");
  });

  it("空标题概念被过滤", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(
      baseExtraction({
        concepts: [
          { title: "", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] },
          { title: "   ", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] },
          { title: "valid", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] }
        ]
      })
    );
    const { result } = renderHook(() => useUserSatellites());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.satellites).toHaveLength(1);
    expect(result.current.satellites[0].concept.title).toBe("valid");
  });

  it("system: 'new' 走 'unclassified' 虚拟分组", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(
      baseExtraction({
        concepts: [
          { title: "未分类概念", type: "doctrine", system: "new", importance: 50, summary: "", keyPoints: [] },
          { title: "民法概念", type: "principle", system: "civil", importance: 50, summary: "", keyPoints: [] }
        ]
      })
    );
    const { result } = renderHook(() => useUserSatellites());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.satellites).toHaveLength(2);
    const grouped = result.current.satellites.map((s) => s.displaySystem).sort();
    expect(grouped).toEqual(["civil", "unclassified"]);
  });

  it("id 稳定且包含 extractionId 和 index", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(
      baseExtraction({
        id: "ext-abc",
        concepts: [
          { title: "A", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] },
          { title: "B", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] }
        ]
      })
    );
    const { result } = renderHook(() => useUserSatellites());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.satellites[0].id).toBe("ext-abc::0");
    expect(result.current.satellites[1].id).toBe("ext-abc::1");
  });

  it("按 startedAt 倒序稳定排序", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(
      baseExtraction({
        id: "ext-old",
        startedAt: 100,
        concepts: [{ title: "old", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] }]
      })
    );
    await putExtraction(
      baseExtraction({
        id: "ext-new",
        startedAt: 200,
        concepts: [{ title: "new", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] }]
      })
    );
    const { result } = renderHook(() => useUserSatellites());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.satellites[0].extractionId).toBe("ext-new");
    expect(result.current.satellites[1].extractionId).toBe("ext-old");
  });

  it("reload 重新拉取数据", async () => {
    await putSourceDoc(baseDoc());
    const { result } = renderHook(() => useUserSatellites());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.satellites).toHaveLength(0);
    await putExtraction(
      baseExtraction({
        concepts: [{ title: "新加的", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] }]
      })
    );
    await act(async () => {
      await result.current.reload();
    });
    await waitFor(() => expect(result.current.satellites).toHaveLength(1));
  });

  it("已删除 sourceDoc 的 fileName 兜底为'已删除的源资料'", async () => {
    await putExtraction(
      baseExtraction({
        sourceDocId: "missing-doc",
        concepts: [{ title: "孤儿概念", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] }]
      })
    );
    const { result } = renderHook(() => useUserSatellites());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.satellites[0].fileName).toBe("已删除的源资料");
  });

  it("confidence 缺省 fallback 50", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(
      baseExtraction({
        concepts: [{ title: "no confidence", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] }]
      })
    );
    const { result } = renderHook(() => useUserSatellites());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.satellites[0].confidence).toBe(50);
  });

  it("confidence clamp 到 0-100", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(
      baseExtraction({
        concepts: [
          { title: "low", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [], confidence: -5 },
          { title: "high", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [], confidence: 200 },
          { title: "nan", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [], confidence: "abc" as unknown as number }
        ]
      })
    );
    const { result } = renderHook(() => useUserSatellites());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.satellites[0].confidence).toBe(0);
    expect(result.current.satellites[1].confidence).toBe(100);
    expect(result.current.satellites[2].confidence).toBe(50);
  });

  it("confidence 保留合法值", async () => {
    await putSourceDoc(baseDoc());
    await putExtraction(
      baseExtraction({
        concepts: [{ title: "ok", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [], confidence: 73 }]
      })
    );
    const { result } = renderHook(() => useUserSatellites());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.satellites[0].confidence).toBe(73);
  });
  it("preserves stable concept identity after another array item was removed", async () => {
    await putExtraction(baseExtraction({ concepts: [{ id: "ext1::5", title: "保留概念", type: "principle", system: "civil", importance: 50, summary: "", keyPoints: [] }] }));
    const { result } = renderHook(() => useUserSatellites());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.satellites[0].id).toBe("ext1::5");
  });

});
