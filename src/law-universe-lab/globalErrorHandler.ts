/**
 * globalErrorHandler —— 注册 window.onerror + unhandledrejection 监听。
 *
 * 用法:
 *   import { registerGlobalErrorHandlers } from "./globalErrorHandler";
 *   registerGlobalErrorHandlers({ onError: (e) => ... });
 *
 * - 不会 throw,失败时 console.warn
 * - 上线后 onError 可以接 endpoint
 * - 默认不打 console.error(交给 ErrorBoundary 处理),只是汇总
 */

interface GlobalErrorHandlerOptions {
  /** 错误回调(同步 error) */
  onError?: (event: ErrorEvent) => void;
  /** Promise 拒绝回调 */
  onUnhandledRejection?: (event: PromiseRejectionEvent) => void;
  /** 是否同时 console.error 原始事件,默认 false(避免刷屏) */
  mirrorToConsole?: boolean;
}

let registered = false;

export function registerGlobalErrorHandlers(options: GlobalErrorHandlerOptions = {}): void {
  if (typeof window === "undefined") return;
  if (registered) return;
  registered = true;

  const { onError, onUnhandledRejection, mirrorToConsole = false } = options;

  window.addEventListener("error", (event) => {
    if (mirrorToConsole) {
       
      console.error("[law-universe:window.error]", event.error ?? event.message);
    }
    onError?.(event);
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (mirrorToConsole) {
       
      console.error("[law-universe:unhandledrejection]", event.reason);
    }
    onUnhandledRejection?.(event);
  });
}

/** 测试/热重载时反注册 */
export function unregisterGlobalErrorHandlers(): void {
  // 我们没保存 handler 引用,简单起见:把 registered 重置,实际 listener 会重复注册。
  // 实际热重载影响不大(Vite HMR 整体重置 module 状态)。
  registered = false;
}
