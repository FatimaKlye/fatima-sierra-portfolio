// Derived views over the verified skill and project data — nothing is retyped here.
// "Used in" links come only from each project's own technology list and stack.

import { CORE_KNOWLEDGE, TECHNOLOGY_GROUPS, type TechnologyItem } from "@/components/about/aboutData";
import { PROJECTS } from "@/components/projects/projectsData";
import { PROJECT_DETAILS } from "@/data/projectDetailsData";

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

/** Every project, in portfolio order, with the preview image used by the hover peek. */
export const SKILL_PROJECTS = PROJECTS.map((project) => ({
  slug: project.slug,
  title: project.title,
  category: project.category,
  image: project.image,
}));

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
};

/** The eight knowledge areas, each joined to its tools and the projects that prove it. */
export const PRACTICE_AREAS: PracticeArea[] = PRACTICE_CONFIG.flatMap((config) => {
  const knowledge = CORE_KNOWLEDGE.find((item) => item.title === config.title);
  if (!knowledge) return [];
  const tools = pick(config.tools);
  return [
    {
      id: config.id,
      title: knowledge.title,
      tier: config.tier,
      summary: config.summary,
      description: knowledge.description,
      topics: topicsOf(knowledge.description, tools),
      tools,
      projects: config.evidence ? unionProjects(pick(config.evidence)) : [],
      repos: config.repos
        ? PROJECTS.flatMap((project) => (project.repoUrl ? [{ title: project.title, url: project.repoUrl }] : []))
        : [],
    },
  ];
});
