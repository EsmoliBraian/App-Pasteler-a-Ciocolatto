"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { SpongeMesh } from "./SpongeMesh";
import { FillingMesh } from "./FillingMesh";
import { DecorationMesh } from "./DecorationMesh";
import { PlateMesh } from "./PlateMesh";
import { SPONGE_HEIGHT, FILLING_HEIGHT } from "./constants";
import type { SpongeOption, FillingOption, DecorationOption } from "@/lib/types";

interface CakeGroupProps {
  sponge?: SpongeOption | null;
  fillings: FillingOption[];
  decoration?: DecorationOption | null;
  spinToken: number;
}

export function CakeGroup({ sponge, fillings, decoration, spinToken }: CakeGroupProps) {
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
  let cursor = 0;

  layers.push({
    key: "sponge-0",
    node: <SpongeMesh key="sponge-0" color={sponge?.colorHex} height={SPONGE_HEIGHT} positionY={cursor + SPONGE_HEIGHT / 2} />,
  });
  cursor += SPONGE_HEIGHT;

  fillings.forEach((filling, i) => {
    layers.push({
      key: `filling-${filling.id}-${i}`,
      node: (
        <FillingMesh
          key={`filling-${filling.id}-${i}`}
          color={filling.colorHex}
          visualStyle={filling.visualStyle}
          height={FILLING_HEIGHT}
          positionY={cursor + FILLING_HEIGHT / 2}
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

  return (
    <group ref={groupRef}>
      <PlateMesh />
      {layers.map((l) => l.node)}
      {decoration && <DecorationMesh visualStyle={decoration.isCustom ? "custom" : decoration.visualStyle} topY={topY} />}
    </group>
  );
}
