"use client";

// Classic six-panel white door with painted casing, slightly cracked open
// to reveal a dark interior void. Self-contained — to remove, delete the
// <DoorWithFrame /> line and import in Scene.tsx along with this file.

const DOOR_W = 1.8;
const DOOR_H = 4.6;
const DOOR_T = 0.07;
const PANEL_DEPTH = 0.016;
const FRAME_TRIM_W = 0.16;
const FRAME_DEPTH = 0.09;
// Positive because the hinge is on the door's right edge and the door swings
// out toward +Z (into the room). With Y rotation around the right-edge hinge,
// the left edge needs +Y to move toward +Z.
const DOOR_OPEN_ANGLE = 0.22;

const PAINT_COLOR = "#f4eee0";
const PANEL_COLOR = "#ebe5d4";
const DARK_INTERIOR = "#070504";
const KNOB_COLOR = "#a8862a"; // brass

// Six-panel layout — two columns, three rows of varying heights
const STILE = 0.15;
const PANEL_W = (DOOR_W - 2 * STILE - 0.15) / 2;
const PANEL_LX = -DOOR_W / 2 + STILE + PANEL_W / 2;
const PANEL_RX = DOOR_W / 2 - STILE - PANEL_W / 2;

const TOP_PANEL_H = 0.66;
const MID_PANEL_H = 0.82;
const BOT_PANEL_H = 1.15;
const PANEL_GAP = 0.5;
const TOP_PANEL_Y = DOOR_H / 2 - PANEL_GAP - TOP_PANEL_H / 2;
const MID_PANEL_Y = TOP_PANEL_Y - TOP_PANEL_H / 2 - PANEL_GAP - MID_PANEL_H / 2;
const BOT_PANEL_Y = MID_PANEL_Y - MID_PANEL_H / 2 - PANEL_GAP - BOT_PANEL_H / 2;
const PANEL_Z = DOOR_T / 2 + PANEL_DEPTH / 2;

type DoorWithFrameProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
};

function Panel({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  return (
    <mesh position={[x, y, PANEL_Z]}>
      <boxGeometry args={[w, h, PANEL_DEPTH]} />
      <meshStandardMaterial color={PANEL_COLOR} roughness={0.65} metalness={0} />
    </mesh>
  );
}

export default function DoorWithFrame({
  position,
  rotation = [0, 0, 0],
}: DoorWithFrameProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* The dark void seen through the door crack — a flat plane sitting
          just in front of the wall plane behind the doorway. */}
      <mesh position={[0, DOOR_H / 2, 0.005]}>
        <planeGeometry args={[DOOR_W, DOOR_H]} />
        <meshBasicMaterial color={DARK_INTERIOR} />
      </mesh>

      {/* Top header casing — runs the full width of the frame including
          the side jamb extensions for a clean cap */}
      <mesh
        position={[0, DOOR_H + FRAME_TRIM_W / 2, FRAME_DEPTH / 2]}
        castShadow
      >
        <boxGeometry
          args={[DOOR_W + 2 * FRAME_TRIM_W, FRAME_TRIM_W, FRAME_DEPTH]}
        />
        <meshStandardMaterial
          color={PAINT_COLOR}
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>

      {/* Left jamb */}
      <mesh
        position={[
          -DOOR_W / 2 - FRAME_TRIM_W / 2,
          DOOR_H / 2,
          FRAME_DEPTH / 2,
        ]}
        castShadow
      >
        <boxGeometry args={[FRAME_TRIM_W, DOOR_H, FRAME_DEPTH]} />
        <meshStandardMaterial
          color={PAINT_COLOR}
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>

      {/* Right jamb */}
      <mesh
        position={[DOOR_W / 2 + FRAME_TRIM_W / 2, DOOR_H / 2, FRAME_DEPTH / 2]}
        castShadow
      >
        <boxGeometry args={[FRAME_TRIM_W, DOOR_H, FRAME_DEPTH]} />
        <meshStandardMaterial
          color={PAINT_COLOR}
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>

      {/* The door slab itself — hinged at its right edge so a small +Z crack
          opens into the room on the left side. Two nested groups: outer for
          the hinge axis, inner for the slab's center-of-mass placement. */}
      <group
        position={[DOOR_W / 2, 0, 0.025]}
        rotation={[0, DOOR_OPEN_ANGLE, 0]}
      >
        <group position={[-DOOR_W / 2, DOOR_H / 2, DOOR_T / 2]}>
          {/* Slab */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[DOOR_W, DOOR_H, DOOR_T]} />
            <meshStandardMaterial
              color={PAINT_COLOR}
              roughness={0.55}
              metalness={0.05}
            />
          </mesh>

          {/* Six raised panels in a 2×3 grid */}
          <Panel x={PANEL_LX} y={TOP_PANEL_Y} w={PANEL_W} h={TOP_PANEL_H} />
          <Panel x={PANEL_RX} y={TOP_PANEL_Y} w={PANEL_W} h={TOP_PANEL_H} />
          <Panel x={PANEL_LX} y={MID_PANEL_Y} w={PANEL_W} h={MID_PANEL_H} />
          <Panel x={PANEL_RX} y={MID_PANEL_Y} w={PANEL_W} h={MID_PANEL_H} />
          <Panel x={PANEL_LX} y={BOT_PANEL_Y} w={PANEL_W} h={BOT_PANEL_H} />
          <Panel x={PANEL_RX} y={BOT_PANEL_Y} w={PANEL_W} h={BOT_PANEL_H} />

          {/* Brass doorknob on the left side, opposite the hinge */}
          <mesh
            position={[-DOOR_W / 2 + 0.17, 0, DOOR_T / 2 + 0.03]}
            castShadow
          >
            <sphereGeometry args={[0.048, 18, 14]} />
            <meshStandardMaterial
              color={KNOB_COLOR}
              roughness={0.25}
              metalness={0.85}
            />
          </mesh>

          {/* Knob backplate — flat disc against the door */}
          <mesh
            position={[-DOOR_W / 2 + 0.17, 0, DOOR_T / 2 + 0.006]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.063, 0.063, 0.006, 18]} />
            <meshStandardMaterial
              color={KNOB_COLOR}
              roughness={0.3}
              metalness={0.85}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
