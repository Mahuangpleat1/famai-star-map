import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFilters, type LegalUniverseFilterState } from "./useFilters";
import type { LegalUniverseUrlState } from "../legalUniverseUrlState";

const emptyUrl: LegalUniverseUrlState = {
  selectedNodeId: null,
  zoomLevel: null,
  nodeTypes: null,
  levels: null,
  sourceCategories: null,
  path: null
};

describe("useFilters", () => {
  it("starts from initialUrlState with empty sceneFilter", () => {
    const { result } = renderHook(() => useFilters(emptyUrl));
    expect(result.current.filterState.nodeTypes).toBeNull();
    expect(result.current.filterState.levels).toBeNull();
    expect(result.current.filterState.sourceCategories).toBeNull();
    expect(result.current.sceneFilter.nodeTypes).toBeNull();
    expect(result.current.sceneFilter.levels).toBeNull();
    expect(result.current.sceneFilter.sourceCategories).toBeNull();
  });

  it("handleFilterChange updates state and sceneFilter (array -> Set)", () => {
    const { result } = renderHook(() => useFilters(emptyUrl));
    const next: LegalUniverseFilterState = {
      nodeTypes: ["law", "field"],
      levels: [1, 2],
      sourceCategories: ["official"]
    };
    act(() => result.current.handleFilterChange(next));
    expect(result.current.filterState).toEqual(next);
    expect(result.current.sceneFilter.nodeTypes).toEqual(new Set(["law", "field"]));
    expect(result.current.sceneFilter.levels).toEqual(new Set([1, 2]));
    expect(result.current.sceneFilter.sourceCategories).toEqual(new Set(["official"]));
  });

  it("handleFilterClear resets all to null", () => {
    const seedUrl: LegalUniverseUrlState = {
      ...emptyUrl,
      nodeTypes: ["law"],
      levels: [1],
      sourceCategories: ["official"]
    };
    const { result } = renderHook(() => useFilters(seedUrl));
    act(() => result.current.handleFilterClear());
    expect(result.current.filterState.nodeTypes).toBeNull();
    expect(result.current.filterState.levels).toBeNull();
    expect(result.current.filterState.sourceCategories).toBeNull();
  });
});
