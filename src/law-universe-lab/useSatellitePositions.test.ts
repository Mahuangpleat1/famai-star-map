import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LegalUniverseDomain } from "./types";
import { useSatellitePositions } from "./useSatellitePositions";
import type { ReviewableSatellite } from "./useUserSatellites";

function mkSat(id: string, displaySystem: LegalUniverseDomain | "new" | "unclassified"): ReviewableSatellite {
  return {
    id,
    extractionId: id.split("::")[0] ?? "ext",
    sourceDocId: "doc1",
    fileName: "test.txt",
    concept: {
      title: id,
      type: "principle",
      // "unclassified" 仅用于 displaySystem 走 fallback 分支;concept.system 走 "new" 即可。
      system: (displaySystem === "unclassified" ? "new" : displaySystem) as LegalUniverseDomain | "new",
      importance: 50,
      summary: "",
      keyPoints: []
    },
    reviewed: false,
    startedAt: 1,
    displaySystem,
    confidence: 50
  };
}

describe("useSatellitePositions", () => {
  it("returns empty map for empty input", () => {
    const { result } = renderHook(() => useSatellitePositions([]));
    expect(result.current.size).toBe(0);
  });

  it("returns one entry per satellite", () => {
    const sats = [mkSat("ext::0", "civil"), mkSat("ext::1", "criminal"), mkSat("ext::2", "civil")];
    const { result } = renderHook(() => useSatellitePositions(sats));
    expect(result.current.size).toBe(3);
  });

  it("is stable across re-renders with same input", () => {
    const sats = [mkSat("ext::0", "civil"), mkSat("ext::1", "criminal")];
    const { result, rerender } = renderHook(({ s }) => useSatellitePositions(s), {
      initialProps: { s: sats }
    });
    const first = result.current.get("ext::0")?.position;
    rerender({ s: sats });
    const second = result.current.get("ext::0")?.position;
    expect(second).toEqual(first);
  });

  it("different ids produce different positions", () => {
    const sats = Array.from({ length: 10 }, (_, i) => mkSat(`ext::${i}`, "civil"));
    const { result } = renderHook(() => useSatellitePositions(sats));
    const positions = new Set<string>();
    for (const sat of sats) {
      const p = result.current.get(sat.id)?.position;
      expect(p).toBeDefined();
      positions.add(p!.join(","));
    }
    // 10 颗位置应该都不重复(基于 hash)
    expect(positions.size).toBe(10);
  });

  it("groups satellites by displaySystem and uses system center", () => {
    const sats = [mkSat("a::0", "civil"), mkSat("a::1", "criminal")];
    const { result } = renderHook(() => useSatellitePositions(sats));
    // unclassified 中心 = [0, 5, 0]
    // civil 中心 = 系统定义; criminal 中心 = 系统定义
    const civilPos = result.current.get("a::0")?.position;
    const criminalPos = result.current.get("a::1")?.position;
    expect(civilPos).toBeDefined();
    expect(criminalPos).toBeDefined();
    // 两个 system 的中心不一样,所以位置肯定不同
    expect(civilPos).not.toEqual(criminalPos);
  });

  it("unclassified uses fallback center [0, 5, 0]", () => {
    const sats = [mkSat("a::0", "unclassified")];
    const { result } = renderHook(() => useSatellitePositions(sats));
    const pos = result.current.get("a::0")?.position;
    expect(pos).toBeDefined();
    // y 应该是 5 + yOffset(±0.4)
    expect(pos![1]).toBeGreaterThanOrEqual(4.6);
    expect(pos![1]).toBeLessThanOrEqual(5.4);
  });

  it("updates when satellite list changes", () => {
    const sats1 = [mkSat("a::0", "civil")];
    const sats2 = [mkSat("a::0", "civil"), mkSat("a::1", "civil")];
    const { result, rerender } = renderHook(({ s }) => useSatellitePositions(s), {
      initialProps: { s: sats1 }
    });
    expect(result.current.size).toBe(1);
    rerender({ s: sats2 });
    expect(result.current.size).toBe(2);
  });
});
