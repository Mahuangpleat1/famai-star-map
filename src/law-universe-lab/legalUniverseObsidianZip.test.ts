import { describe, expect, it } from "vitest";
import { createZipBlob } from "./legalUniverseObsidianZip";
import type { ObsidianFile } from "./legalUniverseObsidian";

const sampleFiles: ObsidianFile[] = [
  { filename: "civil/合同.md", content: "# 合同\n\nTest" },
  { filename: "index.md", content: "# Index\n" }
];

/**
 * jsdom 25 的 Blob 不实现 arrayBuffer() / text(), 用 FileReader 读取字节。
 * 生产环境 (浏览器) Blob 本身有 arrayBuffer() 可用, 这里走 FileReader 是测试环境适配。
 */
function readBytes(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(new Uint8Array(fr.result as ArrayBuffer));
    fr.onerror = () => reject(fr.error);
    fr.readAsArrayBuffer(blob);
  });
}

describe("createZipBlob", () => {
  it("empty array returns empty blob", async () => {
    const blob = await createZipBlob([]);
    expect(blob.size).toBe(0);
  });

  it("single file → valid zip (PK magic bytes)", async () => {
    const blob = await createZipBlob([sampleFiles[0]]);
    const view = await readBytes(blob);
    // PK\x03\x04 = local file header signature
    expect(view[0]).toBe(0x50);
    expect(view[1]).toBe(0x4b);
    expect(view[2]).toBe(0x03);
    expect(view[3]).toBe(0x04);
  });

  it("multi file → zip contains all entries (EOCD marker present)", async () => {
    const blob = await createZipBlob(sampleFiles);
    expect(blob.size).toBeGreaterThan(0);
    const view = await readBytes(blob);
    // find PK\x05\x06 (end of central directory record) near end of file
    let found = false;
    for (let i = view.length - 22; i >= Math.max(0, view.length - 22 - 100); i--) {
      if (view[i] === 0x50 && view[i + 1] === 0x4b && view[i + 2] === 0x05 && view[i + 3] === 0x06) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("UTF-8 filename in zip header (0x800 flag set)", async () => {
    const blob = await createZipBlob([{ filename: "民法典/合同.md", content: "# 合同" }]);
    const view = await readBytes(blob);
    // 第 7-8 字节 (offset 6/7) 是 general purpose bit flag (little-endian)
    const flag = view[6] | (view[7] << 8);
    expect(flag & 0x800).toBe(0x800);
  });
});
