import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WarningGate } from "@strob/components/WarningGate";
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
  title: "Strob — Live mood light sessions",
  description:
    "Controller and viewer synced color strobe lights, inspired by moodlight.org",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function StrobLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`strob-root ${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <WarningGate>{children}</WarningGate>
    </div>
  );
}
