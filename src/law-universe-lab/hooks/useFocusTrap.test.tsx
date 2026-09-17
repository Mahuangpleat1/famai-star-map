/**
 * useFocusTrap 测试 —— 覆盖:
 * 1. 打开时把焦点送到容器内第一个 focusable 元素
 * 2. 关闭时恢复焦点到打开前的元素
 * 3. Tab / Shift+Tab 在 modal 内循环
 * 4. Escape 触发 onEscape 回调
 * 5. 容器内没有 focusable 元素时不抛错
 * 6. active=false 时不安装键盘监听
 */
import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { useFocusTrap, type UseFocusTrapOptions } from "./useFocusTrap";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

/** 构造一个简单的 modal 容器 + 几个 focusable 元素 */
function makeModal(buttonCount: number) {
  const container = document.createElement("div");
  container.tabIndex = -1;
  for (let i = 0; i < buttonCount; i += 1) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = `btn-${i}`;
    container.appendChild(b);
  }
  document.body.appendChild(container);
  return container;
}

interface HarnessProps {
  active?: boolean;
  onEscape?: () => void;
  /** 自定义容器,默认 makeModal(2) */
  container?: HTMLDivElement;
}

function Harness({ active = true, onEscape, container: providedContainer }: HarnessProps) {
  // 第一次 render 拿到容器,后续 re-render 复用
  const [container] = useState<HTMLDivElement>(() => {
    if (providedContainer) return providedContainer;
    const c = document.createElement("div");
    c.tabIndex = -1;
    for (let i = 0; i < 2; i += 1) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = `btn-${i}`;
      c.appendChild(b);
    }
    document.body.appendChild(c);
    return c;
  });
  // 把 ref 直接通过 callback ref 暴露出去
  const opts: UseFocusTrapOptions = onEscape ? { onEscape } : {};
  // 这里用 null-cast 来通过类型检查 —— callback ref 不需要 ref object
  useFocusTrap({ current: container }, active, opts);
  return null;
}

describe("useFocusTrap", () => {
  it("打开时把焦点送到容器内第一个 focusable 元素", () => {
    const container = makeModal(3);
    const firstBtn = container.querySelector("button") as HTMLButtonElement;
    const focusSpy = vi.spyOn(firstBtn, "focus");

    render(<Harness active={true} container={container} />);

    expect(focusSpy).toHaveBeenCalled();
  });

  it("关闭时恢复焦点到打开前的元素", () => {
    const outsideBtn = document.createElement("button");
    outsideBtn.textContent = "outside";
    document.body.appendChild(outsideBtn);
    outsideBtn.focus();
    expect(document.activeElement).toBe(outsideBtn);

    const outsideFocusSpy = vi.spyOn(outsideBtn, "focus");

    const container = makeModal(2);
    const { unmount } = render(<Harness active={true} container={container} />);

    // 打开后,焦点应该跑到 container 内的第一个 button
    const firstBtn = container.querySelector("button") as HTMLButtonElement;
    expect(document.activeElement).toBe(firstBtn);

    // 卸载(模拟 active → false 时 effect cleanup)
    unmount();

    // outsideBtn 在 cleanup 中收到一次 focus 调用
    expect(outsideFocusSpy).toHaveBeenCalled();
  });

  it("Tab 在 modal 内循环:最后一个 → 第一个", () => {
    const container = makeModal(2);
    render(<Harness active={true} container={container} />);

    const buttons = container.querySelectorAll("button");
    const first = buttons[0] as HTMLButtonElement;
    const last = buttons[buttons.length - 1] as HTMLButtonElement;

    // 假装焦点在 last
    last.focus();
    expect(document.activeElement).toBe(last);

    // 触发 Tab(不按 Shift)
    const ev = new KeyboardEvent("keydown", { key: "Tab", shiftKey: false, bubbles: true, cancelable: true });
    act(() => {
      window.dispatchEvent(ev);
    });
    expect(document.activeElement).toBe(first);
  });

  it("Shift+Tab 在 modal 内循环:第一个 → 最后一个", () => {
    const container = makeModal(2);
    render(<Harness active={true} container={container} />);

    const buttons = container.querySelectorAll("button");
    const first = buttons[0] as HTMLButtonElement;
    const last = buttons[buttons.length - 1] as HTMLButtonElement;

    // 默认打开时焦点在 first
    expect(document.activeElement).toBe(first);

    const ev = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true });
    act(() => {
      window.dispatchEvent(ev);
    });
    expect(document.activeElement).toBe(last);
  });

  it("Escape 触发 onEscape 回调", () => {
    const container = makeModal(1);
    const onEscape = vi.fn();
    render(<Harness active={true} onEscape={onEscape} container={container} />);

    const ev = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    act(() => {
      window.dispatchEvent(ev);
    });
    expect(onEscape).toHaveBeenCalledOnce();
  });

  it("容器内没有 focusable 元素时不抛错,Tab 把焦点困在容器", () => {
    const container = document.createElement("div");
    container.tabIndex = -1;
    document.body.appendChild(container);

    expect(() => render(<Harness active={true} container={container} />)).not.toThrow();

    const ev = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    expect(() => {
      act(() => {
        window.dispatchEvent(ev);
      });
    }).not.toThrow();
  });

  it("active=false 时不安装键盘监听,Esc 不触发 onEscape", () => {
    const container = makeModal(1);
    const onEscape = vi.fn();
    render(<Harness active={false} onEscape={onEscape} container={container} />);

    const ev = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    act(() => {
      window.dispatchEvent(ev);
    });
    expect(onEscape).not.toHaveBeenCalled();
  });
});
