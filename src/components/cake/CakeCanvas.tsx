"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { CakeGroup } from "./CakeGroup";
import { CameraRig } from "./CameraRig";
import { StudioBackdrop } from "./StudioBackdrop";
import { totalCakeHeight } from "./constants";
import type { SpongeOption, FillingOption, DecorationOption } from "@/lib/types";

interface CakeCanvasProps {
  sponge?: SpongeOption | null;
  fillings: FillingOption[];
  decoration?: DecorationOption | null;
  spinToken: number;
}

export function CakeCanvas({ sponge, fillings, decoration, spinToken }: CakeCanvasProps) {
  const stackHeight = totalCakeHeight(fillings.length);
  const floorY = -stackHeight / 2 - 0.08;

  return (
    <div className="h-72 w-full overflow-hidden rounded-3xl sm:h-80 md:h-[440px]">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={["#12241c"]} />
        <PerspectiveCamera makeDefault position={[2.6, 2.1, 3.6]} fov={30} />
        <CameraRig stackHeight={stackHeight} />

        <hemisphereLight args={["#fff7e6", "#12241c", 0.55]} />
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[4, 6, 4]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 2, -3]} intensity={0.4} />
        <pointLight position={[0, 2.5, 1.5]} intensity={0.3} />

        <StudioBackdrop floorY={floorY} />

        <group position={[0, -stackHeight / 2, 0]}>
          <CakeGroup sponge={sponge} fillings={fillings} decoration={decoration} spinToken={spinToken} />
        </group>
        <ContactShadows position={[0, floorY + 0.01, 0]} opacity={0.5} scale={6} blur={2.2} far={2} />
      </Canvas>
    </div>
  );
}
