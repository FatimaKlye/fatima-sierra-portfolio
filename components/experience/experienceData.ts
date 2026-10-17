// Derived views for the Experience page and its homepage preview. Facts come
// from the verified case studies (data/projectDetailsData.ts) and aboutData.ts.

import { ACHIEVEMENTS, EDUCATION } from "@/components/about/aboutData";
import { PROJECT_DETAILS, type ProjectContribution } from "@/data/projectDetailsData";

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

export type DevelopmentExperience = {
  role: string;
  period?: string;
  organization?: string;
  projects: { slug: string; project: string; category: string }[];
  /** What I personally did, once per kind of work across the grouped projects. */
  contributions: ProjectContribution[];
};

/**
 * One entry per role: projects that share the same title, period and organisation
 * (IGNIS SAFE's website and app) are listed together instead of as repeated rows.
 */
export const DEVELOPMENT_EXPERIENCE: DevelopmentExperience[] = DEVELOPMENT_ROLES.reduce<DevelopmentExperience[]>(
  (groups, entry) => {
    const contributions = PROJECT_DETAILS.find((project) => project.slug === entry.slug)?.contributions ?? [];
    const group = groups.find(
      (item) => item.role === entry.role && item.period === entry.period && item.organization === entry.organization
    );

    if (!group) {
      groups.push({
        role: entry.role,
        period: entry.period,
        organization: entry.organization,
        projects: [{ slug: entry.slug, project: entry.project, category: entry.category }],
        contributions: [...contributions],
      });
      return groups;
    }

    group.projects.push({ slug: entry.slug, project: entry.project, category: entry.category });
    // A sibling project adds only the kinds of work not already described (e.g. its version-control record).
    const knownAreas = new Set(group.contributions.map((item) => item.area));
    group.contributions.push(...contributions.filter((item) => !knownAreas.has(item.area)));
    return groups;
  },
  []
);

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
