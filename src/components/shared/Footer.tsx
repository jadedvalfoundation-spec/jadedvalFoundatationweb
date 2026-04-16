import Link from "next/link";
import connectDB from "@/lib/mongodb";
import WebsiteInfo from "@/models/WebsiteInfo";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import NewsletterForm from "./NewsletterForm";

interface FooterProps {
  lang: Locale;
}

async function getSocialLinks() {
  try {
    await connectDB();
    const info = await WebsiteInfo.findOne()
      .select("facebook twitter instagram youtube contactEmail")
      .lean() as {
        facebook?: string; twitter?: string; instagram?: string;
        youtube?: string; contactEmail?: string;
      } | null;
    return info ?? {};
  } catch {
    return {};
  }
}

export default async function Footer({ lang }: FooterProps) {
  const [social, dict] = await Promise.all([
    getSocialLinks(),
    getDictionary(lang),
  ]);
  const d = dict.footer;

  const foundation = [
    { label: d.mission,       href: `/${lang}/about` },
    { label: d.ourTeam,       href: `/${lang}/about` },
    { label: d.annualReport,  href: `/${lang}/impact` },
    { label: d.governance,    href: `/${lang}/about` },
  ];

  const connect = [
    { label: d.helpCenter,   href: `/${lang}/contact` },
    { label: d.mediaKit,     href: `/${lang}/contact` },
    { label: d.partnerships, href: `/${lang}/get-involved` },
    { label: d.careers,      href: `/${lang}/get-involved` },
  ];

  const hasSocial = social.facebook || social.twitter || social.instagram || social.youtube;

  return (
    <footer className="bg-[#0c1620]" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">

          {/* Brand + tagline + social */}
          <div className="lg:col-span-1">
            <Link href={`/${lang}`} className="font-heading text-base font-bold uppercase tracking-widest text-brand">
              Jade D&apos;Val Foundation
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">{d.tagline}</p>
            {hasSocial && (
              <div className="mt-5 flex gap-3">
                {social.facebook && (
                  <a href={social.facebook} target="_blank" rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand transition hover:bg-brand hover:text-white">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                  </a>
                )}
                {social.twitter && (
                  <a href={social.twitter} target="_blank" rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand transition hover:bg-brand hover:text-white">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                )}
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand transition hover:bg-brand hover:text-white">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
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
              </div>
            )}
          </div>

          {/* Foundation links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">{d.foundation}</h3>
            <ul className="mt-4 space-y-3">
              {foundation.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-gray-400 transition-colors hover:text-brand">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">{d.connect}</h3>
            <ul className="mt-4 space-y-3">
              {connect.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-gray-400 transition-colors hover:text-brand">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stay Updated */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">{d.stayUpdated}</h3>
            <p className="mt-3 text-sm text-gray-400">
              {dict.home.newsletterSubtitle.split(".")[0]}.
            </p>
            <NewsletterForm compact />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 pt-6 sm:flex-row"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 sm:justify-start">
            <Link href={`/${lang}/privacy`} className="hover:text-brand">Privacy Policy</Link>
            <Link href={`/${lang}/transparency`} className="hover:text-brand">Transparency Report</Link>
            <Link href={`/${lang}/terms`} className="hover:text-brand">Terms of Use</Link>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Jade D&apos;Val Foundation NGO. {d.tagline.split(".")[0]}.
          </p>
        </div>
      </div>
    </footer>
  );
}
