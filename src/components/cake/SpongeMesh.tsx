"use client";

import { animated, useSpring } from "@react-spring/three";
import { CAKE_RADIUS, DEFAULT_SPONGE_COLOR } from "./constants";

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

  return (
    <animated.mesh position-y={posY} scale-y={scaleY} castShadow receiveShadow>
      <cylinderGeometry args={[CAKE_RADIUS, CAKE_RADIUS, height, 56]} />
      <meshStandardMaterial color={color ?? DEFAULT_SPONGE_COLOR} roughness={0.85} metalness={0} />
    </animated.mesh>
  );
}
