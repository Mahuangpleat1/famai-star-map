import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePath } from "./usePath";

describe("usePath", () => {
  it("initial state is idle / null / null", () => {
    const { result } = renderHook(() => usePath());
    expect(result.current.pathMode).toBe("idle");
    expect(result.current.pathEndpoints).toBeNull();
    expect(result.current.activePathId).toBeNull();
  });
  it("startPathFrom sets pathMode to awaiting-to", () => {
    const { result } = renderHook(() => usePath());
    act(() => result.current.startPathFrom("node-a"));
    expect(result.current.pathMode).toBe("awaiting-to");
  });
  it("setPathEndpoints / setActivePathId update state", () => {
    const { result } = renderHook(() => usePath());
    act(() => {
      result.current.setPathEndpoints({ from: "a", to: "b" });
      result.current.setActivePathId("path-1");
    });
    expect(result.current.pathEndpoints).toEqual({ from: "a", to: "b" });
    expect(result.current.activePathId).toBe("path-1");
  });
});
