"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";
import { DoubleSide, type Mesh } from "three";
import { CAKE_RADIUS } from "./constants";
import { useCocoaDustTexture, useGanacheTexture, useRusticTexture, useSwirlCreamTexture, useSwirlSpiralTexture } from "./textures";

const STYLE_COLOR: Record<string, string> = {
  meringue: "#FBF1D8",
  rustic: "#D8C6A8",
  seminaked: "#FFFDF6",
  dripcake: "#4A2A1D",
  selvanegra: "#FFFDF6",
  nuez: "#F3E9D2",
  franui: "#3B2418",
  carrotcake: "#FFFDF6",
  choconutella: "#3B2418",
  chocotorta: "#B98A55",
  matilda: "#4A2A1D",
  chaja: "#FFFDF6",
  tortabrownie: "#F3E9D2",
  frutosrojostop: "#FFFDF6",
  tiramisu: "#5B4636",
};

const CAP_Y_OFFSET = 0.05;
const DEFAULT_FLATNESS = 0.34;

function ring(count: number, radius: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, angle };
  });
}

/** Altura de la superficie del domo (Cap) en un radio horizontal dado, para
 * poder apoyar toppings ENCIMA de la cúpula en vez de enterrarlos dentro. */
function domeSurfaceY(radiusFromCenter: number, flatness: number) {
  const rr = Math.max(0, CAKE_RADIUS * CAKE_RADIUS - radiusFromCenter * radiusFromCenter);
  return CAP_Y_OFFSET + flatness * Math.sqrt(rr);
}

interface CapMeshProps {
  topY: number;
  flatness: number;
  roughness: number;
  map?: ReturnType<typeof useSwirlCreamTexture>["map"];
  bumpMap?: ReturnType<typeof useSwirlCreamTexture>["bumpMap"];
  bumpScale?: number;
  physical?: boolean;
  fallbackColor: string;
}

function CapMesh({ topY, flatness, roughness, map, bumpMap, bumpScale = 0.04, physical, fallbackColor }: CapMeshProps) {
  return (
    <mesh position={[0, topY + CAP_Y_OFFSET, 0]} scale={[1.05, flatness, 1.05]} castShadow receiveShadow>
      <sphereGeometry args={[CAKE_RADIUS, 48, 30]} />
      {physical ? (
        <meshPhysicalMaterial
          color={map ? "#ffffff" : fallbackColor}
          map={map}
          bumpMap={bumpMap}
          bumpScale={bumpScale}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.18}
        />
      ) : (
        <meshStandardMaterial
          color={map ? "#ffffff" : fallbackColor}
          map={map}
          bumpMap={bumpMap}
          bumpScale={bumpScale}
          roughness={roughness}
        />
      )}
    </mesh>
  );
}

/** Cobertura tipo crema/chantilly con "pétalos" de manga pastelera. */
function CapCream({ color, topY, flatness = DEFAULT_FLATNESS }: { color: string; topY: number; flatness?: number }) {
  const { map, bumpMap } = useSwirlCreamTexture(color);
  return <CapMesh topY={topY} flatness={flatness} roughness={0.55} map={map} bumpMap={bumpMap} bumpScale={0.05} fallbackColor={color} />;
}

/** Cobertura de ganache brillante con reflejo direccional. */
function CapGanache({ color, topY, flatness = DEFAULT_FLATNESS }: { color: string; topY: number; flatness?: number }) {
  const { map, bumpMap } = useGanacheTexture(color);
  return <CapMesh topY={topY} flatness={flatness} roughness={0.18} map={map} bumpMap={bumpMap} bumpScale={0.015} physical fallbackColor={color} />;
}

/** Cobertura con espiral de caramelo/dulce de leche vista desde arriba. */
function CapSpiral({ color, topY, flatness = DEFAULT_FLATNESS }: { color: string; topY: number; flatness?: number }) {
  const { map, bumpMap } = useSwirlSpiralTexture(color);
  return <CapMesh topY={topY} flatness={flatness} roughness={0.5} map={map} bumpMap={bumpMap} bumpScale={0.035} fallbackColor={color} />;
}

