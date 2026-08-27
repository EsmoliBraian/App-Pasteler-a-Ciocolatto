"use client";

import { animated, useSpring } from "@react-spring/three";
import { CAKE_RADIUS, DEFAULT_SPONGE_COLOR } from "./constants";
import { useCrumbTexture } from "./textures";

export function SpongeMesh({
  color,
  height,
  positionY,
}: {
  color?: string | null;
  height: number;
  positionY: number;
}) {
  const { scaleY, posY } = useSpring({
    from: { scaleY: 0.01, posY: positionY },
    to: { scaleY: 1, posY: positionY },
    config: { mass: 1, tension: 210, friction: 24 },
  });
  const { map } = useCrumbTexture(color ?? DEFAULT_SPONGE_COLOR);

  return (
    <animated.mesh position-y={posY} scale-y={scaleY} castShadow receiveShadow>
      <cylinderGeometry args={[CAKE_RADIUS, CAKE_RADIUS, height, 56]} />
      <meshStandardMaterial color="#ffffff" map={map} roughness={0.88} metalness={0} />
    </animated.mesh>
  );
}
