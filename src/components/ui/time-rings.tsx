"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

// "Cincin waktu": visual interaktif tentang siklus hidup sertifikat.
// Tiap cincin satu tahap (terbit, dua refreshment, perpanjang), inti adalah
// verifikasi. Merujuk ke sengkalan, penanda waktu dalam tradisi Jawa.
//
// SVG + CSS murni, tanpa WebGL: ringan, jalan di semua perangkat, dan tidak
// bergantung pada GPU. Hover membekukan cincin dan menampilkan tooltip; klik
// (atau tombol tahap, bisa lewat keyboard) membuka penjelasan.
// Flat tanpa gradien. Warna dari BRAND.md.

const PETROL_50 = "#eef6f6";
const PETROL_200 = "#b3d6d8";
const PETROL_300 = "#85babd";
const PETROL_400 = "#4f9a9f";
const PETROL_500 = "#2a7c82";
const PETROL_600 = "#0d5c63";
const PETROL_800 = "#083a3f";
const PETROL_900 = "#052a2e";
const SOGAN_600 = "#8a5a2b";

type Lang = "id" | "en";
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
  rx: number;
  ry: number;
  tilt: number; // derajat
  color: string;
  w: number;
  dur: number; // detik per putaran
  rev: boolean;
  bead: { color: string; r: number; phase: number }; // phase: sudut parametrik di elips
}

const RINGS: RingSpec[] = [
  { rx: 205, ry: 98, tilt: -12, color: PETROL_600, w: 8, dur: 80, rev: false, bead: { color: SOGAN_600, r: 15, phase: 0 } },
  { rx: 165, ry: 72, tilt: 28, color: PETROL_500, w: 6, dur: 60, rev: true, bead: { color: PETROL_900, r: 11, phase: 2.2 } },
  { rx: 128, ry: 54, tilt: -48, color: PETROL_400, w: 5, dur: 48, rev: false, bead: { color: PETROL_800, r: 10, phase: 4.1 } },
  { rx: 92, ry: 40, tilt: 72, color: PETROL_800, w: 4, dur: 40, rev: true, bead: { color: SOGAN_600, r: 9, phase: 1.2 } },
];

// Skala jam di cincin terluar: 60 garis, kelipatan 5 lebih panjang.
function tickPath(rx: number, ry: number, count: number): string {
  let d = "";
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const px = rx * Math.cos(t);
    const py = ry * Math.sin(t);
    let nx = Math.cos(t) / rx;
    let ny = Math.sin(t) / ry;
    const len = Math.hypot(nx, ny);
    nx /= len;
    ny /= len;
    const near = 8;
    const far = i % 5 === 0 ? 21 : 15;
    d += `M${(px + nx * near).toFixed(1)} ${(py + ny * near).toFixed(1)}L${(px + nx * far).toFixed(1)} ${(py + ny * far).toFixed(1)}`;
  }
  return d;
}
const TICKS = tickPath(RINGS[0].rx, RINGS[0].ry, 60);

// Debu waktu: titik kecil di sekitar cincin. Acak deterministik agar stabil.
const DUST = Array.from({ length: 34 }, (_, i) => {
  const rnd = (s: number) => {
    const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const a = rnd(1) * Math.PI * 2;
  const r = 170 + rnd(2) * 85;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, r: 1.2 + rnd(3) * 2.2, d: rnd(4) * 6 };
});

// Ornamen: orbit putus-putus sogan dengan empat belah ketupat. Satu-satunya
// rujukan budaya di visual ini.
const ORN = { rx: 250, ry: 118 };

const spinStyle = (dur: number, paused: boolean): CSSProperties =>
  ({ "--tr-dur": `${dur}s`, animationPlayState: paused ? "paused" : "running" }) as CSSProperties;

