import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./law-universe-lab/ErrorBoundary";
import { registerGlobalErrorHandlers } from "./law-universe-lab/globalErrorHandler";
import "./law-universe-lab/css/law-universe-lab-errors.css";

// Error diagnostics stay in this browser; no automatic error/performance telemetry.
registerGlobalErrorHandlers({
  onError: (event) => { console.warn("[law-universe:window.error]", event.message); },
  onUnhandledRejection: (event) => { console.warn("[law-universe:unhandledrejection]", event.reason); }
});

// Dev-only a11y 自检:扫 DOM 找缺失 aria-label / alt 的 button / a / img,console.warn。
// prod build 通过 tree-shake 完全移除(`import.meta.env.DEV` 是编译时常量)。
// 实现见 src/law-universe-lab/a11yDevCheck.ts
if (import.meta.env.DEV) {
  void import("./law-universe-lab/a11yDevCheck");
}

// 注册 Service Worker(离线缓存 app 壳 + 静态资源)
// 失败只 console.warn,不影响功能。
// 不阻塞首屏:register() 返回的 Promise 不 await,故意让浏览器在 idle 时处理。
// 缓存策略见 public/sw.js 顶部注释。
// 设计:
//   - 用 `'serviceWorker' in navigator` 守卫:老 IE/老 Safari 直接跳过
//   - 不强制判断环境:file:// 协议 register 会失败 → 被 .catch 兜住成 console.warn
//   - 浏览器在 http://(非 localhost) 下 register 也会失败(insecure context),
//     同样 .catch 兜住,不影响 SPA 启动
if (import.meta.env.PROD && typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
    .catch((error: unknown) => {
      console.warn("[law-universe:sw:register-failed]", error);
    });
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
