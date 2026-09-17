import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { getLegalUniverseNodeById, legalUniverseEdges } from "../../data/legalUniverseData";
import { getLegalUniverseWorldPosition, getSystemPosition } from "./legalUniverseLayout";
import { getLegalUniverseColor, legalUniverseTheme } from "./legalUniverseTheme";
import {
  createLawUniverseBeamStrands,
  createLawUniverseDriftSegments,
  createLawUniverseStarField,
  getLawUniverseFocusIgnition,
  getLawUniverseHashSeed,
  writeLawUniversePolylineSegments
} from "./legalUniverseVisuals";
import type { LegalUniverseNode, LegalUniverseVector } from "./types";

interface LawUniverseBackgroundProps {
  reducedMotion: boolean;
  motionPaused: boolean;
  selectedNodeId: string;
  hoveredNodeId: string | null;
  introProgress: number;
  focusIgnitionKey: number;
}

interface StarLayer {
  positions: Float32Array;
  colors: Float32Array;
  opacity: number;
  size: number;
}

interface AmbientBridgeGeometry {
  primary: Float32Array;
  secondary: Float32Array;
}

interface FocusAtmosphere {
  position: THREE.Vector3;
  pinpoint: THREE.Vector3;
  radius: number;
  color: string;
  active: boolean;
}

function isCompactViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.innerWidth < 760 || window.matchMedia("(pointer: coarse)").matches;
}

function vectorToThree(vector: LegalUniverseVector): THREE.Vector3 {
  return new THREE.Vector3(vector[0], vector[1], vector[2]);
}

function getSystemSun(node?: LegalUniverseNode): LegalUniverseNode | undefined {
  if (!node) {
    return undefined;
  }
  if (node.type === "system-sun") {
    return node;
  }
  return getLegalUniverseNodeById(node.systemId);
}

function buildAmbientBridgeGeometry(): AmbientBridgeGeometry {
  const primary: number[] = [];
  const secondary: number[] = [];

  for (const edge of legalUniverseEdges) {
    const source = getLegalUniverseNodeById(edge.source);
    const target = getLegalUniverseNodeById(edge.target);

    if (!source || !target || source.type !== "system-sun" || target.type !== "system-sun") {
      continue;
    }

    const strands = createLawUniverseBeamStrands(vectorToThree(getLegalUniverseWorldPosition(source)), vectorToThree(getLegalUniverseWorldPosition(target)), {
      active: false,
      seed: getLawUniverseHashSeed(`${edge.source}:${edge.target}:ambient`, 31),
      weight: edge.weight
    });

    strands.forEach((strand, index) => writeLawUniversePolylineSegments(index < 2 ? primary : secondary, strand.points));
  }

  return {
    primary: new Float32Array(primary),
    secondary: new Float32Array(secondary)
  };
}

function getFocusAtmosphere(selectedNodeId: string, hoveredNodeId: string | null): FocusAtmosphere {
  const focusNode = getLegalUniverseNodeById(hoveredNodeId ?? selectedNodeId) ?? getLegalUniverseNodeById("universe-core");
  const systemSun = getSystemSun(focusNode);
  const systemPosition = focusNode?.type === "universe-core" ? [0, 0, 0] as LegalUniverseVector : getSystemPosition(systemSun?.id ?? focusNode?.systemId ?? "universe");
  const pinpoint = focusNode ? vectorToThree(getLegalUniverseWorldPosition(focusNode)) : new THREE.Vector3();
  const radius = focusNode?.type === "universe-core" ? 9.8 : focusNode?.type === "system-sun" ? 4.2 : 2.4;

  return {
    position: vectorToThree(systemPosition),
    pinpoint,
    radius,
    color: getLegalUniverseColor(focusNode?.colorKey ?? "universe"),
    active: selectedNodeId !== "universe-core" || Boolean(hoveredNodeId)
  };
}

