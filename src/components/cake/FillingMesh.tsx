"use client";

import { animated, useSpring } from "@react-spring/three";
import { CAKE_RADIUS, DEFAULT_FILLING_COLOR } from "./constants";
import { useGanacheTexture, useJamTexture, useSwirlCreamTexture, useSwirlSpiralTexture } from "./textures";

function FillingMaterial({ color, visualStyle }: { color: string; visualStyle?: string | null }) {
  const spiral = useSwirlSpiralTexture(color);
  const ganache = useGanacheTexture(color);
  const cream = useSwirlCreamTexture(color);
  const jam = useJamTexture(color);

  switch (visualStyle) {
    case "dulcedeleche":
      return <meshStandardMaterial color="#ffffff" map={spiral.map} bumpMap={spiral.bumpMap} bumpScale={0.02} roughness={0.5} />;
    case "nutella":
    case "chocolate":
      return (
        <meshPhysicalMaterial
          color="#ffffff"
          map={ganache.map}
          bumpMap={ganache.bumpMap}
          bumpScale={0.008}
          roughness={0.3}
          clearcoat={0.6}
        />
      );
    case "frutosrojos":
      return <meshStandardMaterial color="#ffffff" map={jam.map} bumpMap={jam.bumpMap} bumpScale={0.015} roughness={0.55} />;
    case "chantilly":
      return <meshStandardMaterial color="#ffffff" map={cream.map} bumpMap={cream.bumpMap} bumpScale={0.02} roughness={0.5} />;
    case "limon":
      return (
        <meshPhysicalMaterial color="#ffffff" map={ganache.map} bumpMap={ganache.bumpMap} bumpScale={0.006} roughness={0.35} clearcoat={0.4} />
      );
    default:
      return <meshStandardMaterial color={color} roughness={0.55} />;
  }
}

export function FillingMesh({
  color,
  visualStyle,
  height,
  positionY,
}: {
  color?: string | null;
  visualStyle?: string | null;
  height: number;
  positionY: number;
}) {
  const { scaleY, posY } = useSpring({
    from: { scaleY: 0.01, posY: positionY },
    to: { scaleY: 1, posY: positionY },
    config: { mass: 1, tension: 220, friction: 22 },
  });
  const fillingColor = color ?? DEFAULT_FILLING_COLOR;

  return (
    <animated.mesh position-y={posY} scale-y={scaleY} castShadow receiveShadow>
      <cylinderGeometry args={[CAKE_RADIUS * 1.04, CAKE_RADIUS * 1.04, height, 56]} />
      <FillingMaterial color={fillingColor} visualStyle={visualStyle} />
    </animated.mesh>
  );
}
