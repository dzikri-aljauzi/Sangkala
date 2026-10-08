"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

// "Cincin waktu": orrery interaktif tentang siklus hidup sertifikat.
// Tiap cincin satu tahap (terbit, dua refreshment, perpanjang), inti adalah
// verifikasi. Merujuk ke sengkalan, penanda waktu dalam tradisi Jawa.
// Seret untuk memutar, arahkan kursor untuk membekukan cincin dan melihat
// tooltip, klik (atau pakai tombol tahap) untuk membuka penjelasan.
// Flat tanpa gradien, tanpa aset eksternal. Warna dari BRAND.md.

const PETROL_50 = "#eef6f6";
const PETROL_200 = "#b3d6d8";
const PETROL_300 = "#85babd";
const PETROL_400 = "#4f9a9f";
const PETROL_500 = "#2a7c82";
const PETROL_600 = "#0d5c63";
const PETROL_800 = "#083a3f";
const PETROL_900 = "#052a2e";
const SOGAN_600 = "#8a5a2b";

type Bilingual = { id: string; en: string };

interface Item {
  n: string;
  title: Bilingual;
  desc: Bilingual;
}

// Empat tahap di cincin, kelima (verifikasi) ada di inti.
const ITEMS: Item[] = [
  {
    n: "01",
    title: { id: "Terbit", en: "Issued" },
    desc: {
      id: "Sertifikat diterbitkan lengkap dengan QR code untuk verifikasi publik.",
      en: "The certificate is issued with a QR code for public verification.",
    },
  },
  {
    n: "02",
    title: { id: "Refreshment I", en: "Refresh I" },
    desc: {
      id: "Pengingat otomatis dikirim di titik penyegaran pertama.",
      en: "An automatic reminder goes out at the first refreshment checkpoint.",
    },
  },
  {
    n: "03",
    title: { id: "Refreshment II", en: "Refresh II" },
    desc: {
      id: "Pengingat kedua menjaga sertifikat tetap berlaku sebelum habis masa.",
      en: "A second reminder keeps the certificate current before it expires.",
    },
  },
  {
    n: "04",
    title: { id: "Perpanjang", en: "Renew" },
    desc: {
      id: "Masa berlaku diperbarui dan siklus dimulai lagi dari awal.",
      en: "Validity is renewed and the cycle begins again.",
    },
  },
  {
    n: "05",
    title: { id: "Verifikasi", en: "Verify" },
    desc: {
      id: "Siapa pun bisa memeriksa keabsahan sertifikat lewat tautan verifikasi.",
      en: "Anyone can check a certificate's validity through its verification link.",
    },
  },
];

const CORE_INDEX = 4;

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
    bead: { color: SOGAN_600, size: 0.15, speed: 0.5, phase: 0 },
    tilt: [1.0, 0, 0], speed: [0, 0, 0.1],
  },
  {
    radius: 1.65, tube: 0.034, color: PETROL_500,
    bead: { color: PETROL_900, size: 0.11, speed: -0.7, phase: 2 },
    tilt: [0.5, 0.9, 0], speed: [0.05, 0.16, 0],
  },
  {
    radius: 1.3, tube: 0.03, color: PETROL_400,
    bead: { color: PETROL_800, size: 0.1, speed: 0.9, phase: 4 },
    tilt: [1.4, 0.3, 0.4], speed: [0.1, 0, 0.12],
  },
  {
    radius: 0.95, tube: 0.026, color: PETROL_800,
    bead: { color: SOGAN_600, size: 0.09, speed: -1.1, phase: 1 },
    tilt: [0.8, -0.5, 0.6], speed: [0, 0.2, 0.06],
  },
];

type ActiveRef = { current: number | null };

