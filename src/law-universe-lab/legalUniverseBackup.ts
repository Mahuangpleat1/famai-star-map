/**
 * DataBackup —— 全量数据备份 / 恢复 / 导入 / 导出。
 *
 * 包含所有用户数据:
 *   - IndexedDB: sourceDocs / extractions / settings / quizItems / mistakes / vaultMapping
 *   - localStorage: favorites-notes / undo-stack / onboarding flag / cheatsheet-seen / quiz-auto-prompt
 *
 * 导出格式: 单个 JSON 文件,带 schema version + meta(导出时间、用户、规模统计)。
 * 导入流程: 解析 → 校验 → 备份当前 → 写入 → 刷新。
 */

import {
  getLLMProviderConfig,
  listExtractions,
  listMistakes,
  listQuizItems,
  listSourceDocs,
  listVaultMappings,
  putExtraction,
  putMistake,
  putQuizItem,
  putSourceDoc,
  putVaultMapping,
  setLLMProviderConfig
} from "./legalUniverseUserDb";
import { DEFAULT_LLM_PROVIDER_CONFIG } from "./userDataTypes";
import type {
  LLMProviderConfig,
  UserExtraction,
  UserMistake,
  UserQuizItem,
  UserSourceDoc,
  VaultMapping
} from "./userDataTypes";

export const BACKUP_SCHEMA_VERSION = 1;
const BACKUP_MAGIC = "famai-star-map-backup";
const BACKUP_FORMAT_ID = "famai-star-map-user-backup";

const LOCAL_STORAGE_KEYS_TO_BACKUP = [
  "law-universe:favorites-notes:v1",
  "law-universe:undo-stack:v1",
  "law-universe:onboarding:v1",
  "law-universe:cheatsheet-seen:v1",
  "law-universe:quiz-auto-prompt:v1",
  "law-universe:workbench-highlight"
];

export interface BackupMetadata {
  exportedAt: number;
  schemaVersion: number;
  appVersion: string;
  counts: {
    sourceDocs: number;
    extractions: number;
    quizItems: number;
    mistakes: number;
    vaultMappings: number;
    settings: number;
    localStorageKeys: number;
  };
}

export interface BackupBundle {
  magic: typeof BACKUP_MAGIC;
  format: typeof BACKUP_FORMAT_ID;
  schemaVersion: number;
  meta: BackupMetadata;
  data: {
    sourceDocs: UserSourceDoc[];
    extractions: UserExtraction[];
    quizItems: UserQuizItem[];
    mistakes: UserMistake[];
    vaultMappings: VaultMapping[];
    settings: (Omit<LLMProviderConfig, "apiKey"> & { apiKey?: string }) | null;
    localStorage: Record<string, string>;
  };
}

export interface ImportValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  counts?: BackupMetadata["counts"];
}

/** Explicit allowlist: neither credentials nor future consent fields belong in backups. */
function publicSettings(config: Partial<LLMProviderConfig>): Omit<LLMProviderConfig, "apiKey"> {
  const defaults = DEFAULT_LLM_PROVIDER_CONFIG;
  return {
    baseURL: typeof config.baseURL === "string" ? config.baseURL : defaults.baseURL,
    model: typeof config.model === "string" ? config.model : defaults.model,
    temperature: typeof config.temperature === "number" && Number.isFinite(config.temperature) ? config.temperature : defaults.temperature,
    maxTokens: typeof config.maxTokens === "number" && Number.isFinite(config.maxTokens) ? config.maxTokens : defaults.maxTokens,
    updatedAt: typeof config.updatedAt === "number" && Number.isFinite(config.updatedAt) ? config.updatedAt : 0
  };
}

function readLocalStorageSnapshot(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const result: Record<string, string> = {};
  for (const key of LOCAL_STORAGE_KEYS_TO_BACKUP) {
    try {
      const value = window.localStorage.getItem(key);
      if (value !== null) {
        result[key] = value;
      }
    } catch {
      /* ignore */
    }
  }
  return result;
}

function writeLocalStorageSnapshot(snapshot: Record<string, string>): void {
  if (typeof window === "undefined") return;
  for (const [key, value] of Object.entries(snapshot)) {
    if (!LOCAL_STORAGE_KEYS_TO_BACKUP.includes(key) || typeof value !== "string") continue;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  }
}

function readAppVersion(): string {
  // 我们没有把版本写进 package.json import.meta,这里用一个 fallback
  // 真正的版本在 package.json,这里给个安全 default
  return "0.1.0";
}

/**
 * 收集所有用户数据并打包为 BackupBundle。
 */
export async function buildBackup(): Promise<BackupBundle> {
  const [sourceDocs, extractions, quizItems, mistakes, vaultMappings, settings] = await Promise.all([
    listSourceDocs(),
    listExtractions(),
    listQuizItems(),
    listMistakes(),
    listVaultMappings(),
    getLLMProviderConfig().catch(() => null)
  ]);
  const localStorage = readLocalStorageSnapshot();

  return {
    magic: BACKUP_MAGIC,
    format: BACKUP_FORMAT_ID,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    meta: {
      exportedAt: Date.now(),
      schemaVersion: BACKUP_SCHEMA_VERSION,
      appVersion: readAppVersion(),
      counts: {
        sourceDocs: sourceDocs.length,
        extractions: extractions.length,
        quizItems: quizItems.length,
        mistakes: mistakes.length,
        vaultMappings: vaultMappings.length,
        settings: settings ? 1 : 0,
        localStorageKeys: Object.keys(localStorage).length
      }
    },
    data: {
      sourceDocs,
      extractions,
      quizItems,
      mistakes,
      vaultMappings,
      settings: settings ? publicSettings(settings) : null,
      localStorage
    }
  };
}

