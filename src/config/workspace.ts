import type { AppRole } from "./nav";

export const VIEW_TITLES: Record<string, string> = {
  overview: "Overview",
  users: "Users",
  documents: "Documents",
  resumes: "Resumes",
  documentations: "Dokumentasi",
  progress: "Progress",
  echelons: "Eselon",
  upload: "Upload Dokumen",
  history: "Riwayat Upload",
};

export const VIEW_SUBTITLES: Record<string, string> = {
  overview: "Ringkasan dan statistik",
  users: "Kelola user asesor dan klien",
  documents: "Semua dokumen dari asesor",
  resumes: "Kelola resume untuk klien",
  documentations: "Kelola dokumentasi untuk klien",
  progress: "Progress pelaksanaan asesmen",
  echelons: "Kelola kategori eselon untuk resume",
  upload: "Upload laporan assessment Anda",
  history: "Lihat semua dokumen yang telah diupload",
};

export const ALLOWED_VIEWS: Record<AppRole, string[]> = {
  SUPER_ADMIN: ["overview", "users", "documents", "resumes", "documentations", "progress", "echelons"],
  ADMIN: ["overview", "users", "documents", "resumes", "documentations", "progress", "echelons"],
  ASESOR: ["overview", "upload", "history"],
  KLIEN: ["overview", "resumes", "documentations", "progress"],
  STAFF_KLIEN: ["overview", "progress"],
};

export function resolveView(role: string | undefined, view: string): string {
  if (!role) return "overview";
  const allowed = ALLOWED_VIEWS[role as AppRole];
  return allowed?.includes(view) ? view : "overview";
}
