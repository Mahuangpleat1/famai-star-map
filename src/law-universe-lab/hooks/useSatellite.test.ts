import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSatellite } from "./useSatellite";
import type { UserExtraction } from "../userDataTypes";
import type { ReviewableSatellite } from "../useUserSatellites";

const fakeSatellite: ReviewableSatellite = {
  id: "ext-1::0",
  extractionId: "ext-1",
  sourceDocId: "doc-1",
  fileName: "doc.txt",
  concept: {
    title: "善意取得",
    type: "principle",
    system: "civil",
    importance: 80,
    summary: "s",
    keyPoints: []
  },
  reviewed: false,
  startedAt: 1,
  displaySystem: "civil",
  confidence: 70
};

const fakeExtraction: UserExtraction = {
  id: "ext-1",
  sourceDocId: "doc-1",
  status: "succeeded",
  startedAt: 1,
  completedAt: 2,
  concepts: [],
  relations: [],
  reviewed: false
};

describe("useSatellite", () => {
  it("starts with both null", () => {
    const { result } = renderHook(() => useSatellite());
    expect(result.current.selectedSatellite).toBeNull();
    expect(result.current.satelliteExtraction).toBeNull();
  });
  it("setSelectedSatellite and setSatelliteExtraction update state", () => {
    const { result } = renderHook(() => useSatellite());
    act(() => {
      result.current.setSelectedSatellite(fakeSatellite);
      result.current.setSatelliteExtraction(fakeExtraction);
    });
    expect(result.current.selectedSatellite).toBe(fakeSatellite);
    expect(result.current.satelliteExtraction).toBe(fakeExtraction);
  });
});
