"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

// "Cincin waktu": armillary dari cincin konsentris yang berputar di sumbu
// berbeda, dengan inti, skala jam, dan butiran penanda yang mengorbit.
// Merujuk ke sengkalan (penanda waktu) dan siklus masa berlaku sertifikat.
// Flat tanpa gradien, tanpa aset eksternal. Warna dari BRAND.md.

const PETROL_50 = "#eef6f6";
const PETROL_200 = "#b3d6d8";
const PETROL_400 = "#4f9a9f";
const PETROL_500 = "#2a7c82";
const PETROL_600 = "#0d5c63";
const PETROL_800 = "#083a3f";
const PETROL_900 = "#052a2e";
const SOGAN_600 = "#8a5a2b";

interface RingSpec {
  radius: number;
  tube: number;
  color: string;
  bead: { color: string; size: number; speed: number; phase: number };
  tilt: [number, number, number];
  speed: [number, number, number];
}

const RINGS: RingSpec[] = [
  {
    radius: 2.0, tube: 0.04, color: PETROL_600,
    bead: { color: SOGAN_600, size: 0.14, speed: 0.5, phase: 0 },
    tilt: [1.0, 0, 0], speed: [0, 0, 0.1],
  },
  {
    radius: 1.65, tube: 0.034, color: PETROL_500,
    bead: { color: PETROL_900, size: 0.1, speed: -0.7, phase: 2 },
    tilt: [0.5, 0.9, 0], speed: [0.05, 0.16, 0],
  },
  {
    radius: 1.3, tube: 0.03, color: PETROL_400,
    bead: { color: PETROL_800, size: 0.09, speed: 0.9, phase: 4 },
    tilt: [1.4, 0.3, 0.4], speed: [0.1, 0, 0.12],
  },
  {
    radius: 0.95, tube: 0.026, color: PETROL_800,
    bead: { color: SOGAN_600, size: 0.08, speed: -1.1, phase: 1 },
    tilt: [0.8, -0.5, 0.6], speed: [0, 0.2, 0.06],
  },
];

function Ring({ spec, animate, withDisc }: { spec: RingSpec; animate: boolean; withDisc?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const bead = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!animate) return;
    if (group.current) {
      group.current.rotation.x += spec.speed[0] * delta;
      group.current.rotation.y += spec.speed[1] * delta;
      group.current.rotation.z += spec.speed[2] * delta;
    }
    if (bead.current) bead.current.rotation.z += spec.bead.speed * delta;
  });

  return (
    <group ref={group} rotation={spec.tilt}>
      {withDisc && (
        <mesh>
          <circleGeometry args={[spec.radius, 96]} />
          <meshBasicMaterial color={PETROL_200} transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
      <mesh>
        <torusGeometry args={[spec.radius, spec.tube, 16, 192]} />
        <meshBasicMaterial color={spec.color} />
      </mesh>
      <group ref={bead} rotation={[0, 0, spec.bead.phase]}>
        <mesh position={[spec.radius, 0, 0]}>
          <sphereGeometry args={[spec.bead.size, 28, 28]} />
          <meshBasicMaterial color={spec.bead.color} />
        </mesh>
      </group>
    </group>
  );
}

// 60 garis penanda di cincin terluar, seperti skala jam (kelipatan 5 lebih panjang).
function Ticks({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const spec = RINGS[0];
  const count = 60;

  const setup = useMemo(
    () => (mesh: THREE.InstancedMesh | null) => {
      if (!mesh) return;
      const m = new THREE.Matrix4();
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const long = i % 5 === 0;
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, a));
        const r = spec.radius + (long ? 0.2 : 0.17);
        const pos = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0);
        m.compose(pos, q, new THREE.Vector3(1, long ? 2 : 1, 1));
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    [spec.radius]
  );

  useFrame((_, delta) => {
    if (animate && group.current) group.current.rotation.z += spec.speed[2] * delta;
  });

  return (
    <group ref={group} rotation={spec.tilt}>
      <instancedMesh ref={setup} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.022, 0.1, 0.022]} />
        <meshBasicMaterial color={PETROL_600} />
      </instancedMesh>
    </group>
  );
}

// Inti: ikosahedron petrol dengan garis tepi terang.
function Core({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.46, 0)), []);
  useFrame((_, delta) => {
    if (!animate || !ref.current) return;
    ref.current.rotation.y += 0.35 * delta;
    ref.current.rotation.x += 0.2 * delta;
  });
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[0.46, 0]} />
        <meshBasicMaterial color={PETROL_600} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={PETROL_50} />
      </lineSegments>
      <mesh>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshBasicMaterial color={PETROL_200} />
      </mesh>
    </group>
  );
}

function Scene({ animate }: { animate: boolean }) {
  const root = useRef<THREE.Group>(null);
  const spin = useRef(0);

  useFrame((state, delta) => {
    if (!root.current) return;
    if (animate) spin.current += 0.12 * delta;
    // Miring halus mengikuti kursor, dengan peredaman.
    const tx = 0.2 + state.pointer.y * -0.4;
    const ty = spin.current + state.pointer.x * 0.5;
    root.current.rotation.x += (tx - root.current.rotation.x) * Math.min(1, delta * 3);
    root.current.rotation.y += (ty - root.current.rotation.y) * Math.min(1, delta * 3);
  });

  return (
    <group ref={root}>
      <Ring spec={RINGS[0]} animate={animate} withDisc />
      {RINGS.slice(1).map((r, i) => (
        <Ring key={i} spec={r} animate={animate} />
      ))}
      <Ticks animate={animate} />
      <Core animate={animate} />
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
        camera={{ position: [0, 0, 6.4], fov: 40 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene animate={!reduced} />
      </Canvas>
    </div>
  );
}
