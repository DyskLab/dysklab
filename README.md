# DyskLab

Website for DyskLab's open-source products (DyskFiles, DyskFocus, DyskFlow, DyskLink), with custom software
for companies as a secondary section (https://dysklab.fanny.dev). Built with Astro as a static site; it was
split out of the fanny.dev Hugo repo.

Repository: https://github.com/DyskLab/dysklab

```bash
npm install
npm run dev      # http://localhost:4321 (also shows draft case studies/testimonials)
npm run build    # static output in dist/
```

## Languages

Indonesian lives at the root (`/`, `/produk/<slug>/`) and English under `/en/` (`/en/`, `/en/products/<slug>/`).
Every page is a view in `src/views/` rendered twice by thin route files in `src/pages/`; copy is picked with
`pick(lang, { id, en })` from `src/i18n.ts`, which also holds the shared strings and path helpers.

Which language a visitor lands on is decided by the redirects in `vercel.json`: on a first visit, anyone whose
`x-vercel-ip-country` isn't `ID` goes to the English page. The language switcher sets a `dl-lang` cookie that wins
over location afterwards. Crawlers and link previews are never redirected, and `hreflang` links both versions.
These rules only run on Vercel, not in `npm run dev`.

## Layout

- Views: `src/views/Home.astro` and one per product (`DyskFiles`, `DyskFocus`, `DyskFlow`, `DyskLink`), each with
  its own scoped styles
- Shared product parts: `ProductBar` (links, GitHub star, language, CTA), `ProductFooter`, `Privacy`, `Faq`
  (with FAQPage data) and `Support` (Star on GitHub + Buy Me a Coffee). They take their colours from the page's
  `--pb-*` / `--pf-*` variables
- Build-time GitHub data: `src/lib/releases.ts` (direct download of the newest release, pre-releases included) and
  `src/lib/github.ts` (star counts, shown only from 10 up)
- Content for the company section: `src/data/content.ts`
- Shell and SEO: `src/layouts/Base.astro`; logo `src/components/Logo.astro` (ink #14161a, off-white #f7f7f4, blue #4d7cff)
- Images: `public/images/apps/`, `public/images/products/<slug>/`, `public/images/cases/`, share card `public/og.jpg`

Deploy: import the repo into Vercel (Astro is auto-detected) and add the `dysklab.fanny.dev` domain (a CNAME to
`cname.vercel-dns.com`). Set `GITHUB_TOKEN` in Vercel if the GitHub API rate limit is ever hit during builds.
