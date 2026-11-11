/*
  Two languages: Indonesian at the root (/, /produk/<slug>/) and English under /en/
  (/en/, /en/products/<slug>/). Pages render the same view with a `lang` prop and pick
  their copy with pick({ id, en }).

  Which language a visitor lands on is decided by vercel.json: on the first visit,
  anyone outside Indonesia (x-vercel-ip-country) is redirected to the English page.
  The language switcher stores the choice in the `dl-lang` cookie, which wins over
  location from then on. Crawlers are never redirected; hreflang links both versions.
*/
export type Lang = "id" | "en";
export const langs: Lang[] = ["id", "en"];

export const BMC = "https://buymeacoffee.com/fannydevz";

export function langOf(url: URL): Lang {
  return url.pathname === "/en" || url.pathname.startsWith("/en/") ? "en" : "id";
}

/** The same page in the other language. Indonesian /produk/x/ is English /en/products/x/. */
export function alternate(path: string, to: Lang): string {
  const clean = path.replace(/^\/en(?=\/|$)/, "").replace(/^\/products\//, "/produk/") || "/";
  if (to === "id") return clean;
  return "/en" + clean.replace(/^\/produk\//, "/products/");
}

/** A link inside the site, in the given language. Pass the Indonesian path. */
export function href(lang: Lang, path: string): string {
  return lang === "id" ? path : alternate(path, "en");
}

export function pick<T>(lang: Lang, v: { id: T; en: T }): T {
  return v[lang];
}

/** Strings shared by every page. */
export const ui = {
  id: {
    home: "Beranda",
    newTab: " (tab baru)",
    otherProducts: "Produk lain dari DyskLab",
    customSoftware: "Butuh software kustom?",
    faq: "Pertanyaan umum",
    privacy: "Privasi",
    support: "Dukung",
    star: "Star di GitHub",
    stars: (n: number) => `${n} star`,
    coffee: "Traktir kopi",
    supportTitle: (p: string) => `${p} gratis dan open source.`,
    supportText: "Tidak ada iklan, akun, atau versi berbayar. Kalau bermanfaat, dua hal ini sangat membantu:",
    starWhy: "Bantu orang lain menemukan proyek ini",
    coffeeWhy: "Membiayai waktu untuk fitur dan perbaikan berikutnya",
    switchTo: "English",
    switchLabel: "Switch to English",
    navLabel: (p: string) => `Navigasi ${p}`,
  },
  en: {
    home: "Home",
    newTab: " (new tab)",
    otherProducts: "More from DyskLab",
    customSoftware: "Need custom software?",
    faq: "FAQ",
    privacy: "Privacy",
    support: "Support",
    star: "Star on GitHub",
    stars: (n: number) => `${n} ${n === 1 ? "star" : "stars"}`,
    coffee: "Buy me a coffee",
    supportTitle: (p: string) => `${p} is free and open source.`,
    supportText: "No ads, no accounts, no paid tier. If it helps you, these two things help a lot:",
    starWhy: "Helps other people find the project",
    coffeeWhy: "Pays for the time behind the next features and fixes",
    switchTo: "Bahasa Indonesia",
    switchLabel: "Ganti ke Bahasa Indonesia",
    navLabel: (p: string) => `${p} navigation`,
  },
} satisfies Record<Lang, Record<string, unknown>>;
