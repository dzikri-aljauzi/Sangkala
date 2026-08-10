import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import SessionProvider from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Leadership Nasional Asia | Sustainable Performance through Integrated People, Process, Technology Excellence",
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
  authors: [{ name: "Leadership Nasional Asia" }],
  icons: {
    icon: "/lna.png",
    shortcut: "/lna.png",
    apple: "/lna.png",
  },
  openGraph: {
    title: "Leadership Nasional Asia",
    description:
      "Sustainable Performance through Integrated People, Process, Technology Excellence. People · Process · Technology – Engineered for Resilient Growth.",
    url: "https://lna.co.id",
    siteName: "Leadership Nasional Asia",
    locale: "id_ID",
    type: "website",
    images: ["/lna.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="antialiased font-sans">
        <SessionProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
