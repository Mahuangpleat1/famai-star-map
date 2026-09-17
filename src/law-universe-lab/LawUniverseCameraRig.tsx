import { CameraControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import type { ElementRef } from "react";
import { getLawUniverseCameraFrame, type LawUniverseCameraFrame } from "./lawUniverseCameraFrame";

type CameraState = "idle" | "focusing" | "focused";

interface LawUniverseCameraRigProps {
  selectedNodeId: string;
  cameraFocusKey: number;
  zoomLevel: number;
  prefersReducedMotion: boolean;
  onFocusComplete: (id: string) => void;
  onCameraState: (state: CameraState) => void;
  onCameraFrame: (frame: LawUniverseCameraFrame) => void;
}

export function LawUniverseCameraRig({
  selectedNodeId,
  cameraFocusKey,
  zoomLevel,
  prefersReducedMotion,
  onFocusComplete,
  onCameraState,
  onCameraFrame
}: LawUniverseCameraRigProps) {
  const controlsRef = useRef<ElementRef<typeof CameraControls>>(null);
  const sequenceRef = useRef(0);
  const frame = useMemo(() => getLawUniverseCameraFrame(selectedNodeId, zoomLevel), [selectedNodeId, zoomLevel]);

  useEffect(() => {
    const controls = controlsRef.current;

    if (!controls) {
      return;
    }

    const sequence = sequenceRef.current + 1;
    sequenceRef.current = sequence;
    const shouldTransition = !prefersReducedMotion && cameraFocusKey > 0;
    onCameraFrame(frame);
    onCameraState(shouldTransition ? "focusing" : "focused");

    let settled = false;
    const finishFocus = () => {
      if (settled || sequenceRef.current !== sequence) {
        return;
      }
      settled = true;
      onCameraFrame(frame);
      onCameraState("focused");
      onFocusComplete(selectedNodeId);
    };
    const fallbackTimer = window.setTimeout(finishFocus, shouldTransition ? 1300 : 0);
    const transition = controls.setLookAt(
      frame.position[0],
      frame.position[1],
      frame.position[2],
      frame.target[0],
      frame.target[1],
      frame.target[2],
      shouldTransition
    );

    Promise.resolve(transition).then(finishFocus);

    return () => window.clearTimeout(fallbackTimer);
  }, [cameraFocusKey, frame, onCameraFrame, onCameraState, onFocusComplete, prefersReducedMotion, selectedNodeId]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      dollySpeed={0.3}
      draggingSmoothTime={0.14}
      maxDistance={42}
      minDistance={2.1}
      smoothTime={0.82}
      truckSpeed={0.16}
    />
  );
}
