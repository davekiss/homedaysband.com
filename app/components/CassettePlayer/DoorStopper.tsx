"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Classic spring-style baseboard doorstop. Built in a local frame where
// +Z points out from the wall (the spring's axis), +Y is up, and the
// pivot for the boing animation sits at local z=0 right at the wall.
//
// Click the spring to flick it: it oscillates as a damped harmonic
// oscillator and settles back to rest. Clicking while it's still
// wobbling adds more energy on top.

const SPRING_LENGTH = 0.24;
const SPRING_RADIUS = 0.024; // helix radius
const TUBE_RADIUS = 0.0038;  // wire thickness
const TURNS = 8;

type DoorStopperProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
};

export default function DoorStopper({
  position,
  rotation = [0, 0, 0],
}: DoorStopperProps) {
  const [hovered, setHovered] = useState(false);
  const springRef = useRef<THREE.Group>(null);
  // Damped-spring state — angle in radians, angular velocity in rad/s
  const angleRef = useRef(0);
  const velRef = useRef(0);
  const restRef = useRef(true);
  const { gl } = useThree();

  // Build the spring as a tube swept along a helical curve
  const springCurve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * TURNS * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          SPRING_RADIUS * Math.cos(angle),
          SPRING_RADIUS * Math.sin(angle),
          t * SPRING_LENGTH
        )
      );
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  useEffect(() => {
    if (!hovered) return;
    gl.domElement.style.cursor = "pointer";
    return () => {
      gl.domElement.style.cursor = "auto";
    };
  }, [hovered, gl]);

  // Damped harmonic oscillator: ddθ = -k*θ - c*dθ
  // k tunes pitch (how fast it boings), c tunes how quickly it settles.
  useFrame((_, delta) => {
    if (restRef.current) return;
    const k = 1100; // stiffness — higher = faster wobble
    const c = 5.0;  // damping  — lower  = longer ringout
    // Sub-step the integration so the explicit Euler stays stable at the
    // higher stiffness even on slow frames.
    const totalDt = Math.min(delta, 0.05);
    const steps = 4;
    const dt = totalDt / steps;
    for (let s = 0; s < steps; s++) {
      const a = -k * angleRef.current - c * velRef.current;
      velRef.current += a * dt;
      angleRef.current += velRef.current * dt;
    }
    if (springRef.current) {
      springRef.current.rotation.y = angleRef.current;
    }
    if (
      Math.abs(angleRef.current) < 0.0008 &&
      Math.abs(velRef.current) < 0.01
    ) {
      angleRef.current = 0;
      velRef.current = 0;
      restRef.current = true;
      if (springRef.current) springRef.current.rotation.y = 0;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    // Add an angular-velocity impulse on each click. Adding rather than
    // replacing means a quick double-click stacks energy and boings harder.
    velRef.current += 14;
    restRef.current = false;
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Round chrome mounting plate pressed flat against the baseboard */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0.005]}
        castShadow
      >
        <cylinderGeometry args={[0.04, 0.04, 0.01, 22]} />
        <meshStandardMaterial
          color="#cfd0d2"
          roughness={0.3}
          metalness={0.85}
        />
      </mesh>

      {/* Tiny mounting screw head at the center of the disc */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0.011]}
      >
        <cylinderGeometry args={[0.006, 0.006, 0.002, 10]} />
        <meshStandardMaterial color="#7a7c80" roughness={0.45} metalness={0.9} />
      </mesh>

      {/* Spring + rubber tip — wrapped in a group whose pivot sits at the
          wall (z=0 in this local frame) so rotating it bends the whole
          spring at its base. */}
      <group
        ref={springRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh castShadow>
          <tubeGeometry args={[springCurve, 96, TUBE_RADIUS, 6, false]} />
          <meshStandardMaterial
            color="#bcbdbf"
            roughness={0.35}
            metalness={0.85}
          />
        </mesh>

        {/* Black rubber tip cap on the end of the spring. The helix's
            endpoint sits at (R, 0, length) since TURNS is an integer. */}
        <mesh
          position={[SPRING_RADIUS, 0, SPRING_LENGTH + 0.006]}
          castShadow
        >
          <sphereGeometry args={[0.022, 18, 14]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.75}
            metalness={0.05}
          />
        </mesh>
      </group>
    </group>
  );
}
