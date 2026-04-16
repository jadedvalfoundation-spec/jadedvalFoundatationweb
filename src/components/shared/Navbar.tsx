"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  }

  const navLinks = [
    { label: dict.nav.home, href: `/${lang}` },
    { label: dict.nav.about, href: `/${lang}/about` },
    { label: dict.nav.programs, href: `/${lang}/programs` },
    { label: dict.nav.donate, href: `/${lang}/donate` },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black">
              <Image
                src="/logo.png"
                alt="Jade D'Val Foundation"
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
                priority
              />
            </div>
            <span className="hidden font-heading text-lg font-bold text-gray-900 sm:block">
              Jadedval Foundation
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 transition-colors hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: Language selector + Donate CTA */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-label={dict.language.selector}
                className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-600 hover:border-brand hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <span className="text-base leading-none">
                  {lang === "en" && "🇬🇧"}
                  {lang === "es" && "🇪🇸"}
                  {lang === "fr" && "🇫🇷"}
                  {lang === "ar" && "🇸🇦"}
                  {lang === "zh" && "🇨🇳"}
                </span>
                <span className="hidden sm:inline">{LOCALE_NAMES[lang]}</span>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                  {SUPPORTED_LOCALES.map((locale) => (
                    <button
                      key={locale}
                      onClick={() => switchLocale(locale)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-brand-lighter hover:text-brand-darker ${
                        locale === lang ? "font-semibold text-brand" : "text-gray-700"
                      }`}
                    >
                      <span>
                        {locale === "en" && "🇬🇧"}
                        {locale === "es" && "🇪🇸"}
                        {locale === "fr" && "🇫🇷"}
                        {locale === "ar" && "🇸🇦"}
                        {locale === "zh" && "🇨🇳"}
                      </span>
                      {LOCALE_NAMES[locale]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Donate CTA (desktop) */}
            <Link
              href={`/${lang}/donate`}
              className="hidden rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark sm:block"
            >
              {dict.nav.donate}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
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
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-brand-lighter hover:text-brand"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href={`/${lang}/donate`}
                className="block rounded-full bg-brand px-4 py-2 text-center text-sm font-semibold text-white"
                onClick={() => setMobileOpen(false)}
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
