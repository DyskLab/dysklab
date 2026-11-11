/*
  Resolves a direct download link at build time. GitHub's /releases/latest skips
  pre-releases (all DyskLink releases are pre-releases), so we ask the API for the
  newest non-draft release and pick the asset whose name matches. If the API can't be
  reached, the link falls back to the repo's releases page.
*/
export type Download = { url: string; version: string | null; file: string | null };

const cache = new Map<string, Promise<Download>>();

export function download(repo: string, match: RegExp): Promise<Download> {
  const key = `${repo} ${match}`;
  if (!cache.has(key)) cache.set(key, resolve(repo, match));
  return cache.get(key)!;
}

async function resolve(repo: string, match: RegExp): Promise<Download> {
  const fallback: Download = { url: `https://github.com/${repo}/releases`, version: null, file: null };
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "dysklab-site" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=10`, { headers });
    if (!res.ok) return fallback;
    const releases = (await res.json()) as { draft: boolean; tag_name: string; assets: { name: string; browser_download_url: string }[] }[];
    for (const r of releases) {
      if (r.draft) continue;
      const asset = r.assets.find((a) => match.test(a.name));
      if (asset) return { url: asset.browser_download_url, version: r.tag_name.replace(/^v/, ""), file: asset.name };
    }
    return fallback;
  } catch {
    return fallback;
  }
}
