import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToastStack } from "./ToastStack";
import type { ToastItem } from "./useToast";

describe("ToastStack", () => {
  const sampleToasts: ToastItem[] = [
    { id: "1", kind: "info", message: "hello", duration: 4000 },
    { id: "2", kind: "error", message: "boom", duration: 0, action: { label: "重试", onClick: vi.fn() } }
  ];

  it("renders all toasts", () => {
    render(<ToastStack toasts={sampleToasts} onDismiss={() => undefined} />);
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByText("boom")).toBeInTheDocument();
  });

  it("applies kind class", () => {
    render(<ToastStack toasts={sampleToasts} onDismiss={() => undefined} />);
    expect(screen.getByTestId("toast-info")).toHaveClass("toast--info");
    expect(screen.getByTestId("toast-error")).toHaveClass("toast--error");
  });

  it("renders action button and triggers callback", () => {
    const cb = vi.fn();
    render(<ToastStack toasts={[{ id: "a", kind: "warning", message: "x", duration: 0, action: { label: "重试", onClick: cb } }]} onDismiss={() => undefined} />);
    fireEvent.click(screen.getByText("重试"));
    expect(cb).toHaveBeenCalledOnce();
  });

  it("close button calls onDismiss with id", () => {
    const cb = vi.fn();
    render(<ToastStack toasts={sampleToasts} onDismiss={cb} />);
    fireEvent.click(screen.getByTestId("toast-close-1"));
    expect(cb).toHaveBeenCalledWith("1");
  });
});
