import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "NDOA — Mariages et invitations numériques",
    template: "%s | NDOA",
  },
  description:
    "Créez votre mariage, organisez vos invités et partagez une invitation numérique élégante avec NDOA.",
  applicationName: "NDOA",
  keywords: ["mariage", "invitation numérique", "RSVP", "NDOA"],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  authors: [{ name: "NDOA" }],
  creator: "NDOA",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "NDOA",
    title: "NDOA — Mariages et invitations numériques",
    description: "Créez, partagez et gérez votre invitation de mariage.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NDOA — Mariages et invitations numériques",
    description: "Créez, partagez et gérez votre invitation de mariage.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
