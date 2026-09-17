/**
 * useDragProjection —— Phase 2 拖拽控制器。
 *
 * 在 R3F Canvas 内任意位置触发 onPointerDown，把屏幕坐标投影到 3D 平面，
 * 计算 worldPosition。每帧根据最新屏幕位置更新。
 *
 * 用法：
 *   const { bind, dragging, worldPosition } = useDragProjection({
 *     onStart, onMove, onEnd
 *   });
 *
 * bind 返回 { onPointerDown }，挂在目标 mesh 上。
 */

import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const PLANE_NORMAL = new THREE.Vector3(0, 0, 1);
const PROJECTION_PLANE = new THREE.Plane();

export interface UseDragProjectionOptions {
  onStart?: (worldPos: [number, number, number]) => void;
  onMove?: (worldPos: [number, number, number]) => void;
  onEnd?: (worldPos: [number, number, number] | null) => void;
}

export interface DragEventLike {
  stopPropagation: () => void;
  clientX: number;
  clientY: number;
  pointerId: number;
}

export interface UseDragProjectionResult {
  dragging: boolean;
  worldPosition: [number, number, number] | null;
  onPointerDown: (event: DragEventLike) => void;
}

function projectToPlane(
  clientX: number,
  clientY: number,
  camera: THREE.Camera,
  canvasRect: DOMRect,
  out: THREE.Vector3
): boolean {
  const ndcX = ((clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
  const ndcY = -((clientY - canvasRect.top) / canvasRect.height) * 2 + 1;
  // 拖拽 plane 平行于屏幕，过 camera 当前位置 + 视线方向偏移
  const cameraPos = new THREE.Vector3();
  camera.getWorldPosition(cameraPos);
  const cameraDir = new THREE.Vector3();
  camera.getWorldDirection(cameraDir);
  // plane 中心 = camera 位置 + 视线方向 * 8（场景中心附近）
  const planeCenter = cameraPos.clone().add(cameraDir.clone().multiplyScalar(8));
  PROJECTION_PLANE.setFromNormalAndCoplanarPoint(PLANE_NORMAL, planeCenter);
  // 注意：plane normal 是 (0,0,1) 是世界 Z 轴。视线方向不一定是 -Z。
  // 修正：让 plane 始终垂直于 camera 视线方向
  PROJECTION_PLANE.setFromNormalAndCoplanarPoint(cameraDir.clone().negate(), planeCenter);

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera({ x: ndcX, y: ndcY } as unknown as THREE.Vector2, camera);
  const hit = raycaster.ray.intersectPlane(PROJECTION_PLANE, out);
  return hit !== null;
}

export function useDragProjection(options: UseDragProjectionOptions = {}): UseDragProjectionResult {
  const { onStart, onMove, onEnd } = options;
  const { camera, gl } = useThree();
  const [dragging, setDragging] = useState(false);
  const [worldPosition, setWorldPosition] = useState<[number, number, number] | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<THREE.Vector3>(new THREE.Vector3());

  const onPointerDown = useCallback(
    (event: DragEventLike) => {
      // 阻止事件冒泡，避免触发其他 3D 元素的点击
      event.stopPropagation();
      const canvasRect = gl.domElement.getBoundingClientRect();
      const out = new THREE.Vector3();
      if (!projectToPlane(event.clientX, event.clientY, camera, canvasRect, out)) {
        return;
      }
      lastPosRef.current.copy(out);
      const pos: [number, number, number] = [out.x, out.y, out.z];
      setWorldPosition(pos);
      setDragging(true);
      pointerIdRef.current = event.pointerId;
      try {
        gl.domElement.setPointerCapture(event.pointerId);
      } catch {
        // ignore: 某些 jsdom 环境不支持
      }
      onStart?.(pos);
    },
    [camera, gl, onStart]
  );

  useEffect(() => {
    if (!dragging) return undefined;

    function handlePointerMove(ev: PointerEvent) {
      if (pointerIdRef.current !== null && ev.pointerId !== pointerIdRef.current) return;
      const canvasRect = gl.domElement.getBoundingClientRect();
      const out = new THREE.Vector3();
      if (!projectToPlane(ev.clientX, ev.clientY, camera, canvasRect, out)) return;
      lastPosRef.current.copy(out);
      const pos: [number, number, number] = [out.x, out.y, out.z];
      setWorldPosition(pos);
      onMove?.(pos);
    }

    function handlePointerUp(ev: PointerEvent) {
      if (pointerIdRef.current !== null && ev.pointerId !== pointerIdRef.current) return;
      const pos: [number, number, number] | null = worldPosition;
      setDragging(false);
      pointerIdRef.current = null;
      try {
        gl.domElement.releasePointerCapture(ev.pointerId);
      } catch {
        // ignore
      }
      onEnd?.(pos);
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragging, camera, gl, onMove, onEnd, worldPosition]);

  return { dragging, worldPosition, onPointerDown };
}

/** 给定世界坐标 + 候选系统中心列表，返回最近系统 id（如果距离 < threshold）。 */
export function findNearestSystem(
  worldPos: [number, number, number],
  systemCenters: Array<{ id: string; position: [number, number, number] }>,
  threshold: number
): { id: string; distance: number } | null {
  let best: { id: string; distance: number } | null = null;
  for (const sys of systemCenters) {
    const dx = worldPos[0] - sys.position[0];
    const dy = worldPos[1] - sys.position[1];
    const dz = worldPos[2] - sys.position[2];
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d < threshold && (best === null || d < best.distance)) {
      best = { id: sys.id, distance: d };
    }
  }
  return best;
}
