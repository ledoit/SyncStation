import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vecchio shared text session",
  description:
    "Live-synced text across your devices. Share prompts, notes, and clipboard-sized state with a short session code.",
};

export const viewport: Viewport = {
  themeColor: "#1c1917",
};

export default function VecchioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`vecchio-root overscroll-none ${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      {children}
    </div>
  );
}
