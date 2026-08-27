"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { CakeGroup } from "./CakeGroup";
import type { SpongeOption, FillingOption, DecorationOption } from "@/lib/types";

interface CakeCanvasProps {
  sponge?: SpongeOption | null;
  fillings: FillingOption[];
  decoration?: DecorationOption | null;
  spinToken: number;
}

export function CakeCanvas({ sponge, fillings, decoration, spinToken }: CakeCanvasProps) {
  return (
    <div className="h-72 w-full sm:h-80 md:h-[420px]">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[2.6, 2.1, 3.6]} fov={32} />
        <OrbitControls
          target={[0, -0.45, 0]}
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
        />
        <hemisphereLight args={["#fff7e6", "#3a2a1e", 0.65]} />
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[4, 6, 4]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 2, -3]} intensity={0.4} />
        <pointLight position={[0, 2.5, 1.5]} intensity={0.3} />

        <group position={[0, -0.9, 0]}>
          <CakeGroup sponge={sponge} fillings={fillings} decoration={decoration} spinToken={spinToken} />
        </group>
        <ContactShadows position={[0, -0.94, 0]} opacity={0.45} scale={6} blur={2.2} far={2} />
      </Canvas>
    </div>
  );
}
