"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";
import { DoubleSide, type Mesh } from "three";
import { CAKE_RADIUS } from "./constants";

const STYLE_COLOR: Record<string, string> = {
  chantilly: "#FFFDF6",
  ganache: "#3B2418",
  meringue: "#FBF1D8",
  rustic: "#D8C6A8",
  seminaked: "#FFFDF6",
  dripcake: "#4A2A1D",
};

function ring(count: number, radius: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, angle };
  });
}

function Cap({ color, topY, glossy }: { color: string; topY: number; glossy?: boolean }) {
  return (
    <mesh position={[0, topY + 0.05, 0]} scale={[1.05, 0.34, 1.05]} castShadow>
      <sphereGeometry args={[CAKE_RADIUS, 40, 24]} />
      {glossy ? (
        <meshPhysicalMaterial color={color} roughness={0.18} clearcoat={1} clearcoatRoughness={0.15} />
      ) : (
        <meshStandardMaterial color={color} roughness={0.6} />
      )}
    </mesh>
  );
}

function Dollops({ color, topY }: { color: string; topY: number }) {
  const points = ring(8, CAKE_RADIUS * 0.82);
  return (
    <>
      {points.map((p, i) => (
        <mesh key={i} position={[p.x, topY + 0.14 + Math.sin(i) * 0.01, p.z]} castShadow>
          <sphereGeometry args={[0.14, 20, 16]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
      ))}
    </>
  );
}

function Peaks({ topY }: { topY: number }) {
  const points = ring(10, CAKE_RADIUS * 0.78);
  return (
    <>
      {points.map((p, i) => (
        <group key={i} position={[p.x, topY + 0.12, p.z]}>
          <mesh castShadow>
            <coneGeometry args={[0.12, 0.32, 16]} />
            <meshStandardMaterial color="#FBF1D8" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.17, 0]} castShadow>
            <sphereGeometry args={[0.045, 10, 8]} />
            <meshStandardMaterial color="#C98A3E" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Drips({ color, topY, long }: { color: string; topY: number; long?: boolean }) {
  const count = long ? 12 : 9;
  const points = ring(count, CAKE_RADIUS * 0.99);
  return (
    <>
      {points.map((p, i) => {
        const len = long ? 0.32 + ((i * 7) % 5) * 0.05 : 0.18 + ((i * 5) % 4) * 0.04;
        return (
          <mesh key={i} position={[p.x, topY - len / 2 + 0.05, p.z]} castShadow>
            <coneGeometry args={[0.09, len, 12]} />
            <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={1} clearcoatRoughness={0.2} />
          </mesh>
        );
      })}
    </>
  );
}

function RusticTexture({ topY }: { topY: number }) {
  const color = STYLE_COLOR.rustic;
  const blobs = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2 + Math.sin(i) * 0.3;
        const heightFrac = 0.25 + ((i * 37) % 100) / 130;
        const r = CAKE_RADIUS * (1.0 + 0.04 * Math.sin(i * 2.1));
        return {
          x: Math.cos(angle) * r,
          z: Math.sin(angle) * r,
          y: topY * heightFrac,
          scale: 0.16 + ((i * 13) % 10) / 90,
          rot: i * 1.3,
        };
      }),
    [topY]
  );

  return (
    <>
      <mesh position={[0, topY / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[CAKE_RADIUS * 1.03, CAKE_RADIUS * 1.03, topY + 0.12, 48]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {blobs.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} rotation={[b.rot, b.rot * 0.6, 0]} scale={b.scale} castShadow>
          <icosahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={color} roughness={1} />
        </mesh>
      ))}
    </>
  );
}

function SemiNaked({ topY }: { topY: number }) {
  const coverageHeight = topY * 0.55;
  return (
    <>
      <mesh position={[0, topY - coverageHeight / 2 + 0.06, 0]} castShadow>
        <cylinderGeometry args={[CAKE_RADIUS * 1.02, CAKE_RADIUS * 1.02, coverageHeight, 48, 1, true]} />
        <meshStandardMaterial color="#FFFDF6" roughness={0.7} transparent opacity={0.55} side={DoubleSide} />
      </mesh>
      <mesh position={[0, topY + 0.04, 0]} scale={[1.02, 0.2, 1.02]} castShadow>
        <sphereGeometry args={[CAKE_RADIUS, 32, 20]} />
        <meshStandardMaterial color="#FFFDF6" roughness={0.6} />
      </mesh>
    </>
  );
}

function CustomMarker({ topY }: { topY: number }) {
  const sparkleRef = useRef<Mesh>(null);
  useFrame((state) => {
    if (!sparkleRef.current) return;
    sparkleRef.current.rotation.y = state.clock.elapsedTime * 0.8;
    sparkleRef.current.position.y = topY + 0.55 + Math.sin(state.clock.elapsedTime * 1.6) * 0.06;
  });

  return (
    <group>
      <mesh position={[0, topY + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[CAKE_RADIUS * 0.75, 0.02, 8, 48]} />
        <meshStandardMaterial color="#C9A24B" transparent opacity={0.55} roughness={0.4} />
      </mesh>
      <mesh ref={sparkleRef} position={[0, topY + 0.55, 0]}>
        <icosahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial color="#C9A24B" emissive="#C9A24B" emissiveIntensity={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function DecorationMesh({ visualStyle, topY }: { visualStyle?: string | null; topY: number }) {
  const style = visualStyle ?? "chantilly";
  const color = STYLE_COLOR[style] ?? STYLE_COLOR.chantilly;

  const spring = useSpring({
    from: { scale: 0.01, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: { mass: 1, tension: 200, friction: 20 },
  });

  return (
    <animated.group scale={spring.scale}>
      {style === "chantilly" && (
        <>
          <Cap color={color} topY={topY} />
          <Dollops color={color} topY={topY} />
        </>
      )}
      {style === "ganache" && (
        <>
          <Cap color={color} topY={topY} glossy />
          <Drips color={color} topY={topY} />
        </>
      )}
      {style === "meringue" && (
        <>
          <Cap color={color} topY={topY} />
          <Peaks topY={topY} />
        </>
      )}
      {style === "rustic" && <RusticTexture topY={topY} />}
      {style === "seminaked" && <SemiNaked topY={topY} />}
      {style === "dripcake" && (
        <>
          <Cap color={color} topY={topY} glossy />
          <Drips color={color} topY={topY} long />
        </>
      )}
      {style === "custom" && <CustomMarker topY={topY} />}
    </animated.group>
  );
}
