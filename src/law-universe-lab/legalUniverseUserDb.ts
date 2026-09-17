/**
 * IndexedDB 薄封装 —— Phase 0 用户数据存储。
 *
 * 单 db：famai-star-map-user-v1
 * 3 个 object store：
 *   - sourceDocs  原始资料（id 为主键）
 *   - extractions 抽取任务（id 为主键，sourceDocId 为索引）
 *   - settings    设置项（key 为主键，单条存 LLMProviderConfig）
 *
 * IndexedDB 直接使用浏览器 API，不额外引入数据库封装依赖。
 * 若后续 store > 5 或需要事务链，再换。
 */

import {
  DEFAULT_LLM_PROVIDER_CONFIG,
  type LLMProviderConfig,
  type UserExtraction,
  type UserMistake,
  type UserQuizItem,
  type UserSourceDoc,
  type VaultMapping
} from "./userDataTypes";

const DB_NAME = "famai-star-map-user-v1";
const DB_VERSION = 3;
const STORE_SOURCE_DOCS = "sourceDocs";
const STORE_EXTRACTIONS = "extractions";
const STORE_SETTINGS = "settings";
const STORE_QUIZ_ITEMS = "quizItems";
const STORE_MISTAKES = "mistakes";
const STORE_VAULT_MAPPING = "vaultMapping";

const SETTING_KEY_LLM = "llmProviderConfig";

let dbPromise: Promise<IDBDatabase> | null = null;
let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB unavailable in this environment"));
  }
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_SOURCE_DOCS)) {
        db.createObjectStore(STORE_SOURCE_DOCS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_EXTRACTIONS)) {
        const store = db.createObjectStore(STORE_EXTRACTIONS, { keyPath: "id" });
        store.createIndex("sourceDocId", "sourceDocId", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE_QUIZ_ITEMS)) {
        const quizStore = db.createObjectStore(STORE_QUIZ_ITEMS, { keyPath: "id" });
        quizStore.createIndex("conceptId", "conceptId", { unique: false });
        quizStore.createIndex("dueAt", "dueAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_MISTAKES)) {
        const mistakeStore = db.createObjectStore(STORE_MISTAKES, { keyPath: "id" });
        mistakeStore.createIndex("quizItemId", "quizItemId", { unique: false });
        mistakeStore.createIndex("conceptTitle", "conceptTitle", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_VAULT_MAPPING)) {
        const vaultStore = db.createObjectStore(STORE_VAULT_MAPPING, { keyPath: "conceptId" });
        vaultStore.createIndex("fileName", "fileName", { unique: false });
        vaultStore.createIndex("lastSyncedAt", "lastSyncedAt", { unique: false });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      dbInstance = db;
      // production: connection stays open; tests close via __closeForTests
      resolve(db);
    };
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
    request.onblocked = () => reject(new Error("IndexedDB open blocked by another tab"));
  });

  return dbPromise;
}

function withStore<T>(storeName: string, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => void): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        let result: T;
        const request = fn(store) as unknown as IDBRequest<T> | undefined;
        if (request) {
          request.onsuccess = () => {
            result = request.result;
          };
          request.onerror = () => reject(request.error);
        }
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new Error("Transaction aborted"));
      })
  );
}

function withVoidStore(storeName: string, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => void): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        fn(tx.objectStore(storeName));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new Error("Transaction aborted"));
      })
  );
}

// --- sourceDocs ---

export function putSourceDoc(doc: UserSourceDoc): Promise<UserSourceDoc> {
  return withStore<UserSourceDoc>(STORE_SOURCE_DOCS, "readwrite", (store) => store.put(doc));
}

export function getSourceDoc(id: string): Promise<UserSourceDoc | undefined> {
  return withStore<UserSourceDoc | undefined>(STORE_SOURCE_DOCS, "readonly", (store) => store.get(id));
}

export function listSourceDocs(): Promise<UserSourceDoc[]> {
  return withStore<UserSourceDoc[]>(STORE_SOURCE_DOCS, "readonly", (store) => store.getAll());
}

