/**
 * KeyboardCheatsheet —— 快捷键面板,按 `?` 打开。
 *
 * - 全屏 modal,ESC 关闭
 * - 列出所有公开快捷键
 * - 完整焦点陷阱(打开时送到内部第一个 focusable,关闭时恢复,Tab/Shift+Tab 循环)
 */
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "./hooks/useFocusTrap";
import "./css/law-universe-lab-panels.css";

const STORAGE_KEY = "law-universe:cheatsheet-seen:v1";

interface ShortcutRow {
  keys: string[];
  desc: string;
}

const SHORTCUTS: ShortcutRow[] = [
  { keys: ["⌘", "K"], desc: "打开节点搜索(命令面板)" },
  { keys: ["Esc"], desc: "重置到总览视角" },
  { keys: ["Space"], desc: "暂停 / 继续场景 motion" },
  { keys: ["+"], desc: "放大" },
  { keys: ["−"], desc: "缩小" },
  { keys: ["R"], desc: "开始路径起点(选起点节点后,再点终点节点)" },
  { keys: ["Z"], desc: "撤销(操作后 5 秒内)" },
  { keys: ["?"], desc: "打开 / 关闭本面板" }
];

function isMacLike(): boolean {
  if (typeof navigator === "undefined") return false;
  const platform = navigator.platform || "";
  const userAgent = navigator.userAgent || "";
  return /Mac|iPhone|iPad/i.test(platform) || /Mac OS X/i.test(userAgent);
}

function keyLabel(key: string): string {
  if (key === "⌘" && !isMacLike()) return "Ctrl";
  return key;
}

export interface KeyboardCheatsheetProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardCheatsheet({ open, onClose }: KeyboardCheatsheetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, [open]);

  // 完整焦点陷阱:打开时送到内部第一个 focusable(Tab/Shift+Tab 循环,关闭时恢复原焦点)
  // 第一个 focusable 就是关闭按钮,所以无需单独 focus 它。
  useFocusTrap(containerRef, open, { onEscape: onClose });

  if (!open) return null;

  function renderKey(key: string): ReactNode {
    return (
      <kbd key={key} className="law-universe-cheatsheet__kbd">
        {keyLabel(key)}
      </kbd>
    );
  }

  return (
    <div
      className="law-universe-cheatsheet__backdrop"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="presentation"
      data-testid="law-universe-cheatsheet-backdrop"
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- onClick is a propagation guard, role=dialog provides keyboard semantics via parent */}
      <div
        ref={containerRef}
        className="law-universe-cheatsheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="law-universe-cheatsheet-title"
        onClick={(e) => e.stopPropagation()}
        data-testid="law-universe-cheatsheet"
      >
        <button
          type="button"
          className="law-universe-cheatsheet__close"
          onClick={onClose}
          aria-label="关闭快捷键面板"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
        <h2 id="law-universe-cheatsheet-title" className="law-universe-cheatsheet__title">
          快捷键
        </h2>
        <p className="law-universe-cheatsheet__subtitle">按 <kbd className="law-universe-cheatsheet__kbd">?</kbd> 随时打开本面板</p>
        <table className="law-universe-cheatsheet__table">
          <tbody>
            {SHORTCUTS.map((row) => (
              <tr key={row.desc}>
                <td className="law-universe-cheatsheet__keys">
                  {row.keys.map((k, i) => (
                    <span key={i} className="law-universe-cheatsheet__key-group">
                      {renderKey(k)}
                      {i < row.keys.length - 1 ? <span className="law-universe-cheatsheet__plus">+</span> : null}
                    </span>
                  ))}
                </td>
                <td className="law-universe-cheatsheet__desc">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="law-universe-cheatsheet__hint">
          按 <kbd className="law-universe-cheatsheet__kbd">Esc</kbd> 关闭本面板
        </p>
      </div>
    </div>
  );
}

export function hasSeenCheatsheet(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
