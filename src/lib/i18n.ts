import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import type { NextRequest } from "next/server";

export const SUPPORTED_LOCALES = ["en", "es", "fr", "ar", "zh"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  ar: "العربية",
  zh: "中文",
};

/** Countries where each locale is the primary language. */
const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  // English
  US: "en",
  GB: "en",
  AU: "en",
  CA: "en",
  NZ: "en",
  IE: "en",
  ZA: "en",
  IN: "en",
  NG: "en",
  GH: "en",
  KE: "en",
  UG: "en",
  TZ: "en",
  ZM: "en",
  ZW: "en",
  // Spanish
  MX: "es",
  ES: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  // French
  FR: "fr",
  BE: "fr",
  CH: "fr",
  CD: "fr",
  CM: "fr",
  CI: "fr",
  SN: "fr",
  ML: "fr",
  BF: "fr",
  NE: "fr",
  GN: "fr",
  MG: "fr",
  HT: "fr",
  // Arabic
  SA: "ar",
  EG: "ar",
  AE: "ar",
  IQ: "ar",
  MA: "ar",
  DZ: "ar",
  SD: "ar",
  SY: "ar",
  YE: "ar",
  TN: "ar",
  JO: "ar",
  LY: "ar",
  LB: "ar",
  OM: "ar",
  KW: "ar",
  QA: "ar",
  BH: "ar",
  // Chinese
  CN: "zh",
  TW: "zh",
  SG: "zh",
  HK: "zh",
  MO: "zh",
};

/** Country → ISO 4217 currency code. */
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  EU: "EUR",
  AU: "AUD",
  CA: "CAD",
  CH: "CHF",
  JP: "JPY",
  CN: "CNY",
  IN: "INR",
  NG: "NGN",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
  MX: "MXN",
  BR: "BRL",
  AR: "ARS",
  SA: "SAR",
  AE: "AED",
  EG: "EGP",
  MA: "MAD",
  FR: "EUR",
  DE: "EUR",
  IT: "EUR",
  ES: "EUR",
  PT: "EUR",
  NL: "EUR",
  BE: "EUR",
  PL: "PLN",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  SG: "SGD",
  HK: "HKD",
  TW: "TWD",
  KR: "KRW",
  RU: "RUB",
  TR: "TRY",
  ID: "IDR",
  PH: "PHP",
  TH: "THB",
  MY: "MYR",
  PK: "PKR",
  BD: "BDT",
  NZ: "NZD",
  ZM: "ZMW",
  TZ: "TZS",
  UG: "UGX",
  ET: "ETB",
  CM: "XAF",
  CI: "XOF",
  SN: "XOF",
};

export function getCurrencyForCountry(countryCode: string): string {
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? "USD";
}

export function getLocaleFromCountry(countryCode: string): Locale {
  return COUNTRY_TO_LOCALE[countryCode.toUpperCase()] ?? DEFAULT_LOCALE;
}

export function getLocaleFromRequest(request: NextRequest): Locale {
  // 1. Check Vercel / Cloudflare country header
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry");

  if (country) {
    const countryLocale = getLocaleFromCountry(country);
    return countryLocale;
  }

  // 2. Fall back to Accept-Language header negotiation
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    try {
      const headers = { "accept-language": acceptLanguage };
      const languages = new Negotiator({ headers }).languages();
      return match(
        languages,
        SUPPORTED_LOCALES as unknown as string[],
        DEFAULT_LOCALE,
      ) as Locale;
    } catch {
      // ignore negotiation errors
    }
  }

  return DEFAULT_LOCALE;
}

export function hasLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
