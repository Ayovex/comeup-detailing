import type { Metadata } from "next";
import { Bebas_Neue, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Comeup Car Detailing | Mobile Detailing Across DFW",
  description:
    "Book mobile car detailing across Dallas-Fort Worth with Comeup Car Detailing. Three daily booking slots, service-first layout, and direct contact links.",
  icons: {
    apple: [
      { url: "/apple-touch-icon.png?v=2", sizes: "180x180" },
      { url: "/apple-touch-icon-precomposed.png?v=2", sizes: "180x180" },
    ],
    icon: [
      { url: "/favicon.ico?v=2" },
      { url: "/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest?v=2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
