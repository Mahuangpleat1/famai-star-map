import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFocusState } from "./useFocusState";

describe("useFocusState", () => {
  it("selectNode updates focusState and increments focusKey", () => {
    const { result } = renderHook(() => useFocusState());
    const beforeKey = result.current.focusState.focusKey;
    act(() => result.current.selectNode("system-civil"));
    expect(result.current.focusState.selectedNodeId).toBe("system-civil");
    expect(result.current.focusState.focusKey).toBe(beforeKey + 1);
  });

  it("resetView returns to universe-core", () => {
    const { result } = renderHook(() => useFocusState("system-criminal"));
    act(() => result.current.resetView());
    expect(result.current.focusState.selectedNodeId).toBe("universe-core");
  });

  it("markFocusComplete updates focusedNodeId and cameraState", () => {
    const { result } = renderHook(() => useFocusState());
    act(() => result.current.markFocusComplete("system-civil"));
    expect(result.current.focusState.focusedNodeId).toBe("system-civil");
    expect(result.current.focusState.cameraState).toBe("focused");
  });
});
