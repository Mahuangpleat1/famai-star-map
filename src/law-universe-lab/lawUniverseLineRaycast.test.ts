import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { createScreenSpaceLineRaycast } from "./lawUniverseLineRaycast";

describe("screen-space relation picking", () => {
  for (const distance of [5, 20, 42]) {
    it(`accepts only the visible line neighborhood at distance ${distance}`, () => {
      const camera = new THREE.PerspectiveCamera(47, 1, 0.1, 220);
      camera.position.set(0, 0, distance); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
      const line = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2, 0, 0), new THREE.Vector3(2, 0, 0)]));
      line.raycast = createScreenSpaceLineRaycast(800, 800);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 2 / 400), camera);
      expect(raycaster.intersectObject(line)).toHaveLength(1);
      raycaster.setFromCamera(new THREE.Vector2(0, 8 / 400), camera);
      expect(raycaster.intersectObject(line)).toHaveLength(0);
      line.geometry.dispose();
    });
  }
});
