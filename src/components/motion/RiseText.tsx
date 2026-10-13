import type { ReactNode } from "react";

/** Memecah teks menjadi kata yang naik satu per satu (animasi CSS, aman tanpa JS). */
export function RiseText({ text, start = 0, children }: { text: string; start?: number; children?: ReactNode }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className="rise-word" style={{ ["--i" as string]: start + i }}>
            <span>{w}</span>
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
      {children}
    </>
  );
}
