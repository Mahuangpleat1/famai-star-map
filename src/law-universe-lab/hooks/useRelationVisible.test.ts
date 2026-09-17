import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useRelationVisible } from "./useRelationVisible";

describe("useRelationVisible", () => {
  it("defaults to visible true", () => {
    const { result } = renderHook(() => useRelationVisible());
    expect(result.current.relationVisible).toBe(true);
  });
  it("toggleRelations flips the flag", () => {
    const { result } = renderHook(() => useRelationVisible());
    act(() => result.current.toggleRelations());
    expect(result.current.relationVisible).toBe(false);
  });
});
