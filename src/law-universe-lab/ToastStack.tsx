/**
 * Toast 容器 —— Phase 3 polish (9.1)。
 *
 * 渲染位置:页面右下角。多个 toast 自上而下堆叠。
 * 单条 toast 含 message / 关闭按钮 / 可选 action 按钮。
 */

import { X } from "lucide-react";
import type { ToastItem } from "./useToast";
import "./css/law-universe-lab-quiz.css";

export interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="toast-stack"
      role="region"
      aria-label="通知"
      data-testid="toast-stack"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.kind}`}
          role="status"
          data-testid={`toast-${toast.kind}`}
        >
          <span className="toast__message">{toast.message}</span>
          {toast.action ? (
            <button
              type="button"
              className="toast__action"
              onClick={toast.action.onClick}
            >
              {toast.action.label}
            </button>
          ) : null}
          <button
            type="button"
            className="toast__close"
            onClick={() => onDismiss(toast.id)}
            aria-label="关闭"
            data-testid={`toast-close-${toast.id}`}
          >
            <X aria-hidden="true" size={12} strokeWidth={2} />
          </button>
        </div>
      ))}
    </div>
  );
}
