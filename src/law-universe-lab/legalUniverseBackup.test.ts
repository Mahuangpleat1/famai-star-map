import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "fake-indexeddb/auto";
import {
  BACKUP_SCHEMA_VERSION,
  buildBackup,
  downloadBackupBundle,
  formatBytes,
  readBackupFile,
  restoreBackup,
  validateBackup,
  type BackupBundle
} from "./legalUniverseBackup";
import {
  __resetDBForTests,
  getLLMProviderConfig,
  putExtraction,
  putMistake,
  putQuizItem,
  putSourceDoc,
  putVaultMapping,
  setLLMProviderConfig
} from "./legalUniverseUserDb";
import type { UserExtraction, UserMistake, UserQuizItem, UserSourceDoc, VaultMapping } from "./userDataTypes";

const sampleDoc: UserSourceDoc = {
  id: "doc-1",
  fileName: "民法总论.txt",
  mimeType: "text/plain",
  sizeBytes: 1024,
  content: "民法总则是民法的总则。",
  uploadedAt: 1700000000000,
  status: "extracted"
};

const sampleExtraction: UserExtraction = {
  id: "ext-1",
  sourceDocId: "doc-1",
  status: "succeeded",
  startedAt: 1700000001000,
  completedAt: 1700000005000,
  reviewed: true,
  concepts: [
    {
      title: "民事主体",
      type: "principle",
      system: "civil",
      importance: 80,
      summary: "参与民事法律关系的个人或组织",
      keyPoints: ["自然人", "法人"],
      confidence: 75
    }
  ],
  relations: [
    {
      source: "民事主体",
      target: "自然人",
      type: "依据",
      strength: 60,
      citation: "民法典第2条"
    }
  ]
};

const sampleQuiz: UserQuizItem = {
  id: "q-1",
  conceptId: "ext-1::0",
  conceptTitle: "民事主体",
  payload: { type: "choice", stem: "民法典调整什么?", options: ["财产关系", "身份关系", "全部", "都不对"], correctIndex: 0 },
  spacedRepetition: { easeFactor: 2.5, interval: 1, repetitions: 0, dueAt: Date.now() + 86400000 },
  createdAt: 1700000010000
};

const sampleMistake: UserMistake = {
  id: "m-1",
  quizItemId: "q-1",
  conceptTitle: "民事主体",
  questionType: "choice",
  questionStem: "民法典调整什么?",
  userAnswer: "身份关系",
  correctAnswer: "财产关系",
  at: 1700000020000,
  attempts: 1
};

const sampleMapping: VaultMapping = {
  conceptId: "ext-1::0",
  fileName: "civil/民事主体.md",
  lastSyncedAt: 1700000030000,
  contentHash: 12345,
  fileModifiedAt: 1700000030000
};

beforeEach(async () => {
  await __resetDBForTests();
});

afterEach(async () => {
  await __resetDBForTests();
  vi.restoreAllMocks();
});

describe("validateBackup", () => {
  it("rejects non-object input", () => {
    const r = validateBackup("not json");
    expect(r.ok).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
  });

  it("rejects missing magic / format", () => {
    const r = validateBackup({});
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes("magic"))).toBe(true);
    expect(r.errors.some((e) => e.includes("format"))).toBe(true);
  });

  it("rejects when data is missing", () => {
    const r = validateBackup({ magic: "famai-star-map-backup", format: "famai-star-map-user-backup", schemaVersion: 1 });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes("data"))).toBe(true);
  });

  it("rejects when arrays are not arrays", () => {
    const r = validateBackup({
      magic: "famai-star-map-backup",
      format: "famai-star-map-user-backup",
      schemaVersion: 1,
      data: { sourceDocs: "not-array" }
    });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes("sourceDocs"))).toBe(true);
  });

  it("accepts a well-formed bundle", () => {
    const bundle = makeEmptyBundle();
    const r = validateBackup(bundle);
    expect(r.ok).toBe(true);
    expect(r.warnings).toEqual([]);
  });

  it("warns when schemaVersion > current", () => {
    const bundle = { ...makeEmptyBundle(), schemaVersion: BACKUP_SCHEMA_VERSION + 1 };
    const r = validateBackup(bundle);
    expect(r.ok).toBe(true);
    expect(r.warnings.length).toBe(1);
  });
});

