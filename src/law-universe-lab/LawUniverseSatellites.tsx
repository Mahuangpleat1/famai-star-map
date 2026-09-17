/**
 * 个人卫星散布容器 —— Phase 1 + Phase 2 拖拽归类。
 *
 * 按 displaySystem 分组，每组在所属 system-sun 周围做环形散布。
 * Phase 2：仅 `displaySystem === "unclassified"` 的卫星可拖。
 * 拖拽时卫星跟随光标在 3D 平面，释放时按距离检测落点。
 *
 * "unclassified" 虚拟系统：universe-core 旁 +Y 方向 5 单位。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { legalUniverseSystems, getLegalUniverseSystemById } from "../../data/legalUniverseData";
import { findNearestSystem, useDragProjection } from "./useDragProjection";
import { getLegalUniverseColor } from "./legalUniverseTheme";
import type { LegalUniverseColorKey, LegalUniverseSystem } from "./types";
import { LawUniverseSatelliteNode } from "./LawUniverseSatelliteNode";
import type { ReviewableSatellite } from "./useUserSatellites";
import { useSatellitePositions } from "./useSatellitePositions";

interface LawUniverseSatellitesProps {
  satellites: ReviewableSatellite[];
  onSelect: (satellite: ReviewableSatellite) => void;
  /** Phase 2: 拖拽释放后命中目标系统时调用，让调用方写回 IndexedDB。 */
  onCommitMove: (satellite: ReviewableSatellite, targetSystemId: string) => void;
  /** Phase 2.5 A1: 拖拽状态变化。 */
  onDragStateChange?: (dragging: boolean) => void;
}

/** Phase 2.5 A2: 释放成功闪烁的 0.5s 时长。 */
const FLASH_DURATION_MS = 500;

type DragStartEvent = {
  stopPropagation: () => void;
  clientX: number;
  clientY: number;
  pointerId: number;
};

const UNCLASSIFIED_CENTER: [number, number, number] = [0, 5, 0];
const DRAG_HIT_THRESHOLD = 4; // 4 单位以内认为命中目标系统

/** 把 11 太阳系 + unclassified 拍平成系统中心列表。 */
function buildSystemCenters(): Array<{ id: string; position: [number, number, number] }> {
  const list: Array<{ id: string; position: [number, number, number] }> = legalUniverseSystems.map(
    (s: LegalUniverseSystem) => ({ id: s.id, position: s.systemPosition })
  );
  list.push({ id: "unclassified", position: UNCLASSIFIED_CENTER });
  return list;
}

