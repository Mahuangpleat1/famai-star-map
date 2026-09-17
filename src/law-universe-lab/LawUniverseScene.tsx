import { PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import * as THREE from "three";
import type { LegalUniversePath } from "../../data/legalUniverseData";
import { LawUniverseBackground } from "./LawUniverseBackground";
import { LawUniverseCameraRig } from "./LawUniverseCameraRig";
import { LawUniverseGraph } from "./LawUniverseGraph";
import { LawUniversePathBeam } from "./LawUniversePathBeam";
import { LawUniverseRelationBeams } from "./LawUniverseRelationBeams";
import { LawUniverseSatellites } from "./LawUniverseSatellites";
import { LawUniverseRenderLoop } from "./LawUniverseRenderLoop";
import { isSoftwareRenderer } from "./lawUniverseRenderPolicy";
import { getLawUniverseCameraFrame } from "./lawUniverseCameraFrame";
import type { LawUniverseCameraFrame } from "./lawUniverseCameraFrame";
import { legalUniverseTheme } from "./legalUniverseTheme";
import type { LegalUniverseSceneFilter } from "./legalUniverseSceneUtils";
import "./css/law-universe-lab-scene.css";
import type { RenderableRelation } from "./useUserRelations";
import type { ReviewableSatellite } from "./useUserSatellites";

type CameraState = "idle" | "focusing" | "focused";

interface LawUniverseSceneProps {
  selectedNodeId: string;
  hoveredNodeId: string | null;
  motionPaused: boolean;
  cameraFocusKey: number;
  focusIgnitionKey: number;
  zoomLevel: number;
  filter: LegalUniverseSceneFilter;
  path: LegalUniversePath | null;
  /** Phase 1 卫星：审核未通过也显示，按需隐藏。 */
  satellites: ReviewableSatellite[];
  satelliteVisible: boolean;
  /** Phase 2.5 B: 用户抽取的关系。 */
  relations: RenderableRelation[];
  relationVisible: boolean;
  onSelectSatellite: (satellite: ReviewableSatellite) => void;
  /** Phase 2: 拖拽释放命中目标系统时调用，让调用方写回 IndexedDB。 */
  onCommitSatelliteMove?: (satellite: ReviewableSatellite, targetSystemId: string) => void;
  /** Phase 2.5 A1: 拖拽状态变化（用于暂停场景 motion）。 */
  onDragStateChange?: (dragging: boolean) => void;
  onSelectNode: (id: string) => void;
  onHoverNode: (id: string | null) => void;
  onReset: () => void;
  onFocusComplete: (id: string) => void;
  onCameraState: (state: CameraState) => void;
  onCameraFrame: (frame: LawUniverseCameraFrame) => void;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

function useIntroProgress(reducedMotion: boolean): number {
  const [introProgress, setIntroProgress] = useState(reducedMotion ? 1 : 0.2);

  useEffect(() => {
    if (reducedMotion) {
      setIntroProgress(1);
      return undefined;
    }

    const phases = [
      { delay: 420, progress: 0.24 },
      { delay: 1_600, progress: 0.48 },
      { delay: 3_200, progress: 0.72 },
      { delay: 5_200, progress: 0.9 },
      { delay: 7_800, progress: 1 }
    ];
    const timers = phases.map(({ delay, progress }) => window.setTimeout(() => setIntroProgress(progress), delay));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [reducedMotion]);

  return introProgress;
}

export function LawUniverseScene({
  selectedNodeId,
  hoveredNodeId,
  motionPaused,
  cameraFocusKey,
  focusIgnitionKey,
  zoomLevel,
  filter,
  path,
  satellites,
  satelliteVisible,
  relations,
  relationVisible,
  onSelectSatellite,
  onCommitSatelliteMove,
  onDragStateChange,
  onSelectNode,
  onHoverNode,
  onReset,
  onFocusComplete,
  onCameraState,
  onCameraFrame
}: LawUniverseSceneProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [constrainedRenderer, setConstrainedRenderer] = useState(false);
  const [rendererReady, setRendererReady] = useState(false);
  const useQuietMotion = prefersReducedMotion || constrainedRenderer;
  const introProgress = useIntroProgress(useQuietMotion);
  const markSlowRenderer = useCallback(() => setConstrainedRenderer(true), []);
  const initialCameraFrame = getLawUniverseCameraFrame("universe-core", zoomLevel);

  return (
    <div
      className="law-universe-scene"
      data-testid="law-universe-scene"
      id="law-universe-scene"
      data-background-motion={useQuietMotion || motionPaused ? "paused" : "running"}
      data-render-quality={constrainedRenderer ? "economy" : "standard"}
      data-background-layers={constrainedRenderer ? "css-nebula-vignette" : "far-stars mid-dust near-sparks colored-micro-stars nebula-mist ambient-light-bridges active-focus-aura drifting-silk vignette"}
    >
      <Canvas
        frameloop="demand"
        dpr={rendererReady && !constrainedRenderer ? [1, 1.7] : 1}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onPointerMissed={onReset}
        onCreated={({ gl }) => {
          gl.domElement.dataset.testid = "law-universe-canvas";
          gl.domElement.dataset.renderer = "three-webgl";
          gl.domElement.dataset.sceneReady = "true";
          gl.setClearColor(legalUniverseTheme.space);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
          const context = gl.getContext();
          const info = context.getExtension("WEBGL_debug_renderer_info");
          if (info && isSoftwareRenderer(String(context.getParameter(info.UNMASKED_RENDERER_WEBGL)))) {
            setConstrainedRenderer(true);
          }
          // Choose geometry/material quality before mounting the graph, avoiding
          // an expensive full-quality shader compilation followed by replacement.
          setRendererReady(true);
        }}
      >
        <LawUniverseRenderLoop animated={!motionPaused && !useQuietMotion} onSlowRenderer={markSlowRenderer} />
        <color attach="background" args={[legalUniverseTheme.space]} />
        <fog attach="fog" args={[legalUniverseTheme.space, 17, 72]} />
        <PerspectiveCamera makeDefault position={initialCameraFrame.position} fov={47} near={0.1} far={220} />
        <ambientLight intensity={0.32} />
        <pointLight position={[0, 2, 0]} intensity={3.35} color={legalUniverseTheme.core} distance={44} />
        <directionalLight position={[7, 8, 4]} intensity={0.62} color={legalUniverseTheme.coreHot} />
        {rendererReady && !constrainedRenderer ? <LawUniverseBackground
          reducedMotion={useQuietMotion}
          motionPaused={motionPaused}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          introProgress={introProgress}
          focusIgnitionKey={focusIgnitionKey}
        /> : null}
        <LawUniverseCameraRig
          selectedNodeId={selectedNodeId}
          cameraFocusKey={cameraFocusKey}
          zoomLevel={zoomLevel}
          prefersReducedMotion={useQuietMotion}
          onFocusComplete={onFocusComplete}
          onCameraState={onCameraState}
          onCameraFrame={onCameraFrame}
        />
        {rendererReady ? <LawUniverseGraph
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          motionPaused={motionPaused}
          reducedMotion={useQuietMotion}
          economical={constrainedRenderer}
          introProgress={introProgress}
          focusIgnitionKey={focusIgnitionKey}
          filter={filter}
          onSelectNode={onSelectNode}
          onHoverNode={onHoverNode}
        /> : null}
        <LawUniversePathBeam path={path} zoomLevel={zoomLevel} />
        {relationVisible ? <LawUniverseRelationBeams relations={relations} satellites={satellites} /> : null}
        {satelliteVisible ? (
          <LawUniverseSatellites
            satellites={satellites}
            onSelect={onSelectSatellite}
            onCommitMove={onCommitSatelliteMove ?? (() => {})}
            onDragStateChange={onDragStateChange}
          />
        ) : null}
      </Canvas>
      {constrainedRenderer ? <p className="law-universe-render-note" role="status">已启用节能渲染 · 仍可缩放和聚焦</p> : null}
    </div>
  );
}
