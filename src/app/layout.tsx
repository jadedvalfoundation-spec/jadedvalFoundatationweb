import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jadedval Foundation",
    template: "%s | Jadedval Foundation",
  },
  description:
    "Empowering communities through education, healthcare, and sustainable development.",
  keywords: ["foundation", "charity", "community", "education", "healthcare"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${inter.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