export function LawUniverseSatellites({ satellites, onSelect, onCommitMove, onDragStateChange }: LawUniverseSatellitesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingSatellite, setDraggingSatellite] = useState<ReviewableSatellite | null>(null);
  const [hoveredTargetSystem, setHoveredTargetSystem] = useState<string | null>(null);
  const [dragOriginPosition, setDragOriginPosition] = useState<[number, number, number] | null>(null);
  /** Phase 2.5 A2: 释放成功后被释放的卫星 id（500ms 内闪烁）。 */
  const [flashingSatelliteId, setFlashingSatelliteId] = useState<string | null>(null);
  const flashUntilRef = useRef<number>(0);

  const systemCenters = useMemo(buildSystemCenters, []);
  const positionDict = useSatellitePositions(satellites);

  const positioned = useMemo(() => {
    return satellites.map((satellite) => {
      const pos = positionDict.get(satellite.id);
      return { satellite, position: pos?.position ?? [0, 0, 0] };
    });
  }, [satellites, positionDict]);

  // 拖拽中的目标系统高亮
  const onDragMove = useCallback(
    (worldPos: [number, number, number]) => {
      if (!draggingSatellite) return;
      const nearest = findNearestSystem(worldPos, systemCenters, DRAG_HIT_THRESHOLD);
      setHoveredTargetSystem(nearest ? nearest.id : null);
    },
    [draggingSatellite, systemCenters]
  );

  // 释放
  const onDragEnd = useCallback(
    (worldPos: [number, number, number] | null) => {
      onDragStateChange?.(false);
      if (!draggingSatellite || !worldPos) {
        setDraggingSatellite(null);
        setHoveredTargetSystem(null);
        setDragOriginPosition(null);
        return;
      }
      const nearest = findNearestSystem(worldPos, systemCenters, DRAG_HIT_THRESHOLD);
      if (nearest && nearest.id !== "unclassified" && nearest.id !== draggingSatellite.displaySystem) {
        // 命中一个新系统：通知 commit + 触发闪烁
        onCommitMove(draggingSatellite, nearest.id);
        setFlashingSatelliteId(draggingSatellite.id);
        flashUntilRef.current = performance.now() + FLASH_DURATION_MS;
        window.setTimeout(() => setFlashingSatelliteId(null), FLASH_DURATION_MS);
      }
      // 落空 / unclassified / 同一系统：静默归位（key 变了 position 重算）
      setDraggingSatellite(null);
      setHoveredTargetSystem(null);
      setDragOriginPosition(null);
    },
    [draggingSatellite, systemCenters, onCommitMove, onDragStateChange]
  );

  const drag = useDragProjection({
    onStart: (worldPos) => {
      // worldPos 此时无效，真实起点在 onDragStart 里给
      void worldPos;
    },
    onMove: onDragMove,
    onEnd: onDragEnd
  });

  // 单独管理 start（拿 nativeEvent）
  const onNodeDragStart = useCallback(
    (satellite: ReviewableSatellite) => (event: DragStartEvent) => {
      setDraggingSatellite(satellite);
      setDragOriginPosition(null);
      onDragStateChange?.(true);
      drag.onPointerDown(event);
    },
    [drag, onDragStateChange]
  );

  // 当 useDragProjection 完成（dragging=false）但 Satellites 状态还残留时也要清空
  useEffect(() => {
    if (!drag.dragging && draggingSatellite) {
      // 拖拽已结束但 Satellites 状态没清（onDragEnd 异步）
      // 不需要做什么，onDragEnd 负责清
    }
  }, [drag.dragging, draggingSatellite]);

  // 拖拽中渲染被拖卫星在新位置；其他卫星原位
  const draggingPosition = drag.worldPosition;
  const isDragging = drag.dragging && draggingSatellite !== null;

  // 拖拽结束后 useDragProjection 会自动 reset dragging 状态（清空 drag.worldPosition = null）
  // 但我们要保留 draggingSatellite 短暂用于视觉反馈

  useEffect(() => {
    if (!isDragging) {
      // 拖拽结束：satellite 状态由 onDragEnd 处理
    }
  }, [isDragging]);

  if (positioned.length === 0) return null;

  return (
    <>
      {positioned.map(({ satellite, position }) => {
        const isThisDragging = isDragging && draggingSatellite?.id === satellite.id;
        const renderPosition = isThisDragging && draggingPosition ? draggingPosition : position;
        const showGhost = isThisDragging && dragOriginPosition;
        return (
          <group key={satellite.id}>
            {showGhost ? (
              <mesh position={dragOriginPosition}>
                <sphereGeometry args={[0.05 + (satellite.concept.importance / 100) * 0.12, 12, 12]} />
                <meshStandardMaterial
                  color={satellite.reviewed ? getSystemColor(satellite.displaySystem) : "#888"}
                  transparent
                  opacity={0.3}
                  depthWrite={false}
                />
              </mesh>
            ) : null}
            <LawUniverseSatelliteNode
              satellite={satellite}
              position={renderPosition}
              isHovered={hoveredId === satellite.id}
              isDragging={isThisDragging}
              isDisabled={isDragging && !isThisDragging}
              flashUntil={flashingSatelliteId === satellite.id ? flashUntilRef.current : null}
              onSelect={() => onSelect(satellite)}
              onHover={(h) => setHoveredId(h ? satellite.id : null)}
              onDragStart={satellite.displaySystem === "unclassified" ? onNodeDragStart(satellite) : undefined}
            />
          </group>
        );
      })}
      {/* Phase 2: 目标系统高亮（拖拽中显示） */}
      {hoveredTargetSystem && hoveredTargetSystem !== "unclassified" ? <SystemHighlight systemId={hoveredTargetSystem} /> : null}
    </>
  );
}

function getSystemColor(displaySystem: string): string {
  if (displaySystem === "unclassified") return "#8a8a8a";
  return getLegalUniverseColor(displaySystem as LegalUniverseColorKey);
}

/** 拖拽目标系统高亮：太阳外环加粗 + 增亮。 */
function SystemHighlight({ systemId }: { systemId: string }) {
  const system = getLegalUniverseSystemById(systemId);
  if (!system) return null;
  return (
    <mesh position={system.systemPosition}>
      <sphereGeometry args={[system.systemRadius * 1.4, 24, 24]} />
      <meshBasicMaterial color="#fff8df" transparent opacity={0.08} depthWrite={false} />
    </mesh>
  );
}