/**
 * 校验导入 bundle 的合法性。
 */
export function validateBackup(input: unknown): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!input || typeof input !== "object") {
    errors.push("备份文件不是合法 JSON 对象");
    return { ok: false, errors, warnings };
  }
  const bundle = input as Partial<BackupBundle>;
  if (bundle.magic !== BACKUP_MAGIC) {
    errors.push(`magic 不匹配: 期望 ${BACKUP_MAGIC}, 实际 ${bundle.magic ?? "(missing)"}`);
  }
  if (bundle.format !== BACKUP_FORMAT_ID) {
    errors.push(`format 不匹配: 期望 ${BACKUP_FORMAT_ID}, 实际 ${bundle.format ?? "(missing)"}`);
  }
  if (typeof bundle.schemaVersion !== "number") {
    errors.push("schemaVersion 缺失或非数字");
  } else if (bundle.schemaVersion > BACKUP_SCHEMA_VERSION) {
    warnings.push(`备份 schemaVersion (${bundle.schemaVersion}) 高于当前应用版本 (${BACKUP_SCHEMA_VERSION}),导入将尽力兼容`);
  }
  if (!bundle.data || typeof bundle.data !== "object") {
    errors.push("data 字段缺失");
    return { ok: false, errors, warnings };
  }
  const d = bundle.data;
  const arrays = ["sourceDocs", "extractions", "quizItems", "mistakes", "vaultMappings"] as const;
  for (const key of arrays) {
    if (!Array.isArray(d[key])) {
      errors.push(`data.${key} 不是数组`);
    }
  }
  if (d.localStorage && typeof d.localStorage !== "object") {
    errors.push("data.localStorage 不是对象");
  }
  if (errors.length > 0) {
    return { ok: false, errors, warnings };
  }
  return {
    ok: true,
    errors,
    warnings,
    counts: bundle.meta?.counts
  };
}

export interface ImportOptions {
  /** 是否覆盖已有数据(否则跳过冲突的 id) */
  overwrite?: boolean;
}

/**
 * 合并写回 IndexedDB + localStorage；同 id 是否覆盖由 options 控制。
 */
export async function restoreBackup(bundle: BackupBundle, options: ImportOptions = {}): Promise<void> {
  const overwrite = options.overwrite ?? true;
  if (!overwrite) {
    // skip-overwrite 模式:只插入新 id
    const existing = new Set((await listExtractions()).map((x) => x.id));
    for (const ext of bundle.data.extractions) {
      if (!existing.has(ext.id)) await putExtraction(ext);
    }
    const existingDocs = new Set((await listSourceDocs()).map((x) => x.id));
    for (const doc of bundle.data.sourceDocs) {
      if (!existingDocs.has(doc.id)) await putSourceDoc(doc);
    }
    const existingQuiz = new Set((await listQuizItems()).map((x) => x.id));
    for (const q of bundle.data.quizItems) {
      if (!existingQuiz.has(q.id)) await putQuizItem(q);
    }
    const existingMistakes = new Set((await listMistakes()).map((x) => x.id));
    for (const m of bundle.data.mistakes) {
      if (!existingMistakes.has(m.id)) await putMistake(m);
    }
    const existingVm = new Set((await listVaultMappings()).map((x) => x.conceptId));
    for (const v of bundle.data.vaultMappings) {
      if (!existingVm.has(v.conceptId)) await putVaultMapping(v);
    }
  } else {
    // 覆盖模式:直接 put (id 相同的会被替换)
    for (const ext of bundle.data.extractions) await putExtraction(ext);
    for (const doc of bundle.data.sourceDocs) await putSourceDoc(doc);
    for (const q of bundle.data.quizItems) await putQuizItem(q);
    for (const m of bundle.data.mistakes) await putMistake(m);
    for (const v of bundle.data.vaultMappings) await putVaultMapping(v);
  }
  if (bundle.data.settings) {
    await setLLMProviderConfig({ ...publicSettings(bundle.data.settings), apiKey: "" });
  }
  if (bundle.data.localStorage) {
    writeLocalStorageSnapshot(bundle.data.localStorage);
  }
}

/**
 * 触发浏览器下载 backup JSON 文件。
 */
export function downloadBackupBundle(bundle: BackupBundle, fileName?: string): void {
  if (typeof window === "undefined") return;
  const safeBundle = { ...bundle, data: { ...bundle.data, settings: bundle.data.settings ? publicSettings(bundle.data.settings) : null } };
  const json = JSON.stringify(safeBundle, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName ?? `famai-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 解析用户选择的 JSON 备份文件。
 * 兼容 jsdom(无 File.text / arrayBuffer)和老浏览器:
 *   1. 优先 file.text()(Chrome 76+ / Firefox 69+ / Safari 14+)
 *   2. 回退 file.arrayBuffer() + TextDecoder
 *   3. 终极回退 FileReader(readAsText) —— jsdom 25 / 任何环境都有
 */
export async function readBackupFile(file: File): Promise<unknown> {
  let text: string;
  if (typeof file.text === "function") {
    text = await file.text();
  } else if (typeof file.arrayBuffer === "function") {
    const ab = await file.arrayBuffer();
    text = new TextDecoder().decode(ab);
  } else {
    // 终极兜底:FileReader。jsdom 25 的 File 缺失 Blob.text / arrayBuffer 时仍可用。
    text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"));
      reader.readAsText(file);
    });
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`文件不是合法 JSON: ${(err as Error).message}`);
  }
}

/** 解析后大小格式化 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
