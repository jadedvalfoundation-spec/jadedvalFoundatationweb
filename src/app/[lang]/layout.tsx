import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import LocaleProvider from "@/components/providers/LocaleProvider";

export async function generateStaticParams() {
  return [
    { lang: "en" },
    { lang: "es" },
    { lang: "fr" },
    { lang: "ar" },
    { lang: "zh" },
  ];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <LocaleProvider locale={lang} dict={dict} dir={dir}>
      {children}
    </LocaleProvider>
  );
}
