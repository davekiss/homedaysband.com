"use client";

export default function CrownMolding() {
  const moldingColor = "#f0ece4";
  const moldingY = 1.0; // halfway up the wall
  const thickness = 0.08;
  const height = 0.15;

  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, moldingY, -5.92]}>
        <boxGeometry args={[16, height, thickness]} />
        <meshStandardMaterial color={moldingColor} roughness={0.5} metalness={0.05} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-7.92, moldingY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[16, height, thickness]} />
        <meshStandardMaterial color={moldingColor} roughness={0.5} metalness={0.05} />
      </mesh>

      {/* Right wall */}
      <mesh position={[7.92, moldingY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[16, height, thickness]} />
        <meshStandardMaterial color={moldingColor} roughness={0.5} metalness={0.05} />
      </mesh>

      {/* Thin lip on top of the molding */}
      <mesh position={[0, moldingY + height / 2 + 0.01, -5.90]}>
        <boxGeometry args={[16, 0.02, thickness + 0.03]} />
        <meshStandardMaterial color={moldingColor} roughness={0.4} metalness={0.05} />
      </mesh>
      <mesh position={[-7.90, moldingY + height / 2 + 0.01, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[16, 0.02, thickness + 0.03]} />
        <meshStandardMaterial color={moldingColor} roughness={0.4} metalness={0.05} />
      </mesh>
      <mesh position={[7.90, moldingY + height / 2 + 0.01, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[16, 0.02, thickness + 0.03]} />
        <meshStandardMaterial color={moldingColor} roughness={0.4} metalness={0.05} />
      </mesh>
    </group>
  );
}
