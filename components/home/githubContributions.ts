const CONTRIBUTIONS_API = "https://github-contributions-api.jogruber.de/v4";

type ContributionDay = {
  date: string;
  count: number;
  level: number;
};

type ContributionsResponse = {
  total: Record<string, number>;
  contributions: ContributionDay[];
};

export type GithubContributions = {
  weeks: (ContributionDay | null)[][];
  totalLastYear: number;
};

function toWeeks(days: ContributionDay[]): (ContributionDay | null)[][] {
  if (days.length === 0) return [];

  const firstWeekday = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const cells: (ContributionDay | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...days,
  ];

  const trailing = (7 - (cells.length % 7)) % 7;
  cells.push(...Array.from({ length: trailing }, () => null));

  const weeks: (ContributionDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export async function getGithubContributions(username: string): Promise<GithubContributions | null> {
  try {
    const response = await fetch(`${CONTRIBUTIONS_API}/${username}?y=last`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data: ContributionsResponse = await response.json();
    if (!data?.contributions?.length) return null;

    return {
      weeks: toWeeks(data.contributions),
      totalLastYear: data.total?.lastYear ?? 0,
    };
  } catch {
    return null;
  }
}
