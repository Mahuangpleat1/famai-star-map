/**
 * useObsidianVault —— Phase 4 F.2 React hook。
 *
 * 桥接 File System Access API + IndexedDB vaultMapping:
 *   - pickVault: 让用户选 vault 目录
 *   - exportToVault: 写 .md 到 vault + 更新 mapping
 *   - syncFromVault: 扫 vault .md → 算 SyncPlan → 返回 imported / conflicts 计数
 *   - isSupported: 浏览器是否支持 File System Access API
 *
 * 复用:
 *   - legalUniverseObsidian.generateMarkdownFiles (F.1 渲染)
 *   - legalUniverseVault.scanVaultFiles / parseVaultMarkdown / computeSyncPlan / contentHash (Task 2)
 *   - legalUniverseUserDb.listVaultMappings / putVaultMapping (Task 1)
 */

import { useCallback, useRef, useState } from "react";
import { generateMarkdownFiles } from "./legalUniverseObsidian";
import {
  scanVaultFiles,
  computeSyncPlan,
  contentHash
} from "./legalUniverseVault";
import { listVaultMappings, putVaultMapping } from "./legalUniverseUserDb";
import type { UserExtraction, UserSourceDoc } from "./userDataTypes";

export interface UseObsidianVault {
  vaultHandle: FileSystemDirectoryHandle | null;
  isSupported: boolean;
  pickVault: () => Promise<void>;
  exportToVault: (
    extractions: UserExtraction[],
    sourceDocs: Map<string, UserSourceDoc>
  ) => Promise<{ exported: number; skipped: number }>;
  syncFromVault: () => Promise<{ imported: number; conflicts: number }>;
  resetVault: () => void;
}

export function useObsidianVault(): UseObsidianVault {
  const [vaultHandle, setVaultHandle] = useState<FileSystemDirectoryHandle | null>(null);
  // 在 mount 时一次性检测,rerender 不再重新检测 (浏览器能力不会运行时变化)
  const isSupportedRef = useRef<boolean>(
    typeof window !== "undefined" && "showDirectoryPicker" in window
  );
  const isSupported = isSupportedRef.current;

  const pickVault = useCallback(async () => {
    if (!isSupported) {
      throw new Error("当前浏览器不支持 File System Access API,请用 .zip 导出");
    }
    const handle = await (
      window as unknown as {
        showDirectoryPicker: (opts?: object) => Promise<FileSystemDirectoryHandle>;
      }
    ).showDirectoryPicker({ mode: "readwrite" });
    setVaultHandle(handle);
  }, [isSupported]);

  const exportToVault = useCallback(
    async (extractions: UserExtraction[], sourceDocs: Map<string, UserSourceDoc>) => {
      if (!vaultHandle) throw new Error("未选 vault 目录");
      const files = generateMarkdownFiles(extractions, sourceDocs);
      const existingMappings = await listVaultMappings();
      const mappingByFile = new Map(existingMappings.map((m) => [m.fileName, m]));
      let exported = 0;
      let skipped = 0;
      for (const file of files) {
        if (!file.filename.endsWith(".md")) continue;
        const contentHashVal = contentHash(file.content);
        const m = mappingByFile.get(file.filename);
        if (m && m.contentHash === contentHashVal) {
          skipped++;
          continue;
        }
        const fileHandle = await vaultHandle.getFileHandle(file.filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file.content);
        await writable.close();
        await putVaultMapping({
          conceptId: m?.conceptId ?? `local::${exported}`,
          fileName: file.filename,
          lastSyncedAt: Date.now(),
          contentHash: contentHashVal,
          fileModifiedAt: Date.now()
        });
        exported++;
      }
      return { exported, skipped };
    },
    [vaultHandle]
  );

  const syncFromVault = useCallback(async () => {
    if (!vaultHandle) throw new Error("未选 vault 目录");
    const vaultFiles = await scanVaultFiles(vaultHandle);
    const mappings = await listVaultMappings();
    // v1:不传 localConcepts (回流方向独立统计)
    const plan = computeSyncPlan([], vaultFiles, mappings);
    return { imported: plan.toImport.length, conflicts: plan.conflicts.length };
  }, [vaultHandle]);

  const resetVault = useCallback(() => setVaultHandle(null), []);

  return { vaultHandle, isSupported, pickVault, exportToVault, syncFromVault, resetVault };
}
