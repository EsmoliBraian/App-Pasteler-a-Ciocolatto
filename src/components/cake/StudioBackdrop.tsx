"use client";

import { useMemo } from "react";
import { CanvasTexture, RepeatWrapping } from "three";

/**
 * Fondo de "estudio fotográfico" generado por código: cortina de terciopelo
 * verde oscuro con pliegues + mesa oscura. Reemplaza a una foto real para
 * evitar usar una imagen de stock con marca de agua; es 100% procedural,
 * sin assets externos.
 */
function useCurtainTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 384;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const base = { r: 18, g: 42, b: 28 };
    ctx.fillStyle = `rgb(${base.r},${base.g},${base.b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pleats = 18;
    const pleatWidth = canvas.width / pleats;
    for (let i = 0; i < pleats; i++) {
      const x = i * pleatWidth;
      const shade = Math.sin((i / pleats) * Math.PI * 2 * 2.2) * 14;
      const grad = ctx.createLinearGradient(x, 0, x + pleatWidth, 0);
      grad.addColorStop(0, `rgb(${base.r - 10}, ${base.g - 12}, ${base.b - 8})`);
      grad.addColorStop(0.5, `rgb(${base.r + 10 + shade}, ${base.g + 14 + shade}, ${base.b + 8 + shade * 0.5})`);
      grad.addColorStop(1, `rgb(${base.r - 10}, ${base.g - 12}, ${base.b - 8})`);
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, pleatWidth, canvas.height);
    }

    const vignette = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height * 0.35,
      canvas.height * 0.15,
      canvas.width / 2,
      canvas.height * 0.5,
      canvas.height * 0.75
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }, []);
}

export function StudioBackdrop({ floorY }: { floorY: number }) {
  const curtainTexture = useCurtainTexture();

  return (
    <group>
      <mesh position={[0, floorY + 3.1, -2.3]} receiveShadow>
        <planeGeometry args={[7, 5.2]} />
        {curtainTexture ? (
          <meshStandardMaterial map={curtainTexture} roughness={0.95} />
        ) : (
          <meshStandardMaterial color="#12241c" roughness={0.95} />
        )}
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#241c17" roughness={0.55} metalness={0.05} />
      </mesh>
    </group>
  );
}
