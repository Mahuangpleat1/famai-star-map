import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { getLegalUniverseNodeById, type LegalUniversePath } from "../../data/legalUniverseData";
import { getLegalUniverseWorldPosition } from "./legalUniverseLayout";

interface LawUniversePathBeamProps {
  path: LegalUniversePath | null;
  zoomLevel: number;
}

const BEAM_RADIUS_BASE = 0.05;
const BEAM_RADIUS_BOOST = 0.025;

function lerpVector(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function pathPointsForEdge(sourceId: string, targetId: string): [number, number, number][] {
  const source = getLegalUniverseNodeById(sourceId);
  const target = getLegalUniverseNodeById(targetId);
  if (!source || !target) {
    return [];
  }
  const start = getLegalUniverseWorldPosition(source);
  const end = getLegalUniverseWorldPosition(target);
  const mid = lerpVector(start, end, 0.5);
  // Slight perpendicular bump so the path reads as a fresh layer above
  // the existing relation beams rather than sitting on top of them.
  const bump: [number, number, number] = [mid[0] * 0.985, mid[1] + 0.18, mid[2] * 0.985];
  return [start, bump, end];
}

export function LawUniversePathBeam({ path, zoomLevel }: LawUniversePathBeamProps) {
  const matRef = useRef<THREE.Material | null>(null);

  const segments = useMemo(() => {
    if (!path || path.steps.length === 0) {
      return [] as Array<{ key: string; points: [number, number, number][]; weight: number }>;
    }
    return path.steps.map((step) => ({
      key: `${step.from}-${step.to}-${step.edge.label}`,
      points: pathPointsForEdge(step.from, step.to),
      weight: step.edge.weight
    }));
  }, [path]);

  useFrame((_state, delta) => {
    if (matRef.current) {
      const material = matRef.current as THREE.Material & { dashOffset?: number };
      material.dashOffset = (material.dashOffset ?? 0) - delta * 0.8;
    }
  });

  if (!path || segments.length === 0) {
    return null;
  }

  return (
    <group>
      {segments.map((segment, index) => {
        const lineWidth = (BEAM_RADIUS_BASE + BEAM_RADIUS_BOOST * (segment.weight / 100)) * (zoomLevel === 2 ? 1.4 : 1);
        return (
          <Line
            key={segment.key}
            points={segment.points}
            color="#fff8df"
            lineWidth={lineWidth * 8}
            transparent
            opacity={0.95}
            depthWrite={false}
            dashed
            dashSize={0.18}
            gapSize={0.08}
            // @ts-expect-error - drei's Line forwards a ref to the underlying THREE.Line
            ref={index === 0 ? (matRef as unknown) : undefined}
            data-testid={`law-universe-path-beam-${index}`}
          />
        );
      })}
    </group>
  );
}
