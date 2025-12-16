import type { Metadata } from "next";
import { Bungee } from "next/font/google";
import "./globals.css";

const bungee = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bungee",
});

export const metadata: Metadata = {
  title: "MacroMate - Smart Nutrition",
  description: "Sistema de seguimiento nutricional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={bungee.variable}>
        {children}
      </body>
    </html>
  );
}