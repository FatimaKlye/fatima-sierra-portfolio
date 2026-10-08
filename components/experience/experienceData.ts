// Derived views for the Experience page and its homepage preview. Facts come
// from the verified case studies (data/projectDetailsData.ts) and aboutData.ts.

import { ACHIEVEMENTS, EDUCATION } from "@/components/about/aboutData";
import { PROJECT_DETAILS } from "@/data/projectDetailsData";

export type DevelopmentRole = {
  slug: string;
  project: string;
  category: string;
  role: string;
  period?: string;
  organization?: string;
  summary: string;
};

/** Sort key for periods like "2025 – Present" or "2024 – 2025": latest end first, then latest start. */
const periodRank = (period?: string) => {
  const years = period?.match(/\d{4}/g)?.map(Number) ?? [];
  const end = /present/i.test(period ?? "") ? Infinity : (years[1] ?? years[0] ?? 0);
  return { end, start: years[0] ?? 0 };
};

/** Projects where a verified role is on record, newest first. */
export const DEVELOPMENT_ROLES: DevelopmentRole[] = PROJECT_DETAILS.flatMap((project) =>
  project.role
    ? [
        {
          slug: project.slug,
          project: project.title,
          category: project.category,
          role: project.role,
          period: project.period,
          organization: project.organization,
          summary: project.summary,
        },
      ]
    : []
).sort((a, b) => {
  const left = periodRank(a.period);
  const right = periodRank(b.period);
  return right.end - left.end || right.start - left.start;
});

export const DEANS_LIST = ACHIEVEMENTS.find((entry) => entry.title.startsWith("Dean's Lister"));

export type ExperienceHighlight = {
  date: string;
  type: string;
  title: string;
  detail: string;
};

const latestRole = DEVELOPMENT_ROLES[0];
const college = EDUCATION[0];
const deansListYears = DEANS_LIST?.years.match(/\d{4}–\d{4}/)?.[0];

/** Three headline moments for the homepage. */
export const EXPERIENCE_HIGHLIGHTS: ExperienceHighlight[] = [
  ...(latestRole
    ? [
        {
          date: latestRole.period ?? "",
          type: "Development",
          title: latestRole.role,
          detail: [latestRole.project, latestRole.organization].filter(Boolean).join(" · "),
        },
      ]
    : []),
  {
    date: college.years,
    type: "Education",
    title: college.detail,
    detail: `${college.institution} · ${college.location}`,
  },
  ...(DEANS_LIST
    ? [
        {
          date: deansListYears ? `AY ${deansListYears}` : DEANS_LIST.years,
          type: "Recognition",
          title: DEANS_LIST.title,
          detail: DEANS_LIST.institution,
        },
      ]
    : []),
];
