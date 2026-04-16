import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Authentication",
};

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href={`/${lang}`} className="inline-flex items-center gap-2">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black">
                <Image
                  src="/logo.png"
                  alt="Jade D'Val Foundation"
                  width={48}
                  height={48}
                  className="h-12 w-12 object-cover"
                  priority
                />
              </div>
              <span className="font-heading text-xl font-bold text-gray-900">
                Jadedval Foundation
              </span>
            </Link>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