describe("buildBackup + restoreBackup", () => {
  it("buildBackup returns empty bundle when DB is empty", async () => {
    const bundle = await buildBackup();
    expect(bundle.magic).toBe("famai-star-map-backup");
    expect(bundle.data.sourceDocs).toEqual([]);
    expect(bundle.data.extractions).toEqual([]);
    expect(bundle.data.quizItems).toEqual([]);
    expect(bundle.data.mistakes).toEqual([]);
    expect(bundle.data.vaultMappings).toEqual([]);
    expect(bundle.data.settings).toBeNull();
  });

  it("buildBackup reads all data from DB", async () => {
    await putSourceDoc(sampleDoc);
    await putExtraction(sampleExtraction);
    await putQuizItem(sampleQuiz);
    await putMistake(sampleMistake);
    await putVaultMapping(sampleMapping);
    await setLLMProviderConfig({ baseURL: "https://api.openai.com/v1", apiKey: "sk-test", model: "gpt-4o-mini", temperature: 0.2, maxTokens: 4096, updatedAt: 1 });

    const bundle = await buildBackup();
    expect(bundle.data.sourceDocs).toHaveLength(1);
    expect(bundle.data.extractions).toHaveLength(1);
    expect(bundle.data.quizItems).toHaveLength(1);
    expect(bundle.data.mistakes).toHaveLength(1);
    expect(bundle.data.vaultMappings).toHaveLength(1);
    expect(bundle.data.settings).not.toHaveProperty("apiKey");
    expect(bundle.meta.counts.sourceDocs).toBe(1);
  });

  it("restoreBackup writes all data back", async () => {
    const bundle = makeEmptyBundle();
    bundle.data.sourceDocs.push(sampleDoc);
    bundle.data.extractions.push(sampleExtraction);
    bundle.data.quizItems.push(sampleQuiz);
    bundle.data.mistakes.push(sampleMistake);
    bundle.data.vaultMappings.push(sampleMapping);
    bundle.data.settings = { baseURL: "https://x", apiKey: "k", model: "m", temperature: 0.5, maxTokens: 1000, updatedAt: 1 };
    bundle.data.localStorage = { "law-universe:onboarding:v1": "1" };

    await restoreBackup(bundle);

    const built = await buildBackup();
    expect(built.data.sourceDocs).toHaveLength(1);
    expect(built.data.extractions).toHaveLength(1);
    expect(built.data.quizItems).toHaveLength(1);
    expect(built.data.mistakes).toHaveLength(1);
    expect(built.data.vaultMappings).toHaveLength(1);
    expect(built.data.settings).not.toHaveProperty("apiKey");
    expect(window.localStorage.getItem("law-universe:onboarding:v1")).toBe("1");
  });

  it("restoreBackup overwrite=true replaces existing data with same id", async () => {
    await putSourceDoc({ ...sampleDoc, fileName: "OLD" });
    const bundle = makeEmptyBundle();
    bundle.data.sourceDocs.push({ ...sampleDoc, fileName: "NEW" });
    await restoreBackup(bundle);
    const built = await buildBackup();
    expect(built.data.sourceDocs).toHaveLength(1);
    expect(built.data.sourceDocs[0].fileName).toBe("NEW");
  });
});