function Tip({ item, language, offset }: { item: Item; language: "id" | "en"; offset?: number }) {
  return (
    <Html zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
      <div
        className="whitespace-nowrap rounded-md bg-petrol-900 px-2.5 py-1.5 text-xs text-paper"
        style={{ transform: `translate(-50%, calc(-100% - ${offset ?? 16}px))` }}
      >
        <span className="mr-1.5 font-mono text-sogan-200">{item.n}</span>
        {item.title[language]}
      </div>
    </Html>
  );
}

interface RingProps {
  index: number;
  spec: RingSpec;
  animate: boolean;
  activeRef: ActiveRef;
  hovered: boolean;
  language: "id" | "en";
  withDisc?: boolean;
  onHover: (i: number | null) => void;
  onSelect: (i: number) => void;
}

function Ring({ index, spec, animate, activeRef, hovered, language, withDisc, onHover, onSelect }: RingProps) {
  const group = useRef<THREE.Group>(null);
  const beadOrbit = useRef<THREE.Group>(null);
  const beadMesh = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);
  const emph = useRef(0);
  const dim = useRef(0);

  useFrame((state, delta) => {
    const act = activeRef.current;
    const isActive = act === index;
    const others = act !== null && !isActive;
    // Cincin yang disorot membeku supaya mudah dibidik; lainnya melambat.
    const speedF = !animate ? 0 : act === null ? 1 : isActive ? 0 : 0.25;

    if (group.current) {
      group.current.rotation.x += spec.speed[0] * delta * speedF;
      group.current.rotation.y += spec.speed[1] * delta * speedF;
      group.current.rotation.z += spec.speed[2] * delta * speedF;
    }
    if (beadOrbit.current) beadOrbit.current.rotation.z += spec.bead.speed * delta * speedF;

    const k = Math.min(1, delta * 8);
    emph.current += ((isActive ? 1 : 0) - emph.current) * k;
    dim.current += ((others ? 1 : 0) - dim.current) * k;

    if (ringMat.current) ringMat.current.opacity = 1 - 0.65 * dim.current;
    if (haloMat.current) haloMat.current.opacity = 0.45 * emph.current;
    if (beadMesh.current) {
      const pulse = index === 0 && animate ? 0.1 * Math.sin(state.clock.elapsedTime * 2.2) : 0;
      beadMesh.current.scale.setScalar(1 + 0.7 * emph.current + pulse);
    }
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(index);
  };
  const out = () => onHover(null);
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(index);
  };

  return (
    <group ref={group} rotation={spec.tilt}>
      {withDisc && (
        <mesh>
          <circleGeometry args={[spec.radius, 96]} />
          <meshBasicMaterial color={PETROL_200} transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Halo saat cincin disorot */}
      <mesh>
        <torusGeometry args={[spec.radius, spec.tube * 2.8, 12, 192]} />
        <meshBasicMaterial ref={haloMat} color={PETROL_200} transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh>
        <torusGeometry args={[spec.radius, spec.tube, 16, 192]} />
        <meshBasicMaterial ref={ringMat} color={spec.color} transparent />
      </mesh>

      {/* Area sentuh yang lebih lebar dari garis cincin */}
      <mesh onPointerOver={over} onPointerOut={out} onClick={click}>
        <torusGeometry args={[spec.radius, 0.12, 8, 96]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={beadOrbit} rotation={[0, 0, spec.bead.phase]}>
        <group position={[spec.radius, 0, 0]}>
          <mesh ref={beadMesh}>
            <sphereGeometry args={[spec.bead.size, 28, 28]} />
            <meshBasicMaterial color={spec.bead.color} />
          </mesh>
          <mesh onPointerOver={over} onPointerOut={out} onClick={click}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          {hovered && <Tip item={ITEMS[index]} language={language} />}
        </group>
      </group>
    </group>
  );
}

// 60 garis penanda di cincin terluar, seperti skala jam (kelipatan 5 lebih panjang).
function Ticks({ animate, activeRef }: { animate: boolean; activeRef: ActiveRef }) {
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
    const act = activeRef.current;
    const f = !animate ? 0 : act === null ? 1 : act === 0 ? 0 : 0.25;
    if (group.current) group.current.rotation.z += spec.speed[2] * delta * f;
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

// Orbit putus-putus sogan dengan empat ornamen belah ketupat di mata angin.
// Detail kecil yang menjadi satu-satunya rujukan budaya di visual ini.
function Ornament({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const radius = 2.55;

  const loop = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({
      color: SOGAN_600,
      dashSize: 0.12,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.55,
    });
    const obj = new THREE.LineLoop(geo, mat);
    obj.computeLineDistances();
    return obj;
  }, []);

  useFrame((_, delta) => {
    if (animate && group.current) group.current.rotation.z -= 0.05 * delta;
  });

  return (
    <group ref={group} rotation={[1.25, 0.15, 0]}>
      <primitive object={loop} />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * radius, Math.sin(a) * radius, 0]} scale={[0.6, 1, 0.6]}>
            <octahedronGeometry args={[0.1, 0]} />
            <meshBasicMaterial color={SOGAN_600} />
          </mesh>
        );
      })}
    </group>
  );
}

