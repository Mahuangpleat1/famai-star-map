import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("boom-from-child");
  }
  return <div data-testid="healthy">healthy</div>;
}

beforeEach(() => {
  // jsdom 默认没有 confirm 实现,需要 mock
  if (!window.confirm) {
    window.confirm = () => true;
  }
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
  }
  // 静默 ErrorBoundary 的 componentDidCatch console.error
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("healthy")).toBeInTheDocument();
  });

  it("shows fallback UI when child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    const fallback = screen.getByTestId("law-universe-error-fallback");
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent("boom-from-child");
    expect(fallback).toHaveTextContent("法脉星图遇到了一个问题");
  });

  it("reset button clears error and re-renders children", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("law-universe-error-fallback")).toBeInTheDocument();

    // simulate error recovery by switching prop
    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    // user clicks reset
    fireEvent.click(screen.getByRole("button", { name: /刷新页面/ }));
    // now fallback is gone, children show again on next render
    // (because resetKey changed, internal div remounts)
    expect(screen.queryByTestId("law-universe-error-fallback")).not.toBeInTheDocument();
  });

  it("custom fallback via prop is used", () => {
    render(
      <ErrorBoundary fallback={(err, reset) => (
        <div data-testid="custom-fallback">
          <span>custom: {err.message}</span>
          <button onClick={reset}>r</button>
        </div>
      )}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    const fb = screen.getByTestId("custom-fallback");
    expect(fb).toBeInTheDocument();
    expect(fb).toHaveTextContent("custom: boom-from-child");
  });

  it("calls onError callback when child throws", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledOnce();
    const [err, info] = onError.mock.calls[0];
    expect(err.message).toBe("boom-from-child");
    expect(info).toBeDefined();
  });

  it("copy button toggles state", async () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    const copyBtn = screen.getByRole("button", { name: /复制错误|已复制|复制失败/ });
    fireEvent.click(copyBtn);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /已复制/ })).toBeInTheDocument();
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
