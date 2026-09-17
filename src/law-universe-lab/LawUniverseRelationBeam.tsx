import { Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { getLegalUniverseNodeById } from "../../data/legalUniverseData";
import { getLegalUniverseWorldPosition } from "./legalUniverseLayout";
import { getLegalUniverseColor, legalUniverseTheme } from "./legalUniverseTheme";
import { isLegalUniverseEdgeActive } from "./legalUniverseSceneUtils";
import {
  createLawUniverseBeamStrands,
  getLawUniverseFocusIgnition,
  getLawUniverseHashSeed,
  writeLawUniverseMovingSegment
} from "./legalUniverseVisuals";
import type { LegalUniverseEdge, LegalUniverseVector } from "./types";
import { createScreenSpaceLineRaycast } from "./lawUniverseLineRaycast";

interface LawUniverseRelationBeamProps {
  edge: LegalUniverseEdge;
  selectedNodeId: string;
  hoveredNodeId: string | null;
  introProgress: number;
  focusIgnitionKey: number;
  animated?: boolean;
  economical?: boolean;
  onSelectNode: (id: string) => void;
}

function toVector3(vector: LegalUniverseVector): THREE.Vector3 {
  return new THREE.Vector3(vector[0], vector[1], vector[2]);
}

const MOVING_SEGMENT_STEPS = 8;

export function LawUniverseRelationBeam({
  edge,
  selectedNodeId,
  hoveredNodeId,
  introProgress,
  focusIgnitionKey,
  animated = true,
  economical = false,
  onSelectNode
}: LawUniverseRelationBeamProps) {
  const size = useThree((state) => state.size);
  const raycast = useMemo(() => createScreenSpaceLineRaycast(size.width, size.height), [size.width, size.height]);
  const movingSegmentRef = useRef<THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>>(null);
  const movingMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const sparkMaterialRef = useRef<THREE.PointsMaterial>(null);
  const ignitionStartRef = useRef(0);
  const ignitionKeyRef = useRef(focusIgnitionKey);
  const active = isLegalUniverseEdgeActive(edge, selectedNodeId, hoveredNodeId);
  const overviewMode = selectedNodeId === "universe-core" && !hoveredNodeId;
  const path = useMemo(() => {
    const source = getLegalUniverseNodeById(edge.source);
    const target = getLegalUniverseNodeById(edge.target);

    if (!source || !target) {
      return null;
    }

    const sourcePosition = toVector3(getLegalUniverseWorldPosition(source));
    const targetPosition = toVector3(getLegalUniverseWorldPosition(target));
    const strands = createLawUniverseBeamStrands(sourcePosition, targetPosition, {
      active,
      seed: getLawUniverseHashSeed(`${edge.source}:${edge.target}:${edge.type}`),
      weight: edge.weight
    });
    const movingSegmentPositions = new Float32Array(strands.length * (MOVING_SEGMENT_STEPS - 1) * 2 * 3);
    const sparkValues: number[] = [];

    strands.forEach((strand, strandIndex) => {
      writeLawUniverseMovingSegment(
        movingSegmentPositions,
        strand.curve,
        0.24 + strandIndex * 0.08,
        active ? 0.115 : 0.08,
        strandIndex * (MOVING_SEGMENT_STEPS - 1) * 2 * 3,
        MOVING_SEGMENT_STEPS
      );

      if (active && strandIndex < 3) {
        for (let pointIndex = 6 + strandIndex; pointIndex < strand.points.length - 4; pointIndex += 11) {
          const point = strand.points[pointIndex];
          sparkValues.push(point.x, point.y, point.z);
        }
      }
    });

    return {
      source,
      target,
      movingSegmentPositions,
      sparkPositions: new Float32Array(sparkValues),
      strands
    };
  }, [active, edge.source, edge.target, edge.type, edge.weight]);
  const opacity = active
    ? Math.min(0.9, 0.55 + edge.weight / 320)
    : overviewMode
      ? edge.type === "cross-domain" || edge.type === "subfield-of"
        ? 0.18
        : 0.076
      : hoveredNodeId
        ? 0.028
        : 0.046;
  const color = active ? getLegalUniverseColor(edge.colorKey) : edge.type === "historical-influence" ? getLegalUniverseColor("legal-history") : legalUniverseTheme.line;
  const simplePositions = useMemo(() => path ? new Float32Array(path.strands[0].points.slice(1).flatMap((point, index) => {
    const previous = path.strands[0].points[index];
    return [previous.x, previous.y, previous.z, point.x, point.y, point.z];
  })) : null, [path]);

  useFrame(({ clock }) => {
    if (!animated) return;
    const elapsed = clock.getElapsedTime();

    if (ignitionKeyRef.current !== focusIgnitionKey) {
      ignitionKeyRef.current = focusIgnitionKey;
      ignitionStartRef.current = elapsed;
    }

    const ignition = active && focusIgnitionKey > 0 ? getLawUniverseFocusIgnition(elapsed - ignitionStartRef.current) : null;

    if (movingMaterialRef.current) {
      movingMaterialRef.current.opacity = (0.38 + (ignition?.lineBoost ?? 0) * 0.72) * introProgress;
    }
    if (sparkMaterialRef.current) {
      sparkMaterialRef.current.opacity = (0.5 + (ignition?.lineBoost ?? 0) * 0.42) * introProgress;
    }

    if (!path || !active || !movingSegmentRef.current) {
      return;
    }

    const attribute = movingSegmentRef.current.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;

    if (!attribute) {
      return;
    }

    const array = attribute.array as Float32Array;
    const segmentLength = 0.118;

    path.strands.forEach((strand, strandIndex) => {
      const start = (elapsed * (0.052 + edge.weight / 3600) + strandIndex * 0.13) % (1 - segmentLength);
      writeLawUniverseMovingSegment(
        array,
        strand.curve,
        start,
        segmentLength,
        strandIndex * (MOVING_SEGMENT_STEPS - 1) * 2 * 3,
        MOVING_SEGMENT_STEPS
      );
    });
    attribute.needsUpdate = true;
  });

  if (!path) {
    return null;
  }

  if (economical && simplePositions) {
    return (
      <lineSegments raycast={raycast} onClick={(event) => { event.stopPropagation(); onSelectNode(edge.target === selectedNodeId ? edge.source : edge.target); }}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[simplePositions, 3]} /></bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={active ? 0.35 : 0.025} depthWrite={false} />
      </lineSegments>
    );
  }

  return (
    <group>
      {active ? (
        <Line
          points={path.strands[0].points}
          color={legalUniverseTheme.core}
          lineWidth={1.18}
          transparent
          opacity={0.056 * introProgress}
          depthWrite={false}
        />
      ) : null}
      {path.strands.map((strand, index) => (
        <Line
          key={index}
          points={strand.points}
          color={color}
          lineWidth={strand.lineWidth}
          transparent
          opacity={strand.opacity * opacity * introProgress}
          depthWrite={false}
          onClick={(event) => {
            event.stopPropagation();
            onSelectNode(edge.target === selectedNodeId ? edge.source : edge.target);
          }}
        />
      ))}
      {active ? (
        <lineSegments ref={movingSegmentRef} renderOrder={4}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[path.movingSegmentPositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            ref={movingMaterialRef}
            color={legalUniverseTheme.coreHot}
            transparent
            opacity={0.38 * introProgress}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      ) : null}
      {active && path.sparkPositions.length > 0 ? (
        <points renderOrder={5}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[path.sparkPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={sparkMaterialRef}
            color={legalUniverseTheme.coreHot}
            size={0.04}
            transparent
            opacity={0.5 * introProgress}
            depthWrite={false}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      ) : null}
    </group>
  );
}
