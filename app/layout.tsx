import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atmosphere — Dynamic Hyper-Local Weather",
  description: "A world-class weather experience with dynamic environments, adaptive theme support, and hyper-local forecasting.",
  keywords: ["weather", "forecast", "tomorrow.io", "radar", "temperature", "atmosphere"],
  authors: [{ name: "Saarth Vadalia" }],
  openGraph: {
    title: "Atmosphere — Dynamic Hyper-Local Weather",
    description: "A world-class weather experience with dynamic environments and hyper-local forecasting.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
    { media: "(prefers-color-scheme: light)", color: "#f1f5f9" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased selection:bg-sky-500/30">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
