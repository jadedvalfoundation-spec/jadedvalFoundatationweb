"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "@/components/providers/LocaleProvider";
import { SUPPORTED_LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n";

interface NavbarProps {
  lang: Locale;
}

export default function Navbar({ lang }: NavbarProps) {
  const { dict } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  function switchLocale(newLang: Locale) {
    const newPath = pathname.replace(/^\/[a-z]{2}(\/|$)/, `/${newLang}$1`);
    router.push(newPath);
    setLangOpen(false);
    setMobileOpen(false);
  }

  function isActive(href: string) {
    if (href === `/${lang}`) return pathname === href;
    return pathname.startsWith(href);
  }

  const navLinks = [
    { label: dict.nav.home, href: `/${lang}` },
    { label: dict.nav.about, href: `/${lang}/about` },
    { label: dict.nav.programs, href: `/${lang}/programs` },
    { label: dict.nav.getInvolved, href: `/${lang}/get-involved` },
    { label: dict.nav.impact, href: `/${lang}/impact` },
    { label: dict.nav.news, href: `/${lang}/news` },
    { label: dict.nav.contact, href: `/${lang}/contact` },
  ];

  const flagEmoji: Record<string, string> = {
    en: "🇬🇧", es: "🇪🇸", fr: "🇫🇷", ar: "🇸🇦", zh: "🇨🇳",
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0c1620]" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Brand */}
          <Link href={`/${lang}`} className="font-heading text-lg font-bold text-white whitespace-nowrap">
            Jade D&apos;Val Foundation
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm transition-colors ${
                  isActive(link.href)
                    ? "text-brand"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-brand" />
                )}
              </Link>
            ))}
          </div>

          {/* Right: lang selector + donate */}
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-label={dict.language?.selector ?? "Language"}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-400 hover:text-white focus:outline-none"
              >
                <span className="text-base leading-none">{flagEmoji[lang]}</span>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-40 rounded-xl border border-white/10 bg-[#0f1e2a] py-1 shadow-xl">
                  {SUPPORTED_LOCALES.map((locale) => (
                    <button
                      key={locale}
                      onClick={() => switchLocale(locale)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:text-brand ${
                        locale === lang ? "font-semibold text-brand" : "text-gray-300"
                      }`}
                    >
                      <span>{flagEmoji[locale]}</span>
                      {LOCALE_NAMES[locale]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Donate button */}
            <Link
              href={`/${lang}/donate`}
              className="hidden rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark sm:block"
            >
              {dict.nav.donate}
            </Link>

            {/* Hamburger */}
            <button
              className="rounded-md p-2 text-gray-400 hover:text-white lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0c1620] lg:hidden">
          <div className="space-y-0.5 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-brand/10 text-brand"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href={`/${lang}/donate`}
                onClick={() => setMobileOpen(false)}
                className="block rounded-full bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                {dict.nav.donate}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
