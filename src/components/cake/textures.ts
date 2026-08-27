"use client";

import { useMemo } from "react";
import { CanvasTexture, RepeatWrapping } from "three";

/**
 * Texturas 100% procedurales (generadas por canvas 2D, sin fotos de terceros)
 * para que las coberturas no se vean como colores planos: swirls de crema
 * pastelera, brillo de ganache, pinceladas rústicas, espiral de caramelo,
 * espolvoreado de cacao y miga de bizcochuelo. Cada hook devuelve un mapa de
 * color (`map`) y un mapa de relieve en escala de grises (`bumpMap`) listos
 * para `meshStandardMaterial`.
 */

function makeCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return { canvas, ctx: canvas.getContext("2d")! };
}

function toTexture(canvas: HTMLCanvasElement, repeat = 1) {
  const texture = new CanvasTexture(canvas);
  if (repeat !== 1) {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(repeat, repeat);
  }
  texture.needsUpdate = true;
  return texture;
}

function mix(hex: string, amount: number) {
  // amount > 0 aclara, < 0 oscurece
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const f = amount > 0 ? (255 - Math.max(r, g, b)) * amount : Math.min(r, g, b) * amount;
  r = Math.max(0, Math.min(255, r + f));
  g = Math.max(0, Math.min(255, g + f));
  b = Math.max(0, Math.min(255, b + f));
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

/** Crema pastelera con "pétalos" de manga (spiral piping) vista desde arriba. */
export function useSwirlCreamTexture(baseColor: string) {
  return useMemo(() => {
    const size = 512;
    const { canvas, ctx } = makeCanvas(size);
    const cx = size / 2;
    const cy = size / 2;
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    const petals = 14;
    for (let ring = 0; ring < 3; ring++) {
      const radius = size * (0.42 - ring * 0.13);
      const count = petals - ring * 3;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + ring * 0.3;
        const x = cx + Math.cos(a) * radius;
        const y = cy + Math.sin(a) * radius;
        const grad = ctx.createRadialGradient(x - 6, y - 6, 2, x, y, size * 0.075);
        grad.addColorStop(0, mix(baseColor, 0.35));
        grad.addColorStop(0.6, baseColor);
        grad.addColorStop(1, mix(baseColor, -0.12));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.07, size * 0.075, a, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const centerGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, size * 0.1);
    centerGrad.addColorStop(0, mix(baseColor, 0.4));
    centerGrad.addColorStop(1, baseColor);
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.09, 0, Math.PI * 2);
    ctx.fill();

    const map = toTexture(canvas);

    const { canvas: bcanvas, ctx: bctx } = makeCanvas(size);
    bctx.fillStyle = "#808080";
    bctx.fillRect(0, 0, size, size);
    for (let ring = 0; ring < 3; ring++) {
      const radius = size * (0.42 - ring * 0.13);
      const count = petals - ring * 3;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + ring * 0.3;
        const x = cx + Math.cos(a) * radius;
        const y = cy + Math.sin(a) * radius;
        const g = bctx.createRadialGradient(x - 6, y - 6, 1, x, y, size * 0.075);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(1, "#707070");
        bctx.fillStyle = g;
        bctx.beginPath();
        bctx.ellipse(x, y, size * 0.07, size * 0.075, a, 0, Math.PI * 2);
        bctx.fill();
      }
    }
    const bumpMap = toTexture(bcanvas);

    return { map, bumpMap };
  }, [baseColor]);
}

/** Ganache: superficie lisa con brillo direccional + micro-burbujas. */
export function useGanacheTexture(baseColor: string) {
  return useMemo(() => {
    const size = 512;
    const { canvas, ctx } = makeCanvas(size);
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    const sheen = ctx.createLinearGradient(0, 0, size, size * 0.6);
    sheen.addColorStop(0, mix(baseColor, 0.45));
    sheen.addColorStop(0.25, mix(baseColor, 0.1));
    sheen.addColorStop(0.5, baseColor);
    sheen.addColorStop(1, mix(baseColor, -0.15));
    ctx.fillStyle = sheen;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(0, 0, size, size);
    ctx.globalAlpha = 1;

    for (let i = 0; i < 60; i++) {
      const a = i * 2.399963;
      const r = size * 0.46 * Math.sqrt((i + 0.5) / 60);
      const x = size / 2 + Math.cos(a) * r;
      const y = size / 2 + Math.sin(a) * r;
      ctx.fillStyle = i % 7 === 0 ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.03)";
      ctx.beginPath();
      ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    const map = toTexture(canvas);

    const { canvas: bcanvas, ctx: bctx } = makeCanvas(size);
    bctx.fillStyle = "#9a9a9a";
    bctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 60; i++) {
      const a = i * 2.399963;
      const r = size * 0.46 * Math.sqrt((i + 0.5) / 60);
      const x = size / 2 + Math.cos(a) * r;
      const y = size / 2 + Math.sin(a) * r;
      bctx.fillStyle = i % 2 === 0 ? "#b0b0b0" : "#828282";
      bctx.beginPath();
      bctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
      bctx.fill();
    }
    const bumpMap = toTexture(bcanvas);

    return { map, bumpMap };
  }, [baseColor]);
}

