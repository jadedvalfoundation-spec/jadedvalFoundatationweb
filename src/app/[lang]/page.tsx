import { notFound } from "next/navigation";
import Link from "next/link";
import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import Button from "@/components/ui/Button";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  const programs = [
    { key: "education" as const, icon: "🎓" },
    { key: "healthcare" as const, icon: "🏥" },
    { key: "skills" as const, icon: "🔧" },
    { key: "community" as const, icon: "🏘️" },
    { key: "youth" as const, icon: "⚡" },
    { key: "environment" as const, icon: "🌱" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar lang={lang} />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-brand-darker via-brand-dark to-brand py-24 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                {dict.hero.title}
              </h1>
              <p className="mt-6 text-lg text-white/80 sm:text-xl">
                {dict.hero.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={`/${lang}/donate`}>
                  <Button size="lg" variant="secondary">
                    {dict.hero.donateNow}
                  </Button>
                </Link>
                <Link href={`/${lang}/programs`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    {dict.hero.ourPrograms}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { label: dict.stats.livesImpacted, value: "10,000+" },
                { label: dict.stats.programs, value: "25+" },
                { label: dict.stats.communities, value: "50+" },
                { label: dict.stats.volunteers, value: "500+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-brand">{stat.value}</p>
                  <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs */}
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold text-gray-900">
              {dict.programs.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
              {dict.programs.subheading}
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map(({ key, icon }) => (
                <div
                  key={key}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="text-3xl">{icon}</div>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900">
                    {dict.programs[key].title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {dict.programs[key].description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-brand py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">{dict.cta.heading}</h2>
            <p className="mt-4 text-white/80">{dict.cta.subheading}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href={`/${lang}/register`}>
                <Button size="lg" variant="secondary">
                  {dict.cta.joinUs}
                </Button>
              </Link>
              <Link href={`/${lang}/contact`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  {dict.cta.contactUs}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
