"use client";

import { animated, useSpring } from "@react-spring/three";
import { CAKE_RADIUS, DEFAULT_FILLING_COLOR } from "./constants";

export function FillingMesh({
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
    config: { mass: 1, tension: 220, friction: 22 },
  });

  return (
    <animated.mesh position-y={posY} scale-y={scaleY} castShadow receiveShadow>
      <cylinderGeometry args={[CAKE_RADIUS * 1.04, CAKE_RADIUS * 1.04, height, 56]} />
      <meshStandardMaterial color={color ?? DEFAULT_FILLING_COLOR} roughness={0.55} metalness={0} />
    </animated.mesh>
  );
}
