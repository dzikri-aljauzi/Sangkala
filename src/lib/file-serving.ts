// Dipakai bareng oleh /api/files dan /api/public/images — dua route ini
// SENGAJA tetap terpisah (beda model keamanan: /api/files butuh login +
// akses bebas ke semua folder uploads, /api/public/images tanpa login +
// dibatasi allowlist folder). Yang benar-benar duplikat di antara keduanya
// cuma dua hal kecil ini, dan sebelumnya sudah sempat drift (map
// content-type-nya tidak identik satu sama lain).

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

export function getContentType(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  return CONTENT_TYPES[ext] || "application/octet-stream";
}

export function isPathTraversalSafe(filePath: string): boolean {
  return !filePath.includes("..");
}
