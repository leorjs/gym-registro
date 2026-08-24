import type { Metadata } from "next";
import { AuthProvider } from "@/lib/hooks/use-auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "openGym",
  description: "Planificá tu semana, entrená y seguí tu progreso.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
