/**
 * 导出到 Obsidian 面板 —— Phase 4 F.1 + F.2。
 *
 * F.1: 范围 (全部 / 单个 extraction) → generateMarkdownFiles + createZipBlob → .zip 下载。
 * F.2: 顶部加 mode toggle (导出 .zip / 双向同步)。
 *      双向模式: 选 vault 目录 → 导出到 vault / 同步 vault 变更 (File System Access API)。
 *      降级 (Safari/Firefox 不支持 showDirectoryPicker): 只显示 .zip 模式。
 */

import { useEffect, useRef, useState } from "react";
import { Download, X, Loader2, CheckCircle2, AlertCircle, FolderOpen, RefreshCw } from "lucide-react";
import { generateMarkdownFiles, type ObsidianFile } from "./legalUniverseObsidian";
import { createZipBlob } from "./legalUniverseObsidianZip";
import { useObsidianVault } from "./useObsidianVault";
import { useFocusTrap } from "./hooks/useFocusTrap";
import type { UserExtraction } from "./userDataTypes";

export interface LawUniverseObsidianExportPanelProps {
  open: boolean;
  onClose: () => void;
  extractions: UserExtraction[];
  sourceDocsMap: Map<string, { fileName: string }>;
}

type ExportMode = "zip" | "vault";
type SyncResult =
  | { kind: "export"; exported: number; skipped: number }
  | { kind: "import"; imported: number; conflicts: number }
  | null;

