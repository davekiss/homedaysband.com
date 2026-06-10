"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  createCalendarPageTexture,
  DESK_PAGE_ASPECT,
} from "./calendarPageTexture";

const PAGE_W = 0.42;
const PAGE_D = PAGE_W * DESK_PAGE_ASPECT;
const STACK_H = 0.085;
const BASE_H = 0.02;

type DeskCalendarProps = {
  position: [number, number, number]; // tabletop surface point
  rotation?: [number, number, number];
};

// Page-a-day tear-off calendar block sitting on the desk, open to today.
// The torn pages taped to the back wall are the upcoming show dates that
// were ripped off this block.
export default function DeskCalendar({
  position,
  rotation = [0, 0, 0],
}: DeskCalendarProps) {
  const topTexture = useMemo(() => {
    const now = new Date();
    return createCalendarPageTexture({
      month: now.toLocaleString("en-US", { month: "long" }).toUpperCase(),
      year: String(now.getFullYear()),
      day: String(now.getDate()),
      weekday: now.toLocaleString("en-US", { weekday: "long" }).toUpperCase(),
    });
  }, []);

  return (
    <group position={position} rotation={rotation}>
      {/* Dark plastic base the block sits in */}
      <mesh position={[0, BASE_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[PAGE_W + 0.05, BASE_H, PAGE_D + 0.05]} />
        <meshStandardMaterial color="#2e2a26" roughness={0.55} metalness={0.1} />
      </mesh>

      {/* The remaining stack of pages */}
      <mesh
        position={[0, BASE_H + STACK_H / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[PAGE_W, STACK_H, PAGE_D]} />
        <meshStandardMaterial color="#e8e0cc" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* Today's page on top */}
      <mesh
        position={[0, BASE_H + STACK_H + 0.001, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[PAGE_W, PAGE_D]} />
        <meshStandardMaterial
          map={topTexture}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}
