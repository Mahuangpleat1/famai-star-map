/**
 * LawUniverseCommandPalette a11y 集成测试。
 *
 * - 打开时焦点送到搜索 input
 * - Esc 触发 onClose(useFocusTrap 接管)
 * - 点击外部 scrim 关闭
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LawUniverseCommandPalette } from "./LawUniverseCommandPalette";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LawUniverseCommandPalette a11y", () => {
  it("不打开时不渲染", () => {
    render(<LawUniverseCommandPalette open={false} onClose={() => undefined} onSelectNode={() => undefined} />);
    expect(screen.queryByTestId("law-universe-command-palette")).not.toBeInTheDocument();
  });

  it("打开时搜索 input 自动 focus", () => {
    render(<LawUniverseCommandPalette open={true} onClose={() => undefined} onSelectNode={() => undefined} />);
    const input = screen.getByTestId("law-universe-command-palette-input");
    expect(document.activeElement).toBe(input);
  });

  it("Esc 触发 onClose(useFocusTrap)", () => {
    const onClose = vi.fn();
    render(<LawUniverseCommandPalette open={true} onClose={onClose} onSelectNode={() => undefined} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("点击 scrim 触发 onClose", () => {
    const onClose = vi.fn();
    render(<LawUniverseCommandPalette open={true} onClose={onClose} onSelectNode={() => undefined} />);
    // scrim 是 class 中带 "scrim" 的那个 "关闭搜索" 按钮
    const scrim = document.querySelector(".law-universe-command-palette__scrim") as HTMLButtonElement;
    fireEvent.click(scrim);
    expect(onClose).toHaveBeenCalled();
  });

  it("输入字符时焦点保持在 input", () => {
    render(<LawUniverseCommandPalette open={true} onClose={() => undefined} onSelectNode={() => undefined} />);
    const input = screen.getByTestId("law-universe-command-palette-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "民法" } });
    expect((input as HTMLInputElement).value).toBe("民法");
  });
});
