/*
  Star counts read once per build from the GitHub API (no token needed for a handful of
  repos; GITHUB_TOKEN is used when set). A failed request gives null, and the page then
  shows the Star button without a number.
*/
const cache = new Map<string, Promise<number | null>>();

export function stars(repo: string): Promise<number | null> {
  if (!cache.has(repo)) cache.set(repo, load(repo));
  return cache.get(repo)!;
}

async function load(repo: string): Promise<number | null> {
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "dysklab-site" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

/** Total stars over several repos; null when none could be read. */
export async function totalStars(repos: string[]): Promise<number | null> {
  const all = await Promise.all(repos.map(stars));
  const known = all.filter((n): n is number => n !== null);
  return known.length ? known.reduce((a, b) => a + b, 0) : null;
}
