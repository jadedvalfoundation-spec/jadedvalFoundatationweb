import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import connectDB from "@/lib/mongodb";
import WebsiteInfo from "@/models/WebsiteInfo";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ContactForm from "@/components/shared/ContactForm";
import FaqAccordion from "@/components/shared/FaqAccordion";
import { translateMany } from "@/lib/translate";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Jade D'Val Foundation. We welcome questions, partnership inquiries, media requests, and feedback.",
  openGraph: {
    title: "Contact Us | Jade D'Val Foundation",
    description: "Reach out for partnerships, questions, media, and more.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

async function getInfo() {
  try {
    await connectDB();
    return await WebsiteInfo.findOne()
      .select("contactPhone contactEmail officeAddress facebook twitter instagram youtube faqs")
      .lean() as {
        contactPhone?: string;
        contactEmail?: string;
        officeAddress?: string;
        facebook?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
        faqs?: { question: string; answer: string }[];
      } | null;
  } catch {
    return null;
  }
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [info, dict] = await Promise.all([getInfo(), getDictionary(lang as Locale)]);
  const d = dict.contact;

  const phone = info?.contactPhone || "+1 (555) 824-JADE";
  const email = info?.contactEmail || "hello@jadedval.org";
  const address = info?.officeAddress || "77 Alchemy Way, Tech District\nInnovation City, 10110";
  const rawFaqs = info?.faqs ?? [];

  // Translate FAQ questions and answers for non-English locales
  const faqs = lang === "en" ? rawFaqs : await (async () => {
    const questions = await translateMany(rawFaqs.map(f => f.question), lang as Locale);
    const answers = await translateMany(rawFaqs.map(f => f.answer), lang as Locale);
    return rawFaqs.map((f, i) => ({ question: questions[i], answer: answers[i] }));
  })();

  const hasSocial = info?.facebook || info?.twitter || info?.instagram || info?.youtube;

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* Main contact section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">

            {/* Left: info */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">{d.badge}</span>
              <h1 className="mt-3 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
                {d.title}{" "}
                <em className="not-italic text-brand">{d.titleLine2}</em>
              </h1>
              <p className="mt-5 text-gray-400 leading-relaxed">{d.subtitle}</p>

              {/* Contact details */}
              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{d.phone}</p>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-1 text-white hover:text-brand transition-colors">
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{d.email}</p>
                    <a href={`mailto:${email}`} className="mt-1 text-white hover:text-brand transition-colors">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{d.address}</p>
                    <p className="mt-1 whitespace-pre-line text-white">{address}</p>
                  </div>
                </div>
              </div>

              {/* Social */}
              {hasSocial && (
                <div className="mt-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{d.followUs}</p>
                  <div className="mt-4 flex gap-3">
                    {info?.facebook && (
                      <a href={info.facebook} target="_blank" rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand transition hover:bg-brand hover:text-white">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                        </svg>
                      </a>
                    )}
                    {info?.twitter && (
                      <a href={info.twitter} target="_blank" rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand transition hover:bg-brand hover:text-white">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}
                    {info?.instagram && (
                      <a href={info.instagram} target="_blank" rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand transition hover:bg-brand hover:text-white">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                        </svg>
                      </a>
                    )}
                    {info?.youtube && (
                      <a href={info.youtube} target="_blank" rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand transition hover:bg-brand hover:text-white">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
                          <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      {faqs.length > 0 && (
        <section className="py-20" style={{ background: "#0a1520" }}>
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-10 text-center font-heading text-3xl font-bold text-white">
              {d.faqTitle} <em className="not-italic text-brand">{d.faqHighlight}</em>
            </h2>
            <FaqAccordion items={faqs} />
          </div>
        </section>
      )}

      <Footer lang={lang as Locale} />
    </div>
  );
}
