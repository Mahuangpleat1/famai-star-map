import { useCallback, useEffect, useMemo, useState } from "react";
import { getLegalUniverseNodeById } from "../../../data/legalUniverseData";
import type { LegalUniverseFocusState, LegalUniverseNode } from "../types";

const initialFocus: LegalUniverseFocusState = {
  selectedNodeId: "universe-core",
  focusedNodeId: "universe-core",
  cameraState: "focused",
  focusKey: 0
};

/**
 * useFocusState —— 3D 场景里"被点中/被聚焦"的节点状态机。
 *
 * 职责:
 *   - 维护 focusState(selected/focused/cameraState/focusKey)
 *   - 维护 visibleDetailNodeId(延迟 160ms 后才更新,让 detail panel 跟随相机过场)
 *   - 暴露 selectNode / resetView / markFocusComplete / setCameraState
 *   - 派生 selectedNode / visibleDetailNode(给 detail panel 直接渲染用)
 */
export function useFocusState(initialSelected?: string) {
  const [focusState, setFocusState] = useState<LegalUniverseFocusState>(() => ({
    ...initialFocus,
    selectedNodeId: initialSelected ?? initialFocus.selectedNodeId
  }));
  const [visibleDetailNodeId, setVisibleDetailNodeId] = useState(focusState.selectedNodeId);

  // 160ms 后延迟更新 visibleDetailNodeId(让 detail panel 跟随相机过场淡入)
  useEffect(() => {
    const t = window.setTimeout(() => setVisibleDetailNodeId(focusState.selectedNodeId), 160);
    return () => window.clearTimeout(t);
  }, [focusState.selectedNodeId]);

  const selectedNode = useMemo<LegalUniverseNode>(
    () => getLegalUniverseNodeById(focusState.selectedNodeId) ?? getLegalUniverseNodeById("universe-core")!,
    [focusState.selectedNodeId]
  );
  const visibleDetailNode = useMemo<LegalUniverseNode>(
    () => getLegalUniverseNodeById(visibleDetailNodeId) ?? selectedNode,
    [visibleDetailNodeId, selectedNode]
  );

  const selectNode = useCallback((id: string) => {
    setFocusState((current) => ({
      selectedNodeId: id,
      focusedNodeId: current.selectedNodeId === id ? id : current.focusedNodeId,
      cameraState: current.selectedNodeId === id ? "focused" : "focusing",
      focusKey: current.focusKey + 1
    }));
  }, []);

  const resetView = useCallback(() => {
    setFocusState((current) => {
      const alreadyAtCore = current.selectedNodeId === "universe-core";
      return {
        selectedNodeId: "universe-core",
        focusedNodeId: alreadyAtCore ? "universe-core" : current.focusedNodeId,
        cameraState: alreadyAtCore ? "focused" : "focusing",
        focusKey: current.focusKey + 1
      };
    });
  }, []);

  const markFocusComplete = useCallback((id: string) => {
    setFocusState((current) => ({ ...current, focusedNodeId: id, cameraState: "focused" }));
  }, []);

  const setCameraState = useCallback((cameraState: LegalUniverseFocusState["cameraState"]) => {
    setFocusState((current) => ({ ...current, cameraState }));
  }, []);

  return {
    focusState,
    setFocusState,
    visibleDetailNodeId,
    setVisibleDetailNodeId,
    selectedNode,
    visibleDetailNode,
    selectNode,
    resetView,
    markFocusComplete,
    setCameraState
  };
}
