/**
 * a11yDevCheck —— dev-only 静态 a11y 自检。
 *
 * 触发场景:在 dev 模式下挂到主入口,等 React 首次 paint 完成后扫一遍 DOM。
 * 输出:发现缺失 aria-label / alt 时 console.warn(不 throw,不影响功能)。
 *
 * 主集成者接入方式(在 src/main.tsx 里):
 *   if (import.meta.env.DEV) import("./law-universe-lab/a11yDevCheck");
 *
 * 设计取舍:
 * - 不引入 axe-core / jsdom 等依赖,纯 querySelectorAll + 正则,轻量。
 * - 只针对 <button> / <a> / <img> 三大类高频元素,够用。
 * - 不递归 Shadow DOM(本项目没用到),如果未来有 portal / web component 需扩展。
 * - 运行时机:requestAnimationFrame * 2,确保 React 渲染完成且 layout 稳定。
 */

type Issue = {
  selector: string;
  reason: string;
  text: string;
};

const MAX_ISSUES_PER_CATEGORY = 25; // 防止单页大量同类问题刷屏

/** 取元素的"可读标识"用于警告输出 */
function describe(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = el.className && typeof el.className === "string"
    ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".")
    : "";
  return `<${tag}${id}${cls}>`;
}

/** 元素是否"有可读文字"——textContent 去掉空白后非空,或 aria-label 存在 */
function hasAccessibleName(el: Element): boolean {
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel && ariaLabel.trim().length > 0) return true;
  const ariaLabelledBy = el.getAttribute("aria-labelledby");
  if (ariaLabelledBy && ariaLabelledBy.trim().length > 0) return true;
  const title = el.getAttribute("title");
  if (title && title.trim().length > 0) return true;
  const text = (el.textContent ?? "").replace(/\s+/g, "").trim();
  return text.length > 0;
}

/** 扫描 <button> / <a> 缺 aria-label 且无文字 */
function scanInteractiveWithoutLabel(): Issue[] {
  const issues: Issue[] = [];
  const elements = document.querySelectorAll(
    'button, a, [role="button"], [tabindex]:not([tabindex="-1"])'
  );
  for (const el of Array.from(elements)) {
    // 跳过隐藏的(aria-hidden / display:none)
    if (el.getAttribute("aria-hidden") === "true") continue;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;

    // 跳过"装饰性"的 <a>(无 href 也无 role)
    if (el.tagName === "A" && !el.hasAttribute("href") && !el.getAttribute("role")) continue;

    if (!hasAccessibleName(el)) {
      issues.push({
        selector: describe(el),
        reason: "missing accessible name (no text / aria-label / aria-labelledby / title)",
        text: (el.textContent ?? "").trim().slice(0, 40)
      });
    }
  }
  return issues;
}

/** 扫描 <img> 缺 alt */
function scanImgWithoutAlt(): Issue[] {
  const issues: Issue[] = [];
  const imgs = document.querySelectorAll("img");
  for (const img of Array.from(imgs)) {
    if (img.getAttribute("aria-hidden") === "true") continue;
    if (img.hasAttribute("alt")) continue;
    const style = window.getComputedStyle(img);
    if (style.display === "none" || style.visibility === "hidden") continue;
    issues.push({
      selector: describe(img),
      reason: "missing alt attribute",
      text: (img.getAttribute("src") ?? "").slice(0, 60)
    });
  }
  return issues;
}

function report(category: string, issues: Issue[]): void {
  if (issues.length === 0) return;
  const shown = issues.slice(0, MAX_ISSUES_PER_CATEGORY);
  const remaining = issues.length - shown.length;
  console.warn(
    `[a11yDevCheck] ${category}: ${issues.length} issue(s)${remaining > 0 ? ` (showing first ${MAX_ISSUES_PER_CATEGORY})` : ""}`
  );
  for (const it of shown) {
    console.warn(`  - ${it.selector} :: ${it.reason}${it.text ? ` :: "${it.text}"` : ""}`);
  }
}

/** 启动自检。运行一次。 */
export function runA11yDevCheck(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!import.meta.env?.DEV) return;

  // 等 React 渲染稳定:两帧 + 一个 microtask,覆盖大部分同步 mount。
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        report("interactive-without-label", scanInteractiveWithoutLabel());
        report("img-without-alt", scanImgWithoutAlt());
      } catch (err) {
        // 不 throw,只警告
        console.warn("[a11yDevCheck] scan failed:", err);
      }
    });
  });
}

// 副作用:import 即执行(主集成者用 `import "./a11yDevCheck"`)
runA11yDevCheck();
