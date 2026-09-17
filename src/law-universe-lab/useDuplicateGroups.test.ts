/**
 * useDuplicateGroups 单元测试。
 */

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDuplicateGroups } from "./useDuplicateGroups";
import type { ReviewableSatellite } from "./useUserSatellites";

const sat = (overrides: Partial<ReviewableSatellite> = {}): ReviewableSatellite => ({
  id: "ext1::0",
  extractionId: "ext1",
  sourceDocId: "doc1",
  fileName: "a.md",
  concept: { title: "善意取得", type: "principle", system: "civil", importance: 80, summary: "", keyPoints: [] },
  reviewed: false,
  startedAt: 1,
  displaySystem: "civil",
  confidence: 50,
  ...overrides
});

const runHook = (sats: ReviewableSatellite[]) => renderHook(({ s }) => useDuplicateGroups(s), { initialProps: { s: sats } }).result.current;

describe("useDuplicateGroups", () => {
  it("无重复返回空数组", () => {
    const result = runHook([sat({ id: "ext1::0", extractionId: "ext1", concept: { ...sat().concept, title: "善意取得" } })]);
    expect(result).toEqual([]);
  });

  it("同 title + system → 一组", () => {
    const result = runHook([
      sat({ id: "ext1::0", extractionId: "ext1", concept: { ...sat().concept, title: "善意取得" } }),
      sat({ id: "ext2::0", extractionId: "ext2", concept: { ...sat().concept, title: "善意取得" } })
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].satellites).toHaveLength(2);
  });

  it("不同 system 不算重复", () => {
    const result = runHook([
      sat({ id: "ext1::0", extractionId: "ext1", concept: { ...sat().concept, title: "善意取得" }, displaySystem: "civil" }),
      sat({ id: "ext2::0", extractionId: "ext2", concept: { ...sat().concept, title: "善意取得" }, displaySystem: "criminal" })
    ]);
    expect(result).toEqual([]);
  });

  it("归一化：去空格 / 大小写 / 尾部标点", () => {
    const result = runHook([
      sat({ id: "ext1::0", extractionId: "ext1", concept: { ...sat().concept, title: "善意取得" } }),
      sat({ id: "ext2::0", extractionId: "ext2", concept: { ...sat().concept, title: "  善意 取得  " } }),
      sat({ id: "ext3::0", extractionId: "ext3", concept: { ...sat().concept, title: "善意取得。" } }),
      sat({ id: "ext4::0", extractionId: "ext4", concept: { ...sat().concept, title: "善意取得" } })
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].satellites).toHaveLength(4);
  });

  it("主 satellite 是最早 extractionId + 最小 conceptIndex", () => {
    const result = runHook([
      sat({ id: "ext-zzz::0", extractionId: "ext-zzz", concept: { ...sat().concept, title: "善意取得" } }),
      sat({ id: "ext-aaa::5", extractionId: "ext-aaa", concept: { ...sat().concept, title: "善意取得" } }),
      sat({ id: "ext-aaa::2", extractionId: "ext-aaa", concept: { ...sat().concept, title: "善意取得" } })
    ]);
    expect(result[0].primary.id).toBe("ext-aaa::2");
  });

  it("displayTitle 选最长", () => {
    const result = runHook([
      sat({ id: "ext1::0", extractionId: "ext1", concept: { ...sat().concept, title: "善意取得" } }),
      sat({ id: "ext2::0", extractionId: "ext2", concept: { ...sat().concept, title: "  善意取得  " } })
    ]);
    expect(result[0].displayTitle).toBe("  善意取得  ");
  });

  it("按重复数倒序", () => {
    const result = runHook([
      sat({ id: "ext1::0", extractionId: "ext1", concept: { ...sat().concept, title: "A" } }),
      sat({ id: "ext2::0", extractionId: "ext2", concept: { ...sat().concept, title: "A" } }),
      sat({ id: "ext3::0", extractionId: "ext3", concept: { ...sat().concept, title: "B" } }),
      sat({ id: "ext4::0", extractionId: "ext4", concept: { ...sat().concept, title: "B" } }),
      sat({ id: "ext5::0", extractionId: "ext5", concept: { ...sat().concept, title: "B" } })
    ]);
    expect(result[0].displayTitle).toBe("B"); // 3 重复
    expect(result[1].displayTitle).toBe("A"); // 2 重复
  });
});
