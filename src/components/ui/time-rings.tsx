"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

// "Cincin waktu": armillary sederhana dari cincin konsentris yang berputar
// pelan di sumbu berbeda. Merujuk ke sengkalan (penanda waktu) dan siklus masa
// berlaku sertifikat. Flat tanpa gradien, tanpa aset eksternal. Warna dari BRAND.md.

const PETROL_600 = "#0d5c63";
const PETROL_500 = "#2a7c82";
const PETROL_400 = "#4f9a9f";
const PETROL_200 = "#b3d6d8";
const SOGAN_600 = "#8a5a2b";

interface RingSpec {
  radius: number;
  tube: number;
  color: string;
  tilt: [number, number, number];
  speed: [number, number, number];
}

const RINGS: RingSpec[] = [
  { radius: 1.9, tube: 0.018, color: PETROL_600, tilt: [1.0, 0, 0], speed: [0, 0, 0.12] },
  { radius: 1.6, tube: 0.014, color: PETROL_500, tilt: [0.5, 0.9, 0], speed: [0.05, 0.18, 0] },
  { radius: 1.3, tube: 0.012, color: PETROL_400, tilt: [1.4, 0.3, 0.4], speed: [0.1, 0, 0.14] },
  { radius: 1.0, tube: 0.01, color: PETROL_600, tilt: [Math.PI / 4, -0.5, 0.6], speed: [0, 0.22, 0.06] },
];

function Ring({ spec, animate }: { spec: RingSpec; animate: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!animate || !ref.current) return;
    ref.current.rotation.x += spec.speed[0] * delta;
    ref.current.rotation.y += spec.speed[1] * delta;
    ref.current.rotation.z += spec.speed[2] * delta;
  });
  return (
    <group ref={ref} rotation={spec.tilt}>
      <mesh>
        <torusGeometry args={[spec.radius, spec.tube, 12, 160]} />
        <meshBasicMaterial color={spec.color} />
      </mesh>
    </group>
  );
}

// 60 garis penanda di cincin terluar, seperti skala jam.
function Ticks({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const count = 60;
  const radius = RINGS[0].radius;

  
  const setup = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const long = i % 5 === 0;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, a));
      const pos = new THREE.Vector3(Math.cos(a) * (radius + 0.14), Math.sin(a) * (radius + 0.14), 0);
      m.compose(pos, q, new THREE.Vector3(1, long ? 1.8 : 1, 1));
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    ref.current = mesh;
  };

  useFrame((_, delta) => {
    if (animate && group.current) group.current.rotation.z += 0.12 * delta;
  });

  return (
    <group ref={group} rotation={RINGS[0].tilt}>
      <instancedMesh ref={setup} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.012, 0.09, 0.012]} />
        <meshBasicMaterial color={PETROL_200} />
      </instancedMesh>
    </group>
  );
}

// Satu titik sogan yang mengorbit di cincin terluar sebagai penanda "kini".
function Marker({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const radius = RINGS[0].radius;
  useFrame((_, delta) => {
    if (animate && ref.current) ref.current.rotation.z += 0.12 * delta;
  });
  return (
    <group rotation={RINGS[0].tilt}>
      <group ref={ref}>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshBasicMaterial color={SOGAN_600} />
        </mesh>
      </group>
    </group>
  );
}

function Scene({ animate }: { animate: boolean }) {
  const root = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (animate && root.current) root.current.rotation.y += 0.08 * delta;
  });
  return (
    <group ref={root} rotation={[0.15, 0, 0]}>
      {RINGS.map((r, i) => (
        <Ring key={i} spec={r} animate={animate} />
      ))}
      <Ticks animate={animate} />
      <Marker animate={animate} />
    </group>
  );
}

export default function TimeRings({ className }: { className?: string }) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className={cn("relative", className)} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 38 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene animate={!reduced} />
      </Canvas>
    </div>
  );
}
