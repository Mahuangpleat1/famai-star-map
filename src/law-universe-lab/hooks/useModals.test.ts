import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useModals } from "./useModals";

describe("useModals", () => {
  it("starts with all modals closed", () => {
    const { result } = renderHook(() => useModals());
    expect(result.current.searchOpen).toBe(false);
    expect(result.current.quizOpen).toBe(false);
    expect(result.current.quizSessionOpen).toBe(false);
    expect(result.current.favoritesOpen).toBe(false);
    expect(result.current.workbenchOpen).toBe(false);
  });

  it("openSearch / closeSearch toggle searchOpen", () => {
    const { result } = renderHook(() => useModals());
    act(() => result.current.openSearch());
    expect(result.current.searchOpen).toBe(true);
    act(() => result.current.closeSearch());
    expect(result.current.searchOpen).toBe(false);
  });

  it("openWorkbench / closeWorkbench toggle workbenchOpen", () => {
    const { result } = renderHook(() => useModals());
    act(() => result.current.openWorkbench());
    expect(result.current.workbenchOpen).toBe(true);
    act(() => result.current.closeWorkbench());
    expect(result.current.workbenchOpen).toBe(false);
  });
});
