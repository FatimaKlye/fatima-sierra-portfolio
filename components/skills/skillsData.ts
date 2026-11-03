// Derived views over the verified skill and project data — nothing is retyped here.
// "Used in" links come only from each project's own technology list and stack.

import { CORE_KNOWLEDGE, TECHNOLOGY_GROUPS, type TechnologyItem } from "@/components/about/aboutData";
import { PROJECTS } from "@/components/projects/projectsData";
import { PROJECT_DETAILS, type ProjectMedia } from "@/data/projectDetailsData";

export type SkillProject = { slug: string; title: string };

export type SkillEntry = TechnologyItem & {
  groupId: string;
  groupLabel: string;
  projects: SkillProject[];
};

/** "React 19" counts as React; "Next.js" never matches "Next". */
const matches = (item: string, name: string) => {
  const a = item.toLowerCase();
  const b = name.toLowerCase();
  return a === b || a.startsWith(`${b} `);
};

function projectsUsing(name: string): SkillProject[] {
  return PROJECTS.filter((project) => {
    const detail = PROJECT_DETAILS.find((entry) => entry.slug === project.slug);
    const items = [...project.technologies, ...(detail?.stack.flatMap((group) => group.items) ?? [])];
    return items.some((item) => matches(item, name));
  }).map((project) => ({ slug: project.slug, title: project.title }));
}

export const SKILL_GROUPS = TECHNOLOGY_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  items: group.items.map<SkillEntry>((item) => ({
    ...item,
    groupId: group.id,
    groupLabel: group.label,
    projects: projectsUsing(item.name),
  })),
}));

export const ALL_SKILLS = SKILL_GROUPS.flatMap((group) => group.items);

/** The main tools shown on the homepage, in display order. */
const PREVIEW_NAMES = ["Next.js", "React", "TypeScript", "Flutter", "Dart", "Supabase", "PostgreSQL", "Figma"];

export const PREVIEW_SKILLS = PREVIEW_NAMES.flatMap((name) => {
  const skill = ALL_SKILLS.find((entry) => entry.name === name);
  return skill ? [skill] : [];
});

/* ---------- /skills page views ---------- */

const pick = (names: string[]) =>
  names.flatMap((name) => {
    const skill = ALL_SKILLS.find((entry) => entry.name === name);
    return skill ? [skill] : [];
  });

const unionProjects = (skills: SkillEntry[]) =>
  PROJECTS.filter((project) => skills.some((skill) => skill.projects.some((entry) => entry.slug === project.slug))).map(
    (project) => ({ slug: project.slug, title: project.title })
  );

const detailOf = (slug: string) => PROJECT_DETAILS.find((entry) => entry.slug === slug);

/** The case study's own hero screenshot, so every preview is the real interface. */
const heroOf = (slug: string): ProjectMedia => {
  const project = PROJECTS.find((entry) => entry.slug === slug);
  return (
    detailOf(slug)?.hero ?? {
      src: project?.image ?? "",
      alt: project?.imageAlt ?? "",
      width: 960,
      height: 720,
      frame: "plain",
    }
  );
};

/** Every project, in portfolio order, with its real hero screenshot. */
export const SKILL_PROJECTS = PROJECTS.map((project) => ({
  slug: project.slug,
  title: project.title,
  category: detailOf(project.slug)?.category ?? project.category,
  media: heroOf(project.slug),
}));

export type SkillProjectPreview = (typeof SKILL_PROJECTS)[number];

/** The constellation: interface tools on one side, mobile and data on the other, projects between. */
export const STACK_SIDES = [
  { id: "interface", label: "Interface", items: SKILL_GROUPS.find((group) => group.id === "frontend")?.items ?? [] },
  {
    id: "mobile-data",
    label: "Mobile & data",
    items: SKILL_GROUPS.filter((group) => group.id === "mobile" || group.id === "backend-database").flatMap(
      (group) => group.items
    ),
  },
];

/** Hero diagram: the three layers I build, each with its main tools. */
export const STACK_LAYERS = [
  { id: "interface", label: "Interface", builds: "Web apps", tools: pick(["Next.js", "React", "TypeScript"]) },
  { id: "mobile", label: "Mobile", builds: "Android apps", tools: pick(["Flutter", "Dart"]) },
  { id: "data", label: "Data", builds: "Auth & storage", tools: pick(["Supabase", "PostgreSQL"]) },
];

type PracticeConfig = {
  id: string;
  title: string;
  tier: "build" | "support";
  /** How the skill shows up in practice — wording kept to what the portfolio already documents. */
  summary: string;
  tools: string[];
  /** Tools whose verified project lists count as evidence for this area. */
  evidence?: string[];
  repos?: boolean;
};

const PRACTICE_CONFIG: PracticeConfig[] = [
  {
    id: "web",
    title: "Web Application Development",
    tier: "build",
    summary: "Building responsive web interfaces, reusable components and interactive pages.",
    tools: ["Next.js", "React", "TypeScript", "JavaScript", "HTML", "CSS"],
    evidence: ["Next.js", "React", "TypeScript"],
  },
  {
    id: "mobile",
    title: "Mobile Application Development",
    tier: "build",
    summary: "Developing mobile application features and interfaces, connected to live data.",
    tools: ["Flutter", "Dart", "Supabase"],
    evidence: ["Flutter", "Dart"],
  },
  {
    id: "database",
    title: "Database Integration",
    tier: "build",
    summary: "Managing application data, authentication and backend integration.",
    tools: ["Supabase", "PostgreSQL"],
    evidence: ["Supabase", "PostgreSQL"],
  },
  {
    id: "ui",
    title: "UI and User Experience",
    tier: "support",
    summary: "Planning layouts, designing interfaces and prototyping concepts before they are built.",
    tools: ["Figma"],
  },
  {
    id: "testing",
    title: "Application Testing",
    tier: "support",
    summary: "Preparing test cases, validating features and debugging until the system behaves.",
    tools: ["Visual Studio Code"],
  },
  {
    id: "documentation",
    title: "System Documentation",
    tier: "support",
    summary: "Organizing requirements and explaining how a system works, for handoff and presentation.",
    tools: ["Canva"],
  },
  {
    id: "version-control",
    title: "Version Control",
    tier: "support",
    summary: "Managing source code, version history and collaboration.",
    tools: ["Git", "GitHub"],
    repos: true,
  },
  {
    id: "ai",
    title: "AI-Assisted Development",
    tier: "support",
    summary: "Supporting research, debugging, planning and development workflows.",
    tools: ["ChatGPT", "Claude", "Cursor"],
  },
];

