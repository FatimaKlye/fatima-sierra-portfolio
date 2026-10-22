const CONTRIBUTIONS_API = "https://github-contributions-api.jogruber.de/v4";

/** How often the section re-checks GitHub, shared by the server cache and the client poll. */
export const GITHUB_REFRESH_MS = 5 * 60 * 1000;

export type ContributionDay = {
  date: string;
  count: number;
  level: number;
};

type ContributionsResponse = {
  total: Record<string, number>;
  contributions: ContributionDay[];
};

export type GithubContributions = {
  /** Rolling past ~12 months, oldest first, one entry per calendar day. */
  days: ContributionDay[];
  totalLastYear: number;
  activeDays: number;
  longestStreak: number;
  /** ISO timestamp of when this snapshot was fetched. */
  fetchedAt: string;
};

function longestStreakOf(days: ContributionDay[]): number {
  let longest = 0;
  let current = 0;
  for (const day of days) {
    current = day.count > 0 ? current + 1 : 0;
    longest = Math.max(longest, current);
  }
  return longest;
}

/**
 * Fetches the rolling past-year contribution calendar. `fresh` skips the 5-minute
 * cache for a manual refresh; the upstream API still applies its own caching.
 */
export async function getGithubContributions(
  username: string,
  { fresh = false }: { fresh?: boolean } = {},
): Promise<GithubContributions | null> {
  try {
    const response = await fetch(
      `${CONTRIBUTIONS_API}/${encodeURIComponent(username)}?y=last`,
      fresh ? { cache: "no-store" } : { next: { revalidate: GITHUB_REFRESH_MS / 1000 } },
    );

    if (!response.ok) return null;

    const data: ContributionsResponse = await response.json();
    if (!data?.contributions?.length) return null;

    const days = data.contributions;
    return {
      days,
      totalLastYear: data.total?.lastYear ?? days.reduce((sum, day) => sum + day.count, 0),
      activeDays: days.filter((day) => day.count > 0).length,
      longestStreak: longestStreakOf(days),
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