describe("downloadBackupBundle", () => {
  it("triggers anchor click for download", () => {
    const clickSpy = vi.fn();
    const createObjectURL = vi.fn().mockReturnValue("blob:fake");
    const revokeObjectURL = vi.fn();
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    const anchor = document.createElement("a");
    const clickOrig = anchor.click;
    anchor.click = clickSpy as unknown as typeof anchor.click;
    const origCreate = document.createElement.bind(document);
    const createSpy = vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
      if (tag === "a") return anchor;
      return origCreate(tag);
    }) as typeof document.createElement);

    downloadBackupBundle(makeEmptyBundle());
    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    createSpy.mockRestore();
    anchor.click = clickOrig;
  });
});

describe("readBackupFile", () => {
  it("parses valid JSON", async () => {
    const file = new File([JSON.stringify({ a: 1 })], "test.json", { type: "application/json" });
    const result = await readBackupFile(file);
    expect(result).toEqual({ a: 1 });
  });

  it("throws on invalid JSON", async () => {
    const file = new File(["not json"], "test.json", { type: "application/json" });
    await expect(readBackupFile(file)).rejects.toThrow(/合法 JSON/);
  });
});

describe("formatBytes", () => {
  it("formats small", () => {
    expect(formatBytes(100)).toBe("100 B");
  });
  it("formats KB", () => {
    expect(formatBytes(2048)).toBe("2.0 KB");
  });
  it("formats MB", () => {
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.00 MB");
  });
});

function makeEmptyBundle(): BackupBundle {
  return {
    magic: "famai-star-map-backup",
    format: "famai-star-map-user-backup",
    schemaVersion: BACKUP_SCHEMA_VERSION,
    meta: {
      exportedAt: 0,
      schemaVersion: BACKUP_SCHEMA_VERSION,
      appVersion: "test",
      counts: {
        sourceDocs: 0,
        extractions: 0,
        quizItems: 0,
        mistakes: 0,
        vaultMappings: 0,
        settings: 0,
        localStorageKeys: 0
      }
    },
    data: {
      sourceDocs: [],
      extractions: [],
      quizItems: [],
      mistakes: [],
      vaultMappings: [],
      settings: null,
      localStorage: {}
    }
  };
}


describe("backup credential boundary", () => {
  beforeEach(async () => { await __resetDBForTests(); localStorage.clear(); });
  afterEach(() => __resetDBForTests());
  it("exports nonsecret settings without key or remember permission", async () => {
    await setLLMProviderConfig({baseURL: "https://first.example.invalid/v1", apiKey: "synthetic-export-key", model: "test", temperature: 0.2, maxTokens: 1000, updatedAt: 0}, {rememberKey: true});
    const bundle = await buildBackup();
    expect(JSON.stringify(bundle)).not.toContain("synthetic-export-key");
    expect(bundle.data.settings).not.toHaveProperty("apiKey");
    expect(bundle.data.settings).not.toHaveProperty("rememberKey");
  });
  it("clears old credentials when restoring another endpoint and ignores incoming keys", async () => {
    await setLLMProviderConfig({baseURL: "https://first.example.invalid/v1", apiKey: "synthetic-current-key", model: "test", temperature: 0.2, maxTokens: 1000, updatedAt: 0}, {rememberKey: true});
    const bundle = makeEmptyBundle();
    bundle.data.settings = {baseURL: "https://second.example.invalid/v1", apiKey: "synthetic-incoming-key", model: "test", temperature: 0.2, maxTokens: 1000, updatedAt: 0};
    bundle.data.localStorage = {"law-universe:onboarding:v1": "true", "law-universe:client-log-endpoint": "https://sink.example.invalid", "unrelated-app": "bad"};
    await restoreBackup(bundle);
    expect((await getLLMProviderConfig())?.baseURL).toBe("https://second.example.invalid/v1");
    expect((await getLLMProviderConfig())?.apiKey).toBe("");
    expect(localStorage.getItem("law-universe:onboarding:v1")).toBe("true");
    expect(localStorage.getItem("law-universe:client-log-endpoint")).toBeNull();
    expect(localStorage.getItem("unrelated-app")).toBeNull();
  });
});
