import * as THREE from "three";

export interface LawUniverseStarFieldOptions {
  count: number;
  radius: number;
  seedOffset: number;
  verticalScale: number;
  saturation: number;
}

export interface LawUniverseStarField {
  positions: Float32Array;
  colors: Float32Array;
}

export interface LawUniverseBeamOptions {
  active: boolean;
  seed: number;
  weight: number;
}

export interface LawUniverseBeamStrand {
  curve: THREE.CatmullRomCurve3;
  points: THREE.Vector3[];
  lineWidth: number;
  opacity: number;
}

export interface LawUniverseFocusIgnition {
  coreBoost: number;
  haloBoost: number;
  lineBoost: number;
  dustBoost: number;
  radiusScale: number;
}

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;

  return () => {
    value = Math.imul(value, 1664525) + 1013904223;
    return (value >>> 0) / 4294967296;
  };
}

function getSafeNormal(vector: THREE.Vector3, fallback: THREE.Vector3): THREE.Vector3 {
  return vector.lengthSq() > 0.0001 ? vector.normalize() : fallback.clone();
}

export function getLawUniverseHashSeed(value: string, salt = 0): number {
  let hash = 2166136261 + salt;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function getLawUniverseFocusIgnition(elapsedSeconds: number): LawUniverseFocusIgnition {
  const coreRise = clamp01(elapsedSeconds / 0.22);
  const coreFall = clamp01((0.66 - elapsedSeconds) / 0.44);
  const coreEnvelope = Math.sin(coreRise * Math.PI * 0.5) * coreFall;
  const haloRise = clamp01((elapsedSeconds - 0.16) / 0.26);
  const haloFall = clamp01((0.78 - elapsedSeconds) / 0.36);
  const haloEnvelope = Math.sin(haloRise * Math.PI * 0.5) * haloFall;
  const lineRise = clamp01(elapsedSeconds / 0.3);
  const lineFall = clamp01((0.74 - elapsedSeconds) / 0.46);
  const lineEnvelope = Math.sin(lineRise * Math.PI * 0.5) * lineFall;
  const dustEnvelope = Math.max(haloEnvelope * 0.82, lineEnvelope * 0.52);

  return {
    coreBoost: coreEnvelope * 0.46,
    haloBoost: haloEnvelope * 0.34,
    lineBoost: lineEnvelope * 0.36,
    dustBoost: dustEnvelope * 0.24,
    radiusScale: 1 + haloEnvelope * 0.24
  };
}

export function createLawUniverseStarField({
  count,
  radius,
  seedOffset,
  verticalScale,
  saturation
}: LawUniverseStarFieldOptions): LawUniverseStarField {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const seed = index + seedOffset;
    const theta = ((seed * 137.508) % 360) * (Math.PI / 180);
    const phi = (((seed * 43.13) % 180) - 90) * (Math.PI / 180);
    const localRadius = radius * (0.68 + ((seed * 17) % 100) / 350);
    const latitudeCos = Math.cos(phi);
    const color = new THREE.Color();
    const hue = (((seed * 29.7) % 360) / 360 + 0.06) % 1;
    const lightness = 0.64 + ((seed * 11) % 100) / 820;

    positions[index * 3] = Math.cos(theta) * latitudeCos * localRadius;
    positions[index * 3 + 1] = Math.sin(phi) * localRadius * verticalScale;
    positions[index * 3 + 2] = Math.sin(theta) * latitudeCos * localRadius;

    color.setHSL(hue, saturation * (0.42 + ((seed * 7) % 100) / 180), lightness);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  return { positions, colors };
}

export function createLawUniverseDriftSegments(count: number, seedOffset: number, radius: [number, number]): Float32Array {
  const random = seededRandom(20260614 + seedOffset);
  const values = new Float32Array(count * 2 * 3);

  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    const localRadius = radius[0] + random() * (radius[1] - radius[0]);
    const length = 1.2 + random() * 5.6;
    const start = new THREE.Vector3(
      Math.cos(angle) * localRadius * (0.78 + random() * 0.4),
      (random() - 0.5) * 32,
      Math.sin(angle) * localRadius
    );
    const drift = new THREE.Vector3((random() - 0.5) * 2.8, (random() - 0.5) * 1.4, length).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      angle + (random() - 0.5) * 0.46
    );
    const end = start.clone().add(drift);
    const offset = index * 6;

    values[offset] = start.x;
    values[offset + 1] = start.y;
    values[offset + 2] = start.z;
    values[offset + 3] = end.x;
    values[offset + 4] = end.y;
    values[offset + 5] = end.z;
  }

  return values;
}

