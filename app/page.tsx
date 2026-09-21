"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function Page() {
  return (
    <main className="bg-gray-200">
      <h1 className="px-2 py-2 font-bold text-black">Propuesta de Nueva Línea de Metro</h1>
      <Map />
    </main>
  );
}