/** Terminación rústica: pinceladas de espátula en distintas direcciones. */
export function useRusticTexture(baseColor: string) {
  return useMemo(() => {
    const size = 512;
    const { canvas, ctx } = makeCanvas(size);
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    const strokes = 46;
    for (let i = 0; i < strokes; i++) {
      const y = (i / strokes) * size + (Math.sin(i * 3.1) * size) / strokes / 1.6;
      const shade = Math.sin(i * 1.7) * 0.16;
      ctx.strokeStyle = mix(baseColor, shade);
      ctx.lineWidth = size / strokes + 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.33, y + Math.cos(i) * 10, size * 0.66, y - Math.sin(i * 2) * 10, size, y);
      ctx.stroke();
    }
    const map = toTexture(canvas, 2);

    const { canvas: bcanvas, ctx: bctx } = makeCanvas(size);
    bctx.fillStyle = "#8c8c8c";
    bctx.fillRect(0, 0, size, size);
    for (let i = 0; i < strokes; i++) {
      const y = (i / strokes) * size + (Math.sin(i * 3.1) * size) / strokes / 1.6;
      bctx.strokeStyle = i % 2 === 0 ? "#c8c8c8" : "#707070";
      bctx.lineWidth = size / strokes + 2;
      bctx.beginPath();
      bctx.moveTo(0, y);
      bctx.bezierCurveTo(size * 0.33, y + Math.cos(i) * 10, size * 0.66, y - Math.sin(i * 2) * 10, size, y);
      bctx.stroke();
    }
    const bumpMap = toTexture(bcanvas, 2);

    return { map, bumpMap };
  }, [baseColor]);
}

/** Espiral de caramelo/dulce de leche vista desde arriba. */
export function useSwirlSpiralTexture(baseColor: string) {
  return useMemo(() => {
    const size = 512;
    const { canvas, ctx } = makeCanvas(size);
    const cx = size / 2;
    const cy = size / 2;
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    ctx.lineCap = "round";
    const turns = 6;
    const maxR = size * 0.46;
    ctx.lineWidth = size * 0.05;
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass === 0 ? mix(baseColor, -0.18) : mix(baseColor, 0.22);
      ctx.beginPath();
      const steps = 240;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * Math.PI * 2 * turns + (pass === 1 ? Math.PI / (turns * 2) : 0);
        const r = t * maxR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    const map = toTexture(canvas);

    const { canvas: bcanvas, ctx: bctx } = makeCanvas(size);
    bctx.fillStyle = "#909090";
    bctx.fillRect(0, 0, size, size);
    bctx.lineCap = "round";
    bctx.lineWidth = size * 0.05;
    bctx.strokeStyle = "#c0c0c0";
    bctx.beginPath();
    const steps = 240;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 2 * turns;
      const r = t * maxR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) bctx.moveTo(x, y);
      else bctx.lineTo(x, y);
    }
    bctx.stroke();
    const bumpMap = toTexture(bcanvas);

    return { map, bumpMap };
  }, [baseColor]);
}

/** Cacao amargo espolvoreado: ruido fino oscuro sobre base marrón. */
export function useCocoaDustTexture(baseColor: string) {
  return useMemo(() => {
    const size = 512;
    const { canvas, ctx } = makeCanvas(size);
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 3200; i++) {
      const x = (i * 97) % size;
      const y = (i * 53) % size;
      const shade = ((i * 31) % 100) / 100;
      ctx.fillStyle = shade > 0.5 ? "rgba(0,0,0,0.22)" : "rgba(80,50,30,0.18)";
      ctx.fillRect(x, y, 1.4, 1.4);
    }
    const map = toTexture(canvas);
    return { map, bumpMap: undefined };
  }, [baseColor]);
}

/** Mermelada/frutos rojos: base con semillas y trocitos de fruta. */
export function useJamTexture(baseColor: string) {
  return useMemo(() => {
    const size = 512;
    const { canvas, ctx } = makeCanvas(size);
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 220; i++) {
      const a = i * 2.399963;
      const r = size * 0.5 * Math.sqrt((i + 0.5) / 220);
      const x = size / 2 + Math.cos(a) * r;
      const y = size / 2 + Math.sin(a) * r;
      ctx.fillStyle = i % 6 === 0 ? mix(baseColor, -0.3) : mix(baseColor, i % 2 === 0 ? 0.18 : -0.12);
      ctx.beginPath();
      ctx.arc(x, y, i % 6 === 0 ? 3.2 : 6 + (i % 4), 0, Math.PI * 2);
      ctx.fill();
    }
    const map = toTexture(canvas);

    const { canvas: bcanvas, ctx: bctx } = makeCanvas(size);
    bctx.fillStyle = "#909090";
    bctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 220; i++) {
      const a = i * 2.399963;
      const r = size * 0.5 * Math.sqrt((i + 0.5) / 220);
      const x = size / 2 + Math.cos(a) * r;
      const y = size / 2 + Math.sin(a) * r;
      bctx.fillStyle = i % 6 === 0 ? "#4a4a4a" : "#a8a8a8";
      bctx.beginPath();
      bctx.arc(x, y, i % 6 === 0 ? 3.2 : 6 + (i % 4), 0, Math.PI * 2);
      bctx.fill();
    }
    const bumpMap = toTexture(bcanvas);

    return { map, bumpMap };
  }, [baseColor]);
}

/** Miga de bizcochuelo: ruido sutil para que no se vea liso/plástico. */
export function useCrumbTexture(baseColor: string) {
  return useMemo(() => {
    const size = 256;
    const { canvas, ctx } = makeCanvas(size);
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 1400; i++) {
      const x = (i * 61) % size;
      const y = (i * 89) % size;
      const light = i % 2 === 0;
      ctx.fillStyle = light ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
      ctx.fillRect(x, y, 1.6, 1.6);
    }
    const map = toTexture(canvas, 2);
    return { map };
  }, [baseColor]);
}