export function deleteSourceDoc(id: string): Promise<void> {
  return withVoidStore(STORE_SOURCE_DOCS, "readwrite", (store) => {
    store.delete(id);
  });
}

// --- extractions ---

export function putExtraction(extraction: UserExtraction): Promise<UserExtraction> {
  return withStore<UserExtraction>(STORE_EXTRACTIONS, "readwrite", (store) => store.put(extraction));
}

export function getExtraction(id: string): Promise<UserExtraction | undefined> {
  return withStore<UserExtraction | undefined>(STORE_EXTRACTIONS, "readonly", (store) => store.get(id));
}

export function listExtractions(): Promise<UserExtraction[]> {
  return withStore<UserExtraction[]>(STORE_EXTRACTIONS, "readonly", (store) => store.getAll());
}

export function deleteExtraction(id: string): Promise<void> {
  return withVoidStore(STORE_EXTRACTIONS, "readwrite", (store) => {
    store.delete(id);
  });
}

/** Structural comparison for plain IndexedDB extraction records (key order is immaterial). */
function sameStoredValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every(key =>
    Object.prototype.hasOwnProperty.call(right, key) && sameStoredValue(left[key], right[key])
  );
}

/** Compare-and-replace batch, shared by merge and undo. No unchecked record is overwritten. */
export async function replaceExtractions(expected: UserExtraction[], replacements: UserExtraction[]): Promise<void> {
  const expectedIds = new Set(expected.map(item => item.id));
  const replacementIds = new Set(replacements.map(item => item.id));
  if (expectedIds.size !== expected.length || replacementIds.size !== replacements.length ||
      replacements.some(item => !expectedIds.has(item.id))) {
    throw new Error("Invalid extraction replacement batch");
  }
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_EXTRACTIONS, "readwrite");
    const store = tx.objectStore(STORE_EXTRACTIONS);
    let failure: Error | null = null;
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(failure ?? tx.error ?? new Error("Extraction transaction aborted"));
    tx.onerror = () => reject(failure ?? tx.error ?? new Error("Extraction transaction failed"));
    const request = store.getAll();
    request.onsuccess = () => {
      try {
        const current = new Map((request.result as UserExtraction[]).map(item => [item.id, item]));
        if (expected.some(item => !sameStoredValue(item, current.get(item.id)))) {
          throw new Error("资料已在其他操作或标签页更新，请刷新后重试");
        }
        for (const replacement of replacements) store.put(replacement);
      } catch (error) {
        failure = error instanceof Error ? error : new Error("Extraction replacement failed");
        tx.abort();
      }
    };
  });
}

// --- settings (LLM provider config) ---

interface SettingRecord<T> {
  key: string;
  value: T;
}

let sessionCredential: { baseURL: string; apiKey: string } | null = null;
interface LLMSettingRecord extends SettingRecord<LLMProviderConfig> {
  rememberKey?: boolean;
}

export async function getLLMProviderConfig(): Promise<LLMProviderConfig | null> {
  const record = await withStore<LLMSettingRecord | undefined>(STORE_SETTINGS, "readonly", (store) =>
    store.get(SETTING_KEY_LLM)
  );
  if (!record) return null;
  const config = { ...DEFAULT_LLM_PROVIDER_CONFIG, ...record.value };
  if (record.rememberKey === true) return config;
  // Old versions persisted keys without consent. Keep a legacy key for this
  // page only, but finish scrubbing disk before returning it to a caller.
  if (config.apiKey) {
    sessionCredential = { baseURL: config.baseURL, apiKey: config.apiKey };
    await withVoidStore(STORE_SETTINGS, "readwrite", (store) => {
      store.put({ key: SETTING_KEY_LLM, value: { ...config, apiKey: "" }, rememberKey: false });
    });
  }
  return { ...config, apiKey: sessionCredential?.baseURL === config.baseURL ? sessionCredential.apiKey : "" };
}

