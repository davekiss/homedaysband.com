"use client";

import dynamic from "next/dynamic";

const CassettePlayer = dynamic(() => import("./index"), { ssr: false });

export default function CassettePlayerWrapper() {
  return <CassettePlayer />;
}
