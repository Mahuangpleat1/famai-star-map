import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCameraFrame } from "./useCameraFrame";
import { getLawUniverseCameraFrame } from "../lawUniverseCameraFrame";

describe("useCameraFrame", () => {
  it("returns initial frame for given selectedNodeId + zoomLevel", () => {
    const { result } = renderHook(() => useCameraFrame("universe-core", 1));
    const expected = getLawUniverseCameraFrame("universe-core", 1);
    expect(result.current.cameraFrame).toEqual(expected);
  });

  it("updates frame when selectedNodeId changes", () => {
    const { result, rerender } = renderHook(
      ({ id, zoom }: { id: string; zoom: number }) => useCameraFrame(id, zoom),
      { initialProps: { id: "universe-core", zoom: 1 } }
    );
    const before = result.current.cameraFrame;
    rerender({ id: "system-civil", zoom: 1 });
    const after = result.current.cameraFrame;
    expect(after).not.toEqual(before);
    expect(after).toEqual(getLawUniverseCameraFrame("system-civil", 1));
  });

  it("updates frame when zoomLevel changes", () => {
    const { result, rerender } = renderHook(
      ({ id, zoom }: { id: string; zoom: number }) => useCameraFrame(id, zoom),
      { initialProps: { id: "universe-core", zoom: 1 } }
    );
    const before = result.current.cameraFrame;
    rerender({ id: "universe-core", zoom: 2 });
    const after = result.current.cameraFrame;
    expect(after).not.toEqual(before);
  });

  it("exposes setCameraFrame so Scene can override with actual rendered position", () => {
    const { result } = renderHook(() => useCameraFrame("universe-core", 1));
    expect(typeof result.current.setCameraFrame).toBe("function");
  });
});