export function LawUniverseBackground({
  reducedMotion,
  motionPaused,
  selectedNodeId,
  hoveredNodeId,
  introProgress,
  focusIgnitionKey
}: LawUniverseBackgroundProps) {
  const farRef = useRef<THREE.Points>(null);
  const midRef = useRef<THREE.Points>(null);
  const nearRef = useRef<THREE.Points>(null);
  const colorRef = useRef<THREE.Points>(null);
  const driftRef = useRef<THREE.LineSegments>(null);
  const bridgeRef = useRef<THREE.Group>(null);
  const mistRef = useRef<THREE.Group>(null);
  const focusRef = useRef<THREE.Group>(null);
  const focusPinpointRef = useRef<THREE.Group>(null);
  const focusDustMaterialRef = useRef<THREE.PointsMaterial>(null);
  const focusPinpointMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const focusPinpointRingMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const ignitionStartRef = useRef(0);
  const ignitionKeyRef = useRef(focusIgnitionKey);
  const compact = isCompactViewport();
  const focus = useMemo(() => getFocusAtmosphere(selectedNodeId, hoveredNodeId), [hoveredNodeId, selectedNodeId]);
  const focusDust = useMemo(
    () =>
      createLawUniverseStarField({
        count: compact ? 48 : 84,
        radius: focus.radius * 1.18,
        seedOffset: getLawUniverseHashSeed(`${selectedNodeId}:${hoveredNodeId ?? "none"}:focus`) % 997,
        verticalScale: 0.44,
        saturation: 0.2
      }),
    [compact, focus.radius, hoveredNodeId, selectedNodeId]
  );
  const { layers, driftLines, bridges } = useMemo<{
    layers: StarLayer[];
    driftLines: Float32Array;
    bridges: AmbientBridgeGeometry;
  }>(() => {
    const far = createLawUniverseStarField({
      count: compact ? 900 : 1_860,
      radius: 58,
      seedOffset: 11,
      verticalScale: 0.78,
      saturation: 0.12
    });
    const mid = createLawUniverseStarField({
      count: compact ? 460 : 940,
      radius: 34,
      seedOffset: 97,
      verticalScale: 0.64,
      saturation: 0.18
    });
    const near = createLawUniverseStarField({
      count: compact ? 110 : 220,
      radius: 22,
      seedOffset: 211,
      verticalScale: 0.52,
      saturation: 0.22
    });
    const color = createLawUniverseStarField({
      count: compact ? 72 : 146,
      radius: 45,
      seedOffset: 409,
      verticalScale: 0.7,
      saturation: 0.38
    });

    return {
      layers: [
        { ...far, opacity: 0.19, size: compact ? 0.016 : 0.012 },
        { ...mid, opacity: 0.25, size: compact ? 0.027 : 0.02 },
        { ...near, opacity: 0.3, size: compact ? 0.039 : 0.029 },
        { ...color, opacity: 0.22, size: compact ? 0.024 : 0.018 }
      ],
      driftLines: createLawUniverseDriftSegments(compact ? 52 : 112, 71, [10, 56]),
      bridges: buildAmbientBridgeGeometry()
    };
  }, [compact]);
  const activeAtmosphere = focus.active;
  const reveal = Math.max(0.26, introProgress);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (ignitionKeyRef.current !== focusIgnitionKey) {
      ignitionKeyRef.current = focusIgnitionKey;
      ignitionStartRef.current = elapsed;
    }

    const ignition =
      activeAtmosphere && focusIgnitionKey > 0 ? getLawUniverseFocusIgnition(elapsed - ignitionStartRef.current) : null;

    if (focusDustMaterialRef.current) {
      focusDustMaterialRef.current.opacity = (activeAtmosphere ? 0.34 : 0.12) * reveal + (ignition?.dustBoost ?? 0);
      focusDustMaterialRef.current.size = activeAtmosphere ? 0.04 + (ignition?.dustBoost ?? 0) * 0.035 : 0.026;
    }
    if (focusPinpointMaterialRef.current) {
      focusPinpointMaterialRef.current.opacity = (activeAtmosphere ? 0.22 : 0.07) * reveal + (ignition?.coreBoost ?? 0) * 0.28;
    }
    if (focusPinpointRingMaterialRef.current) {
      focusPinpointRingMaterialRef.current.opacity = (activeAtmosphere ? 0.28 : 0.08) * reveal + (ignition?.haloBoost ?? 0) * 0.36;
    }
    if (focusRef.current && ignition) {
      focusRef.current.scale.setScalar(ignition.radiusScale);
    }

    if (reducedMotion || motionPaused) {
      return;
    }

    if (farRef.current) {
      farRef.current.rotation.y = elapsed * 0.0012;
      farRef.current.rotation.z = elapsed * -0.0006;
    }
    if (midRef.current) {
      midRef.current.rotation.y = elapsed * -0.002;
      midRef.current.position.x = Math.sin(elapsed * 0.018) * 0.16;
    }
    if (nearRef.current) {
      nearRef.current.rotation.y = elapsed * 0.0034;
      nearRef.current.position.z = Math.sin(elapsed * 0.016) * 0.18;
    }
    if (colorRef.current) {
      colorRef.current.rotation.y = elapsed * -0.0018;
      colorRef.current.rotation.z = Math.sin(elapsed * 0.012) * 0.01;
    }
    if (driftRef.current) {
      driftRef.current.rotation.y = elapsed * -0.0008;
      driftRef.current.rotation.z = Math.sin(elapsed * 0.01) * 0.012;
    }
    if (bridgeRef.current) {
      bridgeRef.current.rotation.y = Math.sin(elapsed * 0.012) * 0.006;
      bridgeRef.current.rotation.z = Math.sin(elapsed * 0.009) * 0.004;
    }
    if (mistRef.current) {
      mistRef.current.rotation.y = elapsed * -0.0008;
      mistRef.current.rotation.z = Math.sin(elapsed * 0.01) * 0.018;
    }
    if (focusRef.current) {
      const pulse = Math.sin(elapsed * 0.72) * 0.025;
      focusRef.current.scale.setScalar((ignition?.radiusScale ?? 1) + pulse);
      focusRef.current.rotation.y = elapsed * 0.006;
    }
    if (focusPinpointRef.current) {
      focusPinpointRef.current.rotation.y = elapsed * -0.018;
      focusPinpointRef.current.rotation.z = elapsed * 0.012;
    }
  });

  const pointRefs = [farRef, midRef, nearRef, colorRef];

  return (
    <group renderOrder={-10}>
      <group ref={mistRef}>
        {[
          { radius: 13, opacity: 0.044, color: "#f5edcf", scaleY: 0.26, rotation: [Math.PI / 2.48, -0.18, 0.28] as [number, number, number] },
          { radius: 21, opacity: 0.027, color: "#b7c9c9", scaleY: 0.2, rotation: [Math.PI / 2.2, 0.16, -0.42] as [number, number, number] },
          { radius: 31, opacity: 0.018, color: "#ad8d5a", scaleY: 0.16, rotation: [Math.PI / 2.72, 0.3, 0.66] as [number, number, number] },
          { radius: 42, opacity: 0.013, color: "#d7d3c8", scaleY: 0.13, rotation: [Math.PI / 2.86, -0.42, -0.38] as [number, number, number] }
        ].map((mist) => (
          <mesh key={mist.radius} rotation={mist.rotation} scale={[1, mist.scaleY, 1]}>
            <circleGeometry args={[mist.radius, 128]} />
            <meshBasicMaterial
              color={mist.color}
              transparent
              opacity={mist.opacity * reveal}
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
        {[
          { radius: 9.4, tube: 0.006, opacity: 0.024 },
          { radius: 15.8, tube: 0.004, opacity: 0.016 },
          { radius: 25.2, tube: 0.003, opacity: 0.011 }
        ].map((ring, index) => (
          <mesh key={ring.radius} rotation={[Math.PI / 2.38, 0.08 * index, 0.38 + index * 0.24]}>
            <torusGeometry args={[ring.radius, ring.tube, 6, 220]} />
            <meshBasicMaterial color={legalUniverseTheme.nodeSoft} transparent opacity={ring.opacity * reveal} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <group ref={bridgeRef}>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[bridges.primary, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color={legalUniverseTheme.core}
            transparent
            opacity={(activeAtmosphere ? 0.03 : 0.052) * reveal}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[bridges.secondary, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color={legalUniverseTheme.nodeSoft}
            transparent
            opacity={(activeAtmosphere ? 0.018 : 0.034) * reveal}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      </group>
      <lineSegments ref={driftRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[driftLines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={legalUniverseTheme.nodeSoft} transparent opacity={0.032 * reveal} depthWrite={false} />
      </lineSegments>
      <group ref={focusRef} position={focus.position}>
        <mesh rotation={[Math.PI / 2.35, 0.18, -0.26]} scale={[1, 0.28, 1]}>
          <ringGeometry args={[focus.radius * 1.26, focus.radius * 1.31, 180]} />
          <meshBasicMaterial
            color={focus.color}
            transparent
            opacity={(activeAtmosphere ? 0.13 : 0.038) * reveal}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.1, -0.12, 0.34]} scale={[1, 0.22, 1]}>
          <ringGeometry args={[focus.radius * 1.58, focus.radius * 1.61, 180]} />
          <meshBasicMaterial
            color={legalUniverseTheme.core}
            transparent
            opacity={(activeAtmosphere ? 0.096 : 0.026) * reveal}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.72, 0.26, -0.52]} scale={[1, 0.16, 1]}>
          <ringGeometry args={[focus.radius * 1.92, focus.radius * 1.94, 200]} />
          <meshBasicMaterial
            color={focus.color}
            transparent
            opacity={(activeAtmosphere ? 0.056 : 0.016) * reveal}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[focusDust.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[focusDust.colors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={focusDustMaterialRef}
            vertexColors
            size={activeAtmosphere ? 0.04 : 0.026}
            transparent
            opacity={(activeAtmosphere ? 0.34 : 0.12) * reveal}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
      <group ref={focusPinpointRef} position={focus.pinpoint}>
        <mesh>
          <sphereGeometry args={[activeAtmosphere ? 0.14 : 0.08, 20, 20]} />
          <meshBasicMaterial
            ref={focusPinpointMaterialRef}
            color={focus.color}
            transparent
            opacity={(activeAtmosphere ? 0.22 : 0.07) * reveal}
            depthWrite={false}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.2, 0, 0]}>
          <torusGeometry args={[activeAtmosphere ? 0.42 : 0.24, 0.003, 6, 86]} />
          <meshBasicMaterial
            color={legalUniverseTheme.core}
            transparent
            opacity={(activeAtmosphere ? 0.28 : 0.08) * reveal}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            ref={focusPinpointRingMaterialRef}
          />
        </mesh>
      </group>
      {layers.map((layer, index) => (
        <points key={index} ref={pointRefs[index]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[layer.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[layer.colors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            vertexColors
            size={layer.size}
            transparent
            opacity={layer.opacity * (activeAtmosphere && index > 0 ? 1.12 : 1) * reveal}
            sizeAttenuation
            depthWrite={false}
            fog={false}
          />
        </points>
      ))}
    </group>
  );
}