export async function getLLMProviderKeyRemembered(): Promise<boolean> {
  await getLLMProviderConfig(); // also migrate legacy credentials
  const record = await withStore<LLMSettingRecord | undefined>(STORE_SETTINGS, "readonly", (store) =>
    store.get(SETTING_KEY_LLM)
  );
  return record?.rememberKey === true;
}

export async function setLLMProviderConfig(
  config: LLMProviderConfig,
  options: { rememberKey?: boolean } = {}
): Promise<LLMProviderConfig> {
  const rememberKey = options.rememberKey === true;
  const record: LLMSettingRecord = {
    key: SETTING_KEY_LLM,
    value: { ...config, apiKey: rememberKey ? config.apiKey : "" },
    rememberKey
  };
  await withVoidStore(STORE_SETTINGS, "readwrite", (store) => { store.put(record); });
  sessionCredential = { baseURL: config.baseURL, apiKey: config.apiKey };
  return config;
}

// --- test-only helpers ---

// --- quizItems ---

export function putQuizItem(item: UserQuizItem): Promise<UserQuizItem> {
  return withStore<UserQuizItem>(STORE_QUIZ_ITEMS, "readwrite", (store) => store.put(item));
}

export function getQuizItem(id: string): Promise<UserQuizItem | undefined> {
  return withStore<UserQuizItem | undefined>(STORE_QUIZ_ITEMS, "readonly", (store) => store.get(id));
}

export function listQuizItems(): Promise<UserQuizItem[]> {
  return withStore<UserQuizItem[]>(STORE_QUIZ_ITEMS, "readonly", (store) => store.getAll());
}

export function listQuizItemsByConcept(conceptId: string): Promise<UserQuizItem[]> {
  return withStore<UserQuizItem[]>(STORE_QUIZ_ITEMS, "readonly", (store) => {
    const idx = store.index("conceptId");
    return idx.getAll(conceptId);
  });
}

export function deleteQuizItem(id: string): Promise<void> {
  return withVoidStore(STORE_QUIZ_ITEMS, "readwrite", (store) => {
    store.delete(id);
  });
}

// --- mistakes ---

export function putMistake(mistake: UserMistake): Promise<UserMistake> {
  return withStore<UserMistake>(STORE_MISTAKES, "readwrite", (store) => store.put(mistake));
}

export function listMistakes(): Promise<UserMistake[]> {
  return withStore<UserMistake[]>(STORE_MISTAKES, "readonly", (store) => store.getAll());
}

export function deleteMistake(id: string): Promise<void> {
  return withVoidStore(STORE_MISTAKES, "readwrite", (store) => {
    store.delete(id);
  });
}

// --- vaultMapping (Phase 4 F.2) ---

export function putVaultMapping(mapping: VaultMapping): Promise<VaultMapping> {
  return withStore<VaultMapping>(STORE_VAULT_MAPPING, "readwrite", (store) => store.put(mapping));
}

export function getVaultMapping(conceptId: string): Promise<VaultMapping | undefined> {
  return withStore<VaultMapping | undefined>(STORE_VAULT_MAPPING, "readonly", (store) => store.get(conceptId));
}

export function listVaultMappings(): Promise<VaultMapping[]> {
  return withStore<VaultMapping[]>(STORE_VAULT_MAPPING, "readonly", (store) => store.getAll());
}

export function deleteVaultMapping(conceptId: string): Promise<void> {
  return withVoidStore(STORE_VAULT_MAPPING, "readwrite", (store) => {
    store.delete(conceptId);
  });
}

/** 关闭活跃连接 + 清空 module-level 引用。生产代码不应调用。 */
export function __closeForTests(): Promise<void> {
  dbPromise = null;
  sessionCredential = null;
  if (!dbInstance) return Promise.resolve();
  const db = dbInstance;
  dbInstance = null;
  db.close();
  return new Promise((resolve) => {
    // 等 onclose 事件
    setTimeout(resolve, 0);
  });
}

export function __resetDBForTests(): Promise<void> {
  if (typeof indexedDB === "undefined") return Promise.resolve();
  return __closeForTests().then(
    () =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error("deleteDatabase blocked"));
      })
  );
}
