import { PROJECTS } from "@/components/projects/projectsData";
import { ALL_SKILLS } from "@/components/skills/skillsData";
import { getProjectDetailBySlug, type ProjectMedia } from "@/data/projectDetailsData";

/**
 * Each chapter on /projects gets its own composition. The layout is chosen per
 * project, but every value shown inside it comes from the verified case-study data.
 */
export type ChapterLayout = "cinema" | "night" | "track" | "stack" | "spread";

const LAYOUTS: Record<string, ChapterLayout> = {
  "ignis-safe-website": "cinema",
  "ignis-safe-mobile": "night",
  "itso-id-tracker": "track",
  beautiverse: "stack",
  "maddy-cassy": "spread",
};

/** Short labels for the hero index, where the full "Web Application · …" category is too long. */
const KINDS: Record<string, string> = {
  "ignis-safe-website": "Web platform",
  "ignis-safe-mobile": "Android app",
  "itso-id-tracker": "Campus system",
  beautiverse: "E-commerce prototype",
  "maddy-cassy": "Rental platform",
};

export const pad = (value: number) => String(value).padStart(2, "0");

export const SHOWCASE_PROJECTS = PROJECTS.map((project, index) => {
  const detail = getProjectDetailBySlug(project.slug);
  const fallback = project.screenshots?.[0] ?? { src: project.image, alt: project.imageAlt };

  const hero: ProjectMedia = detail?.hero ?? {
    src: fallback.src,
    alt: fallback.alt,
    width: 960,
    height: 720,
    frame: "plain",
  };
  // Real screens only: the hero first, then its phone companions and the rest of the case-study gallery.
  const screens = [hero, ...(detail?.heroCompanions ?? []), ...(detail?.gallery ?? [])].filter(
    (media, at, list) => list.findIndex((other) => other.src === media.src) === at
  );

  const stack = Array.from(
    new Set([...(detail?.stack.flatMap((group) => group.items) ?? []), ...project.technologies])
  ).slice(0, 6);

  return {
    number: pad(index + 1),
    slug: project.slug,
    href: `/projects/${project.slug}`,
    layout: LAYOUTS[project.slug] ?? "spread",
    kind: KINDS[project.slug] ?? project.category,
    title: project.title,
    category: project.category,
    tagline: detail?.tagline,
    summary: detail?.summary ?? project.description,
    roles: detail?.roles ?? (detail?.role ? [detail.role] : []),
    period: detail?.period,
    status: detail?.status,
    /** My own first contribution, word for word from the case study. */
    contribution: detail?.contributions?.[0]?.text,
    highlights: detail?.features.slice(0, 3).map((feature) => feature.title) ?? [],
    stack,
    hero,
    screens,
    liveUrl: detail?.links.liveUrl,
    apkUrl: detail?.links.apkUrl,
    apkSize: detail?.download?.size,
    repoUrl: detail?.links.repoUrl ?? project.repoUrl ?? project.externalUrl,
    /** Same matching as the skill counts, so "?tech=React" highlights exactly the projects counted for React. */
    skills: ALL_SKILLS.filter((skill) => skill.projects.some((entry) => entry.slug === project.slug)).map(
      (skill) => skill.name
    ),
  };
});

export type ShowcaseProject = (typeof SHOWCASE_PROJECTS)[number];

const count = (predicate: (project: ShowcaseProject) => boolean) => pad(SHOWCASE_PROJECTS.filter(predicate).length);

const firstYear = Math.min(
  ...SHOWCASE_PROJECTS.map((project) => Number(project.period?.match(/\d{4}/)?.[0] ?? Infinity))
);

/** Counted from the data, never typed in by hand. */
export const PROJECT_STATS = [
  { value: pad(SHOWCASE_PROJECTS.length), label: "Projects" },
  { value: count((project) => project.category.startsWith("Web")), label: "Web apps" },
  { value: count((project) => project.category.startsWith("Mobile")), label: "Mobile app" },
  { value: count((project) => Boolean(project.liveUrl)), label: "Live sites" },
  ...(Number.isFinite(firstYear) ? [{ value: String(firstYear), label: "Building since" }] : []),
];
