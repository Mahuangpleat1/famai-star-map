import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMistakes } from "./useMistakes";

describe("useMistakes", () => {
  it("starts at 0", () => {
    const { result } = renderHook(() => useMistakes());
    expect(result.current.mistakesVersion).toBe(0);
  });
  it("bumpMistakes increments", () => {
    const { result } = renderHook(() => useMistakes());
    act(() => result.current.bumpMistakes());
    expect(result.current.mistakesVersion).toBe(1);
    act(() => result.current.bumpMistakes());
    expect(result.current.mistakesVersion).toBe(2);
  });
  it("setMistakesVersion can reset to arbitrary value", () => {
    const { result } = renderHook(() => useMistakes());
    act(() => result.current.setMistakesVersion(10));
    expect(result.current.mistakesVersion).toBe(10);
  });
});
