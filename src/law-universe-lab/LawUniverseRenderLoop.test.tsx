import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LawUniverseRenderLoop } from "./LawUniverseRenderLoop";
import { isSoftwareRenderer, nextSlowFrameCount } from "./lawUniverseRenderPolicy";

const state = vi.hoisted(() => ({ invalidate: vi.fn(), gl: { domElement: { dataset: {} } } }));
vi.mock("@react-three/fiber", () => ({ useThree: (selector: (value: typeof state) => unknown) => selector(state), useFrame: vi.fn() }));

describe("render scheduling", () => {
  beforeEach(() => { vi.useFakeTimers(); state.invalidate.mockClear(); Object.defineProperty(document, "hidden", { configurable: true, value: false }); });
  afterEach(() => vi.useRealTimers());

  it("caps decorative invalidation and stops timers on pause and unmount", () => {
    const onSlowRenderer = vi.fn();
    const view = render(<LawUniverseRenderLoop animated onSlowRenderer={onSlowRenderer} />);
    act(() => vi.advanceTimersByTime(1000));
    expect(state.invalidate.mock.calls.length).toBeGreaterThanOrEqual(29);
    expect(state.invalidate.mock.calls.length).toBeLessThanOrEqual(32);
    view.rerender(<LawUniverseRenderLoop animated={false} onSlowRenderer={onSlowRenderer} />);
    const pausedCount = state.invalidate.mock.calls.length;
    act(() => vi.advanceTimersByTime(1000));
    expect(state.invalidate).toHaveBeenCalledTimes(pausedCount);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("suspends decorative work while hidden and resumes on visibility", () => {
    const view = render(<LawUniverseRenderLoop animated onSlowRenderer={vi.fn()} />);
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    const count = state.invalidate.mock.calls.length;
    act(() => vi.advanceTimersByTime(1000));
    expect(state.invalidate).toHaveBeenCalledTimes(count);
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    act(() => vi.advanceTimersByTime(1000));
    expect(state.invalidate.mock.calls.length).toBeGreaterThan(count + 20);
    view.unmount();
  });

  it("recognizes software hardware reports, not browser user agents", () => {
    expect(isSoftwareRenderer("ANGLE (Google, Vulkan SwiftShader Device)" )).toBe(true);
    expect(isSoftwareRenderer("Mesa llvmpipe (LLVM 15.0)" )).toBe(true);
    expect(isSoftwareRenderer("ANGLE (Apple, Apple M3, OpenGL 4.1)" )).toBe(false);
    expect(isSoftwareRenderer("HeadlessChrome Lighthouse" )).toBe(false);
  });

  it("resets the slow-frame streak after a healthy frame", () => {
    expect(nextSlowFrameCount(2, 90)).toBe(3);
    expect(nextSlowFrameCount(2, 15)).toBe(0);
  });
});
