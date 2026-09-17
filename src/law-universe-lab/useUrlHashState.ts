/**
 * useUrlHashState —— URL hash 与内部状态的镜像。
 *
 * - 读: 初始从 window.location.hash 解析;hashchange 事件触发重读
 * - 写: writeHash 用 history.replaceState(不污染后退栈,因为 cinematic intro / focus 飞行频繁)
 *
 * 注:hash 仅作为 deep-link 入口的镜像,不是权限边界,解析时会校验字段值。
 */
import { useCallback, useEffect, useState } from "react";
import { parseUrlState, serializeUrlState } from "./legalUniverseUrlState";
import type { LegalUniverseUrlState } from "./legalUniverseUrlState";

const EMPTY_HASH_STATE: LegalUniverseUrlState = {
  selectedNodeId: null,
  zoomLevel: null,
  nodeTypes: null,
  levels: null,
  sourceCategories: null,
  path: null
};

export function useUrlHashState(): [LegalUniverseUrlState, (state: LegalUniverseUrlState) => void] {
  const [hashState, setHashState] = useState<LegalUniverseUrlState>(() =>
    typeof window === "undefined" ? EMPTY_HASH_STATE : parseUrlState(window.location.hash)
  );

  useEffect(() => {
    function onHashChange() {
      setHashState(parseUrlState(window.location.hash));
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const writeHash = useCallback((next: LegalUniverseUrlState) => {
    if (typeof window === "undefined") return;
    const serialized = serializeUrlState(next);
    const current = window.location.hash;
    if (current === serialized || (current === "" && serialized === "")) {
      return;
    }
    const url = `${window.location.pathname}${window.location.search}${serialized}`;
    window.history.replaceState(window.history.state, "", url);
  }, []);

  return [hashState, writeHash];
}
