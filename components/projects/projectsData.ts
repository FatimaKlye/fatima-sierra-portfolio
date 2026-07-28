export type Project = {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  technologies: string[];
  image: string;
  imageAlt: string;
  repoUrl: string;
};

export const PROJECTS: Project[] = [
  {
    id: "ignis-safe-website",
    slug: "ignis-safe-website",
    category: "Web Application · Public Safety",
    title: "IGNIS SAFE Website",
    description:
      "The companion web platform for IGNIS SAFE, delivering fire-safety resources, program information, and administrative tools.",
    technologies: ["Next.js", "TypeScript", "Supabase"],
    image: "/assets/projects/ignis-safe-website.svg",
    imageAlt: "IGNIS SAFE website interface preview",
    repoUrl: "https://github.com/paulosierra797/ignis-safe",
  },
  {
    id: "ignis-safe-mobile",
    slug: "ignis-safe-mobile",
    category: "Mobile Application · Educational Technology",
    title: "IGNIS SAFE Mobile Application",
    description:
      "A mobile fire-safety learning system with structured lessons, assessments, and interactive Unity-based simulations.",
    technologies: ["Flutter", "Dart", "Supabase", "Unity"],
    image: "/assets/projects/ignis-safe-mobile.svg",
    imageAlt: "IGNIS SAFE mobile application interface preview",
    repoUrl: "https://github.com/FatimaKlye/ignis_safe_mobile",
  },
  {
    id: "itso-id-tracker",
    slug: "itso-id-tracker",
    category: "Web Application · Campus System",
    title: "ITSO ID Tracker",
    description:
      "An ID processing and tracking system built for the ITSO office to streamline issuance, status updates, and record-keeping.",
    technologies: ["Next.js", "TypeScript", "Supabase"],
    image: "/assets/projects/itso-id-tracker.svg",
    imageAlt: "ITSO ID Tracker interface preview",
    repoUrl: "https://github.com/seandrodejo/itso-id-tracker1",
  },
  {
    id: "beautiverse",
    slug: "beautiverse",
    category: "Web Application · Beauty & Commerce",
    title: "Beautiverse",
    description:
      "A digital storefront and community platform connecting beauty enthusiasts with products, services, and content.",
    technologies: ["Next.js", "TypeScript", "Supabase"],
    image: "/assets/projects/beautiverse.svg",
    imageAlt: "Beautiverse interface preview",
    repoUrl: "https://github.com/andreii2404/Beautiverse-digi",
  },
];
