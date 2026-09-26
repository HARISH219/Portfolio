import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GalaxyField } from "@/components/background/GalaxyField";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Harish Bag — Developer & Builder",
  description:
    "Personal product lab of Harish Bag. I build products, tools & experiments across web, automation, AI, and Discord.",
  keywords: [
    "Harish Bag",
    "developer",
    "portfolio",
    "web development",
    "automation",
    "AI",
    "Discord bots",
  ],
  authors: [{ name: "Harish Bag" }],
  openGraph: {
    title: "Harish Bag — Developer & Builder",
    description:
      "I build products, tools & experiments across web, automation, AI, and Discord.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${grotesk.variable} ${display.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <GalaxyField />
        <div className="grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
