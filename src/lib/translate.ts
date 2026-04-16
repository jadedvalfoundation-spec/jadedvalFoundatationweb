import "server-only";
import type { Locale } from "./i18n";

// Language code mapping (Locale → Google Translate lang code)
const LANG: Record<Locale, string> = {
  en: "en",
  fr: "fr",
  es: "es",
  ar: "ar",
  zh: "zh-CN",
};

/**
 * Auto-translate a string from English to the given locale.
 * Returns the original text when lang === "en" or on failure.
 * Uses Next.js fetch caching (24h revalidate) to avoid hammering the API.
 */
export async function translate(text: string, lang: Locale): Promise<string> {
  if (!text || lang === "en") return text;
  const stripped = text.trim();
  if (!stripped) return text;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${LANG[lang]}&dt=t&q=${encodeURIComponent(stripped)}`;
    const res = await fetch(url, {
      next: { revalidate: 86400 }, // cache 24h
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return text;
    const data = await res.json();
    // Response shape: [[["translated","original",...], ...], ...]
    const parts: string[] = (data[0] as Array<[string]>).map((p) => p[0]);
    return parts.join("") || text;
  } catch {
    return text;
  }
}

/**
 * Translate multiple strings at once. Returns results in the same order.
 */
export async function translateMany(texts: string[], lang: Locale): Promise<string[]> {
  if (lang === "en") return texts;
  return Promise.all(texts.map((t) => translate(t, lang)));
}

/**
 * Strip HTML tags before translating, then return translated plain text.
 */
export async function translatePlain(html: string, lang: Locale): Promise<string> {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return translate(plain, lang);
}
