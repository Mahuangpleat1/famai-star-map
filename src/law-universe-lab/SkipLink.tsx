/**
 * SkipLink —— 跳到主内容的链接(a11y 最佳实践)。
 *
 * 屏幕阅读器用户和键盘用户能跳过顶部 HUD / FilterBar / 系统索引,
 * 直接跳到 3D 场景或主内容。
 *
 * 用法:
 *   <SkipLink targetId="law-universe-scene" />
 *   <Scene id="law-universe-scene" ... />
 *
 * - 视觉上默认隐藏
 * - 键盘 focus 时显示在屏幕左上
 * - 链接到目标后自动 focus 目标元素
 */
import { useCallback } from "react";
import "./css/law-universe-lab-base.css";

export interface SkipLinkProps {
  /** 目标元素 id(主内容容器) */
  targetId: string;
  /** 链接文字 */
  label?: string;
}

export function SkipLink({ targetId, label = "跳到中国法学宇宙主场景" }: SkipLinkProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const target = document.getElementById(targetId);
      if (!target) {
         
        console.warn(`[SkipLink] target #${targetId} not found`);
        return;
      }
      // 让目标可 focus(如果不是 button / link / input 等天然 focusable)
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: false });
      // 滚动到目标
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // 更新 URL hash 但不触发跳转
      if (window.history && window.history.replaceState) {
        try {
          window.history.replaceState(null, "", `#${targetId}`);
        } catch {
          /* ignore */
        }
      }
    },
    [targetId]
  );

  return (
    <a
      href={`#${targetId}`}
      className="law-universe-skip-link"
      onClick={handleClick}
      data-testid="law-universe-skip-link"
    >
      {label}
    </a>
  );
}
