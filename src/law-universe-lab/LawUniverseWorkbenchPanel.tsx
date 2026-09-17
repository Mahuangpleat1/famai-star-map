/**
 * 个人法学宇宙工作台 —— Phase 0 上传 / 抽取 / 设置统一面板。
 *
 * 三个 section 纵向排列：
 *   1. 上传 + 抽取（拖拽 .txt / .md，调 LLM 抽取概念和关系）
 *   2. 抽取结果 inbox（list + 查看 + 删除 + 审核标记）
 *   3. LLM provider 设置（折叠，默认隐藏）
 *
 * 数据全部存在 IndexedDB（legalUniverseUserDb），刷新不丢。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Database, Download, FileText, Loader2, Settings2, Sparkles, Trash2, UploadCloud, X } from "lucide-react";
import { useFocusTrap } from "./hooks/useFocusTrap";
import "./css/law-universe-lab-panels.css";
import { LawUniverseObsidianExportPanel } from "./LawUniverseObsidianExportPanel";
import { LawUniverseBackupPanel } from "./LawUniverseBackupPanel";
import "./css/law-universe-lab-backup.css";
import {
  deleteExtraction,
  deleteSourceDoc,
  getLLMProviderConfig,
  getLLMProviderKeyRemembered,
  listExtractions,
  listMistakes,
  listSourceDocs,
  putExtraction,
  putSourceDoc,
  setLLMProviderConfig
} from "./legalUniverseUserDb";
import { extractLegalConcepts, MAX_SOURCE_CHARACTERS, validateProviderConfig } from "./legalUniverseLLM";
import { getConceptId } from "./legalUniverseConceptIdentity";
import { LawUniverseStudyPanel } from "./LawUniverseStudyPanel";
import { parsePdf, PdfTooLargeError, ScannedPdfError } from "./legalUniversePdf";
import {
  DEFAULT_LLM_PROVIDER_CONFIG,
  type LLMProviderConfig,
  type UserExtraction,
  type UserExtractedConcept,
  type UserExtractedRelation,
  type UserMistake,
  type UserSourceDoc
} from "./userDataTypes";

type WorkbenchPushToast = (item: {
  kind: "info" | "success" | "warning" | "error";
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}) => void;

interface LawUniverseWorkbenchPanelProps {
  open: boolean;
  onDataChanged?: () => void;
  onClose: () => void;
  /** Phase 3: 点击错题时跳到对应 concept 的详情面板。 */
  onSelectMistake?: (mistake: import("./userDataTypes").UserMistake) => void;
  /** Phase 3: 错题本版本号（增加时强制 reload）。 */
  mistakesVersion?: number;
  /**
   * 由父级传入的 pushToast,避免和 LabPage 的 useToast 双实例视觉重叠。
   * 不传时 fallback 到 console.warn(允许 WorkbenchPanel 单独使用)。
   */
  pushToast?: WorkbenchPushToast;
}

type InboxItem =
  | { kind: "doc"; doc: UserSourceDoc }
  | { kind: "extraction"; extraction: UserExtraction; doc: UserSourceDoc | null };

