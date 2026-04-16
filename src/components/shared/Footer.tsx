import Link from "next/link";
import connectDB from "@/lib/mongodb";
import WebsiteInfo from "@/models/WebsiteInfo";
import type { Locale } from "@/lib/i18n";

interface FooterProps {
  lang: Locale;
}

async function getSocialLinks() {
  try {
    await connectDB();
    const info = await WebsiteInfo.findOne().select("facebook twitter instagram youtube contactEmail").lean() as {
      facebook?: string; twitter?: string; instagram?: string; youtube?: string; contactEmail?: string;
    } | null;
    return info ?? {};
  } catch {
    return {};
  }
}

export default async function Footer({ lang }: FooterProps) {
  const social = await getSocialLinks();

  const ourWork = [
    { label: "Child Empowerment", href: `/${lang}/programs` },
    { label: "Family Support", href: `/${lang}/programs` },
    { label: "Community Hubs", href: `/${lang}/programs` },
    { label: "Digital Literacy", href: `/${lang}/programs` },
  ];

  const supportUs = [
    { label: "Sponsor a Child", href: `/${lang}/donate` },
    { label: "Corporate Giving", href: `/${lang}/donate` },
    { label: "Community Hubs", href: `/${lang}/get-involved` },
    { label: "Volunteer Suite", href: `/${lang}/get-involved` },
    { label: "Impact Reports", href: `/${lang}/impact` },
  ];

  return (
    <footer className="bg-[#0c1620]" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand + description + social */}
          <div className="lg:col-span-1">
            <Link href={`/${lang}`} className="font-heading text-lg font-bold text-white">
              Jade D&apos;Val Foundation
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              An NGO dedicated to community development through digital alchemy and human compassion. We empower children and provide direct support to families in need.
            </p>
            {/* Social icons */}
            <div className="mt-5 flex gap-3">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand transition hover:bg-brand hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand transition hover:bg-brand hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand transition hover:bg-brand hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                  </svg>
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand transition hover:bg-brand hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
                    <polygon fill="#0c1620" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                  </svg>
                </a>
              )}
              {/* Show placeholder icons if no social links configured */}
              {!social.facebook && !social.twitter && !social.instagram && !social.youtube && (
                <p className="text-xs text-gray-600">Social links coming soon</p>
              )}
            </div>
          </div>

          {/* Spacer on large screens */}
          <div className="hidden lg:block" />

          {/* Our Work */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Our Work</h3>
            <ul className="mt-4 space-y-3">
              {ourWork.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-gray-400 transition-colors hover:text-brand">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Us */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Support Us</h3>
            <ul className="mt-4 space-y-3">
              {supportUs.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-gray-400 transition-colors hover:text-brand">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-6 sm:flex-row"
          style={{ borderTopColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 sm:justify-start">
            <Link href={`/${lang}/privacy`} className="hover:text-brand">Privacy Policy</Link>
            <Link href={`/${lang}/transparency`} className="hover:text-brand">Transparency Report</Link>
            <Link href={`/${lang}/terms`} className="hover:text-brand">Terms of Use</Link>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Jade D&apos;Val Foundation NGO. Compassion through Innovation.
          </p>
        </div>
      </div>
    </footer>
  );
}
