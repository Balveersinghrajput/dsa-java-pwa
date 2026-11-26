import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/shell/AppShell";
import RegisterSW from "@/components/RegisterSW";
import { themeScript } from "@/hooks/useTheme";

export const metadata: Metadata = {
  title: { default: "DSA in Java — From Beginner to Advanced", template: "%s · DSA in Java" },
  description: "A 152-day, day-by-day Data Structures & Algorithms course in Java with lessons, visualisations, LeetCode practice, a Java playground and progress tracking.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "DSA Java", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
        <RegisterSW />
      </body>
    </html>
  );
}
