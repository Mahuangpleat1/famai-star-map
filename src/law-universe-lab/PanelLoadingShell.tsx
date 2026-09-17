/**
 * PanelLoadingShell —— React.lazy 加载面板时的占位骨架。
 *
 * 设计要点:
 * - 走 inline style,不依赖 css 文件(避免 PanelLoadingShell 自身也触发额外 chunk 下载)
 * - 视觉上跟现有 pre-shell / fallback-shell 风格保持一致:暗背景 + 微小脉冲
 * - 支持两种变体:
 *   - "modal"  :全屏居中,用于 ⌘K / Quiz / Workbench 等需要遮挡的弹窗
 *   - "inline" :右下角小卡,用于 Path / LearningPath / Detail / Satellite 等浮层
 *
 * 不挂任何外部依赖,确保包体最小,即使 chunk 还在网络中也立刻可见。
 */

import type { CSSProperties } from "react";

export interface PanelLoadingShellProps {
  variant?: "modal" | "inline";
  /** 加载提示文案,默认「载入中...」 */
  label?: string;
}

const BASE_DOT: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#f3c86f",
  display: "inline-block"
};

const ANIMATION = `
@keyframes panel-loading-shell-pulse {
  0%, 100% { opacity: 0.25; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.1); }
}
@keyframes panel-loading-shell-fade {
  from { opacity: 0.6; }
  to { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .panel-loading-shell__dot { animation: none !important; opacity: 0.6; }
}
`;

export function PanelLoadingShell({ variant = "inline", label = "载入中..." }: PanelLoadingShellProps) {
  const isModal = variant === "modal";
  const wrapperStyle: CSSProperties = isModal
    ? {
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(5, 7, 10, 0.78)",
        backdropFilter: "blur(4px)",
        zIndex: 80
      }
    : {
        position: "fixed",
        right: 24,
        bottom: 24,
        padding: "10px 14px",
        borderRadius: 10,
        background: "rgba(5, 7, 10, 0.86)",
        color: "#f3c86f",
        fontSize: 12,
        fontFamily: "ui-sans-serif, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei'",
        boxShadow: "0 6px 24px rgba(0, 0, 0, 0.35)",
        zIndex: 60,
        animation: "panel-loading-shell-fade 240ms ease-out both"
      };

  const dot = (delayMs: number): CSSProperties => ({
    ...BASE_DOT,
    marginRight: 4,
    animation: `panel-loading-shell-pulse 1.1s ease-in-out ${delayMs}ms infinite`
  });

  return (
    <>
      <style>{ANIMATION}</style>
      <div
        role="status"
        aria-live="polite"
        data-testid="panel-loading-shell"
        data-variant={variant}
        style={wrapperStyle}
      >
        <span className="panel-loading-shell__dot" style={dot(0)} />
        <span className="panel-loading-shell__dot" style={dot(160)} />
        <span className="panel-loading-shell__dot" style={dot(320)} />
        <span style={{ marginLeft: 8 }}>{label}</span>
      </div>
    </>
  );
}

export default PanelLoadingShell;
