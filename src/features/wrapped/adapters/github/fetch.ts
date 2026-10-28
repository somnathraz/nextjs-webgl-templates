import { WRAPPED_YEAR } from '../../engine/year';
import type { Day, RankItem, Slice, WrappedResult } from '../../engine/types';
import { languageColor } from './languages';

const LOGIN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const REVALIDATE = 60 * 60;
const TOKEN = process.env.GITHUB_TOKEN;

export function isValidLogin(login: string) {
  return LOGIN.test(login);
}

function apiHeaders(): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'nextjs-webgl-templates-wrapped',
    ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
  };
}

async function getJson<T>(
  url: string,
): Promise<{ status: number; body: T | null }> {
  try {
    const res = await fetch(url, {
      headers: apiHeaders(),
      next: { revalidate: REVALIDATE },
    });
    return {
      status: res.status,
      body: res.ok ? ((await res.json()) as T) : null,
    };
  } catch {
    return { status: 0, body: null };
  }
}

const today = () => new Date().toISOString().slice(0, 10);

function clipToYear(days: Day[]) {
  const end = today();
  return days
    .filter((d) => d.date.startsWith(`${WRAPPED_YEAR}-`) && d.date <= end)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

/* ——— Contribution calendar ——————————————————————————————— */

const LEVEL_GUESS = [0, 1, 3, 6, 10];

/** The public profile calendar needs no token and has no API rate limit.
 *  Day cells carry the date; their tooltips carry the exact count. */
async function scrapeCalendar(login: string): Promise<Day[] | null> {
  try {
    const res = await fetch(
      `https://github.com/users/${login}/contributions?from=${WRAPPED_YEAR}-01-01&to=${WRAPPED_YEAR}-12-31`,
      {
        headers: { 'User-Agent': 'nextjs-webgl-templates-wrapped' },
        next: { revalidate: REVALIDATE },
      },
    );
    if (!res.ok) return null;
    const html = await res.text();

    const counts = new Map<string, number>();
    for (const m of html.matchAll(
      /<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g,
    )) {
      const n = /^\s*([\d,]+)\s+contribution/.exec(m[2]);
      counts.set(m[1], n ? Number(n[1].replace(/,/g, '')) : 0);
    }

    const days: Day[] = [];
    for (const [cell] of html.matchAll(
      /<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g,
    )) {
      const date = /data-date="([^"]+)"/.exec(cell)?.[1];
      const id = /\bid="([^"]+)"/.exec(cell)?.[1];
      const level = Number(/data-level="(\d)"/.exec(cell)?.[1] ?? 0);
      if (!date) continue;
      const count =
        id && counts.has(id) ? counts.get(id)! : (LEVEL_GUESS[level] ?? 0);
      days.push({ date, count });
    }
    return days.length ? clipToYear(days) : null;
  } catch {
    return null;
  }
}

/* ——— Authenticated path: one GraphQL round trip ——————————————— */

type GqlLang = { size: number; node: { name: string; color: string | null } };
type GqlRepo = {
  name: string;
  stargazerCount: number;
  pushedAt: string;
  primaryLanguage: { name: string; color: string | null } | null;
  languages: { edges: GqlLang[] };
};
type GqlUser = {
  login: string;
  name: string | null;
  avatarUrl: string;
  repositories: { totalCount: number; nodes: GqlRepo[] };
  contributionsCollection: {
    contributionCalendar: {
      weeks: {
        contributionDays: { date: string; contributionCount: number }[];
      }[];
    };
  };
};

const QUERY = `query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    login name avatarUrl
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes {
        name stargazerCount pushedAt
        primaryLanguage { name color }
        languages(first: 6, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } }
      }
    }
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar { weeks { contributionDays { date contributionCount } } }
    }
  }
}`;

async function fetchGraphql(
  login: string,
): Promise<GqlUser | null | 'missing'> {
  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({
        query: QUERY,
        variables: {
          login,
          from: `${WRAPPED_YEAR}-01-01T00:00:00Z`,
          to: `${WRAPPED_YEAR}-12-31T23:59:59Z`,
        },
      }),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { user: GqlUser | null } };
    if (!json.data) return null;
    return json.data.user ?? 'missing';
  } catch {
    return null;
  }
}

/* ——— Languages + repos ————————————————————————————————— */

function topLanguages(
  weights: Map<string, { w: number; color: string }>,
): Slice[] {
  const sorted = [...weights.entries()]
    .sort((a, b) => b[1].w - a[1].w)
    .slice(0, 5);
  const sum = sorted.reduce((s, [, v]) => s + v.w, 0);
  if (!sum) return [];
  return sorted.map(([name, v]) => ({
    name,
    color: v.color,
    share: v.w / sum,
  }));
}

