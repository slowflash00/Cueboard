import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cueboard — Visual AI Prompt Library",
  description: "A Pinterest-style visual library for organizing AI-generated images, videos, and multi-part prompts.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cueboard-six.vercel.app'),
  openGraph: {
    title: "Cueboard — Visual AI Prompt Library",
    description: "A Pinterest-style visual library for organizing AI-generated images, videos, and multi-part prompts.",
    url: '/',
    siteName: 'Cueboard',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Cueboard — Visual AI Prompt Library",
    description: "A Pinterest-style visual library for organizing AI-generated images, videos, and multi-part prompts.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)]">
        {children}
      </body>
    </html>
  );
}
