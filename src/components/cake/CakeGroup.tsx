"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { SpongeMesh } from "./SpongeMesh";
import { FillingMesh } from "./FillingMesh";
import { DecorationMesh } from "./DecorationMesh";
import { CalloutLabel } from "./CalloutLabel";
import { PlateMesh } from "./PlateMesh";
import { CAKE_RADIUS, SPONGE_HEIGHT, FILLING_HEIGHT } from "./constants";
import type { SpongeOption, FillingOption, DecorationOption } from "@/lib/types";

interface CakeGroupProps {
  sponge?: SpongeOption | null;
  fillings: FillingOption[];
  decoration?: DecorationOption | null;
  spinToken: number;
  showLabels?: boolean;
}

// Ángulos (rad) para repartir los callouts en abanico sin que se pisen ni se
// corten contra el borde del canvas. Rango acotado (no más de ~0.65 rad) para
// que el abanico no se abra tanto en horizontal, ya que en desktop el canvas
// es proporcionalmente más angosto (más alto en relación al ancho) que en
// mobile y un abanico ancho se corta contra el borde.
const CALLOUT_ANGLES = [0.2, -0.68, 0.55, -0.35, 0.08];

export function CakeGroup({ sponge, fillings, decoration, spinToken, showLabels = true }: CakeGroupProps) {
  const groupRef = useRef<Group>(null);
  const targetRotation = useRef(0);
  const prevSpinToken = useRef(spinToken);

  if (prevSpinToken.current !== spinToken) {
    targetRotation.current += Math.PI * 2;
    prevSpinToken.current = spinToken;
  }

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += (targetRotation.current - groupRef.current.rotation.y) * Math.min(1, delta * 3.2);
  });

  const layers: { key: string; node: ReactNode }[] = [];
  const fillingCenters: number[] = [];
  let cursor = 0;

  layers.push({
    key: "sponge-0",
    node: <SpongeMesh key="sponge-0" color={sponge?.colorHex} height={SPONGE_HEIGHT} positionY={cursor + SPONGE_HEIGHT / 2} />,
  });
  cursor += SPONGE_HEIGHT;

  fillings.forEach((filling, i) => {
    const fillingCenterY = cursor + FILLING_HEIGHT / 2;
    fillingCenters.push(fillingCenterY);
    layers.push({
      key: `filling-${filling.id}-${i}`,
      node: (
        <FillingMesh
          key={`filling-${filling.id}-${i}`}
          color={filling.colorHex}
          visualStyle={filling.visualStyle}
          height={FILLING_HEIGHT}
          positionY={fillingCenterY}
        />
      ),
    });
    cursor += FILLING_HEIGHT;

    layers.push({
      key: `sponge-${i + 1}`,
      node: (
        <SpongeMesh
          key={`sponge-${i + 1}`}
          color={sponge?.colorHex}
          height={SPONGE_HEIGHT}
          positionY={cursor + SPONGE_HEIGHT / 2}
        />
      ),
    });
    cursor += SPONGE_HEIGHT;
  });

  const topY = cursor;

  const callouts: { y: number; radius: number; text: string }[] = [];
  if (sponge) {
    // Apunta a la base (no al sponge de arriba) para no competir en altura
    // con las etiquetas de relleno/decoración, que siempre están más arriba.
    callouts.push({ y: SPONGE_HEIGHT / 2, radius: CAKE_RADIUS, text: `Bizcochuelo · ${sponge.name}` });
  }
  // Capas de relleno consecutivas e iguales (ej. el mismo relleno repetido en
  // 2-3 capas) se agrupan en un solo callout para no amontonar texto repetido.
  let i = 0;
  while (i < fillings.length) {
    let j = i;
    while (j + 1 < fillings.length && fillings[j + 1].id === fillings[i].id) j++;
    const groupCenterY = (fillingCenters[i] + fillingCenters[j]) / 2;
    const count = j - i + 1;
    callouts.push({
      y: groupCenterY,
      radius: CAKE_RADIUS * 1.04,
      text: count > 1 ? `Relleno · ${fillings[i].name} ×${count}` : `Relleno · ${fillings[i].name}`,
    });
    i = j + 1;
  }
  if (decoration) {
    const label = decoration.isCustom ? "Decoración · Personalizada" : `Decoración · ${decoration.name}`;
    callouts.push({ y: topY + 0.3, radius: CAKE_RADIUS * 0.9, text: label });
  }

  return (
    <group ref={groupRef}>
      <PlateMesh />
      {layers.map((l) => l.node)}
      {decoration && <DecorationMesh visualStyle={decoration.isCustom ? "custom" : decoration.visualStyle} topY={topY} />}
      {showLabels &&
        callouts.map((c, i) => {
          const angle = CALLOUT_ANGLES[i % CALLOUT_ANGLES.length];
          const anchor: [number, number, number] = [Math.cos(angle) * c.radius, c.y, Math.sin(angle) * c.radius];
          const tip: [number, number, number] = [Math.cos(angle) * (c.radius + 0.38), c.y + 0.05, Math.sin(angle) * (c.radius + 0.38)];
          return <CalloutLabel key={`callout-${i}`} anchor={anchor} tip={tip} text={c.text} />;
        })}
    </group>
  );
}
