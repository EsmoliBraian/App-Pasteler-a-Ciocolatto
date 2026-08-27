"use client";

import { Html, Line } from "@react-three/drei";

interface CalloutLabelProps {
  /** Punto sobre la superficie de la torta donde nace la línea. */
  anchor: [number, number, number];
  /** Punto donde termina la línea y se ancla la etiqueta. */
  tip: [number, number, number];
  text: string;
}

/** Línea prolija + etiqueta de texto señalando una capa/decoración de la torta,
 * al estilo de un diagrama de producto. */
export function CalloutLabel({ anchor, tip, text }: CalloutLabelProps) {
  return (
    <group>
      <mesh position={anchor}>
        <sphereGeometry args={[0.022, 12, 10]} />
        <meshBasicMaterial color="#C9A24B" />
      </mesh>
      <Line points={[anchor, tip]} color="#C9A24B" lineWidth={1.4} transparent opacity={0.85} />
      <Html position={tip} center zIndexRange={[10, 0]}>
        <div className="whitespace-nowrap rounded-full border border-cioco-gold/40 bg-cioco-white/95 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-cioco-green shadow-sm">
          {text}
        </div>
      </Html>
    </group>
  );
}
