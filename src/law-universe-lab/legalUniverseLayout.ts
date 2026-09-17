import { getLegalUniverseSystemById, legalUniverseNodes } from "../../data/legalUniverseData";
import type { LegalUniverseNode, LegalUniverseVector } from "./types";

interface LocalAngles {
  theta: number;
  phi: number;
}

export interface LegalUniverseCameraTarget {
  position: LegalUniverseVector;
  target: LegalUniverseVector;
}

function degreesToRadians(degrees: number): number {
  return (degrees / 180) * Math.PI;
}

function roundCoordinate(value: number): number {
  return Number(value.toFixed(4));
}

function addVector(a: LegalUniverseVector, b: LegalUniverseVector): LegalUniverseVector {
  return [roundCoordinate(a[0] + b[0]), roundCoordinate(a[1] + b[1]), roundCoordinate(a[2] + b[2])];
}

function subtractVector(a: LegalUniverseVector, b: LegalUniverseVector): LegalUniverseVector {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function scaleVector(vector: LegalUniverseVector, scalar: number): LegalUniverseVector {
  return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

function lerpVector(a: LegalUniverseVector, b: LegalUniverseVector, amount: number): LegalUniverseVector {
  return [
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount
  ];
}

function vectorLength(vector: LegalUniverseVector): number {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function normalizeVector(vector: LegalUniverseVector, fallback: LegalUniverseVector): LegalUniverseVector {
  const length = vectorLength(vector);

  if (length < 0.0001) {
    return fallback;
  }

  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function crossVector(a: LegalUniverseVector, b: LegalUniverseVector): LegalUniverseVector {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function addManyVectors(...vectors: LegalUniverseVector[]): LegalUniverseVector {
  return vectors.reduce<LegalUniverseVector>((sum, vector) => [sum[0] + vector[0], sum[1] + vector[1], sum[2] + vector[2]], [0, 0, 0]).map(roundCoordinate) as LegalUniverseVector;
}

function getSiblingIndex(node: LegalUniverseNode): number {
  return legalUniverseNodes.filter((candidate) => candidate.systemId === node.systemId && candidate.parentId).findIndex((candidate) => candidate.id === node.id);
}

function getLayerRadius(node: LegalUniverseNode): number {
  const system = getLegalUniverseSystemById(node.systemId);
  const baseRadius = system?.systemRadius ?? 2.4;

  if (node.level === 1) {
    return baseRadius * 0.72;
  }
  if (node.level === 2) {
    return baseRadius * 1.05;
  }
  if (node.level === 3) {
    return baseRadius * 1.34;
  }

  return 0;
}

function getLocalAngles(node: LegalUniverseNode): LocalAngles {
  const index = Math.max(0, getSiblingIndex(node));
  const golden = 137.50776405;
  const theta = degreesToRadians((index * golden + node.level * 31) % 360);
  const phiBands = [-28, 19, -12, 31, 8, -34, 24, -20, 38, -6];
  const phi = degreesToRadians(phiBands[index % phiBands.length] + (node.level - 2) * 4);

  return { theta, phi };
}

export function getSystemPosition(systemId: string): LegalUniverseVector {
  return getLegalUniverseSystemById(systemId)?.systemPosition ?? [0, 0, 0];
}

export function getLegalUniverseLocalPosition(node: LegalUniverseNode): LegalUniverseVector {
  if (node.type === "universe-core" || node.type === "system-sun") {
    return [0, 0, 0];
  }

  const { theta, phi } = getLocalAngles(node);
  const radius = getLayerRadius(node);
  const system = getLegalUniverseSystemById(node.systemId);
  const latitudeCos = Math.cos(phi);
  const inclination = system?.systemInclination ?? 0;
  const x = Math.cos(theta) * latitudeCos * radius * 1.16;
  const y = Math.sin(phi) * radius * 0.72 + inclination * radius * 0.34;
  const z = Math.sin(theta) * latitudeCos * radius * 1.05;

  return [roundCoordinate(x), roundCoordinate(y), roundCoordinate(z)];
}

export function getLegalUniverseWorldPosition(node: LegalUniverseNode): LegalUniverseVector {
  if (node.type === "universe-core") {
    return [0, 0, 0];
  }

  return addVector(getSystemPosition(node.systemId), getLegalUniverseLocalPosition(node));
}

export function getNodeLocalPosition(node: LegalUniverseNode): LegalUniverseVector {
  return getLegalUniverseLocalPosition(node);
}

export function getNodeWorldPosition(node: LegalUniverseNode): LegalUniverseVector {
  return getLegalUniverseWorldPosition(node);
}

function getZoomScale(zoomLevel: number): number {
  return zoomLevel === 2 ? 0.84 : zoomLevel === 0 ? 1.18 : 1;
}

export function getSystemFocusCamera(systemId: string, zoomLevel = 1): LegalUniverseCameraTarget {
  const systemPosition = getSystemPosition(systemId);
  const origin: LegalUniverseVector = [0, 0, 0];
  const radial = normalizeVector(subtractVector(systemPosition, origin), [0, 0, 1]);
  const safeSide = normalizeVector(crossVector(radial, [0, 1, 0]), [1, 0, 0]);
  const zoomScale = getZoomScale(zoomLevel);
  const target = addManyVectors(lerpVector(systemPosition, origin, 0.08), [0, 0.08, 0]);
  const position = addManyVectors(systemPosition, scaleVector(radial, 5.6 * zoomScale), scaleVector(safeSide, -1.2), [0, 2.15 * zoomScale, 0]);

  return { position, target };
}

export function getNodeFocusCamera(nodeId: string, zoomLevel = 1): LegalUniverseCameraTarget {
  const selectedNode = legalUniverseNodes.find((node) => node.id === nodeId);

  if (!selectedNode || selectedNode.type === "universe-core") {
    const zoomScale = getZoomScale(zoomLevel);
    return {
      position: [0, roundCoordinate(11.6 * zoomScale), roundCoordinate(23.5 * zoomScale)],
      target: [0, 0.2, 0]
    };
  }

  if (selectedNode.type === "system-sun") {
    return getSystemFocusCamera(selectedNode.id, zoomLevel);
  }

  const nodePosition = getLegalUniverseWorldPosition(selectedNode);
  const parentNode = selectedNode.parentId ? legalUniverseNodes.find((node) => node.id === selectedNode.parentId) : undefined;
  const parentPosition = parentNode ? getLegalUniverseWorldPosition(parentNode) : [0, 0, 0] as LegalUniverseVector;
  const radial = normalizeVector(nodePosition, [0, 0, 1]);
  const direction = normalizeVector(subtractVector(nodePosition, parentPosition), radial);
  const safeSide = normalizeVector(crossVector(direction, [0, 1, 0]), normalizeVector(crossVector(radial, [0, 1, 0]), [1, 0, 0]));
  const zoomScale = getZoomScale(zoomLevel);
  const target = addManyVectors(lerpVector(nodePosition, parentPosition, 0.28), [0, 0.08, 0]);
  const position = addManyVectors(
    nodePosition,
    scaleVector(direction, 2.7 * zoomScale),
    scaleVector(radial, 1.1 * zoomScale),
    scaleVector(safeSide, -0.52),
    [0, 0.92, 0]
  );

  return { position, target };
}