export function LawUniverseObsidianExportPanel({ open, onClose, extractions, sourceDocsMap }: LawUniverseObsidianExportPanelProps) {
  const [mode, setMode] = useState<ExportMode>("zip");
  const [selectedExtId, setSelectedExtId] = useState<string>("__all__");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: true; fileCount: number } | { ok: false; error: string } | null>(null);
  const vault = useObsidianVault();
  const [syncResult, setSyncResult] = useState<SyncResult>(null);
  const [vaultError, setVaultError] = useState<string | null>(null);
  const [vaultBusy, setVaultBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // 完整焦点陷阱
  useFocusTrap(panelRef, open, { onEscape: onClose });

  useEffect(() => {
    if (!open) {
      setResult(null);
      setBusy(false);
      setSelectedExtId("__all__");
      setMode("zip");
      setSyncResult(null);
      setVaultError(null);
      setVaultBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const handleExport = async () => {
    setBusy(true);
    setResult(null);
    try {
      const targetExts = selectedExtId === "__all__" ? extractions : extractions.filter((e) => e.id === selectedExtId);
      const files: ObsidianFile[] = generateMarkdownFiles(targetExts, sourceDocsMap as Map<string, never>);
      if (files.length === 0) {
        setResult({ ok: false, error: "没有可导出的概念" });
        return;
      }
      const blob = await createZipBlob(files);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `famai-obsidian-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setResult({ ok: true, fileCount: files.length });
    } catch (err) {
      setResult({ ok: false, error: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const handlePickVault = async () => {
    setVaultError(null);
    setSyncResult(null);
    setVaultBusy(true);
    try {
      await vault.pickVault();
    } catch (err) {
      setVaultError((err as Error).message);
    } finally {
      setVaultBusy(false);
    }
  };

  const handleExportToVault = async () => {
    setVaultError(null);
    setSyncResult(null);
    setVaultBusy(true);
    try {
      const r = await vault.exportToVault(extractions, sourceDocsMap as never);
      setSyncResult({ kind: "export", exported: r.exported, skipped: r.skipped });
    } catch (err) {
      setVaultError((err as Error).message);
    } finally {
      setVaultBusy(false);
    }
  };

  const handleSyncFromVault = async () => {
    setVaultError(null);
    setSyncResult(null);
    setVaultBusy(true);
    try {
      const r = await vault.syncFromVault();
      setSyncResult({ kind: "import", imported: r.imported, conflicts: r.conflicts });
    } catch (err) {
      setVaultError((err as Error).message);
    } finally {
      setVaultBusy(false);
    }
  };

  const switchMode = (next: ExportMode) => {
    setMode(next);
    setSyncResult(null);
    setVaultError(null);
  };

  return (
    <div className="law-universe-obsidian-export" data-testid="obsidian-export" role="dialog" aria-modal="true" aria-label="导出到 Obsidian">
      <div ref={panelRef} className="law-universe-obsidian-export__panel">
        <header className="law-universe-obsidian-export__head">
          <h3>导出到 Obsidian</h3>
          <button type="button" onClick={onClose} aria-label="关闭" data-testid="obsidian-export-close"><X size={14} /></button>
        </header>
        <div className="law-universe-obsidian-export__body">
          {/* === Mode toggle (F.2) === */}
          <div className="law-universe-obsidian-export__mode" data-testid="obsidian-export-mode">
            <button
              type="button"
              onClick={() => switchMode("zip")}
              className={mode === "zip" ? "is-active" : ""}
              data-testid="obsidian-export-mode-zip"
            >
              导出 .zip
            </button>
            {vault.isSupported ? (
              <button
                type="button"
                onClick={() => switchMode("vault")}
                className={mode === "vault" ? "is-active" : ""}
                data-testid="obsidian-export-mode-vault"
              >
                双向同步
              </button>
            ) : (
              <span
                className="law-universe-obsidian-export__unsupported"
                title="当前浏览器不支持 File System Access API"
                data-testid="obsidian-export-mode-vault-unsupported"
              >
                🔒 双向同步 (不支持)
              </span>
            )}
          </div>

          {/* === F.1: zip 模式 === */}
          {mode === "zip" ? (
            <>
              <label>
                范围:
                <select value={selectedExtId} onChange={(e) => setSelectedExtId(e.target.value)} data-testid="obsidian-export-scope">
                  <option value="__all__">全部 ({extractions.length} 个抽取)</option>
                  {extractions.map((e) => (
                    <option key={e.id} value={e.id}>{(e.concepts ?? []).length} 个 concept ({e.id.slice(0, 12)}…)</option>
                  ))}
                </select>
              </label>
              <p className="law-universe-obsidian-export__hint">每个 concept 生成 1 个 .md, 文件名按 system 分目录, relations 用 [[双链]]。</p>
              <button
                type="button"
                onClick={handleExport}
                disabled={busy || extractions.length === 0}
                data-testid="obsidian-export-generate"
              >
                {busy ? <><Loader2 className="spin" size={14} /> 生成中…</> : <><Download size={14} /> 生成并下载 .zip</>}
              </button>
              {result?.ok === true ? (
                <p className="law-universe-obsidian-export__ok" data-testid="obsidian-export-ok">
                  <CheckCircle2 size={14} /> 已下载 {result.fileCount} 个文件
                </p>
              ) : null}
              {result?.ok === false ? (
                <p className="law-universe-obsidian-export__err" data-testid="obsidian-export-err">
                  <AlertCircle size={14} /> {result.error}
                </p>
              ) : null}
            </>
          ) : null}

          {/* === F.2: vault 双向模式 === */}
          {mode === "vault" && vault.isSupported ? (
            <div className="law-universe-obsidian-export__vault" data-testid="obsidian-export-vault">
              {!vault.vaultHandle ? (
                <button
                  type="button"
                  onClick={handlePickVault}
                  disabled={vaultBusy}
                  data-testid="obsidian-pick-vault"
                >
                  <FolderOpen size={14} /> {vaultBusy ? "选择中…" : "选 vault 目录"}
                </button>
              ) : (
                <>
                  <p className="law-universe-obsidian-export__vault-path">
                    Vault: <strong>{vault.vaultHandle.name}</strong>
                  </p>
                  <div className="actions">
                    <button
                      type="button"
                      onClick={handleExportToVault}
                      disabled={vaultBusy || extractions.length === 0}
                      data-testid="obsidian-export-to-vault"
                    >
                      <Download size={14} /> {vaultBusy ? "导出中…" : "导出到 vault"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSyncFromVault}
                      disabled={vaultBusy}
                      data-testid="obsidian-sync-from-vault"
                    >
                      <RefreshCw size={14} /> {vaultBusy ? "同步中…" : "同步 vault 变更"}
                    </button>
                  </div>
                  {syncResult?.kind === "export" ? (
                    <p className="law-universe-obsidian-export__ok" data-testid="obsidian-export-result">
                      <CheckCircle2 size={14} /> 导出 {syncResult.exported} / 跳过 {syncResult.skipped}
                    </p>
                  ) : null}
                  {syncResult?.kind === "import" ? (
                    <p className="law-universe-obsidian-export__ok" data-testid="obsidian-sync-result">
                      <CheckCircle2 size={14} /> 导入 {syncResult.imported} / 冲突 {syncResult.conflicts}
                    </p>
                  ) : null}
                </>
              )}
              {vaultError ? (
                <p className="law-universe-obsidian-export__err" data-testid="obsidian-vault-err">
                  <AlertCircle size={14} /> {vaultError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
