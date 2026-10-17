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

const ITSO_DIR = "/assets/projects/itso-id-tracker";
const ITSO_SCREENS = {
  home: {
    src: `${ITSO_DIR}/ITSO ID TRACKER - FINALS PRESENTATION VERSION 1 (1).png`,
    alt: "ITSO ID Tracker home page: a welcome headline beside an NU Dasmariñas student ID card on a lanyard",
  },
  calendar: {
    src: `${ITSO_DIR}/ITSO ID TRACKER - FINALS PRESENTATION VERSION 1 (2).png`,
    alt: "ITSO ID Tracker public calendar showing available appointment slots for August 2025",
  },
  booking: {
    src: `${ITSO_DIR}/ITSO ID TRACKER - FINALS PRESENTATION VERSION 1 (3).png`,
    alt: "ITSO ID Tracker student dashboard for booking an appointment, with a calendar and an appointments panel",
  },
  admin: {
    src: `${ITSO_DIR}/ITSO ID TRACKER - FINALS PRESENTATION VERSION 1 (4).png`,
    alt: "ITSO ID Tracker admin dashboard with user accounts, pending and completed appointments and analytics",
  },
};

const BEAUTIVERSE_DIR = "/assets/projects/beautiverse";
const BEAUTIVERSE_SCREENS = {
  admin: {
    src: `${BEAUTIVERSE_DIR}/beautiverse_2.png`,
    alt: "Beautiverse admin dashboard with system statistics for users, employees, products, stock, orders and revenue",
  },
  profile: {
    src: `${BEAUTIVERSE_DIR}/beautiverse.png`,
    alt: "Beautiverse customer dashboard with profile information and order history",
  },
};

export const PROJECTS: Project[] = [
  {
    id: "ignis-safe-website",
    slug: "ignis-safe-website",
    category: "Web Application · Public Safety",
    title: "IGNIS SAFE Website",
    description:
      "The web management platform of our IGNIS SAFE capstone with BFP Dasmariñas: personnel, attendance, reports and fire-safety learning content, plus a public portal.",
    technologies: ["React", "Vite", "Supabase"],
    image: "/assets/projects/ignis-safe-website.svg",
    imageAlt: "IGNIS SAFE website interface preview",
    screenshots: [
      {
        src: "/assets/projects/ignis-safe-website/ignis_safe_landing.png",
        alt: "IGNIS SAFE website landing page on desktop",
      },
      {
        src: "/assets/projects/ignis-safe-website/landing_mobile.png",
        alt: "IGNIS SAFE website download page for the Android app",
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
      {
        src: "/assets/projects/ignis-safe-mobile/LEARNING MATERIALS.jpg",
        alt: "IGNIS SAFE mobile Learning Materials screen with module progress and fire-safety modules",
      },
      { src: "/assets/projects/ignis-safe-mobile/LOGIN.jpg", alt: "IGNIS SAFE mobile login screen" },
      { src: "/assets/projects/ignis-safe-mobile/ONBOADING.jpg", alt: "IGNIS SAFE mobile splash screen" },
    ],
    repoUrl: "https://github.com/FatimaKlye/ignis_safe_mobile",
  },
  {
    id: "itso-id-tracker",
    slug: "itso-id-tracker",
    category: "Web Application · Campus System",
    title: "ITSO ID Tracker",
    description:
      "A student ID appointment and tracking system for the ITSO office: book by request type, follow the status and know when the ID is ready for pickup.",
    technologies: ["React", "Express", "MongoDB"],
    image: ITSO_SCREENS.home.src,
    imageAlt: ITSO_SCREENS.home.alt,
    screenshots: [ITSO_SCREENS.home, ITSO_SCREENS.calendar, ITSO_SCREENS.booking, ITSO_SCREENS.admin],
    repoUrl: "https://github.com/seandrodejo/itso-id-tracker1",
  },
  {
    id: "beautiverse",
    slug: "beautiverse",
    category: "Web Application · Beauty & Commerce",
    title: "Beautiverse",
    description:
      "A student e-commerce prototype for beauty and makeup products, with customer, employee and admin roles for ordering and order management.",
    technologies: ["React", "PHP", "MySQL"],
    image: BEAUTIVERSE_SCREENS.admin.src,
    imageAlt: BEAUTIVERSE_SCREENS.admin.alt,
    screenshots: [BEAUTIVERSE_SCREENS.admin, BEAUTIVERSE_SCREENS.profile],
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
    imageAlt: "Maddy & Cassy Rentals home page with a carousel of rental gear",
    screenshots: [
      {
        src: "/assets/projects/maddy-cassy/screenshot-1.webp",
        alt: "Maddy & Cassy Rentals home page with a carousel of rental gear",
      },
    ],
    externalUrl: "https://github.com/andreii2404/maddyandcassyrentals",
    buttonLabel: "View Repository",
    target: "_blank",
    rel: "noreferrer",
  },
];