export default function TimeRings({ className }: { className?: string }) {
  const { language } = useLanguage();
  const lang: Lang = language === "en" ? "en" : "id";

  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [interacted, setInteracted] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const anchors = useRef<(SVGElement | null)[]>([]);

  const active = hovered ?? selected;
  const detail = selected !== null ? ITEMS[selected] : null;
  const tipItem = ITEMS[hovered ?? 0];

  const handleSelect = (i: number) => {
    setInteracted(true);
    setSelected((prev) => (prev === i ? null : i));
  };

  // Tooltip ditempatkan di titik penanda (butiran) cincin yang disorot. Cincin itu
  // sedang membeku saat hover, jadi posisinya stabil. Langsung lewat style DOM.
  useEffect(() => {
    const tip = tipRef.current;
    const box = boxRef.current;
    if (!tip || !box) return;
    const el = hovered === null ? null : anchors.current[hovered];
    if (!el || hovered === null) {
      tip.style.opacity = "0";
      return;
    }
    const r = el.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    tip.style.transform = `translate(${r.left + r.width / 2 - b.left}px, ${r.top - b.top}px) translate(-50%, calc(-100% - 8px))`;
    tip.style.opacity = "1";
  }, [hovered]);

  const dim = (i: number): CSSProperties => ({
    opacity: active !== null && active !== i ? 0.28 : 1,
    transition: "opacity 200ms",
  });

  return (
    <div className={cn("relative flex flex-col", className)}>
      <div ref={boxRef} className="relative min-h-0 flex-1">
        <svg
          viewBox="-260 -260 520 520"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <g fill="none">
            {/* Debu waktu */}
            <g>
              {DUST.map((p, i) => (
                <circle
                  key={i}
                  className="tr-twinkle"
                  cx={p.x}
                  cy={p.y}
                  r={p.r}
                  fill={PETROL_300}
                  style={{ animationDelay: `-${p.d}s` }}
                />
              ))}
            </g>

            {/* Orbit ornamen sogan */}
            <g className="tr-spin tr-rev" style={spinStyle(140, false)}>
              <g transform="rotate(-8)">
                <ellipse rx={ORN.rx} ry={ORN.ry} stroke={SOGAN_600} strokeWidth="1.6" strokeDasharray="8 7" opacity="0.55" />
                {[0, 1, 2, 3].map((i) => {
                  const t = (i / 4) * Math.PI * 2;
                  return (
                    <rect
                      key={i}
                      x="-6"
                      y="-6"
                      width="12"
                      height="12"
                      fill={SOGAN_600}
                      transform={`translate(${ORN.rx * Math.cos(t)} ${ORN.ry * Math.sin(t)}) rotate(45) scale(0.8 1.25)`}
                    />
                  );
                })}
              </g>
            </g>

            {/* Cincin tahap 01 sampai 04 */}
            {RINGS.map((r, i) => {
              const bx = r.rx * Math.cos(r.bead.phase);
              const by = r.ry * Math.sin(r.bead.phase);
              const isActive = active === i;
              const frozen = hovered === i || selected === i;
              return (
                <g key={i} transform={`rotate(${r.tilt})`} style={dim(i)}>
                  <g className={cn("tr-spin", r.rev && "tr-rev")} style={spinStyle(r.dur, frozen)}>
                    {i === 0 && <ellipse rx={r.rx} ry={r.ry} fill={PETROL_200} fillOpacity="0.28" />}

                    {/* Halo saat disorot */}
                    <ellipse
                      rx={r.rx}
                      ry={r.ry}
                      stroke={PETROL_200}
                      strokeWidth={r.w * 3.2}
                      style={{ opacity: isActive ? 0.55 : 0, transition: "opacity 200ms" }}
                    />
                    <ellipse rx={r.rx} ry={r.ry} stroke={r.color} strokeWidth={r.w} />
                    {i === 0 && <path d={TICKS} stroke={PETROL_600} strokeWidth="2" strokeLinecap="round" />}

                    <g transform={`translate(${bx} ${by})`}>
                      <circle
                        ref={(el) => {
                          anchors.current[i] = el;
                        }}
                        r={r.bead.r}
                        fill={r.bead.color}
                        style={{
                          transformBox: "fill-box",
                          transformOrigin: "center",
                          transform: isActive ? "scale(1.5)" : "scale(1)",
                          transition: "transform 200ms",
                        }}
                      />
                    </g>

                    {/* Area sentuh: garis cincin dan butiran, lebih lebar dari gambarnya */}
                    <ellipse
                      rx={r.rx}
                      ry={r.ry}
                      stroke="transparent"
                      strokeWidth="26"
                      pointerEvents="stroke"
                      className="cursor-pointer"
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => handleSelect(i)}
                    />
                    <circle
                      cx={bx}
                      cy={by}
                      r={r.bead.r + 12}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => handleSelect(i)}
                    />
                  </g>
                </g>
              );
            })}

            {/* Inti: verifikasi */}
            <g
              style={{
                ...dim(CORE_INDEX),
                transformOrigin: "0 0",
                transform: active === CORE_INDEX ? "scale(1.22)" : "scale(1)",
                transition: "opacity 200ms, transform 200ms",
              }}
            >
              <g className="tr-breathe">
                <g className="tr-spin" style={spinStyle(36, hovered === CORE_INDEX || selected === CORE_INDEX)}>
                  <polygon
                    ref={(el) => {
                      anchors.current[CORE_INDEX] = el;
                    }}
                    points="0,-38 33,-19 33,19 0,38 -33,19 -33,-19"
                    fill={PETROL_600}
                    stroke={PETROL_50}
                    strokeWidth="2"
                  />
                  <path d="M0 0V-38M0 0L33 19M0 0L-33 19" stroke={PETROL_50} strokeWidth="2" />
                  <polygon points="0,-12 10,-6 10,6 0,12 -10,6 -10,-6" fill={PETROL_200} />
                </g>
              </g>
              <circle
                r="54"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(CORE_INDEX)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleSelect(CORE_INDEX)}
              />
            </g>
          </g>
        </svg>

        {/* Tooltip tunggal, posisinya diatur dari efek di atas */}
        <div
          ref={tipRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-md bg-petrol-900 px-2.5 py-1.5 text-xs text-paper opacity-0 transition-opacity duration-150"
        >
          <span className="mr-1.5 font-mono text-sogan-200">{tipItem.n}</span>
          {tipItem.title[lang]}
        </div>

        <p
          className={cn(
            "pointer-events-none absolute right-0 top-0 font-mono text-[11px] text-stone-600 transition-opacity duration-500",
            interacted ? "opacity-0" : "opacity-100"
          )}
        >
          {lang === "id" ? "Arahkan ke cincin" : "Hover over a ring"}
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
