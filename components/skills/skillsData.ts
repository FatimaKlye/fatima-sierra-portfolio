// Derived views over the verified skill and project data — nothing is retyped here.
// "Used in" links come only from each project's own technology list and stack.

import { TECHNOLOGY_GROUPS, type TechnologyItem } from "@/components/about/aboutData";
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
