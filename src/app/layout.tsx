import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import Script from "next/script";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jadedvalfoundation.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jade D'Val Foundation",
    template: "%s | Jade D'Val Foundation",
  },
  description:
    "Empowering communities through education, healthcare, and sustainable development. We work in Africa and beyond to build resilient futures through grassroots initiatives.",
  keywords: [
    "foundation", "charity", "NGO", "nonprofit", "community development",
    "education", "healthcare", "Africa", "humanitarian", "donate",
    "volunteer", "sustainability", "youth empowerment",
  ],
  authors: [{ name: "Jade D'Val Foundation", url: SITE_URL }],
  creator: "Jade D'Val Foundation",
  publisher: "Jade D'Val Foundation",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Jade D'Val Foundation",
    title: "Jade D'Val Foundation",
    description:
      "Empowering communities through education, healthcare, and sustainable development.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Jade D'Val Foundation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jade D'Val Foundation",
    description:
      "Empowering communities through education, healthcare, and sustainable development.",
    images: ["/og-default.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Jade D'Val Foundation",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Empowering communities through education, healthcare, and sustainable development across Africa and beyond.",
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${montserrat.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-body">
        <SessionProvider>{children}</SessionProvider>
        <Script
          id="metricool-tracker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `function loadScript(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript",c.src="https://tracker.metricool.com/resources/be.js",c.onreadystatechange=a,c.onload=a,b.appendChild(c)}loadScript(function(){beTracker.t({hash:"c716ffc355cc8e7bf828a4ad939d8216"})});`,
          }}
        />
      </body>
    </html>
  );
}
