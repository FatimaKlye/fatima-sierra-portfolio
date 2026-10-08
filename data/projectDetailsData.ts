/**
 * Single source of truth for the /projects/[slug] case-study pages.
 *
 * Every statement here is traceable to one of:
 *  - the résumé (public/assets/resume/Fatima-Klye-Sierra-Resume-2026.pdf)
 *  - the project's own repository / package files
 *  - the project's live site or the real screenshots in /public/assets/projects
 *
 * Do not add achievements, metrics, images or links that cannot be verified.
 * Optional fields are simply omitted when nothing verified exists — the page
 * hides the matching section instead of filling it with guesses.
 */

/** A rectangle (in % of the image) hidden behind a blurred patch, e.g. a personal email in a screenshot. */
export type MediaRedaction = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type ProjectMedia = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  /** Short screen name used by the device gallery, e.g. "Sign in". */
  label?: string;
  /**
   * "browser" wraps the image in a browser window; "plain" is a soft rounded frame;
   * "phone" places a full-height phone screenshot inside a handset mockup.
   */
  frame: "browser" | "plain" | "phone";
  /** Domain shown in the browser frame's address bar. */
  url?: string;
  redact?: MediaRedaction[];
};

export type ProjectFeature = {
  title: string;
  description: string;
};

export type ProjectStep = {
  title: string;
  description?: string;
};

export type ProjectChallenge = {
  challenge: string;
  solution: string;
};

export type ProjectOutcome = {
  /** Short headline value, e.g. "v1.0.0". Omit for text-only outcomes. */
  stat?: string;
  label: string;
  detail?: string;
};

export type ProjectStackGroup = {
  label: string;
  items: string[];
};

export type ProjectLinks = {
  liveUrl?: string;
  repoUrl?: string;
  videoUrl?: string;
  /** Direct link to a released Android package. */
  apkUrl?: string;
};

/** A downloadable build, described only with facts read from the released file. */
export type ProjectDownload = {
  url: string;
  host: string;
  version: string;
  size: string;
  platform: string;
  architecture: string;
  format: string;
  steps: string[];
  note: string;
  /** Where the download is published (e.g. the website's download page). */
  preview?: ProjectMedia;
};

export type EcosystemSurface = {
  slug: string;
  kind: string;
  name: string;
  role: string;
  media: ProjectMedia;
};

/** How two projects form one system: the surfaces and the verified links between them. */
export type ProjectEcosystem = {
  title: string;
  intro: string;
  hub: string;
  surfaces: [EcosystemSurface, EcosystemSurface];
  connections: ProjectFeature[];
};

export type ProjectDetail = {
  slug: string;
  category: string;
  title: string;
  tagline: string;
  summary: string;
  period?: string;
  role?: string;
  organization?: string;
  status?: string;
  /** Real hero visual. When absent the hero is purely typographic. */
  hero?: ProjectMedia;
  /** Extra phone screens fanned behind a "phone" hero. */
  heroCompanions?: ProjectMedia[];
  overview: {
    what: string;
    purpose?: string;
    audience?: string;
    solves?: string;
  };
  contributions?: string[];
  features: ProjectFeature[];
  /** A user-facing journey (e.g. a booking flow) shown as its own timeline. */
  journey?: { title: string; eyebrow: string; steps: ProjectStep[] };
  /** How the project was built. */
  process?: ProjectStep[];
  gallery: ProjectMedia[];
  challenges?: ProjectChallenge[];
  outcomes?: ProjectOutcome[];
  stack: ProjectStackGroup[];
  links: ProjectLinks;
  download?: ProjectDownload;
  ecosystem?: ProjectEcosystem;
};

const NU = "National University – Dasmariñas";

/* ---------- IGNIS SAFE: shared, verified facts ---------- */

const IGNIS_LIVE_URL = "https://bfp-dasmacfs.com/";
/** Served by the live site as application/vnd.android.package-archive (234,270,526 bytes). */
const IGNIS_APK_URL = "https://bfp-dasmacfs.com/downloads/ignis-safe.apk";

