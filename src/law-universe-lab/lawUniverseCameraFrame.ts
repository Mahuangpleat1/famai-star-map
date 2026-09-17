import { getNodeFocusCamera } from "./legalUniverseLayout";
import type { LegalUniverseVector } from "./types";

export interface LawUniverseCameraFrame {
  position: LegalUniverseVector;
  target: LegalUniverseVector;
}

export function getLawUniverseCameraFrame(selectedNodeId: string, zoomLevel: number): LawUniverseCameraFrame {
  return getNodeFocusCamera(selectedNodeId, zoomLevel);
}
