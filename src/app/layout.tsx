import type { Metadata } from "next";
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
  title: "Registro de Ayuda Humanitaria | Sismo en Colombia 2026",
  description:
    "Registra la ayuda que tu organización, empresa o tú pueden ofrecer a los afectados por el sismo del 10 de agosto en Colombia: donaciones, salud, transporte, alojamiento y más.",
  openGraph: {
    title: "Ofrece tu ayuda — Sismo en Colombia",
    description:
      "Un solo formulario para registrar donaciones, servicios de salud, transporte, alojamiento y voluntariado para los damnificados del sismo del 10 de agosto de 2026.",
    locale: "es_CO",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