/** Cobertura espolvoreada de cacao (tiramisú). */
function CapCocoa({ color, topY, flatness = DEFAULT_FLATNESS }: { color: string; topY: number; flatness?: number }) {
  const { map } = useCocoaDustTexture(color);
  return <CapMesh topY={topY} flatness={flatness} roughness={1} map={map} fallbackColor={color} />;
}

function Dollops({
  color,
  topY,
  radiusFactor = 0.82,
  count = 8,
  size = 0.14,
  capFlatness,
}: {
  color: string;
  topY: number;
  radiusFactor?: number;
  count?: number;
  size?: number;
  capFlatness?: number;
}) {
  const r = CAKE_RADIUS * radiusFactor;
  const points = ring(count, r);
  const baseY = capFlatness !== undefined ? topY + domeSurfaceY(r, capFlatness) : topY;
  return (
    <>
      {points.map((p, i) => (
        <group key={i} position={[p.x, baseY + size * 0.85 + Math.sin(i) * 0.01, p.z]} rotation={[0, (i * Math.PI) / 3, 0]}>
          <mesh castShadow>
            <coneGeometry args={[size * 0.72, size * 1.7, 8]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
          <mesh position={[0, -size * 0.3, 0]} castShadow>
            <sphereGeometry args={[size * 0.78, 16, 12]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
        </group>
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

/** Anillo de bolitas chicas (crocante / crumbs / perlas) alrededor del borde. */
function SpeckRing({
  color,
  topY,
  count = 20,
  size = 0.045,
  radiusFactor = 1.0,
  extraY = 0.02,
  roughness = 0.7,
  capFlatness,
}: {
  color: string;
  topY: number;
  count?: number;
  size?: number;
  radiusFactor?: number;
  extraY?: number;
  roughness?: number;
  capFlatness?: number;
}) {
  const r = CAKE_RADIUS * radiusFactor;
  const points = ring(count, r);
  const baseY = capFlatness !== undefined ? topY + domeSurfaceY(r, capFlatness) : topY;
  return (
    <>
      {points.map((p, i) => (
        <mesh key={i} position={[p.x, baseY + extraY + ((i * 7) % 3) * 0.01, p.z]} castShadow>
          <icosahedronGeometry args={[size, 0]} />
          <meshStandardMaterial color={color} roughness={roughness} />
        </mesh>
      ))}
    </>
  );
}

/** Cluster de esferitas de colores (frutos, virutas) amontonadas cerca del centro. */
function TopCluster({
  colors,
  topY,
  count = 18,
  spread = 0.62,
  size = 0.09,
  capFlatness,
}: {
  colors: string[];
  topY: number;
  count?: number;
  spread?: number;
  size?: number;
  capFlatness?: number;
}) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = i * 2.399963; // ángulo áureo: distribución pareja sin azar real
        const r = spread * CAKE_RADIUS * Math.sqrt((i + 0.5) / count);
        return {
          x: Math.cos(a) * r,
          z: Math.sin(a) * r,
          r,
          s: size * (0.75 + ((i * 13) % 10) / 20),
          color: colors[i % colors.length],
        };
      }),
    [count, spread, size, colors]
  );

  return (
    <>
      {items.map((it, i) => {
        const baseY = capFlatness !== undefined ? topY + domeSurfaceY(it.r, capFlatness) : topY;
        return (
          <mesh key={i} position={[it.x, baseY + it.s * 0.8, it.z]} castShadow>
            <sphereGeometry args={[it.s, 14, 12]} />
            <meshStandardMaterial color={it.color} roughness={0.5} />
          </mesh>
        );
      })}
    </>
  );
}

/** Virutas de chocolate: laminitas finas oscuras esparcidas arriba. */
function ChocoShavings({ topY, count = 14, capFlatness }: { topY: number; count?: number; capFlatness?: number }) {
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = i * 2.399963;
        const r = 0.55 * CAKE_RADIUS * Math.sqrt((i + 0.5) / count);
        return {
          x: Math.cos(a) * r,
          z: Math.sin(a) * r,
          r,
          rotY: i * 1.7,
          rotZ: (i % 5) * 0.3,
        };
      }),
    [count]
  );
  return (
    <>
      {flakes.map((f, i) => {
        const baseY = capFlatness !== undefined ? topY + domeSurfaceY(f.r, capFlatness) : topY;
        return (
          <mesh key={i} position={[f.x, baseY + 0.03 + (i % 3) * 0.02, f.z]} rotation={[0.3, f.rotY, f.rotZ]} castShadow>
            <boxGeometry args={[0.16, 0.014, 0.06]} />
            <meshStandardMaterial color="#2E1B12" roughness={0.35} metalness={0.05} />
          </mesh>
        );
      })}
    </>
  );
}

