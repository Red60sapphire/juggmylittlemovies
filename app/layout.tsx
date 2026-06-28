import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeScript, ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "juggmylittlemovies - Watch Movies & TV Shows",
  description: "Stream your favorite movies and TV shows in HD",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-noise opacity-[0.025]" />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
