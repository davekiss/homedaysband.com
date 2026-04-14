"use client";

import { useGLTF } from "@react-three/drei";

type IbanezGuitarProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
};

export default function IbanezGuitar({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: IbanezGuitarProps) {
  const { scene } = useGLTF("/models/Ibanez.glb");

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Ibanez.glb");
