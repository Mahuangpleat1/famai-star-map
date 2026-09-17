import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSatelliteVisible } from "./useSatelliteVisible";

describe("useSatelliteVisible", () => {
  it("defaults to visible true", () => {
    const { result } = renderHook(() => useSatelliteVisible());
    expect(result.current.satelliteVisible).toBe(true);
  });
  it("toggleSatellites flips the flag", () => {
    const { result } = renderHook(() => useSatelliteVisible());
    act(() => result.current.toggleSatellites());
    expect(result.current.satelliteVisible).toBe(false);
    act(() => result.current.toggleSatellites());
    expect(result.current.satelliteVisible).toBe(true);
  });
  it("respects initial false", () => {
    const { result } = renderHook(() => useSatelliteVisible(false));
    expect(result.current.satelliteVisible).toBe(false);
  });
});
