import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifikasi Tanda Tangan | Leadership Nasional Asia",
  description:
    "Halaman verifikasi tanda tangan digital sertifikat pelatihan Leadership Nasional Asia.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
