import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1WM87HQVQ3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1WM87HQVQ3');
          `}
        </Script>
      </head>
      <body className="bg-background text-foreground antialiased">
        <div className="fixed inset-x-0 top-0 z-[100] h-[2px] bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600/20" />
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-noise opacity-[0.025]" />
        {children}
      </body>
    </html>
  );
}
