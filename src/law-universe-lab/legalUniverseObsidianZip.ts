/**
 * Zip blob writer —— Phase 4 F.1。
 *
 * 纯函数: ObsidianFile[] → Blob (application/zip)。STORE mode (无压缩),UTF-8 文件名。
 * 手写 zip (无外部依赖),只支持小文件 (<1MB per file)。
 * 格式: Local file header + 中央目录 + End of central directory record. 参考 PKWARE 规范。
 */
import type { ObsidianFile } from "./legalUniverseObsidian";

/** 生成一个 zip Blob, 包含所有 files. 空数组返回 0 字节 blob. */
export async function createZipBlob(files: ObsidianFile[]): Promise<Blob> {
  if (files.length === 0) return new Blob([], { type: "application/zip" });
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = enc.encode(file.filename);
    const contentBytes = enc.encode(file.content);
    const crc = crc32(contentBytes);
    const size = contentBytes.length;

    // Local file header (30 + name + extra)
    const header = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true); // signature
    view.setUint16(4, 20, true); // version needed
    view.setUint16(6, 0x0800, true); // flags: UTF-8
    view.setUint16(8, 0, true); // method: STORE
    view.setUint16(10, 0, true); // time
    view.setUint16(12, 0, true); // date
    view.setUint32(14, crc, true);
    view.setUint32(18, size, true);
    view.setUint32(22, size, true);
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true); // extra length
    header.set(nameBytes, 30);
    chunks.push(header);
    chunks.push(contentBytes);

    // Central directory record (46 + name + extra)
    const cd = new Uint8Array(46 + nameBytes.length);
    const cdView = new DataView(cd.buffer);
    cdView.setUint32(0, 0x02014b50, true); // signature
    cdView.setUint16(4, 20, true); // version made by
    cdView.setUint16(6, 20, true); // version needed
    cdView.setUint16(8, 0x0800, true); // flags: UTF-8
    cdView.setUint16(10, 0, true); // method
    cdView.setUint16(12, 0, true); // time
    cdView.setUint16(14, 0, true); // date
    cdView.setUint32(16, crc, true);
    cdView.setUint32(20, size, true);
    cdView.setUint32(24, size, true);
    cdView.setUint16(28, nameBytes.length, true);
    cdView.setUint16(30, 0, true); // extra length
    cdView.setUint16(32, 0, true); // comment length
    cdView.setUint16(34, 0, true); // disk number
    cdView.setUint16(36, 0, true); // internal attrs
    cdView.setUint32(38, 0, true); // external attrs
    cdView.setUint32(42, offset, true); // local header offset
    cd.set(nameBytes, 46);
    central.push(cd);

    offset += header.length + contentBytes.length;
  }

  // Central directory
  const centralStart = offset;
  for (const c of central) chunks.push(c);
  const centralSize = central.reduce((s, c) => s + c.length, 0);
  offset += centralSize;

  // End of central directory record (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true); // signature
  eocdView.setUint16(4, 0, true); // disk number
  eocdView.setUint16(6, 0, true); // disk with CD start
  eocdView.setUint16(8, files.length, true); // entries on this disk
  eocdView.setUint16(10, files.length, true); // total entries
  eocdView.setUint32(12, centralSize, true); // CD size
  eocdView.setUint32(16, centralStart, true); // CD offset
  eocdView.setUint16(20, 0, true); // comment length
  chunks.push(eocd);

  return new Blob(chunks as BlobPart[], { type: "application/zip" });
}

// CRC-32 (IEEE 802.3) — 简单 lookup table 实现
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[i] = c;
}

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
