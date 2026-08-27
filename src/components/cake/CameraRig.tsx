"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

const DIRECTION = new Vector3(2.6, 2.1, 3.6).normalize();
const BASE_DISTANCE = 4.3;
const HEIGHT_FACTOR = 1.25;

/**
 * Margen fijo de altura para toppings que sobresalen por encima del stack
 * (picos de merengue, el marcador flotante de "personalizado", el merengue
 * tostado del Rogel, etc.). Sin esto, un stack corto (ej. 1 bizcochuelo sin
 * relleno) con una decoración alta encima queda cortado arriba porque el
 * encuadre solo consideraba stackHeight.
 */
const DECORATION_HEADROOM = 0.65;

/**
 * Aleja/acerca la cámara automáticamente según la altura actual de la torta
 * (crece con cada relleno agregado) para que nunca quede cortada, ni en
 * mobile ni en desktop. Reemplaza a OrbitControls: no hay interacción del
 * usuario, solo un encuadre que se auto-ajusta.
 */
export function CameraRig({ stackHeight }: { stackHeight: number }) {
  const { camera } = useThree();
  const target = useRef(new Vector3());

  useFrame((_, delta) => {
    const effectiveHeight = stackHeight + DECORATION_HEADROOM;
    const distance = BASE_DISTANCE + effectiveHeight * HEIGHT_FACTOR;
    target.current.copy(DIRECTION).multiplyScalar(distance);
    camera.position.lerp(target.current, Math.min(1, delta * 3));
    camera.lookAt(0, DECORATION_HEADROOM * 0.35, 0);
  });

  return null;
}
