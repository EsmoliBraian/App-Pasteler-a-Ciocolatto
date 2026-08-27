"use client";

import { CAKE_RADIUS } from "./constants";

export function PlateMesh() {
  return (
    <mesh position={[0, -0.04, 0]} receiveShadow>
      <cylinderGeometry args={[CAKE_RADIUS * 1.55, CAKE_RADIUS * 1.6, 0.08, 64]} />
      <meshStandardMaterial color="#ffffff" roughness={0.25} metalness={0.1} />
    </mesh>
  );
}
