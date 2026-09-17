import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { legalUniverseNodes } from "../../data/legalUniverseData";
import { searchLegalUniverse, type LegalUniverseSearchHit } from "./legalUniverseSearch";
import type { LegalUniverseNodeType } from "./types";
import { useFocusTrap } from "./hooks/useFocusTrap";
import "./css/law-universe-lab-panels.css";

interface LawUniverseCommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectNode: (id: string) => void;
  disabledNodeTypes?: LegalUniverseNodeType[];
}

const TYPE_LABEL: Record<LegalUniverseNodeType, string> = {
  "universe-core": "总览",
  "system-sun": "太阳系",
  code: "法典结构",
  law: "法律",
  field: "领域",
  concept: "概念",
  rule: "规则",
  institution: "制度",
  procedure: "程序",
  history: "历史",
  theory: "理论",
  "case-method": "方法"
};

export function LawUniverseCommandPalette({ open, onClose, onSelectNode, disabledNodeTypes }: LawUniverseCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const visibleNodes = useMemo(
    () => (disabledNodeTypes && disabledNodeTypes.length > 0
      ? legalUniverseNodes.filter((node) => !disabledNodeTypes.includes(node.type))
      : legalUniverseNodes),
    [disabledNodeTypes]
  );

  const hits: LegalUniverseSearchHit[] = useMemo(() => searchLegalUniverse(query, visibleNodes), [query, visibleNodes]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      // 上下方向键 / Enter 走 modal 内部快捷键(不冒泡到顶层 Esc / ? 等快捷键)
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => (hits.length === 0 ? 0 : (current + 1) % hits.length));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) => (hits.length === 0 ? 0 : (current - 1 + hits.length) % hits.length));
      } else if (event.key === "Enter") {
        const hit = hits[activeIndex];
        if (hit) {
          event.preventDefault();
          onSelectNode(hit.node.id);
          onClose();
        }
      }
    }
    if (open) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    return undefined;
  }, [open, hits, activeIndex, onClose, onSelectNode]);

  // 完整焦点陷阱(由 useFocusTrap 统一处理 Tab 循环 / Esc / 关闭恢复焦点)。
  // 关闭由 Esc 触发 onEscape 实现;我们仍然把搜索框作为 autoFocus 第一个 focusable 元素。
  const panelRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(panelRef, open, { onEscape: onClose, autoFocus: true });

  if (!open) return null;

  return (
    <div className="law-universe-command-palette" role="dialog" aria-modal="true" aria-label="中国法学宇宙节点搜索" data-testid="law-universe-command-palette">
      <button
        type="button"
        className="law-universe-command-palette__scrim"
        aria-label="关闭搜索"
        onClick={onClose}
      />
      <div ref={panelRef} className="law-universe-command-palette__panel" data-testid="law-universe-command-palette-panel">
        <div className="law-universe-command-palette__input-row">
          <Search aria-hidden="true" size={16} strokeWidth={1.8} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="搜索 170 个法学节点（节点名、标签、概念解释）"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            aria-label="法学节点搜索"
            data-testid="law-universe-command-palette-input"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="law-universe-command-palette__close" onClick={onClose} aria-label="关闭搜索">
            <X aria-hidden="true" size={14} strokeWidth={1.8} />
          </button>
        </div>
        <div className="law-universe-command-palette__hint">↑↓ 选择 · Enter 跳转 · Esc 关闭 · 支持 民法典/mfd 等关键词</div>
        <div
          ref={listRef}
          className="law-universe-command-palette__list"
          role="listbox"
          aria-label="搜索结果"
          data-testid="law-universe-command-palette-list"
        >
          {hits.length === 0 ? (
            <p className="law-universe-command-palette__empty">{query.trim() ? "没有匹配节点" : "试着输入 民法典 / 刑法 / mfd"}</p>
          ) : (
            hits.map((hit, index) => (
              <button
                type="button"
                key={hit.node.id}
                role="option"
                aria-selected={index === activeIndex}
                className={`law-universe-command-palette__item ${index === activeIndex ? "is-active" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  onSelectNode(hit.node.id);
                  onClose();
                }}
                data-testid={`law-universe-command-palette-item-${hit.node.id}`}
                data-matched-field={hit.matchedField}
              >
                <span className="law-universe-command-palette__item-title">{hit.node.title}</span>
                <span className="law-universe-command-palette__item-meta">
                  <span>{TYPE_LABEL[hit.node.type]}</span>
                  <span>·</span>
                  <span>{hit.node.domain}</span>
                  <span>·</span>
                  <span>L{hit.node.level}</span>
                </span>
                <span className="law-universe-command-palette__item-snip">{hit.node.shortDescription}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
