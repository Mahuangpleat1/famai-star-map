import * as THREE from "three";

/** Keep thin-line hit areas in screen pixels as the camera moves and zooms. */
export function createScreenSpaceLineRaycast(width: number, height: number, tolerance = 3): THREE.Line["raycast"] {
  return function (this: THREE.Line, raycaster, intersections) {
    const camera = raycaster.camera;
    if (!camera) return;
    const candidates: THREE.Intersection[] = [];
    THREE.Line.prototype.raycast.call(this, raycaster, candidates);
    const pointer = raycaster.ray.at(1, new THREE.Vector3()).project(camera);
    for (const candidate of candidates) {
      const point = candidate.point.clone().project(camera);
      const dx = (point.x - pointer.x) * width / 2;
      const dy = (point.y - pointer.y) * height / 2;
      if (Math.hypot(dx, dy) <= tolerance) intersections.push(candidate);
    }
  };
}
