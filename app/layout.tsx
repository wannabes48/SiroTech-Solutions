import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sirotech.vercel.app"),
  title: {
    default: "SiroTech Solutions | Software development in Nairobi",
    template: "%s | SiroTech Solutions",
  },
  description: "Independent product studio based in Nairobi specializing in robust web, mobile, and AI integrations.",
  openGraph: {
    title: "SiroTech Solutions",
    description: "Independent product studio based in Nairobi specializing in robust web, mobile, and AI integrations.",
    url: "https://sirotech.vercel.app",
    siteName: "SiroTech Solutions",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${plusJakarta.variable}`}>
      <body className="font-sans antialiased text-body bg-bg">{children}</body>
    </html>
  );
}
