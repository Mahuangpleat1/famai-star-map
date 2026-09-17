import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useQuizReview } from "./useQuizReview";
import * as userDb from "../legalUniverseUserDb";
import type { UseToast } from "../useToast";
import type { UserQuizItem } from "../userDataTypes";

function makeMockToast(): UseToast & { push: ReturnType<typeof vi.fn>; dismiss: ReturnType<typeof vi.fn> } {
  return {
    toasts: [],
    push: vi.fn().mockReturnValue("mock-id"),
    dismiss: vi.fn(),
    success: vi.fn().mockReturnValue("mock-id"),
    error: vi.fn().mockReturnValue("mock-id")
  };
}

function makeItem(dueAt: number): UserQuizItem {
  return {
    id: `q-${dueAt}`,
    conceptId: "c",
    conceptTitle: "x",
    payload: { type: "choice", stem: "s", options: ["a", "b"], correctIndex: 0 },
    spacedRepetition: { easeFactor: 2.5, interval: 0, repetitions: 0, dueAt },
    createdAt: 0
  };
}

describe("useQuizReview", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("computes dueCount from listQuizItems on mount (only items with dueAt <= now)", async () => {
    const now = Date.now();
    vi.spyOn(userDb, "listQuizItems").mockResolvedValue([
      makeItem(now - 1000), // due
      makeItem(now - 500), // due
      makeItem(now + 60_000) // not due
    ]);
    const toast = makeMockToast();
    const { result } = renderHook(() => useQuizReview(toast, false, 0, 0, vi.fn()));
    await waitFor(() => expect(result.current.dueCount).toBe(2));
    expect(toast.push).not.toHaveBeenCalled();
  });

  it("pushes an error toast when listQuizItems rejects", async () => {
    vi.spyOn(userDb, "listQuizItems").mockRejectedValue(new Error("db fail"));
    const toast = makeMockToast();
    const { result } = renderHook(() => useQuizReview(toast, false, 0, 0, vi.fn()));
    await waitFor(() =>
      expect(toast.push).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: "error",
          message: expect.stringContaining("复习题加载失败")
        })
      )
    );
    expect(result.current.dueCount).toBe(0);
  });

  it("retry action of the error toast invokes onRetry", async () => {
    vi.spyOn(userDb, "listQuizItems").mockRejectedValue(new Error("db fail"));
    const toast = makeMockToast();
    const onRetry = vi.fn();
    renderHook(() => useQuizReview(toast, false, 0, 0, onRetry));
    await waitFor(() => expect(toast.push).toHaveBeenCalled());
    const pushed = toast.push.mock.calls[0]?.[0];
    expect(pushed?.action?.label).toBe("重试");
    pushed?.action?.onClick();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
