"use client";

import { useEffect, useRef } from "react";

/**
 * Latar hero: sistem orbit "penanda waktu" yang berputar pelan dalam proyeksi 3D,
 * dengan partikel di tiap orbit, cincin tik seperti jam, dan medan bintang.
 * Kursor memiringkan sistem dan menarik garis ke partikel terdekat.
 *
 * Canvas 2D murni (tanpa WebGL): ringan, tajam di layar retina, berhenti saat
 * tidak terlihat, dan hanya menggambar satu bingkai diam bila pengguna memilih
 * reduced motion atau menekan jeda.
 */

const PETROL_200 = "179,214,216";
const PETROL_300 = "133,186,189";
const PETROL_400 = "79,154,159";
const SOGAN_200 = "226,205,176";

interface Orbit {
  r: number; // radius relatif terhadap ukuran sistem
  tilt: number; // kemiringan (rad) terhadap bidang pandang
  phi: number; // rotasi bidang orbit
  speed: number; // kecepatan partikel (rad/detik)
  spin: number; // kecepatan rotasi bidang
  particles: number[]; // sudut awal partikel
  warm: boolean;
}

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function OrbitCanvas({ paused = false, className }: { paused?: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rnd = rand(7);

    const orbits: Orbit[] = Array.from({ length: 7 }, (_, i) => ({
      r: 0.28 + i * 0.105,
      tilt: 1.05 + (rnd() - 0.5) * 0.5,
      phi: -0.5 + i * 0.32 + rnd() * 0.2,
      speed: (0.12 + rnd() * 0.18) * (i % 2 ? -1 : 1),
      spin: (0.01 + rnd() * 0.02) * (i % 2 ? 1 : -1),
      particles: Array.from({ length: 2 + Math.floor(rnd() * 3) }, () => rnd() * Math.PI * 2),
      warm: i === 2 || i === 5,
    }));
    const stars = Array.from({ length: 140 }, () => ({ x: rnd(), y: rnd(), r: rnd() * 1.1 + 0.3, p: rnd() * Math.PI * 2 }));

    let w = 0,
      h = 0,
      dpr = 1;
    const pointer = { x: -9999, y: -9999, tx: 0, ty: 0, sx: 0, sy: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const mobile = w < 768;
      const cx = mobile ? w * 0.62 : w * 0.72;
      const cy = mobile ? h * 0.78 : h * 0.52;
      const size = mobile ? Math.min(w, h) * 0.95 : Math.min(w * 0.5, h * 0.95);

      // easing kemiringan mengikuti kursor
      pointer.sx += (pointer.tx - pointer.sx) * 0.04;
      pointer.sy += (pointer.ty - pointer.sy) * 0.04;

      // medan bintang
      for (const s of stars) {
        const a = 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(t * 0.0008 + s.p));
        ctx.fillStyle = `rgba(${PETROL_200},${a})`;
        ctx.beginPath();
        ctx.arc(s.x * w + pointer.sx * -12, s.y * h + pointer.sy * -8, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // cincin tik luar (sengkalan / jam)
      const ringR = size * 0.98;
      const ticks = 120;
      const rot = t * 0.00004;
      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < ticks; i++) {
        const a = (i / ticks) * Math.PI * 2 + rot;
        const long = i % 10 === 0;
        const len = long ? 14 : 6;
        ctx.strokeStyle = `rgba(${long ? SOGAN_200 : PETROL_300},${long ? 0.55 : 0.28})`;
        ctx.lineWidth = long ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * ringR, Math.sin(a) * ringR * 0.98);
        ctx.lineTo(Math.cos(a) * (ringR - len), Math.sin(a) * (ringR - len) * 0.98);
        ctx.stroke();
      }
      ctx.restore();

      type P = { x: number; y: number; z: number; warm: boolean };
      const pts: P[] = [];

      for (const o of orbits) {
        const r = o.r * size * 0.9;
        const tilt = o.tilt + pointer.sy * 0.18;
        const phi = o.phi + t * 0.001 * o.spin + pointer.sx * 0.12;
        const ry = r * Math.cos(tilt);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(phi);
        ctx.strokeStyle = `rgba(${o.warm ? SOGAN_200 : PETROL_400},${o.warm ? 0.35 : 0.42})`;
        ctx.lineWidth = 1;
        ctx.setLineDash(o.warm ? [2, 6] : []);
        ctx.beginPath();
        ctx.ellipse(0, 0, r, Math.abs(ry), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        for (const p0 of o.particles) {
          const th = p0 + t * 0.001 * o.speed;
          const lx = r * Math.cos(th);
          const ly = ry * Math.sin(th);
          const z = Math.sin(th) * Math.sin(tilt); // kedalaman -1..1
          const x = cx + lx * Math.cos(phi) - ly * Math.sin(phi);
          const y = cy + lx * Math.sin(phi) + ly * Math.cos(phi);
          pts.push({ x, y, z, warm: o.warm });
        }
      }

      // garis dari kursor ke partikel terdekat
      for (const p of pts) {
        const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        if (d < 180) {
          ctx.strokeStyle = `rgba(${PETROL_200},${(1 - d / 180) * 0.6})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      // partikel, yang "di depan" lebih besar dan terang
      pts.sort((a, b) => a.z - b.z);
      for (const p of pts) {
        const k = (p.z + 1) / 2;
        const rad = 1.8 + k * 3.2;
        ctx.fillStyle = `rgba(${p.warm ? SOGAN_200 : PETROL_200},${0.45 + k * 0.55})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();
        if (k > 0.75) {
          ctx.strokeStyle = `rgba(${p.warm ? SOGAN_200 : PETROL_300},0.25)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // inti: verifikasi
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.0018);
      ctx.strokeStyle = `rgba(${SOGAN_200},${0.35 + pulse * 0.35})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + pulse * 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(${SOGAN_200},0.95)`;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Redupkan area di belakang teks agar judul dan paragraf tetap terbaca.
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      const fade = mobile ? ctx.createLinearGradient(0, 0, 0, h * 0.75) : ctx.createLinearGradient(0, 0, w * 0.62, 0);
      fade.addColorStop(0, "rgba(0,0,0,0.92)");
      fade.addColorStop(0.7, "rgba(0,0,0,0.6)");
      fade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fade;
      if (mobile) ctx.fillRect(0, 0, w, h * 0.75);
      else ctx.fillRect(0, 0, w * 0.62, h);
      ctx.restore();
    };

    let raf = 0;
    let visible = true;
    let last = 0;
    let clock = 12000; // waktu animasi sendiri, supaya jeda tidak membuat lompatan
    const loop = (now: number) => {
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      if (!pausedRef.current) clock += dt;
      draw(clock);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && visible && !reduce) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    draw(clock);
    start();

    const ro = new ResizeObserver(() => {
      resize();
      draw(clock);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.tx = (pointer.x / rect.width - 0.5) * 2;
      pointer.ty = (pointer.y / rect.height - 0.5) * 2;
      if (reduce) draw(clock);
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
      pointer.tx = pointer.ty = 0;
    };
    const host = canvas.parentElement ?? canvas;
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
