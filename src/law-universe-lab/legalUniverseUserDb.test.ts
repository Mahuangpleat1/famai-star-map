import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { __closeForTests, __resetDBForTests, getLLMProviderConfig, setLLMProviderConfig, getExtraction, putExtraction, replaceExtractions } from "./legalUniverseUserDb";
import { type UserExtraction, DEFAULT_LLM_PROVIDER_CONFIG } from "./userDataTypes";

const config = { ...DEFAULT_LLM_PROVIDER_CONFIG, apiKey: "synthetic-test-key" };
async function storedRecord(value?: unknown) {
  return new Promise<unknown>((resolve, reject) => {
    const open = indexedDB.open("famai-star-map-user-v1", 3);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction("settings", value ? "readwrite" : "readonly");
      const store = tx.objectStore("settings");
      const req = value ? store.put({key: "llmProviderConfig", value}) : store.get("llmProviderConfig");
      tx.oncomplete = () => { db.close(); resolve(req.result); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
    open.onerror = () => reject(open.error);
  });
}
beforeEach(() => __resetDBForTests());
afterEach(() => __resetDBForTests());
describe("provider key persistence", () => {
  it("keeps default key in memory only and forgets on fresh session", async () => {
    await setLLMProviderConfig(config);
    expect((await getLLMProviderConfig())?.apiKey).toBe(config.apiKey);
    expect(JSON.stringify(await storedRecord())).not.toContain(config.apiKey);
    await __closeForTests();
    expect((await getLLMProviderConfig())?.apiKey).toBe("");
  });
  it("remembers only with explicit opt-in and revokes persistence on default save", async () => {
    await setLLMProviderConfig(config, { rememberKey: true });
    await __closeForTests();
    expect((await getLLMProviderConfig())?.apiKey).toBe(config.apiKey);
    await setLLMProviderConfig(config);
    expect(JSON.stringify(await storedRecord())).not.toContain(config.apiKey);
  });
  it("migrates legacy keys to current session and scrubs disk", async () => {
    await setLLMProviderConfig({...config, apiKey: ""});
    await storedRecord(config);
    expect((await getLLMProviderConfig())?.apiKey).toBe(config.apiKey);
    expect(JSON.stringify(await storedRecord())).not.toContain(config.apiKey);
    await __closeForTests();
    expect((await getLLMProviderConfig())?.apiKey).toBe("");
  });
});


function extraction(id: string): UserExtraction {
  return {id, sourceDocId: `doc-${id}`, status: "succeeded", startedAt: 0, concepts: [], relations: [], reviewed: false};
}
describe("atomic extraction replacement", () => {
  it("updates a complete batch and reverses it with snapshots", async () => {
    const before = [extraction("a"), extraction("b")];
    for (const item of before) await putExtraction(item);
    const after = before.map(item => ({...item, reviewed: true}));
    await replaceExtractions(before, after);
    expect(await getExtraction("a")).toEqual(after[0]);
    expect(await getExtraction("b")).toEqual(after[1]);
    await replaceExtractions(after, before);
    expect(await getExtraction("a")).toEqual(before[0]);
    expect(await getExtraction("b")).toEqual(before[1]);
  });
  it("rejects stale snapshots without any partial writes", async () => {
    const before = [extraction("a"), extraction("b")];
    for (const item of before) await putExtraction(item);
    await putExtraction({...before[1], completedAt: 1});
    await expect(replaceExtractions(before, before.map(item => ({...item, reviewed: true})))).rejects.toThrow();
    expect(await getExtraction("a")).toEqual(before[0]);
    expect(await getExtraction("b")).toEqual({...before[1], completedAt: 1});
  });
  it("rejects writes whose id was not checked", async () => {
    await putExtraction(extraction("a"));
    await expect(replaceExtractions([extraction("a")], [extraction("b")])).rejects.toThrow();
    expect(await getExtraction("b")).toBeUndefined();
  });
});