// Debu waktu: titik kecil yang melayang pelan di kulit bola luar.
function Dust({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const count = 90;

  const setup = useMemo(
    () => (mesh: THREE.InstancedMesh | null) => {
      if (!mesh) return;
      const m = new THREE.Matrix4();
      // Acak deterministik agar tata letak stabil antar render.
      const rnd = (i: number, s: number) => {
        const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
        return x - Math.floor(x);
      };
      for (let i = 0; i < count; i++) {
        const theta = rnd(i, 1) * Math.PI * 2;
        const phi = Math.acos(2 * rnd(i, 2) - 1);
        const r = 2.7 + rnd(i, 3) * 0.7;
        const s = 0.6 + rnd(i, 4) * 1.1;
        m.compose(
          new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
          ),
          new THREE.Quaternion(),
          new THREE.Vector3(s, s, s)
        );
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    []
  );

  useFrame((_, delta) => {
    if (animate && group.current) {
      group.current.rotation.y += 0.03 * delta;
      group.current.rotation.x += 0.012 * delta;
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={setup} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshBasicMaterial color={PETROL_300} />
      </instancedMesh>
    </group>
  );
}

interface CoreProps {
  animate: boolean;
  activeRef: ActiveRef;
  hovered: boolean;
  language: "id" | "en";
  onHover: (i: number | null) => void;
  onSelect: (i: number) => void;
}

// Inti: ikosahedron petrol dengan garis tepi terang, mewakili verifikasi.
function Core({ animate, activeRef, hovered, language, onHover, onSelect }: CoreProps) {
  const spin = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const emph = useRef(0);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.46, 0)), []);

  useFrame((state, delta) => {
    const isActive = activeRef.current === CORE_INDEX;
    emph.current += ((isActive ? 1 : 0) - emph.current) * Math.min(1, delta * 8);
    if (spin.current && animate) {
      const f = isActive ? 2.5 : 1;
      spin.current.rotation.y += 0.35 * delta * f;
      spin.current.rotation.x += 0.2 * delta * f;
    }
    if (body.current) {
      const breathe = animate ? 0.03 * Math.sin(state.clock.elapsedTime * 1.5) : 0;
      body.current.scale.setScalar(1 + 0.25 * emph.current + breathe);
    }
  });

  return (
    <group ref={body}>
      <group ref={spin}>
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
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(CORE_INDEX);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(CORE_INDEX);
        }}
      >
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {hovered && <Tip item={ITEMS[CORE_INDEX]} language={language} offset={34} />}
    </group>
  );
}