const IGNIS_SCREENS = {
  onboarding: {
    src: "/assets/projects/ignis-safe-mobile/ONBOADING.jpg",
    alt: "IGNIS SAFE splash screen: the fire-truck shield badge with the words 'IGNIS SAFE — Learn, Prepare, Protect'.",
    width: 922,
    height: 2048,
    label: "Onboarding",
    caption: "The splash screen: the IGNIS SAFE badge and its promise to learn, prepare and protect.",
    frame: "phone",
  },
  login: {
    src: "/assets/projects/ignis-safe-mobile/LOGIN.jpg",
    alt: "IGNIS SAFE login screen with email and password fields, Forgot Password, Sign Up and an English / Filipino language toggle.",
    width: 922,
    height: 2048,
    label: "Sign in",
    caption: "Sign in with email and password, reset a forgotten password or sign up — in English or Filipino.",
    frame: "phone",
  },
  learning: {
    src: "/assets/projects/ignis-safe-mobile/LEARNING MATERIALS.jpg",
    alt: "IGNIS SAFE Learning Materials screen with a module progress card (0 of 5) and modules for fire extinguishers, house fires, electrical fires and kitchen fires.",
    width: 922,
    height: 2048,
    label: "Learning Materials",
    caption: "Module progress at a glance and the fire-safety modules, each with its own colour and icon.",
    frame: "phone",
  },
  profile: {
    src: "/assets/projects/ignis-safe-mobile/PROFILE.jpg",
    alt: "IGNIS SAFE My Profile screen showing training progress, recent activity, achievements (0 of 6 medals) and account settings.",
    width: 922,
    height: 2048,
    label: "My Profile",
    caption: "Training progress, recent simulation activity, achievement medals and account settings.",
    frame: "phone",
    // The screenshot shows a real person's email address; keep it unreadable on the portfolio.
    redact: [{ left: 34.6, top: 26.8, width: 40.4, height: 2.6 }],
  },
} satisfies Record<string, ProjectMedia>;

const IGNIS_WEB_LANDING: ProjectMedia = {
  src: "/assets/projects/ignis-safe-website/ignis_safe_landing.png",
  alt: "IGNIS SAFE website home page: the official BFP Dasmariñas City Fire Station portal with the headline 'Protecting lives, property and community'.",
  width: 1897,
  height: 985,
  caption: "Home — service shortcuts for FSIC & FSEC, advisories and station contact.",
  frame: "browser",
  url: "bfp-dasmacfs.com",
};

const IGNIS_WEB_DOWNLOAD: ProjectMedia = {
  src: "/assets/projects/ignis-safe-website/landing_mobile.png",
  alt: "Download IGNIS SAFE page on the website showing the Android app on two phones, version details, a QR code and install steps.",
  width: 1897,
  height: 987,
  caption: "Download page — version details, a QR code and install steps for the Android app.",
  frame: "browser",
  url: "bfp-dasmacfs.com",
};

/** Every connection below is traceable to both codebases (same Supabase project and tables). */
const IGNIS_ECOSYSTEM: ProjectEcosystem = {
  title: "One system, two surfaces",
  intro:
    "IGNIS SAFE is a single fire-safety system. The website is the fire station's public portal and management side; the mobile app is where learners study, test themselves and practise.",
  hub: "Supabase",
  surfaces: [
    {
      slug: "ignis-safe-website",
      kind: "Web platform",
      name: "IGNIS SAFE Website",
      role: "Public portal for the BFP Dasmariñas City Fire Station — services, advisories and the app download.",
      media: IGNIS_WEB_LANDING,
    },
    {
      slug: "ignis-safe-mobile",
      kind: "Mobile application",
      name: "IGNIS SAFE Mobile",
      role: "Android app for learners — modules, assessments, 3D simulations, progress and medals.",
      media: IGNIS_SCREENS.learning,
    },
  ],
  connections: [
    {
      title: "One shared backend",
      description: "The website and the app both connect to the same Supabase project, so they work from the same data.",
    },
    {
      title: "Content managed on the web",
      description:
        "Learning materials and assessment questions are maintained through the website and loaded by the app's modules.",
    },
    {
      title: "Progress flows back",
      description:
        "Module progress and assessment attempts recorded on the phone are stored in the shared tables the website reads.",
    },
    {
      title: "Distributed by the website",
      description: "The Android APK is published on the website's download page, with a QR code and install steps.",
    },
  ],
};

