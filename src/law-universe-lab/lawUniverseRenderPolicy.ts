/** Software WebGL is usable, but continuous effects monopolize its CPU renderer. */
export function isSoftwareRenderer(renderer: string): boolean {
  return /swiftshader|llvmpipe|softpipe|software rasterizer|software renderer/i.test(renderer);
}

export const AMBIENT_FRAME_INTERVAL_MS = 1000 / 30;

/** Ignore isolated compilation/GC spikes; sustained slow frames trigger quiet mode. */
export function nextSlowFrameCount(previous: number, renderDurationMs: number): number {
  return renderDurationMs > 80 ? previous + 1 : 0;
}
