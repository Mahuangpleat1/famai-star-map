/**
 * DataBackupPanel —— 数据备份 / 恢复 UI。
 *
 * - "立即备份" → buildBackup() → downloadBackupBundle()
 * - "从文件恢复" → file input → 校验 → 确认 → restoreBackup() → 提示刷新
 */
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Database, Download, RefreshCw, Upload, AlertCircle, CheckCircle2, FileJson } from "lucide-react";
import {
  buildBackup,
  downloadBackupBundle,
  formatBytes,
  readBackupFile,
  restoreBackup,
  validateBackup,
  type BackupBundle,
  type ImportValidationResult
} from "./legalUniverseBackup";
import { useFocusTrap } from "./hooks/useFocusTrap";
import "./css/law-universe-lab-panels.css";

interface LawUniverseBackupPanelProps {
  open: boolean;
  onClose: () => void;
}

type Status =
  | { kind: "idle" }
  | { kind: "busy"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string; details?: string };

export function LawUniverseBackupPanel({ open, onClose }: LawUniverseBackupPanelProps) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [bundleSize, setBundleSize] = useState<number | null>(null);
  const [preview, setPreview] = useState<BackupBundle | null>(null);
  const [validation, setValidation] = useState<ImportValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 完整焦点陷阱:打开时把焦点送到 panel 内第一个 focusable 元素,Esc 关闭,关闭时恢复原焦点
  useFocusTrap(containerRef, open, { onEscape: onClose });

  // Open 时预计算 backup size,作为 "立即备份" 按钮的提示
  useEffect(() => {
    if (!open) {
      setStatus({ kind: "idle" });
      setPreview(null);
      setValidation(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const bundle = await buildBackup();
        if (cancelled) return;
        setBundleSize(JSON.stringify(bundle).length);
      } catch (err) {
        if (cancelled) return;
        setStatus({ kind: "error", message: "计算备份大小失败", details: (err as Error).message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  async function handleExport() {
    setStatus({ kind: "busy", message: "正在打包数据..." });
    try {
      const bundle = await buildBackup();
      downloadBackupBundle(bundle);
      setStatus({ kind: "success", message: `备份已下载 (${formatBytes(JSON.stringify(bundle).length)})` });
    } catch (err) {
      setStatus({ kind: "error", message: "导出失败", details: (err as Error).message });
    }
  }

  function handleFileSelect() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // 重置 input value,允许选同一文件
    if (event.target) event.target.value = "";
    if (!file) return;
    setStatus({ kind: "busy", message: `正在解析 ${file.name}...` });
    try {
      const raw = await readBackupFile(file);
      const result = validateBackup(raw);
      setPreview(raw as BackupBundle);
      setValidation(result);
      if (!result.ok) {
        setStatus({ kind: "error", message: "备份文件校验失败", details: result.errors.join("; ") });
        return;
      }
      setStatus({
        kind: "idle"
      });
    } catch (err) {
      setValidation(null);
      setPreview(null);
      setStatus({ kind: "error", message: "读取文件失败", details: (err as Error).message });
    }
  }

  async function handleConfirmRestore() {
    if (!preview || !validation?.ok) return;
    const ok = window.confirm(
      [
        "确认要恢复这份备份吗?",
        "",
        `源文件大小: ${formatBytes(JSON.stringify(preview).length)}`,
        validation.counts
          ? `包含: ${validation.counts.sourceDocs} 资料 / ${validation.counts.extractions} 抽取 / ${validation.counts.quizItems} 题目 / ${validation.counts.mistakes} 错题 / ${validation.counts.vaultMappings} 映射`
          : "",
        "",
        "⚠️ 恢复会覆盖现有的同 ID 数据 (LLM 设置 / 收藏 / 笔记 / Undo 栈也会被覆盖)。"
      ]
        .filter(Boolean)
        .join("\n")
    );
    if (!ok) return;
    setStatus({ kind: "busy", message: "正在恢复数据..." });
    try {
      await restoreBackup(preview, { overwrite: true });
      setStatus({ kind: "success", message: "恢复完成,即将刷新页面" });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setStatus({ kind: "error", message: "恢复失败", details: (err as Error).message });
    }
  }

  function handleCancelRestore() {
    setPreview(null);
    setValidation(null);
    setStatus({ kind: "idle" });
  }

  return (
    <div
      className="law-universe-modal-backdrop"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="presentation"
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- onClick is a propagation guard, role=dialog provides keyboard semantics via parent */}
      <div
        ref={containerRef}
        className="law-universe-backup-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="law-universe-backup-title"
        onClick={(e) => e.stopPropagation()}
        data-testid="law-universe-backup-panel"
      >
        <header className="law-universe-backup-panel__header">
          <Database size={18} strokeWidth={1.6} aria-hidden="true" />
          <h2 id="law-universe-backup-title">数据备份与恢复</h2>
          <button
            type="button"
            className="law-universe-backup-panel__close"
            onClick={onClose}
            aria-label="关闭数据备份面板"
            data-testid="law-universe-backup-close"
          >
            ×
          </button>
        </header>

        <div className="law-universe-backup-panel__body">
          <section className="law-universe-backup-panel__section">
            <h3>
              <Download size={14} strokeWidth={1.8} aria-hidden="true" />
              立即备份
            </h3>
            <p className="law-universe-backup-panel__desc">
              打包你本地的所有数据(上传资料、抽取结果、错题本、收藏笔记、LLM 设置)为单个 JSON 文件,保存到下载目录。
            </p>
            {bundleSize !== null ? (
              <p className="law-universe-backup-panel__meta" data-testid="law-universe-backup-size">
                当前数据量: <strong>{formatBytes(bundleSize)}</strong>
              </p>
            ) : (
              <p className="law-universe-backup-panel__meta">正在计算...</p>
            )}
            <button
              type="button"
              className="law-universe-backup-panel__btn law-universe-backup-panel__btn--primary"
              onClick={handleExport}
              disabled={status.kind === "busy"}
              data-testid="law-universe-backup-export"
            >
              <Download size={14} strokeWidth={1.8} />
              <span>导出为 JSON 文件</span>
            </button>
          </section>

          <section className="law-universe-backup-panel__section">
            <h3>
              <Upload size={14} strokeWidth={1.8} aria-hidden="true" />
              从文件恢复
            </h3>
            <p id="law-universe-backup-file-hint" className="law-universe-backup-panel__desc">
              选择之前导出的 JSON 备份文件。恢复会覆盖现有同 ID 数据,完成后会自动刷新页面。
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              style={{ display: "none" }}
              data-testid="law-universe-backup-file-input"
              aria-describedby="law-universe-backup-file-hint"
            />
            <button
              type="button"
              className="law-universe-backup-panel__btn"
              onClick={handleFileSelect}
              disabled={status.kind === "busy"}
              data-testid="law-universe-backup-pick-file"
            >
              <FileJson size={14} strokeWidth={1.8} />
              <span>选择备份文件</span>
            </button>

            {preview && validation ? (
              <div className="law-universe-backup-panel__preview" data-testid="law-universe-backup-preview">
                <header className="law-universe-backup-panel__preview-header">
                  {validation.ok ? (
                    <span className="law-universe-backup-panel__badge law-universe-backup-panel__badge--ok">
                      <CheckCircle2 size={12} strokeWidth={1.8} />
                      校验通过
                    </span>
                  ) : (
                    <span className="law-universe-backup-panel__badge law-universe-backup-panel__badge--err">
                      <AlertCircle size={12} strokeWidth={1.8} />
                      校验失败
                    </span>
                  )}
                  <span className="law-universe-backup-panel__preview-size">{formatBytes(JSON.stringify(preview).length)}</span>
                </header>
                {validation.counts ? (
                  <ul className="law-universe-backup-panel__counts">
                    <li>资料: {validation.counts.sourceDocs}</li>
                    <li>抽取: {validation.counts.extractions}</li>
                    <li>题目: {validation.counts.quizItems}</li>
                    <li>错题: {validation.counts.mistakes}</li>
                    <li>映射: {validation.counts.vaultMappings}</li>
                    <li>设置: {validation.counts.settings}</li>
                    <li>本地存储: {validation.counts.localStorageKeys} 项</li>
                  </ul>
                ) : null}
                {validation.warnings.length > 0 ? (
                  <ul className="law-universe-backup-panel__warnings">
                    {validation.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="law-universe-backup-panel__actions">
                  {validation.ok ? (
                    <>
                      <button
                        type="button"
                        className="law-universe-backup-panel__btn law-universe-backup-panel__btn--primary"
                        onClick={handleConfirmRestore}
                        disabled={status.kind === "busy"}
                      >
                        <RefreshCw size={14} strokeWidth={1.8} />
                        <span>确认恢复</span>
                      </button>
                      <button
                        type="button"
                        className="law-universe-backup-panel__btn"
                        onClick={handleCancelRestore}
                        disabled={status.kind === "busy"}
                      >
                        取消
                      </button>
                    </>
                  ) : (
                    <button type="button" className="law-universe-backup-panel__btn" onClick={handleCancelRestore}>
                      清除预览
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </section>

          {status.kind !== "idle" ? (
            <div
              className={`law-universe-backup-panel__status law-universe-backup-panel__status--${status.kind}`}
              role={status.kind === "error" ? "alert" : "status"}
              data-testid="law-universe-backup-status"
            >
              {status.kind === "busy" ? <RefreshCw size={14} className="law-universe-backup-panel__spinner" /> : null}
              {status.kind === "success" ? <CheckCircle2 size={14} strokeWidth={1.8} /> : null}
              {status.kind === "error" ? <AlertCircle size={14} strokeWidth={1.8} /> : null}
              <span>
                {status.message}
                {status.kind === "error" && status.details ? <small>{status.details}</small> : null}
              </span>
            </div>
          ) : null}
        </div>

        <footer className="law-universe-backup-panel__footer">
          <p>
            提示:浏览器清除站点数据(cookie / IndexedDB / localStorage)会丢失所有用户数据。建议每次重要操作前(上传新讲义 / 出题 / 改 LLM 设置)导出一份备份。
          </p>
        </footer>
      </div>
    </div>
  );
}
