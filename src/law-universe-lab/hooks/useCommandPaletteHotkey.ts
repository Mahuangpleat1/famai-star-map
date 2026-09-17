/**
 * useCommandPaletteHotkey —— ⌘K / Ctrl+K / `/` 全局快捷键监听。
 *
 * 设计:
 * - 只在 LabPage 顶层使用(让 LabPage 主入口只引用此 hook,不要静态 import
 *   LawUniverseCommandPalette.tsx 整个 panel 模块;否则 rollup 会把 panel 拽进主 chunk,
 *   拆 chunk 失败)。Track G 把这个 hook 从 panel 文件拆出来,正是为了让 panel 能
 *   单独走 React.lazy() 的动态 import。
 * - 文本输入态(INPUT / TEXTAREA / contentEditable)屏蔽快捷键,避免和搜索框冲突。
 */

import { useEffect } from "react";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function useCommandPaletteHotkey(open: boolean, setOpen: (open: boolean) => void): void {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const isModifier = event.metaKey || event.ctrlKey;
      if (isModifier && event.key.toLowerCase() === "k") {
        if (isEditableTarget(event.target)) {
          return;
        }
        event.preventDefault();
        setOpen(!open);
        return;
      }
      if (event.key === "/" && !open) {
        if (isEditableTarget(event.target)) {
          return;
        }
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);
}