/* ---------- Evidence shown beside each build area ---------- */

export type BrowserShot = {
  slug: string;
  title: string;
  media: ProjectMedia;
  /** Address shown in the browser bar — the live domain when there is one. */
  address?: string;
  liveUrl?: string;
};

export type DataClient = { slug: string; title: string; tool?: SkillEntry; does: string };

export type DataSystem = {
  id: string;
  title: string;
  clients: DataClient[];
  hub: { title: string; detail: string; tool?: SkillEntry };
  note?: string;
};

export type PracticeShowcase =
  | { kind: "browser"; shots: BrowserShot[] }
  | { kind: "phones"; slug: string; title: string; front: ProjectMedia; back: ProjectMedia[]; repoUrl?: string }
  | { kind: "diagram"; systems: DataSystem[] };

const hostOf = (url?: string) => (url ? new URL(url).host : undefined);

const browserShot = (slug: string): BrowserShot => {
  const detail = detailOf(slug);
  const media = heroOf(slug);
  return {
    slug,
    title: detail?.title ?? slug,
    media,
    address: media.url ?? hostOf(detail?.links.liveUrl),
    liveUrl: detail?.links.liveUrl,
  };
};

const tool = (name: string) => ALL_SKILLS.find((entry) => entry.name === name);

/*
 * The data diagram only draws what the case studies already state: the IGNIS SAFE
 * ecosystem section (both surfaces on one Supabase project), the mobile repo's own
 * SQL migrations, and the Maddy & Cassy integration contribution. No table names,
 * keys or records.
 */
const DATA_SYSTEMS: DataSystem[] = [
  {
    id: "ignis",
    title: "IGNIS SAFE",
    clients: [
      {
        slug: "ignis-safe-website",
        title: "IGNIS SAFE Website",
        tool: tool("React"),
        does: "Manages learning materials and assessment questions; reads learner progress",
      },
      {
        slug: "ignis-safe-mobile",
        title: "IGNIS SAFE Mobile",
        tool: tool("Flutter"),
        does: "Signs learners in; saves module progress and assessment attempts",
      },
    ],
    hub: { title: "Supabase", detail: "Auth · PostgreSQL · one shared project", tool: tool("Supabase") },
    note: "17 of the 23 SQL migrations in the app repository are mine.",
  },
  {
    id: "maddy",
    title: "Maddy & Cassy Rentals",
    clients: [
      {
        slug: "maddy-cassy",
        title: "Maddy & Cassy Rentals",
        tool: tool("Next.js"),
        does: "Rental catalog, bookings and admin tools",
      },
    ],
    hub: { title: "Supabase", detail: "Inventory migrated from Firebase", tool: tool("Supabase") },
  },
];

const showcaseFor = (id: string, projects: SkillProject[]): PracticeShowcase | undefined => {
  if (id === "web") return { kind: "browser", shots: projects.map((project) => browserShot(project.slug)) };
  if (id === "mobile") {
    const detail = detailOf("ignis-safe-mobile");
    if (!detail?.hero) return undefined;
    return {
      kind: "phones",
      slug: detail.slug,
      title: detail.title,
      front: detail.hero,
      back: detail.heroCompanions ?? [],
      repoUrl: detail.links.repoUrl,
    };
  }
  if (id === "database") return { kind: "diagram", systems: DATA_SYSTEMS };
  return undefined;
};

/** Splits "A, B, and C." into topics, dropping any already shown as a tool logo. */
const topicsOf = (description: string, tools: SkillEntry[]) =>
  description
    .replace(/\.$/, "")
    .split(/,\s*(?:and\s+)?/)
    .filter((topic) => !tools.some((tool) => tool.name === topic));

export type PracticeArea = {
  id: string;
  title: string;
  tier: "build" | "support";
  summary: string;
  description: string;
  topics: string[];
  tools: SkillEntry[];
  projects: SkillProject[];
  repos: { title: string; url: string }[];
  showcase?: PracticeShowcase;
};

/** The eight knowledge areas, each joined to its tools and the projects that prove it. */
export const PRACTICE_AREAS: PracticeArea[] = PRACTICE_CONFIG.flatMap((config) => {
  const knowledge = CORE_KNOWLEDGE.find((item) => item.title === config.title);
  if (!knowledge) return [];
  const tools = pick(config.tools);
  const projects = config.evidence ? unionProjects(pick(config.evidence)) : [];
  return [
    {
      id: config.id,
      title: knowledge.title,
      tier: config.tier,
      summary: config.summary,
      description: knowledge.description,
      topics: topicsOf(knowledge.description, tools),
      tools,
      projects,
      repos: config.repos
        ? PROJECTS.flatMap((project) => {
            const url = detailOf(project.slug)?.links.repoUrl ?? project.repoUrl;
            return url ? [{ title: project.title, url }] : [];
          })
        : [],
      showcase: showcaseFor(config.id, projects),
    },
  ];
});