interface SceneProps {
  animate: boolean;
  active: number | null;
  hovered: number | null;
  autoRotate: boolean;
  language: "id" | "en";
  onHover: (i: number | null) => void;
  onSelect: (i: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function Scene({ animate, active, hovered, autoRotate, language, onHover, onSelect, onDragStart, onDragEnd }: SceneProps) {
  const activeRef = useRef<number | null>(active);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useCursor(hovered !== null, "pointer", "grab");

  // Izinkan scroll vertikal halaman saat jari di atas kanvas (seret horizontal tetap memutar).
  useEffect(() => {
    const el = gl.domElement;
    const id = requestAnimationFrame(() => {
      el.style.touchAction = "pan-y";
    });
    return () => cancelAnimationFrame(id);
  }, [gl]);

  return (
    <>
      <Dust animate={animate} />
      <Ornament animate={animate} />
      {RINGS.map((spec, i) => (
        <Ring
          key={i}
          index={i}
          spec={spec}
          animate={animate}
          activeRef={activeRef}
          hovered={hovered === i}
          language={language}
          withDisc={i === 0}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
      <Ticks animate={animate} activeRef={activeRef} />
      <Core
        animate={animate}
        activeRef={activeRef}
        hovered={hovered === CORE_INDEX}
        language={language}
        onHover={onHover}
        onSelect={onSelect}
      />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.8}
        autoRotate={autoRotate}
        autoRotateSpeed={1.2}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.75}
        onStart={onDragStart}
        onEnd={onDragEnd}
      />
    </>
  );
}

export default function TimeRings({ className }: { className?: string }) {
  const { language } = useLanguage();
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const active = hovered ?? selected;
  const autoRotate = !reduced && !dragging && active === null;
  const lang = language === "en" ? "en" : "id";
  const detail = selected !== null ? ITEMS[selected] : null;

  const handleSelect = (i: number) => {
    setInteracted(true);
    setSelected((prev) => (prev === i ? null : i));
  };

  const handleDragStart = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setDragging(true);
    setInteracted(true);
  };

  const handleDragEnd = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setDragging(false), 1500);
  };

  return (
    <div className={cn("relative flex flex-col", className)}>
      <div className="relative min-h-0 flex-1">
        <div aria-hidden="true" className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 6.6], fov: 40 }}
            dpr={[1, 2]}
            gl={{ alpha: true, antialias: true }}
            onPointerMissed={() => setSelected(null)}
          >
            <Scene
              animate={!reduced}
              active={active}
              hovered={hovered}
              autoRotate={autoRotate}
              language={lang}
              onHover={setHovered}
              onSelect={handleSelect}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </Canvas>
        </div>

        <p
          className={cn(
            "pointer-events-none absolute right-0 top-0 font-mono text-[11px] text-stone-600 transition-opacity duration-500",
            interacted ? "opacity-0" : "opacity-100"
          )}
        >
          {lang === "id" ? "Seret untuk memutar" : "Drag to rotate"}
        </p>

        <div aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
          {detail && (
            <div className="w-[min(100%,20rem)] rounded-md border border-stone-200 bg-white/95 p-3 text-left">
              <p className="text-sm font-semibold text-ink">
                <span className="mr-2 font-mono text-sogan-600">{detail.n}</span>
                {detail.title[lang]}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-stone-700 sm:text-sm">{detail.desc[lang]}</p>
            </div>
          )}
        </div>
      </div>

      <div
        role="group"
        aria-label={lang === "id" ? "Tahap siklus sertifikat" : "Certificate lifecycle stages"}
        className="flex flex-wrap justify-center gap-1.5 pt-3"
      >
        {ITEMS.map((item, i) => (
          <button
            key={item.n}
            type="button"
            aria-pressed={selected === i}
            onClick={() => handleSelect(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            className={cn(
              "rounded-md border px-2 py-1 text-[11px] leading-none transition-colors sm:text-xs",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol-600 focus-visible:ring-offset-2",
              selected === i
                ? "border-petrol-600 bg-petrol-50 text-petrol-800"
                : "border-stone-200 bg-white/60 text-stone-700 hover:bg-stone-100"
            )}
          >
            <span className="mr-1 font-mono text-sogan-600">{item.n}</span>
            {item.title[lang]}
          </button>
        ))}
      </div>
    </div>
  );
}
