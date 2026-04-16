import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { hasLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar lang={lang} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} />
    </div>
  );
}
