import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifikasi Tanda Tangan | Sangkala",
  description:
    "Halaman verifikasi tanda tangan digital sertifikat pelatihan Sangkala.",
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
