/**
 * 关系连边 3D 渲染 —— Phase 2.5。
 *
 * 数据流（spec §5）：
 *   1. useUserRelations 派生 RenderableRelation[]（已完成）
 *   2. 内部 useMemo 算 satellite 位置字典（同 Satellites 算法）
 *   3. useMemo 派生 visibleRelations：filter source/target 都在 satellites
 *   4. 分类：跨系统（displaySystem 不同） vs 同系统
 *   5. 渲染：每条 cylinder mesh（source → target）
 *
 * 视觉规则（spec §3.4）：
 *   - 8 种 type 颜色（lawUniverseRelationColors）
 *   - strength 1-100 → 半径 + 透明度
 *   - 跨系统 vs 同系统：半径差异（跨系统粗，同系统细）
 */

import { useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { getRelationColor, strengthToOpacity, strengthToWidth } from "./lawUniverseRelationColors";
import type { RenderableRelation } from "./useUserRelations";
import type { ReviewableSatellite } from "./useUserSatellites";
import { resolveRelationEndpoints } from "./legalUniverseRelationResolver";
import { useSatellitePositions } from "./useSatellitePositions";
import "./css/law-universe-lab-satellites.css";

interface LawUniverseRelationBeamsProps {
  relations: RenderableRelation[];
  satellites: ReviewableSatellite[];
}

export function LawUniverseRelationBeams({ relations, satellites }: LawUniverseRelationBeamsProps) {
  const positionDict = useSatellitePositions(satellites);

  // 派生可见 relations（source/target 都在 satellites 里）
  const visibleRelations = useMemo(() => {
    return relations
      .map((rel) => {
        const endpoints = resolveRelationEndpoints(rel, satellites);
        if (!endpoints) return null;
        const sourcePos = positionDict.get(endpoints.source.id);
        const targetPos = positionDict.get(endpoints.target.id);
        if (!sourcePos || !targetPos) return null;
        return { relation: rel, source: sourcePos, target: targetPos };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [relations, satellites, positionDict]);

  if (visibleRelations.length === 0) return null;

  return (
    <group>
      {visibleRelations.map(({ relation, source, target }) => (
        <RelationBeam
          key={relation.id}
          relation={relation}
          source={source.position}
          target={target.position}
          crossSystem={source.displaySystem !== target.displaySystem}
        />
      ))}
    </group>
  );
}

interface RelationBeamProps {
  relation: RenderableRelation;
  source: [number, number, number];
  target: [number, number, number];
  crossSystem: boolean;
}

function RelationBeam({ relation, source, target, crossSystem }: RelationBeamProps) {
  const [hovered, setHovered] = useState(false);

  // 抽 const 让 useMemo 依赖数组只剩纯变量,避免 lint 报 "complex expression in dep"
  // (component 每次 render 都会拿同一组 source/target 三元组,这里只关心 6 个数值是否变)
  const [sourceX, sourceY, sourceZ] = source;
  const [targetX, targetY, targetZ] = target;

  const { position, quaternion, length } = useMemo(() => {
    const sourceVec = new THREE.Vector3(sourceX, sourceY, sourceZ);
    const targetVec = new THREE.Vector3(targetX, targetY, targetZ);
    const direction = new THREE.Vector3().subVectors(targetVec, sourceVec);
    const length = direction.length();
    if (length < 0.01) {
      return { position: sourceVec, quaternion: new THREE.Quaternion(), length: 0.01 };
    }
    const mid = new THREE.Vector3().addVectors(sourceVec, targetVec).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );
    return { position: mid, quaternion: q, length };
  }, [sourceX, sourceY, sourceZ, targetX, targetY, targetZ]);

  const width = strengthToWidth(relation.strength) * (crossSystem ? 1.4 : 0.7);
  const opacity = strengthToOpacity(relation.strength);
  const color = getRelationColor(relation.type);

  return (
    <group>
      <mesh
        position={position}
        quaternion={quaternion}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[width, width, length, 8, 1]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 1 : opacity} depthWrite={false} />
      </mesh>
      {hovered ? (
        <Html position={position} center distanceFactor={10} zIndexRange={[100, 0]}>
          <div
            className="law-universe-relation-label"
            data-testid="law-universe-relation-label"
            style={{ borderColor: color }}
          >
            <div className="law-universe-relation-label__type" style={{ color }}>
              {relation.type} · 强度 {relation.strength}
            </div>
            {relation.citation ? (
              <div className="law-universe-relation-label__citation">{relation.citation.slice(0, 30)}{relation.citation.length > 30 ? "…" : ""}</div>
            ) : null}
          </div>
        </Html>
      ) : null}
    </group>
  );
}