export function createLawUniverseBeamStrands(
  source: THREE.Vector3,
  target: THREE.Vector3,
  { active, seed, weight }: LawUniverseBeamOptions
): LawUniverseBeamStrand[] {
  const distance = source.distanceTo(target);
  const midpoint = source.clone().lerp(target, 0.5);
  const chord = getSafeNormal(target.clone().sub(source), new THREE.Vector3(0, 0, 1));
  const outward = getSafeNormal(midpoint.clone(), new THREE.Vector3(0, 1, 0));
  const cross = new THREE.Vector3().crossVectors(chord, new THREE.Vector3(0, 1, 0));
  const side = getSafeNormal(cross, new THREE.Vector3(1, 0, 0));
  const random = seededRandom(seed + Math.round(weight * 97));
  const strandCount = active ? 5 : 4;
  const baseBend = Math.min(4.8, Math.max(1.35, distance * 0.24));
  const baseLift = Math.min(3.2, Math.max(0.72, distance * 0.16));
  const weightBoost = 0.86 + Math.min(0.34, weight / 300);

  return Array.from({ length: strandCount }, (_, index) => {
    const centeredIndex = index - (strandCount - 1) / 2;
    const spread = centeredIndex * (active ? 0.22 : 0.16) + (random() - 0.5) * 0.18;
    const bend = baseBend * weightBoost * (0.82 + random() * 0.34);
    const lift = baseLift * (0.58 + random() * 0.62);
    const twist = (random() - 0.5) * Math.min(1.6, distance * 0.06);
    const controlA = source
      .clone()
      .lerp(target, 0.24 + random() * 0.08)
      .add(outward.clone().multiplyScalar(bend))
      .add(side.clone().multiplyScalar(spread + twist * 0.12))
      .add(new THREE.Vector3(0, lift, 0));
    const controlB = source
      .clone()
      .lerp(target, 0.68 + random() * 0.08)
      .add(outward.clone().multiplyScalar(bend * (0.58 + random() * 0.16)))
      .add(side.clone().multiplyScalar(-spread * 0.72 - twist * 0.1))
      .add(new THREE.Vector3(0, -lift * (0.18 + random() * 0.2), 0));
    const curve = new THREE.CatmullRomCurve3([source.clone(), controlA, controlB, target.clone()], false, "catmullrom", 0.38);
    const isCore = index === 0;
    const lineWidth = active ? (isCore ? 0.34 : Math.max(0.09, 0.2 - index * 0.024)) : Math.max(0.055, 0.14 - index * 0.018);
    const opacity = active ? (isCore ? 0.72 : Math.max(0.1, 0.32 - index * 0.045)) : Math.max(0.038, 0.128 - index * 0.024);

    return {
      curve,
      points: curve.getPoints(active ? 72 : 58),
      lineWidth,
      opacity
    };
  });
}

export function writeLawUniversePolylineSegments(values: number[], points: THREE.Vector3[]): void {
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const point = points[index];
    values.push(previous.x, previous.y, previous.z, point.x, point.y, point.z);
  }
}

export function writeLawUniverseMovingSegment(
  values: Float32Array,
  curve: THREE.Curve<THREE.Vector3>,
  start: number,
  length: number,
  offset: number,
  steps: number
): void {
  let previous = curve.getPoint(start);
  let cursor = offset;

  for (let index = 1; index < steps; index += 1) {
    const point = curve.getPoint(Math.min(1, start + (length * index) / (steps - 1)));

    values[cursor] = previous.x;
    values[cursor + 1] = previous.y;
    values[cursor + 2] = previous.z;
    values[cursor + 3] = point.x;
    values[cursor + 4] = point.y;
    values[cursor + 5] = point.z;
    previous = point;
    cursor += 6;
  }
}
