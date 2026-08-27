import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ciocolatto Pastelería — Diseñá tu torta",
    template: "%s — Ciocolatto Pastelería",
  },
  description:
    "Diseñá tu torta paso a paso: elegí bizcochuelo, rellenos y decoración, mirá el precio en tiempo real y recibí tu presupuesto al instante por WhatsApp.",
  openGraph: {
    title: "Ciocolatto Pastelería — Diseñá tu torta",
    description:
      "Constructor interactivo de tortas: armá tu torta ideal y recibí el presupuesto al instante por WhatsApp.",
    siteName: "Ciocolatto Pastelería",
    locale: "es_AR",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cioco-cream text-[--foreground] font-sans">
        {children}
      </body>
    </html>
  );
}
