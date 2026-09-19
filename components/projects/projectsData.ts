export type ProjectScreenshot = {
  src: string;
  alt: string;
};

export type Project = {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  technologies: string[];
  image: string;
  imageAlt: string;
  screenshots?: ProjectScreenshot[];
  repoUrl?: string;
  externalUrl?: string;
  buttonLabel?: string;
  target?: "_blank";
  rel?: string;
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
    screenshots: [
      {
        src: "/assets/projects/ignis-safe-website/ignis_safe_landing.png",
        alt: "IGNIS SAFE website landing page on desktop",
      },
      {
        src: "/assets/projects/ignis-safe-website/landing_mobile.png",
        alt: "IGNIS SAFE website landing page on mobile",
      },
    ],
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
    screenshots: [
      { src: "/assets/projects/ignis-safe-mobile/hero.svg", alt: "IGNIS SAFE mobile home screen preview" },
      {
        src: "/assets/projects/ignis-safe-mobile/screen-dashboard.svg",
        alt: "IGNIS SAFE mobile lesson dashboard screen",
      },
      {
        src: "/assets/projects/ignis-safe-mobile/screen-detail.svg",
        alt: "IGNIS SAFE mobile assessment screen",
      },
    ],
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
    screenshots: [
      { src: "/assets/projects/itso-id-tracker/hero.svg", alt: "ITSO ID Tracker home preview" },
      {
        src: "/assets/projects/itso-id-tracker/screen-dashboard.svg",
        alt: "ITSO ID Tracker records dashboard screen",
      },
      {
        src: "/assets/projects/itso-id-tracker/screen-detail.svg",
        alt: "ITSO ID Tracker request detail screen",
      },
    ],
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
    screenshots: [
      { src: "/assets/projects/beautiverse/hero.svg", alt: "Beautiverse storefront preview" },
      {
        src: "/assets/projects/beautiverse/screen-dashboard.svg",
        alt: "Beautiverse storefront catalog screen",
      },
      {
        src: "/assets/projects/beautiverse/screen-detail.svg",
        alt: "Beautiverse product detail screen",
      },
    ],
    repoUrl: "https://github.com/andreii2404/Beautiverse-digi",
  },
  {
    id: "focusit",
    slug: "focusit",
    category: "Temporary category (unverified)",
    title: "FOCUSIT",
    description:
      "Temporary description (unverified): detailed project information is pending confirmation.",
    technologies: ["Unverified"],
    image: "/assets/projects/focusit/focusit-screenshot.png",
    imageAlt: "FOCUSIT project screenshot exported from Figma",
    screenshots: [
      {
        src: "/assets/projects/focusit/focusit-screenshot.png",
        alt: "FOCUSIT project screenshot exported from Figma",
      },
    ],
    externalUrl:
      "https://www.figma.com/make/qqKN0sSjlFwNrpX316zFXe/FOCUSIT---FINAL-FINAL?t=vKefT98pNXZhE5ff-6",
    buttonLabel: "Explore Project",
    target: "_blank",
    rel: "noreferrer",
  },
  {
    id: "maddy-cassy",
    slug: "maddy-cassy",
    category: "Web Application · Equipment Rental & Commerce",
    title: "Maddy & Cassy Rentals",
    description:
      "A Next.js and Supabase rental platform for camera and mobile gear, handling bookings, manual GCash payment verification, and automatically generated invoices and rental agreements.",
    technologies: ["Next.js", "TypeScript", "Supabase"],
    image: "/assets/projects/maddy-cassy/screenshot-1.webp",
    imageAlt: "Maddy & Cassy Rentals placeholder preview",
    screenshots: [
      {
        src: "/assets/projects/maddy-cassy/screenshot-1.webp",
        alt: "Maddy & Cassy Rentals placeholder preview 1",
      },
      {
        src: "/assets/projects/maddy-cassy/screenshot-2.webp",
        alt: "Maddy & Cassy Rentals placeholder preview 2",
      },
      {
        src: "/assets/projects/maddy-cassy/screenshot-3.webp",
        alt: "Maddy & Cassy Rentals placeholder preview 3",
      },
    ],
    externalUrl: "https://github.com/andreii2404/maddyandcassyrentals",
    buttonLabel: "View Repository",
    target: "_blank",
    rel: "noreferrer",
  },
];
