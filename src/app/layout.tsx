import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import {
  Poppins,
  Playfair_Display,
  JetBrains_Mono,
  Space_Grotesk,
  DM_Sans,
  Lora,
  Bebas_Neue,
  Sora,
  Outfit,
} from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const clashDisplay = localFont({
  src: [
    { path: "./fonts/ClashDisplay-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clash",
  display: "swap",
});

const satoshi = localFont({
  src: [
    { path: "./fonts/Satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Satoshi-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ─── Theme fonts (public page) ───────────────────────────────────────────────
// Curated font picker. Each maps to a --lb-font-* CSS variable that the
// theme-tokens resolver references. Loaded server-side via next/font/google.
//
// preload: false — critical for public page performance. With preload on
// (the next/font default), the browser downloads ALL 9 font families × all
// their weights on EVERY page (21 woff2 files ≈ 483KB) even though the
// active theme only uses ONE. With preload off, the @font-face rules still
// exist in the CSS (so the admin theme picker works), but the browser only
// downloads a font when an element actually renders with that font-family.
// Net effect on the public page: 1 font downloads instead of 9. The admin
// theme preview still works (fonts swap in on-demand, a ~100ms FOUT).
const inter = Inter({
  variable: "--lb-font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});
const poppins = Poppins({
  variable: "--lb-font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const playfair = Playfair_Display({
  variable: "--lb-font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const jetbrains = JetBrains_Mono({
  variable: "--lb-font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--lb-font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const dmSans = DM_Sans({
  variable: "--lb-font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const lora = Lora({
  variable: "--lb-font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const bebas = Bebas_Neue({
  variable: "--lb-font-bebas",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
});

const sora = Sora({
  variable: "--lb-font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const outfit = Outfit({
  variable: "--lb-font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "LinkBreeze — Self-hosted link-in-bio",
  description: "Self-hosted link-in-bio platform with analytics, QR codes, and themes. The open-source Linktree alternative.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "LinkBreeze — Self-hosted link-in-bio",
    description: "The open-source Linktree alternative you own.",
    images: ["/banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkBreeze — Self-hosted link-in-bio",
    description: "The open-source Linktree alternative you own.",
    images: ["/banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${satoshi.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} ${playfair.variable} ${jetbrains.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${lora.variable} ${bebas.variable} ${sora.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
