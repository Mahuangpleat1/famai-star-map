/**
 * useStorageQuota —— 监测浏览器存储配额(IndexedDB + localStorage)。
 *
 * - navigator.storage.estimate() → 配额 / 已用 / 可用
 * - localStorage 估算:遍历所有 key 长度
 * - 阈值(threshold):默认 80% → 警告;95% → 危险
 *
 * 用法:
 *   const quota = useStorageQuota({ pollIntervalMs: 60000 });
 *   if (quota.warning) { toast.push({ kind: "warning", message: "..." }) }
 */
import { useCallback, useEffect, useState } from "react";

export interface StorageQuotaState {
  /** 浏览器估计的配额(字节) */
  quotaBytes: number;
  /** 浏览器估计的已用(字节) */
  usageBytes: number;
  /** 浏览器估计的可用 = quota - usage */
  availableBytes: number;
  /** localStorage 估算占用 */
  localStorageBytes: number;
  /** 使用率 0-1 */
  usageRatio: number;
  /** ≥ 0.95 时为危险 */
  danger: boolean;
  /** ≥ threshold 时为警告(默认 0.8) */
  warning: boolean;
  /** navigator.storage 是否支持(不支持时 quota=0) */
  supported: boolean;
  /** 最近一次失败(estimate / read 失败) */
  error: string | null;
  /** 上次更新时间戳 */
  updatedAt: number;
}

export interface UseStorageQuotaOptions {
  /** 警告阈值 0-1,默认 0.8 */
  warningThreshold?: number;
  /** 危险阈值 0-1,默认 0.95 */
  dangerThreshold?: number;
  /** 轮询间隔(毫秒),默认 60000(1 分钟) */
  pollIntervalMs?: number;
  /** 是否启用(可在某些场景暂停) */
  enabled?: boolean;
}

const DEFAULT_WARNING = 0.8;
const DEFAULT_DANGER = 0.95;
const DEFAULT_POLL_MS = 60_000;

function readLocalStorageBytes(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key === null) continue;
      const value = window.localStorage.getItem(key) ?? "";
      // 估算:key 长度 + value UTF-16 长度 × 2
      total += key.length * 2 + value.length * 2;
    }
  } catch {
    /* ignore */
  }
  return total;
}

async function computeQuotaBytes(): Promise<{ quota: number; usage: number; supported: boolean }> {
  if (typeof navigator === "undefined" || !navigator.storage || typeof navigator.storage.estimate !== "function") {
    return { quota: 0, usage: 0, supported: false };
  }
  try {
    const est = await navigator.storage.estimate();
    return {
      quota: est.quota ?? 0,
      usage: est.usage ?? 0,
      supported: true
    };
  } catch {
    return { quota: 0, usage: 0, supported: false };
  }
}

export function useStorageQuota(options: UseStorageQuotaOptions = {}): StorageQuotaState {
  const warningThreshold = options.warningThreshold ?? DEFAULT_WARNING;
  const dangerThreshold = options.dangerThreshold ?? DEFAULT_DANGER;
  const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_MS;
  const enabled = options.enabled ?? true;

  const [state, setState] = useState<StorageQuotaState>(() => ({
    quotaBytes: 0,
    usageBytes: 0,
    availableBytes: 0,
    localStorageBytes: readLocalStorageBytes(),
    usageRatio: 0,
    danger: false,
    warning: false,
    supported: false,
    error: null,
    updatedAt: 0
  }));

  const refresh = useCallback(async () => {
    const { quota, usage, supported } = await computeQuotaBytes();
    const localStorageBytes = readLocalStorageBytes();
    // 总用量 = IndexedDB estimate.usage + localStorage(避免重复计算的话需要用 estimate.detail)
    // 简化:取 max(estimate, localStorage),因为 estimate 通常包含 localStorage
    const combinedUsage = Math.max(usage, localStorageBytes);
    const usageRatio = quota > 0 ? Math.min(1, combinedUsage / quota) : 0;
    const availableBytes = Math.max(0, quota - combinedUsage);
    setState({
      quotaBytes: quota,
      usageBytes: combinedUsage,
      availableBytes,
      localStorageBytes,
      usageRatio,
      danger: usageRatio >= dangerThreshold,
      warning: usageRatio >= warningThreshold,
      supported,
      error: null,
      updatedAt: Date.now()
    });
  }, [warningThreshold, dangerThreshold]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, pollIntervalMs);
    return () => window.clearInterval(timer);
  }, [enabled, refresh, pollIntervalMs]);

  return state;
}
