/**
 * 单颗个人卫星 R3F 组件 —— Phase 1。
 *
 * 视觉规则（见 spec §3.3）：
 * - 球体，半径 = 0.05 + (importance / 100) * 0.12
 * - 已审核：所属系统色 + 透明度 0.85
 * - 未审核：灰色 #888 + 透明度 0.4
 * - 弱光晕 + 极慢呼吸（0.6 Hz）
 * - 标签默认隐藏（Phase 2 加）
 */

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { getLegalUniverseColor } from "./legalUniverseTheme";
import type { ReviewableSatellite } from "./useUserSatellites";
import type { LegalUniverseColorKey } from "./types";

interface LawUniverseSatelliteNodeProps {
  satellite: ReviewableSatellite;
  position: [number, number, number];
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  isHovered: boolean;
  /** Phase 2: 当卫星被点击并开始拖拽。 */
  onDragStart?: (event: { stopPropagation: () => void; clientX: number; clientY: number; pointerId: number }) => void;
  /** Phase 2: 该卫星是否正在被拖拽（视觉放大）。 */
  isDragging?: boolean;
  /** Phase 2.5 A2: 闪烁结束时间戳（performance.now()），0.5s 内 emissive 增强。 */
  flashUntil?: number | null;
  /** Phase 2.5 A3: 是否禁用交互（其他卫星正在被拖拽时）。 */
  isDisabled?: boolean;
}

const UNCLASSIFIED_COLOR = "#8a8a8a";
const UNREVIEWED_COLOR = "#888888";

function getRadius(importance: number): number {
  return 0.05 + (Math.max(1, Math.min(100, importance)) / 100) * 0.12;
}

/**
 * 根据 importance 决定球体段数 —— LOD:不重要的小卫星用更少的多边形。
 * - importance < 30: 6x6 (36 triangles)
 * - importance < 60: 10x10 (100 triangles)
 * - importance >= 60: 16x16 (256 triangles,原值)
 *
 * 视觉效果对 0.05-0.17 半径的小球几乎不可见,但 500+ 颗时 GPU 节约明显。
 */
function getSphereSegments(importance: number): { width: number; height: number } {
  if (importance < 30) return { width: 6, height: 6 };
  if (importance < 60) return { width: 10, height: 10 };
  return { width: 16, height: 16 };
}

function getSystemColor(displaySystem: string): string {
  if (displaySystem === "unclassified") return UNCLASSIFIED_COLOR;
  return getLegalUniverseColor(displaySystem as LegalUniverseColorKey);
}

/** Phase 2 confidence 视觉规则（spec §6.2）。 */
function getConfidenceScale(confidence: number): number {
  if (confidence < 30) return 0.7;
  if (confidence > 70) return 1.1;
  return 1.0;
}

function getConfidenceEmissiveBoost(confidence: number): number {
  // > 70 时颜色亮度 +20%（叠加到基线 0.5/0.2）
  if (confidence > 70) return 0.7;
  return 0;
}

export function LawUniverseSatelliteNode({
  satellite,
  position,
  onSelect,
  onHover,
  isHovered,
  onDragStart,
  isDragging,
  flashUntil,
  isDisabled
}: LawUniverseSatelliteNodeProps) {
  const groupRef = useRef<THREE.Group>(null);

  const radius = getRadius(satellite.concept.importance) * getConfidenceScale(satellite.confidence);
  const segments = getSphereSegments(satellite.concept.importance);
  const reviewed = satellite.reviewed;
  const color = reviewed ? getSystemColor(satellite.displaySystem) : UNREVIEWED_COLOR;
  const bodyOpacity = reviewed
    ? isHovered
      ? 0.95
      : 0.85
    : isHovered
      ? 0.55
      : 0.4;
  const haloOpacity = reviewed ? 0.05 : 0.02;
  const baseEmissive = (reviewed ? 0.5 : 0.2) + getConfidenceEmissiveBoost(satellite.confidence);
  const [emissiveIntensity, setEmissiveIntensity] = useState(baseEmissive);

  // 闪烁衰减 (Phase 2.5 A2): flashUntil 之后的 0.5s 内 emissive 0.8 → baseEmissive
  useFrame(() => {
    if (!flashUntil) {
      if (emissiveIntensity !== baseEmissive) setEmissiveIntensity(baseEmissive);
      return;
    }
    const now = performance.now();
    const remaining = flashUntil - now;
    if (remaining <= 0) {
      if (emissiveIntensity !== baseEmissive) setEmissiveIntensity(baseEmissive);
      return;
    }
    // 0.5s 内 0.8 → baseEmissive 线性插值
    const FLASH_DURATION = 500;
    const t = Math.max(0, Math.min(1, remaining / FLASH_DURATION));
    const flashBoost = 0.8 * t;
    setEmissiveIntensity(baseEmissive + flashBoost);
  });

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // 0.6 Hz 极慢呼吸，幅度 5%
    const breathe = 1 + Math.sin(t * Math.PI * 0.6) * 0.05;
    groupRef.current.scale.setScalar(breathe);
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onClick={(e) => {
          if (isDisabled) return;
          e.stopPropagation();
          // 拖拽中不触发 select
          if (isDragging) return;
          onSelect();
        }}
        onPointerDown={(e) => {
          if (isDisabled) return;
          if (!onDragStart) return;
          // 只有 system: "new" 卫星可拖（其他拖了视觉无变化，避免无意义操作）
          if (satellite.displaySystem !== "unclassified") return;
          onDragStart({
            stopPropagation: () => e.stopPropagation(),
            clientX: e.clientX,
            clientY: e.clientY,
            pointerId: e.pointerId
          });
        }}
        onPointerOver={(e) => {
          if (isDisabled) return;
          e.stopPropagation();
          onHover(true);
        }}
        onPointerOut={() => {
          if (isDisabled) return;
          onHover(false);
        }}
        scale={isDragging ? 1.4 : 1}
      >
        <sphereGeometry args={[radius, segments.width, segments.height]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={bodyOpacity}
          roughness={0.4}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 1.6, Math.max(6, segments.width - 2), Math.max(6, segments.height - 2)]} />
        <meshBasicMaterial color={color} transparent opacity={haloOpacity} depthWrite={false} />
      </mesh>
    </group>
  );
}
