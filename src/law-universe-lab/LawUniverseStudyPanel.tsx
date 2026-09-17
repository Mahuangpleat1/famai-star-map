import { useEffect, useRef, useState } from "react";
import { generateStudyReport } from "./legalUniverseStudy";
import type { LLMProviderConfig, UserExtraction, UserSourceDoc } from "./userDataTypes";

interface Props {
  config: LLMProviderConfig;
  extractions: UserExtraction[];
  sourceDocs: UserSourceDoc[];
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}

export function LawUniverseStudyPanel({ config, extractions, sourceDocs, disabled, onBusyChange }: Props) {
  const [excludedDocs, setExcludedDocs] = useState<string[]>([]);
  const successful = extractions.filter(e => e.status === "succeeded" && !excludedDocs.includes(e.sourceDocId));
  const availableDocs = sourceDocs.filter((d, i) => sourceDocs.findIndex(other => other.id === d.id) === i && extractions.some(e => e.status === "succeeded" && e.sourceDocId === d.id));
  const [report, setReport] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const fingerprint = JSON.stringify([successful, availableDocs.map(d => [d.id, d.fileName])]);
  const currentFingerprint = useRef(fingerprint);
  currentFingerprint.current = fingerprint;

  useEffect(() => {
    controller.current?.abort();
    setReport("");
    setError("");
  }, [fingerprint]);
  useEffect(() => () => controller.current?.abort(), []);

  async function generate() {
    if (controller.current || disabled) return;
    const abort = new AbortController();
    controller.current = abort;
    const version = fingerprint;
    setBusy(true); onBusyChange(true); setError(""); setReport("");
    try {
      const result = await generateStudyReport(config, successful, sourceDocs, abort.signal);
      if (!abort.signal.aborted && currentFingerprint.current === version) setReport(result);
    } catch (err) {
      setError(abort.signal.aborted ? "生成已取消，可以重新生成。" : (err as Error).message);
    } finally {
      controller.current = null;
      setBusy(false); onBusyChange(false);
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([report], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `法脉星河-学习报告-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <section className="law-universe-workbench__study" aria-label="综合学习报告">
    <h3 className="law-universe-workbench__section-title">综合学习报告</h3>
    <p>整合 {successful.length} 份已分析资料的概念和关系，生成概览、星系要点、学习顺序与自测问题。</p>
    <p>AI 内容尚未经核实，仅供学习。请对照原文核查来源、法律效力和模型推断。</p>
    {availableDocs.length ? <details>
      <summary>报告资料范围（已选 {successful.length} 份）</summary>
      {availableDocs.map(doc => <label key={doc.id} className="law-universe-workbench__remember">
        <input type="checkbox" checked={!excludedDocs.includes(doc.id)} disabled={busy || disabled} onChange={e => setExcludedDocs(ids => e.target.checked ? ids.filter(id => id !== doc.id) : [...ids, doc.id])} />
        {doc.fileName}
      </label>)}
    </details> : null}
    <div className="law-universe-workbench__settings-actions">
      <button type="button" className="law-universe-workbench__btn law-universe-workbench__btn--primary" disabled={disabled || busy || successful.length === 0} onClick={() => void generate()}>{busy ? "正在生成…" : "生成学习报告"}</button>
      {busy ? <button type="button" className="law-universe-workbench__btn" onClick={() => controller.current?.abort()}>取消生成</button> : null}
      {report ? <button type="button" className="law-universe-workbench__btn" onClick={download}>下载 Markdown</button> : null}
    </div>
    {error ? <p role="alert" className="law-universe-workbench__error">{error}</p> : null}
    {report ? <pre className="law-universe-workbench__report" data-testid="study-report">{report}</pre> : null}
  </section>;
}
