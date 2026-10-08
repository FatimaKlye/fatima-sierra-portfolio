// Content for the homepage "From Cooking to Coding" About Me section.
// Facts (schools, years, awards, certificates, projects) are looked up from the
// verified sources in aboutData.ts and projectsData.ts — never retyped here — so
// this file only adds the storytelling copy that ties those facts together.

import {
  ACHIEVEMENTS,
  CERTIFICATES,
  EDUCATION,
  LEADERSHIP,
  PROFESSIONAL_SKILLS,
} from "@/components/about/aboutData";
import { PROJECTS } from "@/components/projects/projectsData";

const achievementsTitled = (title: string) => ACHIEVEMENTS.filter((entry) => entry.title === title);
const visibleRole = (role: string) => LEADERSHIP.filter((entry) => !entry.hidden && entry.role === role);

export const ABOUT_PORTRAIT = {
  src: "/assets/about/fatima-sierra-professional.jpg",
  alt: "Portrait of Fatima Klye M. Sierra in a black blazer",
};

/**
 * Optional real photo for the kitchen chapter. Leave as null until a genuine
 * photo exists; set it to e.g. { src: "/assets/about/story/01-where-it-started.jpg", alt: "…" }
 * and it appears in Chapter 01 as a tilted print — no other code changes needed.
 */
export const KITCHEN_PHOTO: { src: string; alt: string } | null = null;

export const COLLEGE = EDUCATION[0];
export const SENIOR_HIGH = EDUCATION[1];

export const MEDALS = [
  ...achievementsTitled("Cookery NC II Passer – Gold Medalist").map((entry) => ({
    ...entry,
    label: "Cookery NC II",
  })),
  ...achievementsTitled("Bread and Pastry Production NC II Passer – Gold Medalist").map((entry) => ({
    ...entry,
    label: "Bread & Pastry Production NC II",
  })),
];

export const SENIOR_HIGH_HONORS = achievementsTitled("With High Honors")[0];

export const HOME_ECONOMICS_AWARDS = LEADERSHIP.filter(
  (entry) => !entry.hidden && entry.organization === "Lyceum Circle of Home Economics Community"
);

export const DEANS_LIST = ACHIEVEMENTS.find((entry) => entry.title.startsWith("Dean's Lister"));

export const IT_SPECIALIST_CERTS = CERTIFICATES.filter((entry) => entry.category === "professional").map(
  (entry) => ({ id: entry.id, title: entry.title, year: entry.date?.slice(-4) ?? "" })
);

export const PHOTOGRAPHER_ROLE = visibleRole("Former Photographer")[0];
export const SERVICE_ROLES = [...visibleRole("Former Registration Committee"), ...visibleRole("Former SECA Inspector")];

export const TEAM_SKILLS = PROFESSIONAL_SKILLS;

export type CodeToken = {
  kind: "keyword" | "fn" | "string" | "tag" | "plain";
  text: string;
};

export type RecipeStep = {
  kitchen: string;
  kitchenLine: string;
  /** Plain-language version of the code line; shown as the code comment and read by screen readers. */
  dev: string;
  code: CodeToken[];
};

// The kitchen → code metaphor behind the whole section ("plan it, build it,
// taste-test, adjust, repeat"). These are habits and analogies, not claims of experience.
export const RECIPE_STEPS: RecipeStep[] = [
  {
    kitchen: "Mise en place",
    kitchenLine: "Prep every ingredient before the heat goes on.",
    dev: "Plan the features before writing a line.",
    code: [
      { kind: "keyword", text: "const " },
      { kind: "plain", text: "plan = " },
      { kind: "fn", text: "scope" },
      { kind: "plain", text: "(requirements);" },
    ],
  },
  {
    kitchen: "Measure precisely",
    kitchenLine: "A spoonful too much changes everything.",
    dev: "Validate every input before it is used.",
    code: [
      { kind: "fn", text: "validate" },
      { kind: "plain", text: "(input, schema);" },
    ],
  },
  {
    kitchen: "Follow the method",
    kitchenLine: "Step by step, in the right order.",
    dev: "Write logic that runs one clear step at a time.",
    code: [
      { kind: "plain", text: "steps." },
      { kind: "fn", text: "forEach" },
      { kind: "plain", text: "((step) => " },
      { kind: "fn", text: "run" },
      { kind: "plain", text: "(step));" },
    ],
  },
  {
    kitchen: "Taste & adjust",
    kitchenLine: "Taste, season, then taste again.",
    dev: "Test, debug, and repeat until it works.",
    code: [
      { kind: "keyword", text: "while " },
      { kind: "plain", text: "(!works) { " },
      { kind: "fn", text: "test" },
      { kind: "plain", text: "(); " },
      { kind: "fn", text: "fix" },
      { kind: "plain", text: "(); }" },
    ],
  },
  {
    kitchen: "Plate with care",
    kitchenLine: "It should look as good as it tastes.",
    dev: "Design interfaces that are responsive and accessible.",
    code: [
      { kind: "tag", text: "<Screen " },
      { kind: "string", text: "responsive accessible" },
      { kind: "tag", text: " />" },
    ],
  },
];

export const MARQUEE_WORDS: { word: string; side: "kitchen" | "code" }[] = [
  { word: "Measure", side: "kitchen" },
  { word: "Plan", side: "code" },
  { word: "Mix", side: "kitchen" },
  { word: "Build", side: "code" },
  { word: "Taste", side: "kitchen" },
  { word: "Test", side: "code" },
  { word: "Plate", side: "kitchen" },
  { word: "Ship", side: "code" },
];

const projectBySlug = (slug: string) => PROJECTS.find((project) => project.slug === slug);

// Real screenshots only (no illustrated mockups) for the "building" chapter.
export const PROJECT_PLATES = [
  {
    slug: "ignis-safe-website",
    src: "/assets/projects/ignis-safe-website/ignis_safe_landing.png",
    alt: "IGNIS SAFE website landing page on desktop",
    sizes: "(max-width: 820px) 92vw, 46vw",
  },
  {
    slug: "ignis-safe-mobile",
    src: "/assets/projects/ignis-safe-mobile/app-preview.png",
    alt: "IGNIS SAFE mobile application splash and learning materials screens",
    sizes: "(max-width: 820px) 60vw, 24vw",
  },
  {
    slug: "maddy-cassy",
    src: "/assets/projects/maddy-cassy/screenshot-1.webp",
    alt: "Maddy & Cassy Rentals home page with a carousel of rental gear",
    sizes: "(max-width: 820px) 80vw, 34vw",
  },
].flatMap((plate) => {
  const project = projectBySlug(plate.slug);
  return project ? [{ ...plate, title: project.title, category: project.category }] : [];
});

export const PROJECT_COUNT = PROJECTS.length;
