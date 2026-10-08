import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  tone?: "petrol" | "light";
}

// Wordmark teks sesuai BRAND.md: "Sangkala" IBM Plex Sans medium, Petrol 600.
// Logo bergambar sengaja belum dibuat.
export function Wordmark({ className, tone = "petrol" }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-medium tracking-tight",
        tone === "petrol" ? "text-petrol-600" : "text-paper",
        className
      )}
    >
      Sangkala
    </span>
  );
}
