import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Used to resolve absolute URLs for the OG/Twitter preview images.
// Update NEXT_PUBLIC_SITE_URL in your Vercel env vars once the custom
// domain is live — until then this falls back to the Vercel deploy URL.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const title = "rai ku hub";
const description =
  "Live holder stats for rkuSOL — Raiku's Solana liquid staking token. Check any wallet, browse top holders, and see how to stake.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="cosmic-base text-ash-50 font-sans antialiased">
        <div className="starfield-far pointer-events-none fixed inset-0 -z-20 opacity-70" />
        <div className="starfield-near pointer-events-none fixed inset-0 -z-10 opacity-80" />
        <div className="pointer-events-none fixed inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-signal to-transparent" />
        {children}
      </body>
    </html>
  );
}
