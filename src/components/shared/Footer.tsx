import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

interface FooterProps {
  lang: Locale;
}

export default async function Footer({ lang }: FooterProps) {
  const dict = await getDictionary(lang);

  const quickLinks = [
    { label: dict.nav.home, href: `/${lang}` },
    { label: dict.nav.about, href: `/${lang}/about` },
    { label: dict.nav.programs, href: `/${lang}/programs` },
    { label: dict.nav.contact, href: `/${lang}/contact` },
  ];

  const programs = [
    dict.programs.education.title,
    dict.programs.healthcare.title,
    dict.programs.skills.title,
    dict.programs.community.title,
    dict.programs.youth.title,
  ];

  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black ring-1 ring-brand/30">
                <Image
                  src="/logo.png"
                  alt="Jade D'Val Foundation"
                  width={48}
                  height={48}
                  className="h-12 w-12 object-cover"
                />
              </div>
              <span className="font-heading text-lg font-bold">
                Jadedval Foundation
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-400">{dict.footer.tagline}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-gray-300">
              {dict.footer.quickLinks}
            </h3>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-brand-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-gray-300">
              {dict.footer.programsTitle}
            </h3>
            <ul className="mt-4 space-y-2">
              {programs.map((item) => (
                <li key={item}>
                  <Link
                    href={`/${lang}/programs`}
                    className="text-sm text-gray-400 transition-colors hover:text-brand-light"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-gray-300">
              {dict.footer.contact}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li>info@jadedvalfoundation.org</li>
              <li>+1 (000) 000-0000</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Jadedval Foundation.{" "}
            {dict.footer.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
