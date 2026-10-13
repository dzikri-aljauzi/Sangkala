import { cn } from "@/lib/utils";

/**
 * Ilustrasi generatif (SVG) pengganti foto stok. Deterministik dari `seed`,
 * jadi tiap halaman/artikel punya gambar sendiri yang selalu sama.
 * Hanya memakai ramp petrol dan sogan dari BRAND.md.
 */

type Variant = "orbits" | "rings" | "grid" | "waves" | "bars" | "arcs";
type Tone = "dark" | "light";

function rng(seed: number) {
  let s = (seed % 2147483647) + 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function hashSeed(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return Math.abs(h);
}

/** Bulatkan koordinat supaya HTML server dan klien identik (hindari hydration mismatch). */
const f = (v: number) => Math.round(v * 100) / 100;

const palette = {
  dark: { bg: "#052a2e", line: "#4f9a9f", soft: "#0a4a50", dot: "#b3d6d8", warm: "#e2cdb0" },
  light: { bg: "#eef6f6", line: "#2a7c82", soft: "#d9ebec", dot: "#0d5c63", warm: "#8a5a2b" },
};

export function Pattern({
  variant = "orbits",
  seed = 1,
  tone = "dark",
  className,
  animate = false,
}: {
  variant?: Variant;
  seed?: number;
  tone?: Tone;
  className?: string;
  /** Putaran pelan (CSS); otomatis berhenti dengan reduced motion. */
  animate?: boolean;
}) {
  const c = palette[tone];
  const r = rng(seed);
  const W = 800;
  const H = 500;
  const els: React.ReactNode[] = [];

  if (variant === "orbits" || variant === "rings") {
    const cx = W * (0.55 + r() * 0.3);
    const cy = H * (0.35 + r() * 0.35);
    const n = variant === "orbits" ? 7 : 9;
    for (let i = 0; i < n; i++) {
      const rad = 40 + i * (variant === "orbits" ? 46 : 34);
      const ry = variant === "orbits" ? rad * (0.35 + r() * 0.3) : rad;
      const rot = variant === "orbits" ? -30 + r() * 60 : 0;
      const warm = i === 3;
      els.push(
        <ellipse key={`e${i}`} cx={f(cx)} cy={f(cy)} rx={f(rad)} ry={f(ry)} transform={`rotate(${f(rot)} ${f(cx)} ${f(cy)})`} fill="none"
          stroke={warm ? c.warm : c.line} strokeOpacity={warm ? 0.7 : 0.45} strokeWidth={1.2} strokeDasharray={i % 3 === 2 ? "3 7" : undefined} />
      );
      const a = r() * Math.PI * 2;
      const px = cx + rad * Math.cos(a) * Math.cos((rot * Math.PI) / 180) - ry * Math.sin(a) * Math.sin((rot * Math.PI) / 180);
      const py = cy + rad * Math.cos(a) * Math.sin((rot * Math.PI) / 180) + ry * Math.sin(a) * Math.cos((rot * Math.PI) / 180);
      els.push(<circle key={`p${i}`} cx={f(px)} cy={f(py)} r={f(3 + r() * 4)} fill={warm ? c.warm : c.dot} />);
    }
    if (variant === "rings") {
      for (let t = 0; t < 90; t++) {
        const a = (t / 90) * Math.PI * 2;
        const R = 40 + 8 * 34 + 14;
        const L = t % 10 === 0 ? 14 : 6;
        els.push(<line key={`t${t}`} x1={f(cx + Math.cos(a) * R)} y1={f(cy + Math.sin(a) * R)} x2={f(cx + Math.cos(a) * (R - L))} y2={f(cy + Math.sin(a) * (R - L))}
          stroke={t % 10 === 0 ? c.warm : c.line} strokeOpacity={0.6} strokeWidth={1} />);
      }
    }
    els.push(<circle key="core" cx={f(cx)} cy={f(cy)} r={f(5)} fill={c.warm} />);
  }

  if (variant === "grid") {
    const step = 28;
    for (let x = step; x < W; x += step)
      for (let y = step; y < H; y += step) {
        const v = r();
        const big = v > 0.965;
        els.push(<circle key={`${x}-${y}`} cx={f(x)} cy={f(y)} r={f(big ? 4 : 1.3)} fill={big ? (v > 0.985 ? c.warm : c.dot) : c.line} fillOpacity={big ? 1 : 0.5} />);
      }
    for (let i = 0; i < 4; i++) {
      const x = Math.round((r() * W) / step) * step;
      els.push(<line key={`v${i}`} x1={f(x)} y1={f(0)} x2={f(x)} y2={f(H)} stroke={c.line} strokeOpacity={0.35} />);
    }
  }

  if (variant === "waves") {
    const lines = 16;
    const amp = 18 + r() * 30;
    const freq = 0.006 + r() * 0.01;
    const ph = r() * 6;
    for (let i = 0; i < lines; i++) {
      let d = "";
      for (let x = 0; x <= W; x += 10) {
        const y = 60 + i * 26 + Math.sin(x * freq + ph + i * 0.35) * amp * (0.4 + i / lines);
        d += `${x === 0 ? "M" : "L"}${x},${y.toFixed(1)} `;
      }
      els.push(<path key={i} d={d} fill="none" stroke={i === 7 ? c.warm : c.line} strokeOpacity={i === 7 ? 0.9 : 0.4} strokeWidth={i === 7 ? 1.6 : 1} />);
    }
  }

  if (variant === "bars") {
    const n = 40;
    const bw = W / n;
    for (let i = 0; i < n; i++) {
      const hgt = 40 + Math.abs(Math.sin(i * 0.35 + r() * 2)) * (H * 0.6) * (0.5 + r() * 0.5);
      const warm = r() > 0.93;
      els.push(<rect key={i} x={f(i * bw + bw * 0.3)} y={f(H - hgt - 30)} width={f(bw * 0.4)} height={f(hgt)} fill={warm ? c.warm : c.line} fillOpacity={warm ? 0.9 : f(0.35 + (i / n) * 0.4)} rx={f(1)} />);
    }
    els.push(<line key="base" x1={f(0)} y1={f(H - 30)} x2={f(W)} y2={f(H - 30)} stroke={c.dot} strokeOpacity={0.5} />);
  }

  if (variant === "arcs") {
    for (let i = 0; i < 9; i++) {
      const cx = r() * W;
      const cy = H + 40;
      const rad = 120 + r() * 380;
      els.push(<circle key={i} cx={f(cx)} cy={f(cy)} r={f(rad)} fill="none" stroke={i === 4 ? c.warm : c.line} strokeOpacity={i === 4 ? 0.8 : 0.35} strokeWidth={1.2} />);
    }
    for (let i = 0; i < 24; i++) els.push(<circle key={`d${i}`} cx={f(r() * W)} cy={f(r() * H * 0.8)} r={f(1.5 + r() * 2.5)} fill={c.dot} fillOpacity={0.7} />);
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden className={cn("block h-full w-full", className)} style={{ background: c.bg }}>
      <g className={animate ? "pattern-drift" : undefined}>{els}</g>
    </svg>
  );
}