/** 简单的 uuid 兜底（IndexedDB 主键用，不依赖 crypto.randomUUID 的可用性）。 */
function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function formatTime(ts: number): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function LawUniverseWorkbenchPanel({ open, onClose, onSelectMistake, mistakesVersion, pushToast, onDataChanged }: LawUniverseWorkbenchPanelProps) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [mistakes, setMistakes] = useState<UserMistake[]>([]);
  const [providerConfig, setProviderConfig] = useState<LLMProviderConfig>(DEFAULT_LLM_PROVIDER_CONFIG);
  const [providerConfigLoaded, setProviderConfigLoaded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftConfig, setDraftConfig] = useState<LLMProviderConfig>(DEFAULT_LLM_PROVIDER_CONFIG);
  const [rememberKey, setRememberKey] = useState(false);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [progress, setProgress] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);
  const [isDragging, setIsDragging] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [busyFileId, setBusyFileId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedExtractionId, setExpandedExtractionId] = useState<string | null>(null);
  const [obsidianOpen, setObsidianOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const containerRef = useRef<HTMLElement>(null);
  // pushToast 由父级传入,避免和 LabPage 自己的 useToast 出现双实例视觉重叠。
  // 单测 / 独立使用场景没传 prop 时 fallback 到 console.warn,不丢提示语义。
  // useMemo 包住,避免每次 render 都创建新的 arrow(让 safePush 引用稳定,下游 useCallback deps 不会抖)。
  const safePush: WorkbenchPushToast = useMemo(
    () => pushToast ?? ((item) => console.warn(`[Workbench Toast] [${item.kind}] ${item.message}`)),
    [pushToast]
  );

  // 初始加载
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setProviderConfigLoaded(false);
    setErrorMessage(null);
    (async () => {
      try {
        const [docs, extractions, cfg, remembered, ms] = await Promise.all([listSourceDocs(), listExtractions(), getLLMProviderConfig(), getLLMProviderKeyRemembered(), listMistakes()]);
        if (cancelled) return;
        const docsById = new Map(docs.map((d) => [d.id, d]));
        const docItems: InboxItem[] = docs
          .filter((d) => !d.extractionId || !extractions.some(e => e.id === d.extractionId))
          .map((d) => ({ kind: "doc" as const, doc: d }));
        const extItems: InboxItem[] = extractions
          .sort((a, b) => b.startedAt - a.startedAt)
          .map((e) => ({ kind: "extraction" as const, extraction: e, doc: docsById.get(e.sourceDocId) ?? null }));
        setItems([...extItems, ...docItems]);
        setMistakes(ms.sort((a, b) => b.at - a.at));
        const resolvedCfg = cfg ?? DEFAULT_LLM_PROVIDER_CONFIG;
        setRememberKey(remembered);
        setSettingsOpen(!resolvedCfg.apiKey);
        setProviderConfig(resolvedCfg);
        setDraftConfig(resolvedCfg);
        setProviderConfigLoaded(true);
        // 一次性高亮：LabPage 通过 localStorage 传过来的 extractionId
        if (typeof window !== "undefined") {
          const highlight = window.localStorage.getItem("law-universe:workbench-highlight");
          if (highlight) {
            setExpandedExtractionId(highlight);
            window.localStorage.removeItem("law-universe:workbench-highlight");
          }
        }
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(`加载失败：${(err as Error).message}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Phase 3: mistakesVersion 变化时强制刷新错题本
  useEffect(() => {
    if (!open || loading) return;
    let cancelled = false;
    listMistakes()
      .then((ms) => { if (!cancelled) setMistakes(ms.sort((a, b) => b.at - a.at)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [mistakesVersion, open, loading]);

  // 完整焦点陷阱:打开时把焦点送到 panel 内第一个 focusable 元素,Tab 循环,关闭恢复
  useFocusTrap(containerRef, open, { onEscape: onClose });

  const reload = useCallback(async () => {
    try {
      const [docs, extractions] = await Promise.all([listSourceDocs(), listExtractions()]);
      const docsById = new Map(docs.map((d) => [d.id, d]));
      const docItems: InboxItem[] = docs.filter((d) => !d.extractionId || !extractions.some(e => e.id === d.extractionId)).map((d) => ({ kind: "doc" as const, doc: d }));
      const extItems: InboxItem[] = extractions
        .sort((a, b) => b.startedAt - a.startedAt)
        .map((e) => ({ kind: "extraction" as const, extraction: e, doc: docsById.get(e.sourceDocId) ?? null }));
      setItems([...extItems, ...docItems]);
      onDataChanged?.();
    } catch (err) {
      setErrorMessage(`刷新失败：${(err as Error).message}`);
    }
  }, [onDataChanged]);

  const parseFile = useCallback(
    async (
      file: File
    ): Promise<{
      mimeType: "text/plain" | "text/markdown" | "application/pdf";
      content: string;
      extractionMethod?: "native-text" | "scanned-empty";
    } | null> => {
      const lowerName = file.name.toLowerCase();
      const isMd = lowerName.endsWith(".md") || lowerName.endsWith(".markdown") || file.type === "text/markdown";
      const isTxt = lowerName.endsWith(".txt") || file.type === "text/plain";
      const isPdf = lowerName.endsWith(".pdf") || file.type === "application/pdf";

      if (isMd || isTxt) {
        if (file.size > MAX_SOURCE_CHARACTERS * 4) throw new Error("文本文件过大，请拆分为每份不超过 20 万字符");
        return { mimeType: isMd ? "text/markdown" : "text/plain", content: await file.text() };
      }

      if (isPdf) {
        // 100MB 硬拒
        if (file.size > 100 * 1024 * 1024) {
          throw new PdfTooLargeError(file.size);
        }
        // 20MB 软警告
        if (file.size > 20 * 1024 * 1024) {
          safePush({
            kind: "warning",
            message: `${file.name} 较大（${(file.size / 1024 / 1024).toFixed(1)}MB），解析可能需要数秒`
          });
        }
        const buf = await file.arrayBuffer();
        const result = await parsePdf(buf);
        if (result.method === "scanned-empty") {
          throw new ScannedPdfError(file.name, result.pageCount);
        }
        return { mimeType: "application/pdf", content: result.text, extractionMethod: result.method };
      }

      return null;
    },
    [safePush]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setErrorMessage(null);
      const list = Array.from(files);
      let okCount = 0;
      let skipCount = 0;
      for (const file of list) {
        try {
          const parsed = await parseFile(file);
          if (!parsed) {
            skipCount += 1;
            continue;
          }
          if (!parsed.content.trim()) throw new Error("资料内容为空");
          if (parsed.content.length > MAX_SOURCE_CHARACTERS) throw new Error("资料超过 20 万字符，请拆分后导入；不会截断内容");
          const doc: UserSourceDoc = {
            id: uuid(),
            fileName: file.name,
            mimeType: parsed.mimeType,
            sizeBytes: file.size,
            content: parsed.content,
            uploadedAt: Date.now(),
            status: "pending",
            ...(parsed.extractionMethod ? { extractionMethod: parsed.extractionMethod } : {})
          };
          await putSourceDoc(doc);
          okCount += 1;
        } catch (err) {
          if (err instanceof PdfTooLargeError) {
            setErrorMessage(err.message);
          } else if (err instanceof ScannedPdfError) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage(`处理 ${file.name} 失败：${(err as Error).message}`);
          }
          skipCount += 1;
        }
      }
      if (skipCount > 0) {
        setErrorMessage((prev) =>
          prev ? `${prev}\n另忽略 ${skipCount} 个文件` : `已忽略 ${skipCount} 个非 .txt / .md / .pdf 文件`
        );
      }
      await reload();
      if (okCount > 0) {
        // 暂不自动抽取，等用户点按钮（避免误消耗 token）
      }
    },
    [parseFile, reload]
  );

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!loading && e.target.files) {
        void handleFiles(e.target.files);
        e.target.value = "";
      }
    },
    [handleFiles, loading]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);
      if (!loading && e.dataTransfer.files) {
        void handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles, loading]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  }, []);

  const savePastedSource = async () => {
    if (!pasteText.trim()) { setErrorMessage("请先粘贴资料内容"); return; }
    if (pasteText.length > MAX_SOURCE_CHARACTERS) { setErrorMessage("资料超过 20 万字符，请拆分后导入"); return; }
    try {
      const content = pasteText.trim();
      await putSourceDoc({ id: uuid(), fileName: `${pasteTitle.trim() || "粘贴资料"}.txt`, mimeType: "text/plain", content, sizeBytes: new Blob([content]).size, uploadedAt: Date.now(), status: "pending" });
      setPasteText(""); setPasteTitle(""); setErrorMessage(null);
      await reload();
    } catch (err) { setErrorMessage(`保存失败：${(err as Error).message}`); }
  };

  const runDocuments = async (docs: UserSourceDoc[]) => {
    if (controllerRef.current || reportBusy || docs.length === 0) return;
    try { validateProviderConfig(providerConfig); }
    catch (err) { setErrorMessage((err as Error).message); setSettingsOpen(true); return; }
    const controller = new AbortController();
    controllerRef.current = controller;
    setErrorMessage(null);
    let completed = 0;
    try {
      for (const doc of docs) {
        if (controller.signal.aborted) break;
        setBusyFileId(doc.id);
        const extraction: UserExtraction = { id: doc.extractionId ?? uuid(), sourceDocId: doc.id, status: "running", startedAt: Date.now(), concepts: [], relations: [], reviewed: false };
        setProgress(`资料 ${completed + 1}/${docs.length} · ${doc.fileName} · 正在分析`);
        try {
          await putExtraction(extraction);
          await putSourceDoc({ ...doc, status: "extracting", extractionId: extraction.id, errorMessage: undefined });
          await reload();
          const previous = await listExtractions();
          const existingConcepts = previous.filter(e => e.status === "succeeded" && e.id !== extraction.id).flatMap(e => e.concepts.map((c, i) => ({ id: getConceptId(e.id, c, i), title: c.title, summary: c.summary, system: c.system })));
          const result = await extractLegalConcepts(providerConfig, doc.content, controller.signal, {
            existingConcepts,
            onProgress: (done, total) => setProgress(`资料 ${completed + 1}/${docs.length} · ${doc.fileName} · 分块 ${done}/${total}`)
          });
          controller.signal.throwIfAborted();
          await putExtraction({ ...extraction, status: "succeeded", completedAt: Date.now(), concepts: result.concepts.map((c, i) => ({ ...c, id: `${extraction.id}::${i}` })), relations: result.relations.map(relation => {
            const localId = (title: string) => {
              const matches = result.concepts.flatMap((c, i) => c.title === title ? [i] : []);
              return matches.length === 1 ? `${extraction.id}::${matches[0]}` : undefined;
            };
            return { ...relation, sourceConceptId: relation.sourceConceptId ?? localId(relation.source), targetConceptId: relation.targetConceptId ?? localId(relation.target) };
          }), rawResponse: result.rawResponse });
          await putSourceDoc({ ...doc, status: "extracted", extractionId: extraction.id, errorMessage: undefined });
          setExpandedExtractionId(extraction.id);
          completed += 1;
        } catch (err) {
          const message = controller.signal.aborted ? "分析已取消，可重新分析" : (err as Error).message;
          await putExtraction({ ...extraction, status: "failed", completedAt: Date.now(), errorMessage: message });
          await putSourceDoc({ ...doc, status: "failed", extractionId: extraction.id, errorMessage: message });
          setErrorMessage(`抽取失败：${message}`);
          break;
        } finally { await reload(); }
      }
      setProgress(`本次完成 ${completed}/${docs.length} 份资料，成功结果已同步到星图。`);
    } catch (err) { setErrorMessage(`保存分析状态失败：${(err as Error).message}`); }
    finally { controllerRef.current = null; setBusyFileId(null); }
  };

  const handleDeleteDoc = useCallback(
    async (doc: UserSourceDoc) => {
      try {
      if (doc.extractionId) {
        await deleteExtraction(doc.extractionId);
      }
      await deleteSourceDoc(doc.id);
      await reload();
      } catch (err) { setErrorMessage(`删除失败：${(err as Error).message}`); }
    },
    [reload]
  );

  const handleDeleteExtraction = useCallback(
    async (ext: UserExtraction) => {
      try {
      await deleteExtraction(ext.id);
      // 关联的 sourceDoc 解除关联
      if (ext.sourceDocId) {
        const sourceDoc = (await listSourceDocs()).find(d => d.id === ext.sourceDocId);
        if (sourceDoc) {
          await putSourceDoc({ ...sourceDoc, status: "pending", extractionId: undefined, errorMessage: undefined });
        }
      }
      await reload();
      } catch (err) { setErrorMessage(`删除抽取失败：${(err as Error).message}`); }
    },
    [reload]
  );

  const handleMarkReviewed = useCallback(
    async (ext: UserExtraction) => {
      try {
        await putExtraction({ ...ext, reviewed: !ext.reviewed });
        await reload();
      } catch (err) { setErrorMessage(`保存审核状态失败：${(err as Error).message}`); }
    },
    [reload]
  );

  const saveSettings = useCallback(async () => {
    const next: LLMProviderConfig = {
      ...draftConfig,
      baseURL: draftConfig.baseURL.trim().replace(/\/+$/, ""),
      model: draftConfig.model.trim(),
      apiKey: draftConfig.apiKey.trim(),
      maxTokens: Math.max(256, Math.min(32768, Math.round(draftConfig.maxTokens))),
      temperature: Math.max(0, Math.min(1, draftConfig.temperature)),
      updatedAt: Date.now()
    };
    try {
      // Empty key can be saved to forget a credential, but endpoint/model still need validation.
      validateProviderConfig({ ...next, apiKey: next.apiKey || "validation-only" });
      await setLLMProviderConfig(next, { rememberKey });
    } catch (err) { setErrorMessage(`设置保存失败：${(err as Error).message}`); return; }
    setProviderConfig(next);
    setDraftConfig(next);
    setSettingsOpen(false);
    setErrorMessage(null);
  }, [draftConfig, rememberKey]);

  const totalConcepts = useMemo(
    () => items.reduce((acc, it) => acc + (it.kind === "extraction" ? it.extraction.concepts.length : 0), 0),
    [items]
  );
  const totalRelations = useMemo(
    () => items.reduce((acc, it) => acc + (it.kind === "extraction" ? it.extraction.relations.length : 0), 0),
    [items]
  );

  // Phase 4 F.1: 喂给 Obsidian 导出面板的派生数据。
  // 只挑 succeeded / failed 的抽取(inbox 已经有 running 状态的也包含,Obsidian 那边会自然忽略空 concepts)。
  const obsidianExtractions = useMemo(
    () =>
      items.flatMap((it) => (it.kind === "extraction" ? [it.extraction] : [])),
    [items]
  );
  const obsidianSourceDocsMap = useMemo(() => {
    const m = new Map<string, { fileName: string }>();
    for (const it of items) {
      if (it.kind === "extraction" && it.doc) {
        m.set(it.extraction.sourceDocId, { fileName: it.doc.fileName });
      }
    }
    return m;
  }, [items]);

  const sourceDocs = items.flatMap(it => it.kind === "doc" ? [it.doc] : it.doc ? [it.doc] : []);
  const pendingDocs = sourceDocs.filter(d => d.status !== "extracted");
  const working = loading || busyFileId !== null || reportBusy;

  if (!open) return null;

  return (
    <aside ref={containerRef} className="law-universe-workbench" data-testid="law-universe-workbench" role="dialog" aria-label="个人法学宇宙工作台" aria-busy={loading}>
      <header className="law-universe-workbench__head">
        <span className="law-universe-workbench__title">法脉星河 · 个人学习工作台</span>
        <span className="law-universe-workbench__count">
          {loading ? "正在加载…" : `${items.length} 条 · ${totalConcepts} 概念 / ${totalRelations} 关系`}
        </span>
        <button type="button" className="law-universe-workbench__close" onClick={onClose} aria-label="关闭工作台" title="关闭">
          <X aria-hidden="true" size={14} strokeWidth={1.8} />
        </button>
      </header>

      <section className="law-universe-workbench__guide">
        <p><strong>自己的资料，自己的法律星系。</strong></p>
        <p>1. 配置 AI → 2. 导入或粘贴 → 3. 分析与连线 → 4. 生成学习报告</p>
        <p>预置星系是学习底图；AI 抽取内容会标为待审核，自动分入部门法星系。无法归类的概念进入待归类区。</p>
        <p>上传仅保存到此浏览器。点击分析或生成报告，将把资料或概念摘要发送到 <strong>{providerConfigLoaded ? providerConfig.baseURL : "（正在读取 AI 服务配置）"}</strong>，由你的服务商计费。</p>
      </section>
      {/* Section 1: 上传 — 拖拽区同时承担 "点按选择文件" 入口,因此 role=button + 键盘可达。
          拖拽本身只支持鼠标,但 Space/Enter 触发隐式 file picker(等价于点 [选择文件] 按钮)。 */}
      <section
        className={`law-universe-workbench__upload ${isDragging ? "is-dragging" : ""}`}
        role="button"
        tabIndex={working ? -1 : 0}
        aria-disabled={working}
        aria-label="拖拽文件到此处或按 Enter 选择文件"
        onClick={() => { if (!working) fileInputRef.current?.click(); }}
        onKeyDown={(e) => {
          if (!working && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        data-testid="law-universe-workbench-upload"
      >
        <UploadCloud aria-hidden="true" size={20} strokeWidth={1.6} />
        <p className="law-universe-workbench__upload-title">上传 .txt / .md / .pdf 资料</p>
        <p className="law-universe-workbench__upload-hint">拖拽到此处，或点击选择文件。支持 .txt / .md / .pdf（≤100MB）。</p>
        <button type="button" className="law-universe-workbench__upload-btn" disabled={working} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          选择文件
        </button>
        <input
          ref={fileInputRef}
          type="file"
          disabled={working}
          accept=".txt,text/plain,.md,.markdown,text/markdown,.pdf,application/pdf"
          multiple
          hidden
          onChange={onFileInputChange}
          data-testid="law-universe-workbench-file-input"
        />
      </section>

      <section className="law-universe-workbench__paste">
        <label className="law-universe-workbench__field"><span>资料标题</span>
          <input value={pasteTitle} onChange={e => setPasteTitle(e.target.value)} maxLength={120} placeholder="如：合同法课堂笔记" />
        </label>
        <label className="law-universe-workbench__field"><span>粘贴法律学习资料</span>
          <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} rows={4} placeholder="粘贴自己的讲义、案例摘录或学习笔记。请先去除个人信息。" />
        </label>
        <button type="button" className="law-universe-workbench__btn" onClick={() => void savePastedSource()} disabled={working || !pasteText.trim()}>保存粘贴资料</button>
      </section>
      <section className="law-universe-workbench__analysis" aria-label="资料分析">
        <button type="button" className="law-universe-workbench__btn law-universe-workbench__btn--primary" disabled={working || !providerConfigLoaded || pendingDocs.length === 0} onClick={() => void runDocuments(pendingDocs)}>分析待处理资料（{pendingDocs.length}）</button>
        {busyFileId ? <button type="button" className="law-universe-workbench__btn" onClick={() => controllerRef.current?.abort()}>取消分析</button> : null}
        {progress ? <p role="status">{progress}</p> : null}
        <p>长文自动分块；结合已有概念推断跨资料关系。分析失败会暂停队列，可修正设置后再次点击分析。</p>
      </section>

      {errorMessage ? <p className="law-universe-workbench__error" role="alert">{errorMessage}</p> : null}

      {/* Section 1.5: 错题本 */}
      {mistakes.length > 0 ? (
        <section className="law-universe-workbench__mistakes" data-testid="law-universe-workbench-mistakes">
          <h3 className="law-universe-workbench__section-title">错题本 · {mistakes.length}</h3>
          <ul className="law-universe-workbench__list">
            {mistakes.map((m) => (
              <li
                key={m.id}
                className="law-universe-workbench__mistake-item"
                data-testid="law-universe-workbench-mistake-item"
              >
                <p className="law-universe-workbench__mistake-title">{m.conceptTitle}</p>
                <p className="law-universe-workbench__mistake-meta">
                  {m.questionType === "choice" ? "选择题" : m.questionType === "fill" ? "填空" : "简答"} · {formatTime(m.at)} · 错 {m.attempts} 次
                </p>
                <p className="law-universe-workbench__mistake-stem">{m.questionStem.slice(0, 60)}{m.questionStem.length > 60 ? "…" : ""}</p>
                <div className="law-universe-workbench__mistake-actions">
                  <button
                    type="button"
                    onClick={() => onSelectMistake?.(m)}
                    className="law-universe-workbench__btn"
                    data-testid="law-universe-workbench-mistake-jump"
                  >
                    跳到详情
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Section 2: Inbox */}
      <section className="law-universe-workbench__inbox" data-testid="law-universe-workbench-inbox">
        <div className="law-universe-workbench__inbox-head">
          <h3 className="law-universe-workbench__section-title">抽取结果</h3>
          <button
            type="button"
            className="law-universe-workbench__btn law-universe-workbench__btn--primary"
            onClick={() => setObsidianOpen(true)}
            disabled={working || obsidianExtractions.length === 0}
            data-testid="law-universe-workbench-export-obsidian"
            title="把抽取结果导出为 Obsidian 兼容的 .md zip"
          >
            <Download aria-hidden="true" size={12} />
            导出 Obsidian
          </button>
          <button
            type="button"
            className="law-universe-workbench__btn"
            onClick={() => setBackupOpen(true)}
            data-testid="law-universe-workbench-backup"
            title="导出 / 恢复本地学习资料和设置；备份不包含 API Key"
            disabled={working}
          >
            <Database aria-hidden="true" size={12} />
            数据备份
          </button>
        </div>
        {loading ? (
          <p role="status">正在加载本地资料和设置…</p>
        ) : items.length === 0 ? (
          !errorMessage ? <p className="law-universe-workbench__empty">还没有上传任何资料。</p> : null
        ) : (
          <ul className="law-universe-workbench__list">
            {items.map((item) =>
              item.kind === "doc" ? (
                <DocItem
                  key={`doc-${item.doc.id}`}
                  doc={item.doc}
                  busy={working}
                  onExtract={() => void runDocuments([item.doc])}
                  onDelete={() => handleDeleteDoc(item.doc)}
                />
              ) : (
                <ExtractionItem
                  key={`ext-${item.extraction.id}`}
                  extraction={item.extraction}
                  doc={item.doc}
                  expanded={expandedExtractionId === item.extraction.id}
                  onToggle={() => setExpandedExtractionId((cur) => (cur === item.extraction.id ? null : item.extraction.id))}
                  onDelete={() => handleDeleteExtraction(item.extraction)}
                  onToggleReviewed={() => handleMarkReviewed(item.extraction)}
                  onReload={reload}
                  busy={working}
                />
              )
            )}
          </ul>
        )}
      </section>

      {!loading ? <LawUniverseStudyPanel config={providerConfig} extractions={obsidianExtractions} sourceDocs={sourceDocs} disabled={!providerConfigLoaded || busyFileId !== null} onBusyChange={setReportBusy} /> : null}

      {/* Section 3: LLM 设置（折叠） */}
      <section className="law-universe-workbench__settings">
        <button
          type="button"
          className="law-universe-workbench__settings-toggle"
          disabled={loading}
          onClick={() => setSettingsOpen((v) => !v)}
          aria-expanded={settingsOpen}
        >
          {settingsOpen ? <ChevronDown aria-hidden="true" size={14} /> : <ChevronRight aria-hidden="true" size={14} />}
          <Settings2 aria-hidden="true" size={14} strokeWidth={1.6} />
          <span>LLM Provider 设置</span>
          {providerConfigLoaded && providerConfig.apiKey ? <span className="law-universe-workbench__settings-status">已配置</span> : null}
        </button>
        {settingsOpen ? (
          <fieldset disabled={working} className="law-universe-workbench__settings-body">
            <label className="law-universe-workbench__field">
              <span>Base URL</span>
              <input
                type="text"
                aria-label="Base URL"
                value={draftConfig.baseURL}
                onChange={(e) => setDraftConfig((c) => ({ ...c, baseURL: e.target.value }))}
                placeholder="https://api.openai.com/v1"
                spellCheck={false}
                aria-describedby="law-universe-workbench-baseurl-hint"
              />
              <small id="law-universe-workbench-baseurl-hint">需要服务商支持 OpenAI-compatible chat/completions 与浏览器跨域请求；本地免鉴权服务可填写 local 作为占位密钥。</small>
            </label>
            <label className="law-universe-workbench__field">
              <span>API Key</span>
              <input
                type="password"
                aria-label="API Key"
                value={draftConfig.apiKey}
                onChange={(e) => setDraftConfig((c) => ({ ...c, apiKey: e.target.value }))}
                placeholder="sk-..."
                autoComplete="off"
                aria-describedby="law-universe-workbench-apikey-hint"
              />
              <small id="law-universe-workbench-apikey-hint">默认仅当前页面会话使用；刷新后重新填写。不要在不信任的网站输入密钥。</small>
            </label>
            <label className="law-universe-workbench__remember"><input type="checkbox" checked={rememberKey} onChange={e => setRememberKey(e.target.checked)} />在此浏览器记住 API Key（同源脚本和扩展可能读取）</label>
            <label className="law-universe-workbench__field">
              <span>Model</span>
              <input
                type="text"
                value={draftConfig.model}
                onChange={(e) => setDraftConfig((c) => ({ ...c, model: e.target.value }))}
                placeholder="gpt-4o-mini"
                spellCheck={false}
              />
            </label>
            <div className="law-universe-workbench__field-row">
              <label className="law-universe-workbench__field">
                <span>Temperature</span>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={draftConfig.temperature}
                  onChange={(e) => setDraftConfig((c) => ({ ...c, temperature: Number(e.target.value) }))}
                  aria-describedby="law-universe-workbench-temperature-hint"
                />
                <small id="law-universe-workbench-temperature-hint">0 = 确定性输出,1 = 最大随机性</small>
              </label>
              <label className="law-universe-workbench__field">
                <span>Max Tokens</span>
                <input
                  type="number"
                  min={256}
                  max={32768}
                  step={256}
                  value={draftConfig.maxTokens}
                  onChange={(e) => setDraftConfig((c) => ({ ...c, maxTokens: Number(e.target.value) }))}
                  aria-describedby="law-universe-workbench-maxtokens-hint"
                />
                <small id="law-universe-workbench-maxtokens-hint">范围 256–32768，默认 4096</small>
              </label>
            </div>
            <div className="law-universe-workbench__settings-actions">
              <button type="button" onClick={saveSettings} className="law-universe-workbench__btn law-universe-workbench__btn--primary">
                保存设置
              </button>
              <button
                type="button"
                onClick={() => setDraftConfig(providerConfig)}
                className="law-universe-workbench__btn"
              >
                重置
              </button>
            </div>
          </fieldset>
        ) : null}
      </section>

      {/* Phase 4 F.1: Obsidian 导出 modal */}
      <LawUniverseObsidianExportPanel
        open={obsidianOpen}
        onClose={() => setObsidianOpen(false)}
        extractions={obsidianExtractions}
        sourceDocsMap={obsidianSourceDocsMap}
      />
      <LawUniverseBackupPanel open={backupOpen} onClose={() => setBackupOpen(false)} />
    </aside>
  );
}

interface DocItemProps {
  doc: UserSourceDoc;
  busy: boolean;
  onExtract: () => void;
  onDelete: () => void;
}

function DocItem({ doc, busy, onExtract, onDelete }: DocItemProps) {
  return (
    <li className="law-universe-workbench__item" data-testid="law-universe-workbench-doc-item">
      <FileText aria-hidden="true" size={14} strokeWidth={1.6} />
      <div className="law-universe-workbench__item-main">
        <p className="law-universe-workbench__item-title">{doc.fileName}</p>
        <p className="law-universe-workbench__item-meta">
          {formatBytes(doc.sizeBytes)} · {doc.mimeType} · {formatTime(doc.uploadedAt)}
        </p>
      </div>
      <button
        type="button"
        onClick={onExtract}
        disabled={busy}
        className="law-universe-workbench__btn law-universe-workbench__btn--primary"
        data-testid="law-universe-workbench-extract-btn"
      >
        {busy ? <Loader2 aria-hidden="true" size={12} className="law-universe-workbench__spin" /> : <Sparkles aria-hidden="true" size={12} />}
        抽取
      </button>
      <button type="button" onClick={onDelete} disabled={busy} className="law-universe-workbench__btn" aria-label={`删除 ${doc.fileName}`}>
        <Trash2 aria-hidden="true" size={12} />
      </button>
    </li>
  );
}

interface ExtractionItemProps {
  extraction: UserExtraction;
  doc: UserSourceDoc | null;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onToggleReviewed: () => void;
  onReload: () => Promise<void>;
  busy: boolean;
}

function ExtractionItem({ extraction, doc, expanded, onToggle, onDelete, onToggleReviewed, onReload, busy }: ExtractionItemProps) {
  const statusLabel = extraction.status === "running" ? "抽取中" : extraction.status === "succeeded" ? "成功" : "失败";
  const statusClass = `law-universe-workbench__status--${extraction.status}`;
  return (
    <li className="law-universe-workbench__item" data-testid="law-universe-workbench-ext-item">
      <button type="button" className="law-universe-workbench__item-toggle" onClick={onToggle} aria-expanded={expanded}>
        <Sparkles aria-hidden="true" size={14} strokeWidth={1.6} />
        <div className="law-universe-workbench__item-main">
          <p className="law-universe-workbench__item-title">
            {doc?.fileName ?? "已删除的源资料"} <span className={`law-universe-workbench__status ${statusClass}`}>{statusLabel}</span>
            {extraction.reviewed ? <span className="law-universe-workbench__reviewed">已审核</span> : null}
          </p>
          <p className="law-universe-workbench__item-meta">
            {extraction.concepts.length} 概念 / {extraction.relations.length} 关系 · {formatTime(extraction.completedAt ?? extraction.startedAt)}
          </p>
        </div>
        {expanded ? <ChevronDown aria-hidden="true" size={14} /> : <ChevronRight aria-hidden="true" size={14} />}
      </button>
      {expanded ? (
        <div className="law-universe-workbench__ext-detail">
          {extraction.status === "failed" && extraction.errorMessage ? (
            <p className="law-universe-workbench__error-inline">错误：{extraction.errorMessage}</p>
          ) : null}
          {extraction.concepts.length > 0 ? (
            <ConceptsSection
              concepts={extraction.concepts}
              onChange={async (index, updated) => {
                const newConcepts = extraction.concepts.map((c, i) => (i === index ? updated : c));
                await putExtraction({ ...extraction, concepts: newConcepts });
                await onReload();
              }}
            />
          ) : null}
          {extraction.relations.length > 0 ? (
            <ExtractionDetailSection title="关系" items={extraction.relations.map((r) => relationLine(r))} />
          ) : null}
          <div className="law-universe-workbench__ext-actions">
            <button type="button" disabled={busy} onClick={onToggleReviewed} className="law-universe-workbench__btn">
              {extraction.reviewed ? "取消审核" : "标记已审核"}
            </button>
            <button type="button" disabled={busy} onClick={onDelete} className="law-universe-workbench__btn" aria-label="删除该次抽取">
              <Trash2 aria-hidden="true" size={12} /> 删除
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function ExtractionDetailSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="law-universe-workbench__ext-section">
      <h4>{title}</h4>
      <ul>
        {items.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function conceptLine(c: UserExtractedConcept): string {
  return `${c.title} · ${c.type} · ${c.system} · 重要度 ${c.importance} · ${c.summary}`;
}

function ConceptsSection({
  concepts,
  onChange
}: {
  concepts: UserExtractedConcept[];
  onChange: (index: number, updated: UserExtractedConcept) => Promise<void>;
}) {
  return (
    <div className="law-universe-workbench__ext-section" data-testid="law-universe-workbench-concepts">
      <h4>概念 · {concepts.length}</h4>
      <ul>
        {concepts.map((c, i) => (
          <li key={`${c.title}-${i}`} className="law-universe-workbench__concept-item">
            <p className="law-universe-workbench__concept-line">
              <span className="law-universe-workbench__concept-title">{c.title}</span>
              <span className="law-universe-workbench__concept-meta">
                {c.type} · {c.system} · 重要度 {c.importance}
              </span>
            </p>
            <label className="law-universe-workbench__concept-confidence">
              <span>置信度</span>
              <input
                type="range"
                min={0}
                max={100}
                value={typeof c.confidence === "number" ? c.confidence : 50}
                onChange={(e) => void onChange(i, { ...c, confidence: Number(e.target.value) })}
                data-testid={`law-universe-workbench-confidence-${i}`}
              />
              <output>{typeof c.confidence === "number" ? c.confidence : 50}</output>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function relationLine(r: UserExtractedRelation): string {
  return `${r.source} → ${r.target} · ${r.type} · 强度 ${r.strength} · ${r.citation || "—"}`;
}
