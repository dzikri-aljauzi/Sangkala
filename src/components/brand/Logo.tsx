import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  priority?: boolean;
}

// Logo penuh Sangkala (mark "S" + wordmark), satu warna Petrol 600.
// Atur ukuran lewat tinggi, mis. className="h-8"; lebar mengikuti rasio.
export function Logo({ className, priority }: LogoProps) {
  return (
    <Image
      src="/brand/sangkala-logo.png"
      alt="Sangkala"
      width={933}
      height={209}
      priority={priority}
      className={cn("h-8 w-auto", className)}
    />
  );
}