function RusticCovering({ topY, color }: { topY: number; color: string }) {
  const { map, bumpMap } = useRusticTexture(color);
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
        <meshStandardMaterial color="#ffffff" map={map} bumpMap={bumpMap} bumpScale={0.04} roughness={0.95} />
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

/** Cobertura parcial translúcida (semi naked / carrot cake): se ve el bizcochuelo debajo. */
function PartialCoverage({
  topY,
  coverageFrac = 0.55,
  flatness = 0.2,
}: {
  topY: number;
  coverageFrac?: number;
  flatness?: number;
}) {
  const coverageHeight = topY * coverageFrac;
  return (
    <>
      <mesh position={[0, topY - coverageHeight / 2 + 0.06, 0]} castShadow>
        <cylinderGeometry args={[CAKE_RADIUS * 1.02, CAKE_RADIUS * 1.02, coverageHeight, 48, 1, true]} />
        <meshStandardMaterial color="#FFFDF6" roughness={0.7} transparent opacity={0.55} side={DoubleSide} />
      </mesh>
      <CapCream color="#FFFDF6" topY={topY} flatness={flatness} />
    </>
  );
}

/** Pila de capas finas (crepes) rematada con merengue tostado: look de Rogel. */
function CrepeStack({ topY }: { topY: number }) {
  const layers = 5;
  const layerHeight = 0.055;
  const capTopY = topY + layers * layerHeight;
  return (
    <>
      {Array.from({ length: layers }).map((_, i) => (
        <mesh key={i} position={[0, topY + i * layerHeight + layerHeight / 2, 0]} castShadow>
          <cylinderGeometry args={[CAKE_RADIUS * 0.97, CAKE_RADIUS * 0.97, layerHeight * 0.72, 48]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#E8C687" : "#D9AE64"} roughness={0.7} />
        </mesh>
      ))}
      <CapCream color="#F3E4B8" topY={capTopY} flatness={0.28} />
      <Drips color="#A9642B" topY={capTopY + 0.02} />
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

const BERRY_COLORS = ["#B33951", "#8C1D2B", "#5B2A86", "#C94F6D"];

export function DecorationMesh({ visualStyle, topY }: { visualStyle?: string | null; topY: number }) {
  const style = visualStyle ?? "selvanegra";
  const color = STYLE_COLOR[style] ?? STYLE_COLOR.selvanegra;

  const spring = useSpring({
    from: { scale: 0.01 },
    to: { scale: 1 },
    config: { mass: 1, tension: 200, friction: 20 },
  });

  return (
    <animated.group scale={spring.scale}>
      {/* Clásicas */}
      {style === "selvanegra" && (
        <>
          <CapCream color={color} topY={topY} />
          <Dollops color={color} topY={topY} count={6} radiusFactor={0.9} size={0.1} capFlatness={DEFAULT_FLATNESS} />
          <ChocoShavings topY={topY} capFlatness={DEFAULT_FLATNESS} />
          <TopCluster colors={["#C1272D", "#E23B44"]} topY={topY} count={9} spread={0.4} size={0.11} capFlatness={DEFAULT_FLATNESS} />
        </>
      )}
      {style === "nuez" && (
        <>
          <CapCream color={color} topY={topY} />
          <SpeckRing
            color="#8A5A32"
            topY={topY}
            count={22}
            size={0.05}
            radiusFactor={1.0}
            extraY={-0.01}
            capFlatness={DEFAULT_FLATNESS}
          />
          <TopCluster colors={["#8A5A32", "#6E4423"]} topY={topY} count={7} spread={0.3} size={0.09} capFlatness={DEFAULT_FLATNESS} />
        </>
      )}
      {style === "franui" && (
        <>
          <CapGanache color={color} topY={topY} />
          <SpeckRing
            color="#7A1F2B"
            topY={topY}
            count={10}
            size={0.075}
            radiusFactor={0.78}
            roughness={0.4}
            capFlatness={DEFAULT_FLATNESS}
          />
        </>
      )}
      {style === "rogel" && <CrepeStack topY={topY} />}
      {style === "carrotcake" && (
        <>
          <PartialCoverage topY={topY} coverageFrac={0.5} flatness={0.2} />
          <Dollops color="#FFFDF6" topY={topY} count={9} radiusFactor={0.85} size={0.09} capFlatness={0.2} />
          <TopCluster colors={["#8A5A32", "#6E4423"]} topY={topY} count={6} spread={0.25} size={0.08} capFlatness={0.2} />
        </>
      )}
      {style === "choconutella" && <CapGanache color={color} topY={topY} />}
      {style === "chocotorta" && (
        <>
          <CapSpiral color={color} topY={topY} />
          <SpeckRing
            color="#2E1B12"
            topY={topY}
            count={26}
            size={0.045}
            radiusFactor={1.0}
            extraY={-0.01}
            capFlatness={DEFAULT_FLATNESS}
          />
        </>
      )}
      {style === "matilda" && <RusticCovering topY={topY} color={color} />}
      {style === "chaja" && (
        <>
          <CapCream color={color} topY={topY} />
          <Dollops color={color} topY={topY} count={10} radiusFactor={0.86} size={0.1} capFlatness={DEFAULT_FLATNESS} />
          <mesh position={[0, topY + domeSurfaceY(0, DEFAULT_FLATNESS) + 0.1, 0]} castShadow>
            <sphereGeometry args={[0.16, 16, 12]} />
            <meshStandardMaterial color="#A9642B" roughness={0.5} />
          </mesh>
        </>
      )}
      {style === "tortabrownie" && (
        <>
          <CapCream color={color} topY={topY} />
          <SpeckRing
            color="#2E1B12"
            topY={topY}
            count={16}
            size={0.06}
            radiusFactor={0.88}
            roughness={0.3}
            capFlatness={DEFAULT_FLATNESS}
          />
        </>
      )}
      {style === "frutosrojostop" && (
        <>
          <Dollops color="#FFFDF6" topY={topY} count={10} radiusFactor={0.88} size={0.1} />
          <TopCluster colors={BERRY_COLORS} topY={topY} count={22} spread={0.55} size={0.1} />
        </>
      )}
      {style === "tiramisu" && (
        <>
          <CapCocoa color={color} topY={topY} flatness={0.16} />
          <TopCluster
            colors={["#2E1B12", "#3B2418"]}
            topY={topY}
            count={45}
            spread={0.9}
            size={0.035}
            capFlatness={0.16}
          />
        </>
      )}

      {/* Especiales / frutas */}
      {style === "meringue" && (
        <>
          <CapCream color={color} topY={topY} />
          <Peaks topY={topY} />
        </>
      )}
      {style === "rustic" && <RusticCovering topY={topY} color={color} />}
      {style === "seminaked" && <PartialCoverage topY={topY} />}
      {style === "dripcake" && (
        <>
          <CapGanache color={color} topY={topY} />
          <Drips color={color} topY={topY} long />
        </>
      )}

      {style === "custom" && <CustomMarker topY={topY} />}
    </animated.group>
  );
}
