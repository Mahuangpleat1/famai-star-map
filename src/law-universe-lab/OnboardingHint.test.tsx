import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { OnboardingHint, resetOnboardingFlag } from "./OnboardingHint";

const STORAGE_KEY = "law-universe:onboarding:v1";

beforeEach(() => {
  window.localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("OnboardingHint", () => {
  it("shows after 600ms delay when storage flag absent", () => {
    render(<OnboardingHint />);
    expect(screen.queryByTestId("law-universe-onboarding")).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByTestId("law-universe-onboarding")).toBeInTheDocument();
    expect(screen.getByText("欢迎来到法脉星河")).toBeInTheDocument();
  });

  it("does not show if storage flag set", () => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    render(<OnboardingHint />);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.queryByTestId("law-universe-onboarding")).not.toBeInTheDocument();
  });

  it("close button persists flag and removes hint", () => {
    render(<OnboardingHint />);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    fireEvent.click(screen.getByRole("button", { name: /开始探索/ }));
    expect(screen.queryByTestId("law-universe-onboarding")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("1");
  });

  it("X button also persists flag", () => {
    render(<OnboardingHint />);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    fireEvent.click(screen.getByRole("button", { name: /关闭引导/ }));
    expect(screen.queryByTestId("law-universe-onboarding")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("1");
  });

  it("auto-hides when any completed key arrives", () => {
    render(<OnboardingHint completedKeys={new Set(["clicked-node"])} />);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    // the auto-hide effect runs synchronously on next tick after state prop change
    // we need to flush effects
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.queryByTestId("law-universe-onboarding")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("1");
  });

  it("resetOnboardingFlag clears storage", () => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    resetOnboardingFlag();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
