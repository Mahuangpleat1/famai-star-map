import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { AMBIENT_FRAME_INTERVAL_MS, nextSlowFrameCount } from "./lawUniverseRenderPolicy";

interface Props {
  animated: boolean;
  onSlowRenderer: () => void;
}

/** Only decorative animation needs a timer. CameraControls invalidates while moving. */
export function LawUniverseRenderLoop({ animated, onSlowRenderer }: Props) {
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);
  const slowFrames = useRef(0);
  const measurement = useRef<ReturnType<typeof setTimeout>>();

  useFrame(() => {
    if (!animated || document.hidden || measurement.current !== undefined) return;
    const started = performance.now();
    // Runs after this frame's synchronous WebGL work, without forcing GPU readback.
    measurement.current = setTimeout(() => {
      measurement.current = undefined;
      slowFrames.current = nextSlowFrameCount(slowFrames.current, performance.now() - started);
      if (slowFrames.current >= 3) onSlowRenderer();
    }, 0);
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      if (document.hidden || !animated) return;
      invalidate();
      timer = setTimeout(tick, AMBIENT_FRAME_INTERVAL_MS);
    };
    const syncVisibility = () => {
      clearTimeout(timer);
      timer = undefined;
      if (!document.hidden) {
        invalidate();
        if (animated) timer = setTimeout(tick, AMBIENT_FRAME_INTERVAL_MS);
      }
    };
    gl.domElement.dataset.renderMode = animated ? "animated-30fps" : "on-demand";
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      clearTimeout(timer);
      clearTimeout(measurement.current);
      measurement.current = undefined;
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, [animated, gl, invalidate]);

  return null;
}
