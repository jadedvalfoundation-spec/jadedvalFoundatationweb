"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";

interface LocaleContextValue {
  locale: Locale;
  dict: Dictionary;
  currency: string;
  dir: "ltr" | "rtl";
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}

interface Props {
  locale: Locale;
  dict: Dictionary;
  dir: "ltr" | "rtl";
  children: ReactNode;
}

export default function LocaleProvider({ locale, dict, dir, children }: Props) {
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    // Read currency from cookie set by the proxy
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_currency="));
    if (match) setCurrency(match.split("=")[1]);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, dict, currency, dir }}>
      <div dir={dir} lang={locale} className="contents">
        {children}
      </div>
    </LocaleContext.Provider>
  );
}
