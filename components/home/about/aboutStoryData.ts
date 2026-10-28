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
  // Same asset as the homepage hero portrait — reused, not duplicated.
  src: "/assets/profile/profile_picture.jpg",
  alt: "Portrait of Fatima Klye M. Sierra in a black blazer",
};

/**
 * Moments from Fatima's personal life, revealed around the About portrait on hover
 * (tap on touch screens). The first six are used, in this order — order maps to the
 * collage spots in AboutCollage (first two appear on hover). `width` / `height` are the
 * files' real pixel sizes so each print keeps its own proportions; with an empty list
 * the portrait simply stays a single image, with no hover effect or hint.
 */
export const COLLAGE_PHOTOS: { src: string; alt: string; width: number; height: number }[] = [
  { src: "/assets/profile/pic.jpg", alt: "Fatima smiling in a pink dress at an evening garden celebration", width: 1200, height: 1600 },
  { src: "/assets/profile/bf.jpg", alt: "Fatima and her boyfriend under a heart-shaped flower arch", width: 1200, height: 1600 },
  { src: "/assets/profile/japan.jpg", alt: "Fatima with friends by a lake in Japan, Mount Fuji behind them", width: 1200, height: 1600 },
  { src: "/assets/profile/parents.jpg", alt: "Fatima's parents posing together at home", width: 1200, height: 1600 },
  { src: "/assets/profile/dog.jpg", alt: "Fatima's white Pomeranian in a striped shirt", width: 900, height: 1600 },
  { src: "/assets/profile/lorie.jpg", alt: "Lorie holding two Pomeranians", width: 1200, height: 1600 },
];

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

export const KITCHEN_VALUES = ["Patience", "Precision", "Creativity", "Problem-solving"];

/* Homepage preview story ------------------------------------------------------
   Fatima's own words, kept verbatim — only split into phrases so the meaningful
   ones can be styled. Joining every `text` in order gives the paragraph back. */

export type LoopStepId = "mix" | "taste" | "adjust";

export type StoryPhrase = {
  text: string;
  /** kitchen = dusty rose, code = pink, mark = pink with a highlighter sweep. */
  tone?: "kitchen" | "code" | "mark";
  /** Ties the phrase to its row in STORY_LOOP (underlined, linked on hover). */
  step?: LoopStepId;
};

export const PREVIEW_STORY: { lead: StoryPhrase[]; body: StoryPhrase[]; close: StoryPhrase[] } = {
  lead: [
    { text: "Before I got into coding, I was " },
    { text: "experimenting in the kitchen", tone: "kitchen" },
    { text: "." },
  ],
  body: [
    { text: "I loved " },
    { text: "making something from scratch", step: "mix" },
    { text: ", " },
    { text: "figuring out what went wrong", step: "taste" },
    { text: ", and " },
    { text: "trying again until I got it right", step: "adjust" },
    { text: ". When I discovered coding, I found " },
    { text: "that same curiosity", tone: "code" },
    { text: " in technology." },
  ],
  close: [
    { text: "Now, I build web and mobile apps, and what excites me most is seeing something I've worked on become " },
    { text: "useful to someone else", tone: "mark" },
    { text: "." },
  ],
};

// The same habit, two kitchens — margin notes beside the story, one per step phrase.
export const STORY_LOOP: { id: LoopStepId; kitchen: string; code: string }[] = [
  { id: "mix", kitchen: "Mix", code: "build()" },
  { id: "taste", kitchen: "Taste", code: "debug()" },
  { id: "adjust", kitchen: "Adjust", code: "iterate()" },
];

/* "Honours, Leadership & Education" record ----------------------------------
   One chronological timeline assembled from the verified lists above. Titles,
   organisations and dates are passed through untouched; only the grouping
   (type + starting year) is derived. */

export type RecordType = "award" | "certification" | "leadership" | "education";

export type RecordEntry = {
  id: string;
  type: RecordType;
  title: string;
  organization: string;
  /** The date exactly as recorded (a range, an academic year, or a calendar date). */
  date: string;
  /** Starting year, used only to place the entry on the timeline. */
  year: number;
  location?: string;
};

export const RECORD_TYPES: { id: RecordType; label: string; singular: string }[] = [
  { id: "award", label: "Awards & honours", singular: "Award" },
  { id: "certification", label: "Certifications", singular: "Certification" },
  { id: "leadership", label: "Leadership roles", singular: "Leadership" },
  { id: "education", label: "Education", singular: "Education" },
];

const firstYear = (text: string) => Number(text.match(/\d{4}/)?.[0] ?? 0);

// Leadership records that name an award or recognition (e.g. "Leadership Awardee",
// "Outstanding Club Member") are honours; "Former …" records are roles held.
const isRoleHeld = (role: string) => role.startsWith("Former");
const VISIBLE_LEADERSHIP = LEADERSHIP.filter((entry) => !entry.hidden);
const TYPE_ORDER: RecordType[] = ["education", "award", "leadership", "certification"];

export const RECORD_ENTRIES: RecordEntry[] = [
  ...EDUCATION.map((entry) => ({
    id: `edu-${entry.institution}`,
    type: "education" as const,
    title: entry.detail,
    organization: entry.institution,
    location: entry.location,
    date: entry.years,
    year: firstYear(entry.years),
  })),
  ...ACHIEVEMENTS.map((entry) => ({
    id: `award-${entry.title}`,
    type: "award" as const,
    title: entry.title,
    organization: entry.institution,
    date: entry.years,
    year: firstYear(entry.years),
  })),
  ...VISIBLE_LEADERSHIP.map((entry) => ({
    id: `lead-${entry.organization}-${entry.role}`,
    type: isRoleHeld(entry.role) ? ("leadership" as const) : ("award" as const),
    title: entry.role,
    organization: entry.organization,
    date: entry.years,
    year: firstYear(entry.years),
  })),
  ...CERTIFICATES.filter((entry) => entry.category === "professional").map((entry) => ({
    id: `cert-${entry.id}`,
    type: "certification" as const,
    title: `${entry.type} — ${entry.title}`,
    organization: entry.issuer,
    date: entry.date ?? "",
    year: firstYear(entry.date?.slice(-4) ?? ""),
  })),
]
  .filter((entry) => entry.year > 0)
  .sort((a, b) => a.year - b.year || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type));

/** Timeline rows: one per starting year, in order. */
export const RECORD_YEARS = Array.from(new Set(RECORD_ENTRIES.map((entry) => entry.year))).map((year) => ({
  year,
  entries: RECORD_ENTRIES.filter((entry) => entry.year === year),
}));

/** Certificates beyond the professional ones (completions, workshops, webinars), counted not listed. */
export const OTHER_CERTIFICATE_COUNT = CERTIFICATES.filter((entry) => entry.category !== "professional").length;

export const LEADERSHIP_ROLE_COUNT = VISIBLE_LEADERSHIP.filter((entry) => isRoleHeld(entry.role)).length;

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
    src: "/assets/projects/ignis-safe-mobile/LEARNING MATERIALS.jpg",
    alt: "IGNIS SAFE mobile application Learning Materials screen",
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