const IGNIS_PROCESS: ProjectStep[] = [
  {
    title: "Analyze",
    description: "Study the Bureau of Fire Protection's requirements for the system.",
  },
  {
    title: "Translate",
    description: "Turn those requirements into workflows, database structures and functional features.",
  },
  {
    title: "Build",
    description: "Develop the web and mobile features with Flutter, React.js and Supabase.",
  },
  {
    title: "Test & debug",
    description: "Test and debug each feature to improve reliability, usability and performance.",
  },
];

export const PROJECT_DETAILS: ProjectDetail[] = [
  {
    slug: "ignis-safe-website",
    category: "Web Application · Public Safety",
    title: "IGNIS SAFE Website",
    tagline: "The official online portal for the BFP Dasmariñas City Fire Station.",
    summary:
      "The web side of IGNIS SAFE: a city fire station portal for fire-safety services, public advisories and FSIC / FSEC application guidance, plus the download page for the IGNIS SAFE Android app.",
    period: "2025 – Present",
    role: "Systems Analyst, Mobile & Web Developer",
    organization: NU,
    status: "Live at bfp-dasmacfs.com",
    hero: IGNIS_WEB_LANDING,
    overview: {
      what: "IGNIS SAFE is a fire-safety learning and 3D simulation system built around requirements from the Bureau of Fire Protection. The website is its public face: it presents the fire station's services and distributes the mobile app.",
      purpose:
        "Give people one place to reach fire-safety services, public advisories, contact details and FSIC / FSEC application guidance.",
      audience:
        "Community members who need the Dasmariñas City Fire Station's services, including anyone preparing an FSIC or FSEC application.",
      solves:
        "Puts station services, advisories, application requirements, hotlines and the app download in a single portal.",
    },
    contributions: [
      "Developed web and mobile features using Flutter, React.js and Supabase for fire-safety learning, assessments, tracking and administration.",
      "Analyzed BFP requirements and translated them into system workflows, database structures and functional features.",
      "Tested and debugged system features to improve reliability, usability and overall performance.",
    ],
    features: [
      {
        title: "FSIC & FSEC guidance",
        description:
          "Requirements and the application process, with a 'Start online application' entry point and a 'View requirements' path.",
      },
      {
        title: "Public advisories",
        description: "A home-page shortcut to the station's latest announcements and updates.",
      },
      {
        title: "Station contact",
        description:
          "Hotlines and official channels, with an emergency banner pointing visitors to call 911 immediately.",
      },
      {
        title: "Android app download",
        description:
          "A download page with version, size and platform details, a QR code and step-by-step install instructions for the IGNIS SAFE app.",
      },
      {
        title: "Built into the header",
        description: "Resources, About Us and Contact menus, a language selector and sign-in are available on every page.",
      },
    ],
    process: IGNIS_PROCESS,
    gallery: [IGNIS_WEB_LANDING, IGNIS_WEB_DOWNLOAD],
    outcomes: [
      {
        stat: "Live",
        label: "Publicly available",
        detail: "Online at bfp-dasmacfs.com.",
      },
      {
        stat: "APK",
        label: "Android app distributed",
        detail: "Hosts the IGNIS SAFE APK (v1.0.6, Android 7.1+) for direct download.",
      },
    ],
    stack: [
      { label: "Interface", items: ["React 19", "Vite", "React Router"] },
      { label: "Data & backend", items: ["Supabase"] },
      { label: "Visuals & documents", items: ["Chart.js", "jsPDF", "QR codes"] },
      { label: "Motion", items: ["GSAP"] },
      { label: "Quality", items: ["ESLint", "Lighthouse"] },
    ],
    links: {
      liveUrl: IGNIS_LIVE_URL,
      repoUrl: "https://github.com/paulosierra797/ignis-safe",
    },
    ecosystem: IGNIS_ECOSYSTEM,
  },
  {
    slug: "ignis-safe-mobile",
    category: "Mobile Application · Educational Technology",
    title: "IGNIS SAFE Mobile Application",
    tagline: "Learn. Practice. Stay prepared.",
    summary:
      "A Flutter app that teaches fire safety through five learning modules that pair assessments and learning materials with 3D simulations, backed by Supabase and tracked per learner.",
    period: "2025 – Present",
    role: "Systems Analyst, Mobile & Web Developer",
    organization: NU,
    status: "v1.0.6 · Android APK available",
    hero: IGNIS_SCREENS.learning,
    heroCompanions: [IGNIS_SCREENS.login, IGNIS_SCREENS.onboarding],
    overview: {
      what: "IGNIS SAFE Mobile is the learner-facing half of the IGNIS SAFE system. It brings focused fire-safety lessons, guided simulations, learning progress and achievement badges into one mobile experience.",
      purpose:
        "Make fire-safety learning active: learners are assessed, study the material, are assessed again, then practise in a 3D simulation.",
      audience:
        "Learners with an IGNIS SAFE account, who sign in with email or Google and have their module progress tracked.",
      solves:
        "Combines lessons, assessments, simulations, progress tracking and medals in a single app.",
    },
    contributions: [
      "Developed mobile and web features using Flutter, React.js and Supabase for fire-safety learning, assessments, tracking and administration.",
      "Analyzed BFP requirements and translated them into system workflows, database structures and functional features.",
      "Tested and debugged system features to improve reliability, usability and overall performance.",
      "Authored 107 of the 138 commits in the app's repository (git history, October 2026).",
    ],
    features: [
      {
        title: "Five learning modules",
        description:
          "Fire extinguisher, house fire, electrical fire, kitchen fire and tenement fire — each a self-contained module with its own materials.",
      },
      {
        title: "3D simulations with Unity",
        description:
          "Simulations are Unity scenes launched from the Flutter app through a platform channel, then hand control back to the app on completion.",
      },
      {
        title: "Progress & history",
        description:
          "A module progress overview and per-module history, stored in Supabase so a learner's results follow their account.",
      },
      {
        title: "Achievement medals",
        description: "Virtual medals earned per module, plus a completion medal for finishing every module.",
      },
      {
        title: "English & Tagalog",
        description: "The app ships with English and Tagalog locales.",
      },
      {
        title: "Accounts, feedback & help",
        description:
          "Sign-up with email verification, password reset, Google sign-in, in-app feedback and an FAQ page.",
      },
    ],
    journey: {
      eyebrow: "Learning journey",
      title: "How a module unfolds",
      steps: [
        { title: "Pre-Assessment", description: "Check what you already know before starting." },
        { title: "Learning Materials", description: "Work through the lesson content for the module." },
        { title: "Post-Assessment", description: "Test what you have learned." },
        { title: "3D Simulation", description: "Practise the response in an interactive scene." },
      ],
    },
    process: IGNIS_PROCESS,
    gallery: [IGNIS_SCREENS.onboarding, IGNIS_SCREENS.login, IGNIS_SCREENS.learning, IGNIS_SCREENS.profile],
    challenges: [
      {
        challenge:
          "Returning from a Unity simulation to Flutter reliably. Leaving the Unity process alive caused a black screen on the next scene launch, and several scripts could trigger a return at the same time, risking a freeze.",
        solution:
          "A ReturnToFlutter helper finishes the Android activity so the Unity process is destroyed and Flutter receives the result, with a guard flag so only one return call ever runs.",
      },
      {
        challenge: "Keeping a Unity-integrated Android build compatible with current Flutter packages.",
        solution:
          "Pinned package_info_plus to 8.0.2, because version 9 needs a newer Kotlin Gradle plugin than the project's Unity-integrated build uses.",
      },
    ],
    outcomes: [
      {
        stat: "v1.0.6",
        label: "Android release",
        detail: "Distributed as an APK for Android 7.1+ (64-bit ARM) through bfp-dasmacfs.com.",
      },
      { stat: "5", label: "Learning modules" },
      { stat: "2", label: "Languages", detail: "English and Tagalog." },
    ],
    stack: [
      { label: "Mobile", items: ["Flutter", "Dart", "Provider"] },
      { label: "Data & auth", items: ["Supabase", "Google Sign-In"] },
      { label: "3D & media", items: ["Unity", "model_viewer_plus", "video_player"] },
    ],
    links: {
      apkUrl: IGNIS_APK_URL,
      repoUrl: "https://github.com/FatimaKlye/ignis_safe_mobile",
    },
    // Read from the released file: versionName and minSdk from its manifest, size from the file itself.
    download: {
      url: IGNIS_APK_URL,
      host: "bfp-dasmacfs.com",
      version: "1.0.6",
      size: "223.4 MB",
      platform: "Android 7.1+",
      architecture: "64-bit ARM",
      format: "APK",
      steps: [
        "Select Download APK on your Android phone.",
        "Open the downloaded ignis-safe.apk file.",
        "If Android asks, allow your browser or file manager to install unknown apps.",
        "Select Install, then open IGNIS SAFE. Turn that install permission off again afterward.",
      ],
      note: "Only install this APK from the official IGNIS SAFE website. Keep Google Play Protect enabled.",
      preview: IGNIS_WEB_DOWNLOAD,
    },
    ecosystem: IGNIS_ECOSYSTEM,
  },
  {
    slug: "itso-id-tracker",
    category: "Web Application · Campus System",
    title: "ITSO ID Tracker",
    tagline: "Status monitoring and record management for ID issuance.",
    summary:
      "An ID processing and tracking system that simplifies how ID issuance is monitored and recorded for the ITSO office.",
    period: "2024 – 2025",
    role: "Web Developer",
    organization: NU,
    overview: {
      what: "ITSO ID Tracker is a web system for processing and tracking IDs, built with Next.js, TypeScript and Supabase.",
      purpose: "Simplify ID issuance and tracking workflows.",
      audience: "The ITSO office, which processes and tracks ID issuance.",
      solves: "Brings status monitoring and record management into one tracking system.",
    },
    contributions: [
      "Developed an ID processing and tracking system using Next.js, TypeScript and Supabase.",
      "Implemented status monitoring and record management, simplifying ID issuance and tracking workflows.",
      "Tested and refined system functions and interfaces, improving usability and data accuracy.",
    ],
    features: [
      {
        title: "Status monitoring",
        description: "Follow each ID through the issuance process by its current status.",
      },
      {
        title: "Record management",
        description: "Keep ID records organised in one place instead of scattered across the process.",
      },
      {
        title: "Streamlined workflow",
        description: "Issuance and tracking steps simplified into a clearer, more consistent flow.",
      },
    ],
    process: [
      { title: "Build", description: "Develop the ID processing and tracking system with Next.js, TypeScript and Supabase." },
      { title: "Implement", description: "Add status monitoring and record management to the issuance workflow." },
      { title: "Test & refine", description: "Test system functions and refine the interfaces for usability and data accuracy." },
    ],
    gallery: [],
    outcomes: [
      { label: "Simplified ID issuance and tracking workflows." },
      { label: "Improved usability and data accuracy through testing and refinement." },
    ],
    stack: [
      { label: "Framework & language", items: ["Next.js", "TypeScript"] },
      { label: "Data & backend", items: ["Supabase"] },
    ],
    links: {
      repoUrl: "https://github.com/seandrodejo/itso-id-tracker1",
    },
  },
  {
    slug: "beautiverse",
    category: "Web Application · Beauty & Commerce",
    title: "Beautiverse",
    tagline: "A beauty storefront and community in one place.",
    summary:
      "A digital beauty storefront and community platform for products, services and user content.",
    period: "2025 – 2026",
    role: "Web Developer",
    organization: NU,
    overview: {
      what: "Beautiverse is a digital beauty storefront and community platform where products, services and user content live together.",
      purpose: "Create a clearer, more accessible browsing experience for beauty products, services and content.",
      solves: "Puts products, services and user content on one platform with a clear browsing flow.",
    },
    contributions: [
      "Developed a digital beauty storefront and community platform for products, services and user content.",
      "Designed responsive interfaces and user flows, creating a clearer and more accessible browsing experience.",
      "Integrated application features and data management, supporting reliable interaction across the platform.",
    ],
    features: [
      {
        title: "Products & services storefront",
        description: "A storefront for browsing beauty products and services.",
      },
      {
        title: "Community content",
        description: "A space for user content alongside the storefront.",
      },
      {
        title: "Responsive interfaces",
        description: "Layouts and user flows designed to stay clear and accessible across screen sizes.",
      },
      {
        title: "Integrated data management",
        description: "Application features connected to managed data for reliable interaction across the platform.",
      },
    ],
    process: [
      { title: "Design", description: "Shape responsive interfaces and user flows for browsing." },
      { title: "Build", description: "Develop the storefront and community platform." },
      { title: "Integrate", description: "Connect application features with data management." },
    ],
    gallery: [],
    outcomes: [
      { label: "A clearer, more accessible browsing experience across products, services and content." },
      { label: "Reliable interaction across the platform through integrated features and data management." },
    ],
    stack: [
      { label: "Framework & language", items: ["Next.js", "TypeScript"] },
      { label: "Data & backend", items: ["Supabase"] },
    ],
    links: {},
  },
  {
    slug: "maddy-cassy",
    category: "Web Application · Equipment Rental & Commerce",
    title: "Maddy & Cassy Rentals",
    tagline: "Rent the gear. Create the moment.",
    summary:
      "A rental platform for cameras and iPhones that handles bookings, manual GCash payment verification, and automatically generated invoices and rental agreements.",
    status: "Live on Vercel",
    hero: {
      src: "/assets/projects/maddy-cassy/screenshot-1.webp",
      alt: "Maddy & Cassy Rentals home page: 'Rent the Gear. Create the Moment.' with a carousel of rental gear including the DJI Osmo Action 6.",
      width: 1440,
      height: 900,
      frame: "browser",
    },
    overview: {
      what: "Rental by Maddy & Cassy is a gear rental platform for premium cameras and iPhones, rented by the day with delivery and pickup across Metro Manila.",
      purpose: "Let customers browse gear, reserve dates, pay and sign their rental agreement online.",
      audience: "Customers in Metro Manila renting cameras and iPhones for trips, events and content.",
      solves:
        "Handles booking, GCash payment verification, invoices and rental agreements in one rental platform.",
    },
    features: [
      {
        title: "Live catalog",
        description: "Cameras and iPhones organised by category, with a daily rate on every listing.",
      },
      {
        title: "GCash checkout",
        description: "Pay a 50% deposit or the full amount through GCash, with manual payment verification.",
      },
      {
        title: "Invoices & agreements",
        description: "Invoices and rental agreements are generated automatically; agreements are signed electronically.",
      },
      {
        title: "Booking tracking",
        description: "A Track Booking action in the hero for following a reservation after it is placed.",
      },
      {
        title: "Customer tools",
        description: "Favorites, a rental cart and in-app messages for each account.",
      },
      {
        title: "Rewards",
        description: "A birthday-month discount and loyalty rewards for repeat renters.",
      },
    ],
    journey: {
      eyebrow: "Booking journey",
      title: "From gear to confirmation",
      steps: [
        { title: "Select gear" },
        { title: "Set reservation dates" },
        { title: "Pay via GCash" },
        { title: "Submit verification documents" },
        { title: "Sign the rental agreement" },
        { title: "Receive confirmation" },
      ],
    },
    gallery: [],
    outcomes: [
      {
        stat: "Live",
        label: "Deployed on Vercel",
        detail: "Publicly available at maddyandcassyrentals-nine.vercel.app.",
      },
      {
        stat: "15+",
        label: "Catalog listings",
        detail: "Cameras and iPhones available to browse and reserve.",
      },
    ],
    stack: [
      { label: "Framework & language", items: ["Next.js", "TypeScript"] },
      { label: "Data & backend", items: ["Supabase"] },
    ],
    links: {
      liveUrl: "https://maddyandcassyrentals-nine.vercel.app/",
      repoUrl: "https://github.com/andreii2404/maddyandcassyrentals",
    },
  },
];

export function getProjectDetailBySlug(slug: string): ProjectDetail | undefined {
  return PROJECT_DETAILS.find((project) => project.slug === slug);
}

export function getProjectPosition(slug: string): { index: number; total: number } {
  return {
    index: PROJECT_DETAILS.findIndex((project) => project.slug === slug),
    total: PROJECT_DETAILS.length,
  };
}

export function getAdjacentProjects(slug: string): {
  previous: ProjectDetail | null;
  next: ProjectDetail | null;
} {
  const index = PROJECT_DETAILS.findIndex((project) => project.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  const previous = PROJECT_DETAILS[(index - 1 + PROJECT_DETAILS.length) % PROJECT_DETAILS.length];
  const next = PROJECT_DETAILS[(index + 1) % PROJECT_DETAILS.length];

  return { previous, next };
}
