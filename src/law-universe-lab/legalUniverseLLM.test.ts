/**
 * LLM provider 单元测试 —— 聚焦 JSON 解析容错和 prompt 结构。
 * 请求在 fetch 边界使用测试响应，不调用真实服务。
 */

import { describe, expect, it } from "vitest";
import { extractLegalConcepts, EXTRACT_PROMPT, ExtractionError } from "./legalUniverseLLM";
import type { LLMProviderConfig } from "./userDataTypes";

const baseConfig: LLMProviderConfig = {
  baseURL: "https://api.openai.com/v1",
  apiKey: "sk-test",
  model: "gpt-4o-mini",
  temperature: 0.2,
  maxTokens: 4096,
  updatedAt: 0
};

describe("legalUniverseLLM", () => {
  it("EXTRACT_PROMPT 包含关键字段约束", () => {
    expect(EXTRACT_PROMPT).toContain("concepts");
    expect(EXTRACT_PROMPT).toContain("relations");
    expect(EXTRACT_PROMPT).toContain("statute|principle|case|doctrine|theory");
    expect(EXTRACT_PROMPT).toContain("依据|解释|修正|适用|类推|冲突|继承|发展");
    expect(EXTRACT_PROMPT).toContain("civil|criminal|administrative");
  });

  it("未配置 API Key 时抛 auth 错误", async () => {
    await expect(
      extractLegalConcepts({ ...baseConfig, apiKey: "" }, "some text")
    ).rejects.toMatchObject({ kind: "auth" });
  });

  it("空文本抛 empty 错误", async () => {
    await expect(extractLegalConcepts(baseConfig, "   ")).rejects.toBeInstanceOf(ExtractionError);
    await expect(extractLegalConcepts(baseConfig, "   ")).rejects.toMatchObject({ kind: "empty" });
  });

  it("fetch 网络错误包成 ExtractionError", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () => Promise.reject(new Error("boom"));
    try {
      await expect(extractLegalConcepts(baseConfig, "test")).rejects.toMatchObject({ kind: "network" });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("401 抛 auth 错误", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(new Response("unauthorized", { status: 401 })) as unknown as Promise<Response>;
    try {
      await expect(extractLegalConcepts(baseConfig, "test")).rejects.toMatchObject({ kind: "auth" });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("429 抛 rate-limit 错误", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(new Response("rate limited", { status: 429 })) as unknown as Promise<Response>;
    try {
      await expect(extractLegalConcepts(baseConfig, "test")).rejects.toMatchObject({ kind: "rate-limit" });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("正常 JSON 解析成功", async () => {
    const llmResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              concepts: [
                {
                  title: "善意取得",
                  type: "principle",
                  system: "civil",
                  importance: 85,
                  summary: "无权处分人将动产或不动产转让给善意第三人时，善意第三人在符合条件下取得所有权。",
                  keyPoints: ["受让人须为善意", "以合理价格转让", "完成法定登记或交付"]
                },
                { title: "物权变动", type: "principle", system: "civil", importance: 50, summary: "物权发生变动", keyPoints: [] }
              ],
              relations: [
                {
                  source: "善意取得",
                  target: "物权变动",
                  type: "依据",
                  strength: 80,
                  citation: "《民法典》第311条"
                }
              ]
            })
          }
        }
      ]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(new Response(JSON.stringify(llmResponse), { status: 200 })) as unknown as Promise<Response>;
    try {
      const result = await extractLegalConcepts(baseConfig, "test");
      expect(result.concepts).toHaveLength(2);
      expect(result.concepts[0].title).toBe("善意取得");
      expect(result.concepts[0].type).toBe("principle");
      expect(result.concepts[0].system).toBe("civil");
      expect(result.concepts[0].importance).toBe(85);
      expect(result.concepts[0].keyPoints).toHaveLength(3);
      expect(result.relations).toHaveLength(1);
      expect(result.relations[0].source).toBe("善意取得");
      expect(result.relations[0].target).toBe("物权变动");
      expect(result.relations[0].type).toBe("依据");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("JSON 包了 markdown code block 也能解析", async () => {
    const llmResponse = {
      choices: [
        {
          message: {
            content: "```json\n" + JSON.stringify({
              concepts: [{ title: "test", type: "doctrine", system: "criminal", importance: 50, summary: "x", keyPoints: [] }],
              relations: []
            }) + "\n```"
          }
        }
      ]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(new Response(JSON.stringify(llmResponse), { status: 200 })) as unknown as Promise<Response>;
    try {
      const result = await extractLegalConcepts(baseConfig, "test");
      expect(result.concepts).toHaveLength(1);
      expect(result.concepts[0].type).toBe("doctrine");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("非法 JSON 抛 schema 错误", async () => {
    const llmResponse = {
      choices: [{ message: { content: "not json" } }]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(new Response(JSON.stringify(llmResponse), { status: 200 })) as unknown as Promise<Response>;
    try {
      await expect(extractLegalConcepts(baseConfig, "test")).rejects.toMatchObject({ kind: "schema" });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("非法 type 字段降级为 principle", async () => {
    const llmResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              concepts: [{ title: "x", type: "invalid-type", system: "civil", importance: 50, summary: "", keyPoints: [] }],
              relations: []
            })
          }
        }
      ]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(new Response(JSON.stringify(llmResponse), { status: 200 })) as unknown as Promise<Response>;
    try {
      const result = await extractLegalConcepts(baseConfig, "test");
      expect(result.concepts[0].type).toBe("principle");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("importance 越界被 clamp 到 1-100", async () => {
    const llmResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              concepts: [
                { title: "low", type: "principle", system: "civil", importance: -5, summary: "", keyPoints: [] },
                { title: "high", type: "principle", system: "civil", importance: 200, summary: "", keyPoints: [] },
                { title: "nan", type: "principle", system: "civil", importance: "abc", summary: "", keyPoints: [] }
              ],
              relations: []
            })
          }
        }
      ]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(new Response(JSON.stringify(llmResponse), { status: 200 })) as unknown as Promise<Response>;
    try {
      const result = await extractLegalConcepts(baseConfig, "test");
      expect(result.concepts[0].importance).toBe(1);
      expect(result.concepts[1].importance).toBe(100);
      expect(result.concepts[2].importance).toBe(50);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("空标题的概念被过滤", async () => {
    const llmResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              concepts: [
                { title: "", type: "principle", system: "civil", importance: 50, summary: "", keyPoints: [] },
                { title: "  ", type: "principle", system: "civil", importance: 50, summary: "", keyPoints: [] },
                { title: "valid", type: "principle", system: "civil", importance: 50, summary: "", keyPoints: [] }
              ],
              relations: []
            })
          }
        }
      ]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(new Response(JSON.stringify(llmResponse), { status: 200 })) as unknown as Promise<Response>;
    try {
      const result = await extractLegalConcepts(baseConfig, "test");
      expect(result.concepts).toHaveLength(1);
      expect(result.concepts[0].title).toBe("valid");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("关系 source/target 为空时被过滤", async () => {
    const llmResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              concepts: [
                { title: "A", type: "principle", system: "civil", importance: 50, summary: "", keyPoints: [] },
                { title: "B", type: "principle", system: "civil", importance: 50, summary: "", keyPoints: [] }
              ],
              relations: [
                { source: "", target: "B", type: "依据", strength: 50, citation: "" },
                { source: "A", target: "", type: "依据", strength: 50, citation: "" },
                { source: "A", target: "B", type: "依据", strength: 50, citation: "ok" }
              ]
            })
          }
        }
      ]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(new Response(JSON.stringify(llmResponse), { status: 200 })) as unknown as Promise<Response>;
    try {
      const result = await extractLegalConcepts(baseConfig, "test");
      expect(result.relations).toHaveLength(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("空 concepts + 空 relations 抛 empty 错误", async () => {
    const llmResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({ concepts: [], relations: [] })
          }
        }
      ]
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(new Response(JSON.stringify(llmResponse), { status: 200 })) as unknown as Promise<Response>;
    try {
      await expect(extractLegalConcepts(baseConfig, "test")).rejects.toMatchObject({ kind: "empty" });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
