import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { KeyboardCheatsheet } from "./KeyboardCheatsheet";

const STORAGE_KEY = "law-universe:cheatsheet-seen:v1";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("KeyboardCheatsheet", () => {
  it("does not render when open=false", () => {
    render(<KeyboardCheatsheet open={false} onClose={() => {}} />);
    expect(screen.queryByTestId("law-universe-cheatsheet")).not.toBeInTheDocument();
  });

  it("renders when open=true and lists shortcuts", () => {
    render(<KeyboardCheatsheet open onClose={() => {}} />);
    const dialog = screen.getByTestId("law-universe-cheatsheet");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent("快捷键");
    expect(dialog).toHaveTextContent("打开节点搜索");
    expect(dialog).toHaveTextContent("重置到总览视角");
  });

  it("persists seen flag in localStorage on first open", () => {
    render(<KeyboardCheatsheet open onClose={() => {}} />);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("1");
  });

  it("calls onClose when backdrop clicked", () => {
    let closed = false;
    render(<KeyboardCheatsheet open onClose={() => { closed = true; }} />);
    fireEvent.click(screen.getByTestId("law-universe-cheatsheet-backdrop"));
    expect(closed).toBe(true);
  });

  it("calls onClose when X button clicked", () => {
    let closed = false;
    render(<KeyboardCheatsheet open onClose={() => { closed = true; }} />);
    fireEvent.click(screen.getByRole("button", { name: /关闭快捷键面板/ }));
    expect(closed).toBe(true);
  });

  it("calls onClose when Esc key pressed", () => {
    let closed = false;
    render(<KeyboardCheatsheet open onClose={() => { closed = true; }} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(closed).toBe(true);
  });

  it("stopPropagation on click inside dialog (does not close)", () => {
    let closed = false;
    render(<KeyboardCheatsheet open onClose={() => { closed = true; }} />);
    const dialog = screen.getByTestId("law-universe-cheatsheet");
    fireEvent.click(dialog);
    expect(closed).toBe(false);
  });
});