function topRepos(all: RankItem[], pushed: RankItem[]): RankItem[] {
  const pool = pushed.length ? pushed : all;
  return [...pool].sort((a, b) => b.value - a.value).slice(0, 3);
}

type RestUser = {
  login: string;
  name: string | null;
  avatar_url: string;
};
type RestRepo = {
  name: string;
  fork: boolean;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
};

/* ——— Entry point ——————————————————————————————————————— */

/** One GitHub user's year as engine data. Called through `getWrapped`. */
export async function fetchGithubWrapped(
  login: string,
): Promise<WrappedResult> {
  if (!isValidLogin(login)) return { ok: false, reason: 'not-found' };

  const yearPrefix = `${WRAPPED_YEAR}-`;
  const eventsReq = getJson<{ created_at: string }[]>(
    `https://api.github.com/users/${login}/events/public?per_page=100`,
  );
  const events = async () =>
    ((await eventsReq).body ?? [])
      .map((e) => e.created_at)
      .filter((t) => t.startsWith(yearPrefix));

  if (TOKEN) {
    const user = await fetchGraphql(login);
    if (user === 'missing') return { ok: false, reason: 'not-found' };
    if (user) {
      const weights = new Map<string, { w: number; color: string }>();
      const all: RankItem[] = [];
      const pushed: RankItem[] = [];
      for (const r of user.repositories.nodes) {
        const repo: RankItem = {
          name: r.name,
          value: r.stargazerCount,
          label: r.primaryLanguage?.name,
          color:
            r.primaryLanguage?.color ?? languageColor(r.primaryLanguage?.name),
        };
        all.push(repo);
        if (!r.pushedAt.startsWith(yearPrefix)) continue;
        pushed.push(repo);
        for (const e of r.languages.edges) {
          const prev = weights.get(e.node.name);
          weights.set(e.node.name, {
            w: (prev?.w ?? 0) + e.size,
            color: e.node.color ?? languageColor(e.node.name),
          });
        }
      }
      return {
        ok: true,
        data: {
          kind: 'github',
          id: user.login.toLowerCase(),
          handle: user.login,
          name: user.name || user.login,
          avatar: user.avatarUrl,
          year: WRAPPED_YEAR,
          days: clipToYear(
            user.contributionsCollection.contributionCalendar.weeks.flatMap(
              (w) =>
                w.contributionDays.map((d) => ({
                  date: d.date,
                  count: d.contributionCount,
                })),
            ),
          ),
          breakdown: topLanguages(weights),
          ranking: topRepos(all, pushed),
          events: await events(),
          sample: false,
        },
      };
    }
    // GraphQL failed (bad token, outage) → fall through to the public path
  }

  const [profile, repos, days] = await Promise.all([
    getJson<RestUser>(`https://api.github.com/users/${login}`),
    getJson<RestRepo[]>(
      `https://api.github.com/users/${login}/repos?per_page=100&sort=pushed&type=owner`,
    ),
    scrapeCalendar(login),
  ]);
  if (profile.status === 404) return { ok: false, reason: 'not-found' };
  if (!days)
    return { ok: false, reason: profile.body ? 'unavailable' : 'not-found' };

  // Rate-limited REST still leaves us the calendar — the heart of the story.
  const weights = new Map<string, { w: number; color: string }>();
  const all: RankItem[] = [];
  const pushed: RankItem[] = [];
  for (const r of repos.body ?? []) {
    if (r.fork) continue;
    const repo: RankItem = {
      name: r.name,
      value: r.stargazers_count,
      label: r.language ?? undefined,
      color: languageColor(r.language),
    };
    all.push(repo);
    if (!r.pushed_at.startsWith(yearPrefix)) continue;
    pushed.push(repo);
    if (r.language) {
      const prev = weights.get(r.language);
      weights.set(r.language, { w: (prev?.w ?? 0) + 1, color: repo.color });
    }
  }

  const p = profile.body;
  return {
    ok: true,
    data: {
      kind: 'github',
      id: login.toLowerCase(),
      handle: p?.login ?? login,
      name: p?.name || p?.login || login,
      avatar: p?.avatar_url ?? `https://avatars.githubusercontent.com/${login}`,
      year: WRAPPED_YEAR,
      days,
      breakdown: topLanguages(weights),
      ranking: topRepos(all, pushed),
      events: await events(),
      sample: false,
    },
  };
}
