import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bitcount = Inter({
  variable: "--font-bitcount",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Homedays | Just a band from Cleveland, Ohio",
  description: "Coming soon to a CD-RW near you",
  openGraph: {
    title: "Homedays | Just a band from Cleveland, Ohio",
    description: "Coming soon to a CD-RW near you",
    images: [
      {
        url: "/images/og.jpg",
        width: 1200,
        height: 630,
        alt: "Homedays band",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Homedays | Just a band from Cleveland, Ohio",
    description: "Coming soon to a CD-RW near you",
    images: ["/images/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bitcount:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bitcount.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
