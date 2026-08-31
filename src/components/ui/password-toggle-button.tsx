"use client";

import { Eye, EyeOff } from "lucide-react";

interface PasswordToggleButtonProps {
  visible: boolean;
  onToggle: () => void;
  /** "sm" dipakai di konteks admin/CRUD (icon 16px), "md" di halaman login (icon 20px) --
   *  sebelumnya ini didefinisikan ulang 4x secara independen dengan ukuran beda-beda dikit. */
  size?: "sm" | "md";
}

export function PasswordToggleButton({ visible, onToggle, size = "md" }: PasswordToggleButtonProps) {
  const iconClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const padClass = size === "sm" ? "p-0.5" : "p-1";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`absolute right-3 top-1/2 -translate-y-1/2 ${padClass} text-slate-400 hover:text-slate-600 transition-colors focus:outline-none`}
      aria-label={visible ? "Sembunyikan password" : "Lihat password"}
      title={visible ? "Sembunyikan password" : "Lihat password"}
    >
      {visible ? <EyeOff className={iconClass} /> : <Eye className={iconClass} />}
    </button>
  );
}
