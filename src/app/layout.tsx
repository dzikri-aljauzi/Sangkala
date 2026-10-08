import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import SessionProvider from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Sangkala | Sustainable Performance through Integrated People, Process, Technology Excellence",
  description:
    "Konsultan dan pelatihan spesialis untuk lembaga keuangan, perbankan, dan BUMN. People · Process · Technology – Engineered for Resilient Growth.",
  keywords: [
    "GRC Indonesia",
    "pelatihan perbankan",
    "konsultan BUMN",
    "business judgment rule",
    "transformasi digital bank",
    "IT governance training",
    "compliance POJK",
    "risk management",
    "leadership training",
  ],
  authors: [{ name: "Sangkala" }],
  openGraph: {
    title: "Sangkala",
    description:
      "Sustainable Performance through Integrated People, Process, Technology Excellence. People · Process · Technology – Engineered for Resilient Growth.",
    url: "https://sangkala.example",
    siteName: "Sangkala",
    locale: "id_ID",
    type: "website",
    images: ["/og-sangkala.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`scroll-smooth ${plexSans.variable} ${plexMono.variable}`}>
      <body className="antialiased font-sans">
        <SessionProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
