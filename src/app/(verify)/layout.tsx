import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

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
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${inter.variable} ${plusJakarta.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
