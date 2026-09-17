/**
 * useFocusTrap —— modal/dialog 焦点陷阱。
 *
 * a11y 价值:
 * - 打开 dialog 时,把焦点送到 modal 内部第一个可聚焦元素(避免焦点跑回 page 后面)
 * - Tab / Shift+Tab 在 modal 内循环,焦点不会跑到 modal 外
 * - Esc 触发外部传入的 onEscape 回调(由调用方决定是 onClose 还是别的副作用)
 * - 关闭时,把焦点恢复到打开 dialog 前的元素(键盘用户最在乎的"我不丢失上下文")
 *
 * 用法(参考 KeyboardCheatsheet):
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   useFocusTrap(containerRef, open, { onEscape: onClose });
 *
 * 设计取舍:
 * - 监听挂到 `document`(capture)而不是 `window`,确保 modal 嵌套 / shadow DOM 场景下也生效。
 *   实际测试中 @testing-library 的 `fireEvent.keyDown(window, ...)` 也会触发 document 的
 *   capture 监听(走的是标准 capture 路径),所以两种调用方式都兼容。
 * - 不接管 Esc 的 preventDefault(只调用回调),避免和 LabPage 顶层 Esc 逻辑冲突。
 * - "可聚焦" 走一组常见 selector(覆盖 a / button / input / textarea / select / [tabindex])。
 *   对 [tabindex="-1"] / [hidden] / [aria-hidden="true"] / [disabled] 显式跳过。
 * - 不依赖 getComputedStyle / offsetParent(jsdom / SSR 不可靠),只用语义属性判断可见性。
 */
import { useEffect, type RefObject } from "react";

export interface UseFocusTrapOptions {
  /** 触发关闭的回调(Esc 按下时调用) */
  onEscape?: () => void;
  /** 打开时是否自动 focus 容器内第一个 focusable 元素(默认 true) */
  autoFocus?: boolean;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "audio[controls]",
  "video[controls]",
  "details > summary"
].join(",");

function isFocusable(el: HTMLElement): boolean {
  if (el.hasAttribute("hidden")) return false;
  if (el.getAttribute("aria-hidden") === "true") return false;
  if ((el as HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).disabled) return false;
  if (el.getAttribute("tabindex") === "-1") return false;
  return true;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((node) =>
    isFocusable(node)
  );
}

export function useFocusTrap<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  active: boolean,
  options: UseFocusTrapOptions = {}
): void {
  const { onEscape, autoFocus = true } = options;

  useEffect(() => {
    if (!active) return undefined;
    if (typeof window === "undefined") return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    // 1) 保存打开前的焦点,关闭后恢复
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // 2) 立即把焦点送到第一个 focusable 元素
    if (autoFocus) {
      const focusables = getFocusableElements(container);
      const target = focusables[0] ?? container;
      if (typeof (target as HTMLElement).focus === "function") {
        (target as HTMLElement).focus();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        return;
      }
      if (event.key !== "Tab") return;
      // Tab / Shift+Tab 在 modal 内循环
      const focusables = getFocusableElements(container as HTMLElement);
      if (focusables.length === 0) {
        // modal 内部没可聚焦元素,把焦点困在 container 自身
        event.preventDefault();
        if (typeof container?.focus === "function") {
          (container as HTMLElement).focus();
        }
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement as HTMLElement | null;
      // container 在 effect 入口已 null-check,这里把 TS 类型也收窄一下
      const safeContainer = container as HTMLElement;
      if (event.shiftKey) {
        if (current === first || !safeContainer.contains(current)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (current === last || !safeContainer.contains(current)) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);
    // 同样挂一份到 window(测试 / 边缘场景兼容:fireEvent.keyDown(window, ...) 走的是 target 阶段)
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      // 恢复焦点(只在 previouslyFocused 仍在文档中,且不是 body 时)
      if (
        previouslyFocused &&
        typeof previouslyFocused.focus === "function" &&
        previouslyFocused.isConnected &&
        previouslyFocused !== document.body
      ) {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef, onEscape, autoFocus]);
}
