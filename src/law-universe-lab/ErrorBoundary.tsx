/**
 * ErrorBoundary —— 全局 React 错误兜底。
 *
 * 用法:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * - 渲染时遇到子组件抛错,展示降级 UI(不是空白页)
 * - 提供 "复制错误" + "刷新" 两个操作
 * - 提供 "Reset local cache" 高危操作(清 IndexedDB + localStorage,确认弹窗)
 * - 上线后可以加 endpoint 推送,目前先 console.error
 */
import { Component, useState, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, Copy, RefreshCw, Trash2 } from "lucide-react";
import { sendClientLog } from "../lib/clientLog";
import { __resetDBForTests } from "./legalUniverseUserDb";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** 自定义降级 UI 渲染,默认用内置 FullPageFallback */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** 错误回调,用于埋点上报(目前是 console.error) */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
  /** 用户主动清缓存后的重置 flag —— 触发 componentWillUnmount/remount 子树 */
  resetKey: number;
}

function describeError(err: unknown): { name: string; message: string; stack?: string } {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  if (typeof err === "string") {
    return { name: "StringError", message: err };
  }
  try {
    return { name: "UnknownError", message: JSON.stringify(err) };
  } catch {
    return { name: "UnknownError", message: String(err) };
  }
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback: textarea + execCommand
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function FullPageFallback({ error, reset, onResetCache }: { error: Error; reset: () => void; onResetCache: () => void }) {
  const [copyState, setCopyState] = useStateCopyState();

  async function handleCopy() {
    const text = [
      `Error: ${error.name}`,
      `Message: ${error.message}`,
      "",
      "Stack:",
      error.stack ?? "(no stack)"
    ].join("\n");
    const ok = await copyToClipboard(text);
    setCopyState(ok ? "copied" : "failed");
  }

  return (
    <main
      className="law-universe-error-fallback"
      role="alert"
      aria-live="assertive"
      data-testid="law-universe-error-fallback"
    >
      <div className="law-universe-error-fallback__panel">
        <div className="law-universe-error-fallback__icon" aria-hidden="true">
          <AlertTriangle size={28} strokeWidth={1.6} />
        </div>
        <h1 className="law-universe-error-fallback__title">法脉星图遇到了一个问题</h1>
        <p className="law-universe-error-fallback__subtitle">
          页面渲染时发生未捕获的错误。已自动记录到浏览器控制台。
        </p>
        <pre className="law-universe-error-fallback__details" tabIndex={0}>
{`${error.name}: ${error.message}`}
        </pre>
        <div className="law-universe-error-fallback__actions">
          <button type="button" className="law-universe-error-fallback__btn law-universe-error-fallback__btn--primary" onClick={reset}>
            <RefreshCw size={14} strokeWidth={1.8} />
            <span>刷新页面</span>
          </button>
          <button type="button" className="law-universe-error-fallback__btn" onClick={handleCopy}>
            <Copy size={14} strokeWidth={1.8} />
            <span>{copyState === "copied" ? "已复制" : copyState === "failed" ? "复制失败" : "复制错误"}</span>
          </button>
          <button
            type="button"
            className="law-universe-error-fallback__btn law-universe-error-fallback__btn--danger"
            onClick={() => {
              const ok = window.confirm("清空本地缓存会删除你上传的资料、抽取的概念、错题本、Obsidian 同步映射。继续吗?");
              if (ok) onResetCache();
            }}
            title="清空本地 IndexedDB + localStorage"
          >
            <Trash2 size={14} strokeWidth={1.8} />
            <span>重置本地缓存</span>
          </button>
        </div>
        <p className="law-universe-error-fallback__hint">
          如果问题反复出现,试试「重置本地缓存」(会清掉你所有上传资料)或联系开发者。
        </p>
      </div>
    </main>
  );
}

// Local micro-hook to avoid pulling useState import noise; small and only used here.
type CopyState = "idle" | "copied" | "failed";
function useStateCopyState(): [CopyState, (s: CopyState) => void] {
  return useState<CopyState>("idle");
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, resetKey: 0 };

  static getDerivedStateFromError(error: Error): Pick<ErrorBoundaryState, "error"> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // 现有 console.error 保留 —— 开发 / 自排查都靠它
    console.error("[law-universe] ErrorBoundary caught:", error, info);

    // 上线后:PROD 模式下把 React 渲染错误体通过 sendClientLog 上报
    // DEV 模式不打网络,避免污染开发者本地请求日志
    if (import.meta.env.PROD) {
      sendClientLog({
        kind: "error",
        data: {
          source: "ErrorBoundary",
          name: error.name,
          message: error.message,
          stack: error.stack,
          componentStack: info.componentStack,
          ts: Date.now()
        }
      });
    }

    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.setState({ error: null, resetKey: this.state.resetKey + 1 });
  };

  handleResetCache = async (): Promise<void> => {
    try {
      // Clear localStorage (favorites/notes/undo-stack/url-state-cinematic/prompt)
      try {
        window.localStorage.clear();
      } catch {
        /* ignore */
      }
      // Clear sessionStorage too
      try {
        window.sessionStorage.clear();
      } catch {
        /* ignore */
      }
      // Clear IndexedDB
      try {
        await __resetDBForTests();
      } catch (err) {
         
        console.warn("[law-universe] resetDBForTests failed", err);
      }
    } finally {
      // Reload the page so all in-memory state is gone
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return <FullPageFallback error={this.state.error} reset={this.reset} onResetCache={this.handleResetCache} />;
    }
    return <div key={this.state.resetKey}>{this.props.children}</div>;
  }
}

export { describeError };
