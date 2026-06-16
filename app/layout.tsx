import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DaMovies - Watch Movies & TV Shows",
  description: "Stream your favorite movies and TV shows in HD",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
