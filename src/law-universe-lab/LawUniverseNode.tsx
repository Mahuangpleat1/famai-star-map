import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { getLegalUniverseWorldPosition } from "./legalUniverseLayout";
import { getLegalUniverseColor, legalUniverseTheme } from "./legalUniverseTheme";
import { LawUniverseLabel } from "./LawUniverseLabel";
import { getLawUniverseFocusIgnition } from "./legalUniverseVisuals";
import type { LegalUniverseNode } from "./types";

interface LawUniverseNodeProps {
  node: LegalUniverseNode;
  selectedNodeId: string;
  hoveredNodeId: string | null;
  isDimmed: boolean;
  labelVisible: boolean;
  introProgress: number;
  focusIgnitionKey: number;
  motionScale: number;
  economical?: boolean;
  onSelectNode: (id: string) => void;
  onHoverNode: (id: string | null) => void;
}

function getVisualRadius(node: LegalUniverseNode): number {
  if (node.type === "universe-core") {
    return 0.34;
  }
  if (node.type === "system-sun") {
    return node.size * 0.86;
  }
  return node.size * (node.level === 1 ? 0.82 : node.level === 2 ? 0.68 : 0.56);
}

export function LawUniverseNode({
  node,
  selectedNodeId,
  hoveredNodeId,
  isDimmed,
  labelVisible,
  introProgress,
  focusIgnitionKey,
  motionScale,
  economical = false,
  onSelectNode,
  onHoverNode
}: LawUniverseNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const bodyMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const outerHaloRef = useRef<THREE.Mesh>(null);
  const outerHaloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const ignitionRingRef = useRef<THREE.Mesh>(null);
  const ignitionRingMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const ignitionStartRef = useRef(0);
  const ignitionKeyRef = useRef(focusIgnitionKey);
  const position = useMemo(() => getLegalUniverseWorldPosition(node), [node]);
  const selected = selectedNodeId === node.id;
  const hovered = hoveredNodeId === node.id;
  const domainColor = getLegalUniverseColor(node.colorKey);
  const visualRadius = getVisualRadius(node);
  const hitRadius = Math.max(visualRadius * (node.type === "system-sun" ? 1.75 : 2.2), 0.18);
  const bodyOpacity = selected ? 1 : hovered ? 0.95 : isDimmed ? 0.03 : node.type === "system-sun" ? 0.93 : 0.58;
  const haloOpacity =
    node.type === "system-sun"
      ? selected
        ? 0.078
        : hovered
          ? 0.052
          : isDimmed
            ? 0.001
            : 0.023
      : selected
        ? 0.14
        : hovered
          ? 0.084
          : isDimmed
            ? 0.002
            : 0.017;
  const outerHaloOpacity =
    node.type === "system-sun"
      ? selected
        ? 0.024
        : hovered
          ? 0.014
          : isDimmed
            ? 0.0008
            : 0.007
      : selected
        ? 0.058
        : hovered
          ? 0.034
          : isDimmed
            ? 0.001
            : 0.009;
  const baseEmissiveIntensity = isDimmed ? 0.012 : selected ? 1.05 : hovered ? 0.66 : node.type === "system-sun" ? 0.44 : 0.13;

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }
    const elapsed = clock.getElapsedTime();
    if (ignitionKeyRef.current !== focusIgnitionKey) {
      ignitionKeyRef.current = focusIgnitionKey;
      ignitionStartRef.current = elapsed;
    }

    const ignition =
      focusIgnitionKey > 0 && (selected || hovered) ? getLawUniverseFocusIgnition(elapsed - ignitionStartRef.current) : null;
    const pulse = motionScale > 0 ? Math.sin(elapsed * 0.8 * motionScale + node.importance) * 0.008 : 0;
    const ignitionScale = ignition ? ignition.coreBoost * (selected ? 0.2 : 0.08) : 0;
    groupRef.current.scale.setScalar((1 + pulse) * introProgress);

    if (bodyMaterialRef.current) {
      bodyMaterialRef.current.emissiveIntensity = baseEmissiveIntensity + (ignition?.coreBoost ?? 0);
      bodyMaterialRef.current.opacity = Math.min(1, bodyOpacity + (ignition?.coreBoost ?? 0) * 0.18);
    }
    if (haloRef.current) {
      const selectedPulse = selected && motionScale > 0 ? Math.sin(elapsed * 1.4 * motionScale) * 0.035 : 0;
      haloRef.current.scale.setScalar((selected ? 1.18 + selectedPulse : hovered ? 1.1 : 1) + ignitionScale);
    }
    if (haloMaterialRef.current) {
      haloMaterialRef.current.opacity = Math.min(0.42, haloOpacity + (ignition?.haloBoost ?? 0) * (selected ? 0.62 : 0.34));
    }
    if (outerHaloRef.current) {
      outerHaloRef.current.scale.setScalar(ignition?.radiusScale ?? 1);
    }
    if (outerHaloMaterialRef.current) {
      outerHaloMaterialRef.current.opacity = Math.min(0.26, outerHaloOpacity + (ignition?.haloBoost ?? 0) * 0.28);
    }
    if (ignitionRingRef.current) {
      ignitionRingRef.current.scale.setScalar(ignition?.radiusScale ?? 1);
    }
    if (ignitionRingMaterialRef.current) {
      ignitionRingMaterialRef.current.opacity = selected ? (ignition?.haloBoost ?? 0) * 0.42 : 0;
    }
    if (lightRef.current) {
      lightRef.current.intensity = (selected ? 0.84 : 0.42) + (ignition?.coreBoost ?? 0) * 1.4;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onPointerEnter={(event) => {
          event.stopPropagation();
          onHoverNode(node.id);
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          onHoverNode(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelectNode(node.id);
        }}
      >
        <sphereGeometry args={[hitRadius, 12, 12]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[visualRadius, economical ? 12 : 24, economical ? 12 : 24]} />
        {economical ? <meshBasicMaterial color={domainColor} transparent opacity={bodyOpacity} /> : <meshStandardMaterial
          ref={bodyMaterialRef}
          color={node.type === "system-sun" ? legalUniverseTheme.core : legalUniverseTheme.node}
          emissive={selected || hovered ? domainColor : node.type === "system-sun" ? domainColor : legalUniverseTheme.nodeSoft}
          emissiveIntensity={baseEmissiveIntensity}
          roughness={0.72}
          metalness={0.02}
          transparent
          opacity={bodyOpacity}
        />}
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[visualRadius * (node.type === "system-sun" ? 2.24 : 2.55), 16, 16]} />
        <meshBasicMaterial
          ref={haloMaterialRef}
          color={domainColor}
          transparent
          opacity={haloOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {!economical ? <mesh ref={outerHaloRef}>
        <sphereGeometry args={[visualRadius * (node.type === "system-sun" ? 3.4 : 3.8), 16, 16]} />
        <meshBasicMaterial
          ref={outerHaloMaterialRef}
          color={domainColor}
          transparent
          opacity={outerHaloOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh> : null}
      {!economical ? <mesh ref={ignitionRingRef} rotation={[Math.PI / 2.24, 0.14, 0.28]}>
        <torusGeometry args={[visualRadius * (node.type === "system-sun" ? 4.4 : 4.0), 0.0035, 6, 128]} />
        <meshBasicMaterial
          ref={ignitionRingMaterialRef}
          color={legalUniverseTheme.coreHot}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh> : null}
      {selected || hovered ? (
        <pointLight ref={lightRef} color={domainColor} intensity={selected ? 0.84 : 0.42} distance={node.type === "system-sun" ? 7.2 : 4.2} />
      ) : null}
      {node.type === "system-sun" && !isDimmed && !economical ? (
        <group>
          <mesh rotation={[Math.PI / 2.16, 0.08, 0.18]}>
            <torusGeometry args={[visualRadius * 3.0, 0.004, 6, 112]} />
            <meshBasicMaterial color={domainColor} transparent opacity={selected ? 0.42 : 0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh rotation={[Math.PI / 2.72, -0.2, 0.58]}>
            <torusGeometry args={[visualRadius * 4.18, 0.0028, 6, 112]} />
            <meshBasicMaterial color={legalUniverseTheme.core} transparent opacity={selected ? 0.24 : 0.082} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh rotation={[Math.PI / 1.94, 0.28, -0.38]}>
            <torusGeometry args={[visualRadius * 5.36, 0.0018, 6, 144]} />
            <meshBasicMaterial color={domainColor} transparent opacity={selected ? 0.16 : 0.046} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ) : null}
      {labelVisible ? (
        <LawUniverseLabel
          node={node}
          selectedNodeId={selectedNodeId}
          isSelected={selected}
          isDimmed={isDimmed}
          isVisible={labelVisible}
          onSelectNode={onSelectNode}
        />
      ) : null}
    </group>
  );
}
