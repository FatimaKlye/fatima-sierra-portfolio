/**
 * Single source of truth for the /projects/[slug] case-study pages.
 *
 * Every statement here is traceable to one of:
 *  - the résumé (public/assets/resume/Fatima-Sierra.pdf)
 *  - the project's own repository / package files
 *  - the project's live site or the real screenshots in /public/assets/projects
 *  - the owner's own description of the project (problem, solution, roles)
 *
 * Where the résumé and the repository disagree (e.g. a tech stack), the repository wins.
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

/** A key capability on the case study, optionally shown with a real screenshot or its steps. */
export type ProjectHighlight = ProjectFeature & {
  media?: ProjectMedia;
  steps?: string[];
};

/** One thing I personally did, tagged with the kind of work it was. */
export type ProjectContribution = {
  area: "Development" | "Systems analysis" | "Testing" | "UI/UX design" | "Integration" | "Team role" | "Version control";
  text: string;
};

export type ProjectChallenge = {
  challenge: string;
  solution: string;
  /** Who made the fix, read from the repository's git history. */
  solvedBy: "me" | "team";
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
  /** The full, formal project name when the page title is a shorter surface name. */
  fullName?: string;
  tagline: string;
  /** Used for page metadata, the projects index and the Experience page. */
  summary: string;
  /** One sentence: what the application does, who uses it and what problem it solves. */
  purpose: string;
  /** 2–3 sentences: the need behind the project — what was missing, for whom, and why it mattered. */
  problem: string;
  /** How the project answers that need, in terms of purpose and practical value rather than features. */
  solution: string;
  period?: string;
  /** Résumé job title; also shown on the Experience page and the projects index. */
  role?: string;
  /** Roles shown on the case study when they differ from the résumé title. */
  roles?: string[];
  organization?: string;
  /** An organizational responsibility on the project team, kept apart from development roles. */
  teamRole?: string;
  /** Where my work ends and the team's begins, e.g. a part built mainly by a teammate. */
  teamNote?: string;
  status?: string;
  /** Real hero visual. When absent the hero is purely typographic. */
  hero?: ProjectMedia;
  /** Extra phone screens fanned behind a "phone" hero. */
  heroCompanions?: ProjectMedia[];
  /** My own work only — product capabilities belong in `features`. */
  contributions?: ProjectContribution[];
  /** The 3–4 capabilities that matter most. */
  features: ProjectHighlight[];
  /** Real screenshots; also used by the projects index. */
  gallery: ProjectMedia[];
  challenges?: ProjectChallenge[];
  outcomes?: ProjectOutcome[];
  /** What the project is not (prototype scope, sample data, missing integrations), stated plainly. */
  limitations?: string[];
  /** Grouped by purpose, e.g. Frontend, Backend & database, Development tools. */
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
      role: "Management platform for BFP Dasmariñas personnel, plus the public portal and the app download.",
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

/* ---------- ITSO ID Tracker & Beautiverse: real screenshots ---------- */

const ITSO_DIR = "/assets/projects/itso-id-tracker";
// These exports already include the browser's own window chrome, so they use the "plain" frame
// instead of a second, drawn browser bar.
const ITSO_SCREENS = {
  home: {
    src: `${ITSO_DIR}/ITSO ID TRACKER - FINALS PRESENTATION VERSION 1 (1).png`,
    alt: "ITSO ID Tracker home page: a 'Welcome to ITSO ID Tracker' headline with a Get Started button beside an NU Dasmariñas student ID card on a lanyard.",
    width: 606,
    height: 339,
    label: "Home",
    caption: "Home — a welcome page that points NU Dasmariñas students to ID appointments.",
    frame: "plain",
  },
  calendar: {
    src: `${ITSO_DIR}/ITSO ID TRACKER - FINALS PRESENTATION VERSION 1 (2).png`,
    alt: "ITSO ID Tracker public calendar page showing August 2025 with available appointment slots for the ITSO office.",
    width: 603,
    height: 339,
    label: "Public calendar",
    caption: "Public calendar — available appointment slots, visible before signing in.",
    frame: "plain",
  },
  booking: {
    src: `${ITSO_DIR}/ITSO ID TRACKER - FINALS PRESENTATION VERSION 1 (3).png`,
    alt: "ITSO ID Tracker student dashboard titled 'Book an Appointment' with a calendar marking days that have appointments or are closed, and a panel for the student's appointments.",
    width: 628,
    height: 335,
    label: "Book an appointment",
    caption: "Student dashboard — book a slot, manage the schedule and track ID status.",
    frame: "plain",
    // The screenshot shows a real student's ID number and email address; keep them unreadable.
    redact: [{ left: 66.5, top: 49.5, width: 19, height: 8 }],
  },
  admin: {
    src: `${ITSO_DIR}/ITSO ID TRACKER - FINALS PRESENTATION VERSION 1 (4).png`,
    alt: "ITSO ID Tracker admin dashboard with user accounts, pending and completed appointment counts and an analytics and reports panel.",
    width: 628,
    height: 335,
    label: "Admin dashboard",
    caption: "Admin dashboard — account and appointment counts, with analytics and reports.",
    frame: "plain",
  },
} satisfies Record<string, ProjectMedia>;

const BEAUTIVERSE_DIR = "/assets/projects/beautiverse";
const BEAUTIVERSE_SCREENS = {
  admin: {
    src: `${BEAUTIVERSE_DIR}/beautiverse_2.png`,
    alt: "Beautiverse admin dashboard showing system statistics: total users, employees, products, stock, orders and revenue.",
    width: 1917,
    height: 1031,
    label: "Admin dashboard",
    caption: "Admin dashboard — system statistics across users, products, stock, orders and revenue.",
    frame: "browser",
  },
  profile: {
    src: `${BEAUTIVERSE_DIR}/beautiverse.png`,
    alt: "Beautiverse customer dashboard with profile information and an order history section.",
    width: 1897,
    height: 1030,
    label: "Customer dashboard",
    caption: "Customer dashboard — profile information and order history.",
    frame: "browser",
  },
} satisfies Record<string, ProjectMedia>;

const IGNIS_FULL_NAME =
  "IGNIS SAFE: A Mobile Fire Safety Learning and 3D Simulation System with Web Management for BFP Dasmariñas";

/** IGNIS SAFE is a capstone project built with BFP Dasmariñas, not a solo build. */
const IGNIS_ORGANIZATION = `${NU} · Capstone with BFP Dasmariñas`;

/** Organizational, not development: shown apart from the roles and contributions. */
const IGNIS_TEAM_ROLE = "Assistant Secretary of the capstone team";

export const PROJECT_DETAILS: ProjectDetail[] = [
  {
    slug: "ignis-safe-website",
    category: "Web Application · Public Safety",
    title: "IGNIS SAFE Website",
    fullName: IGNIS_FULL_NAME,
    tagline: "The web management platform for the BFP Dasmariñas City Fire Station.",
    summary:
      "The web side of the IGNIS SAFE capstone: a management platform for BFP Dasmariñas covering personnel, attendance, reports, learning content and analytics, plus a public portal and the IGNIS SAFE Android app download.",
    purpose:
      "A web platform where BFP Dasmariñas manages personnel, attendance, reports and the fire-safety learning content used by the IGNIS SAFE app — with a public portal for the community.",
    problem:
      "BFP Dasmariñas needed one central platform to support personnel management, administrative processes, fire-safety educational content and the community's learning progress. Personnel records, attendance, reports and learning content all had to be managed and followed in one system.",
    solution:
      "A web-based management platform that brings attendance, personnel and user management, reports, learning materials, assessment questions, analytics and announcements together for BFP personnel. It also runs the public portal where the community finds station services and downloads the IGNIS SAFE app.",
    period: "2025 – Present",
    role: "Systems Analyst, Mobile & Web Developer",
    roles: ["Web Developer", "Systems Analyst"],
    organization: IGNIS_ORGANIZATION,
    teamRole: IGNIS_TEAM_ROLE,
    teamNote: "IGNIS SAFE is our capstone team's project with BFP Dasmariñas. The items listed are my part of it.",
    status: "Live at bfp-dasmacfs.com",
    hero: IGNIS_WEB_LANDING,
    contributions: [
      {
        area: "Development",
        text: "Contributed to the web application's development with React and Supabase, working with the capstone team on its implementation.",
      },
      {
        area: "Systems analysis",
        text: "Helped translate BFP Dasmariñas requirements into system workflows, database structures and functional features.",
      },
      {
        area: "Integration",
        text: "Worked on interface development and on connecting the React front end to the Supabase database.",
      },
      {
        area: "Testing",
        text: "Tested and debugged features to improve the system's reliability and usability.",
      },
      {
        area: "Version control",
        text: "Authored 401 of the 626 commits on the repository's main branch (GitHub, October 2026).",
      },
    ],
    features: [
      {
        title: "Verified attendance",
        description:
          "Personnel confirm attendance by scanning a rotating QR code, then completing a face check and a location check. Admins search and filter the records and export them as CSV or PDF.",
      },
      {
        title: "Personnel & reports",
        description:
          "Admins manage personnel accounts and leave requests, and review submitted reports from Submitted to Under Review to Approved or Rejected.",
      },
      {
        title: "Learning content for the app",
        description:
          "Learning materials and assessment questions are managed on the website and loaded by the mobile app's modules.",
      },
      {
        title: "Learning analytics",
        description:
          "Pre- and post-assessment results become knowledge-gain, completion and module charts, so the station can see what learners understand.",
      },
      {
        title: "Public portal & app download",
        description:
          "Announcements, FSIC / FSEC guidance and a download page with version details, a QR code and install steps for the Android app.",
        media: IGNIS_WEB_DOWNLOAD,
      },
    ],
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
      { label: "Frontend", items: ["React 19", "Vite", "React Router", "GSAP"] },
      { label: "Backend & database", items: ["Supabase"] },
      { label: "Attendance checks", items: ["face-api", "MediaPipe", "React Webcam", "QR codes"] },
      { label: "Charts & exports", items: ["Chart.js", "jsPDF"] },
      { label: "Quality tools", items: ["ESLint", "Lighthouse"] },
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
    fullName: IGNIS_FULL_NAME,
    tagline: "Learn. Practice. Stay prepared.",
    summary:
      "The mobile side of the IGNIS SAFE capstone: an Android app with five fire-safety learning modules that pair learning materials and assessments with 3D simulations, backed by Supabase.",
    purpose:
      "An Android app where learners study fire-safety procedures, test what they know and practise in 3D simulations, with progress saved to their account.",
    problem:
      "Fire safety education needed to be accessible and interactive — something people could use to learn important procedures, check what they know and practise through simulated scenarios. Reading materials alone don't give learners that kind of repeated, hands-on practice.",
    solution:
      "An Android app with five fire-safety learning modules. Each module runs from a pre-assessment through learning materials and a post-assessment to an interactive 3D simulation built in Unity, with progress saved through Supabase.",
    period: "2025 – Present",
    role: "Systems Analyst, Mobile & Web Developer",
    roles: ["Mobile Developer (Flutter)", "Systems Analyst"],
    organization: IGNIS_ORGANIZATION,
    teamRole: IGNIS_TEAM_ROLE,
    teamNote:
      "My work is the Flutter app. The Unity 3D simulations were built mainly by a teammate (git history of the Unity scripts).",
    status: "v1.0.6 · Android APK available",
    hero: IGNIS_SCREENS.learning,
    heroCompanions: [IGNIS_SCREENS.login, IGNIS_SCREENS.onboarding],
    contributions: [
      {
        area: "Development",
        text: "Developed mobile app features in Flutter and Dart — learning materials, assessment functionality, user interfaces and app workflows.",
      },
      {
        area: "Integration",
        text: "Integrated the app with Supabase for accounts, module progress and assessment records.",
      },
      {
        area: "Testing",
        text: "Tested and debugged the app and improved its usability.",
      },
      {
        area: "Version control",
        text: "Authored 107 of the 138 commits in the app's repository (git history, October 2026).",
      },
    ],
    features: [
      {
        title: "Five learning modules",
        description:
          "Fire extinguisher, house fire, electrical fire, kitchen fire and tenement fire — each module takes the learner through the same four steps.",
        steps: ["Pre-Assessment", "Learning Materials", "Post-Assessment", "3D Simulation"],
      },
      {
        title: "Progress & achievement medals",
        description:
          "Module progress and per-module history are stored in Supabase, so results follow the learner's account. Medals are earned per module, plus one for completing every module.",
        media: IGNIS_SCREENS.profile,
      },
      {
        title: "Accounts in English & Tagalog",
        description:
          "Sign-up with email verification, password reset and Google sign-in, plus in-app feedback and an FAQ page — in English and Tagalog.",
        media: IGNIS_SCREENS.login,
      },
      {
        title: "3D simulations",
        description:
          "Team-built Unity scenes launched from the Flutter app through a platform channel, which hand control back to the app when the simulation ends.",
      },
    ],
    gallery: [IGNIS_SCREENS.onboarding, IGNIS_SCREENS.login, IGNIS_SCREENS.learning, IGNIS_SCREENS.profile],
    challenges: [
      {
        challenge:
          "Returning from a Unity simulation to Flutter reliably. Leaving the Unity process alive caused a black screen on the next scene launch, and several scripts could trigger a return at the same time, risking a freeze.",
        solution:
          "A ReturnToFlutter helper finishes the Android activity so the Unity process is destroyed and Flutter receives the result, with a guard flag so only one return call ever runs.",
        solvedBy: "team",
      },
      {
        challenge: "Keeping a Unity-integrated Android build compatible with current Flutter packages.",
        solution:
          "Pinned package_info_plus to 8.0.2, because version 9 needs a newer Kotlin Gradle plugin than the project's Unity-integrated build uses.",
        solvedBy: "me",
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
      { label: "Mobile app", items: ["Flutter", "Dart", "Provider"] },
      { label: "Backend & database", items: ["Supabase"] },
      { label: "Authentication", items: ["Google Sign-In"] },
      { label: "3D simulations (team)", items: ["Unity"] },
      { label: "Media", items: ["model_viewer_plus", "video_player"] },
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
    tagline: "Book, track and claim a school ID in one place.",
    summary:
      "A student ID appointment and tracking system for the NU Dasmariñas IT Services Office (ITSO): students book ID appointments and follow each request until the ID is ready for pickup.",
    purpose:
      "Lets NU Dasmariñas students book an ID appointment and follow its status until the ID is ready for pickup, while ITSO manages appointments, records and announcements.",
    problem:
      "Students applying for or replacing a school ID need a convenient way to check their request's status, know whether a new photo is required and find out when the ID is ready to collect. The IT Services Office (ITSO) also needed one place to manage those appointments and records.",
    solution:
      "ITSO ID Tracker lets students book an appointment by request type, choose whether to take a new photo and follow the status from approval to printing to ready for pickup. ITSO posts announcements and manages appointments from an admin dashboard in the same system.",
    period: "2024 – 2025",
    role: "Web Developer",
    organization: NU,
    hero: ITSO_SCREENS.home,
    contributions: [
      {
        area: "UI/UX design",
        text: "Reworked the admin dashboard interface the ITSO office uses to manage appointments and ID records.",
      },
      {
        area: "Development",
        text: "Worked on status monitoring and record management for ID issuance and tracking.",
      },
      {
        area: "Testing",
        text: "Tested and refined system functions and interfaces, improving usability and data accuracy.",
      },
    ],
    features: [
      {
        title: "Book by request type",
        description:
          "Students choose term renewal, school-year renewal or lost ID, decide whether to take a new photo or keep the current one, and book a slot on a calendar that marks booked and closed days.",
        media: ITSO_SCREENS.booking,
      },
      {
        title: "Status until pickup",
        description:
          "Each request moves through clear statuses — and can be put on hold or declined — so students know when their ID is ready to collect.",
        steps: ["Pending approval", "For printing", "Ready for pickup"],
      },
      {
        title: "Public appointment calendar",
        description: "Available appointment slots are visible before signing in.",
        media: ITSO_SCREENS.calendar,
      },
      {
        title: "Admin dashboard & announcements",
        description:
          "ITSO manages accounts and appointments, sees pending and completed counts with analytics and reports, and publishes announcements for students.",
        media: ITSO_SCREENS.admin,
      },
      {
        title: "QR appointment pass",
        description: "Students get a QR pass for their appointment, which the office scans to verify it.",
      },
    ],
    gallery: [ITSO_SCREENS.home, ITSO_SCREENS.calendar, ITSO_SCREENS.booking, ITSO_SCREENS.admin],
    outcomes: [
      { label: "Simplified ID issuance and tracking workflows." },
      { label: "Improved usability and data accuracy through testing and refinement." },
    ],
    stack: [
      { label: "Frontend", items: ["React 19", "Vite", "Tailwind CSS", "React Router"] },
      { label: "Backend & API", items: ["Node.js", "Express"] },
      { label: "Database", items: ["MongoDB", "Mongoose"] },
      { label: "Auth & integrations", items: ["JWT", "Google Calendar API", "Nodemailer", "QR codes"] },
    ],
    links: {
      repoUrl: "https://github.com/seandrodejo/itso-id-tracker1",
    },
  },
  {
    slug: "beautiverse",
    category: "Web Application · E-Commerce Prototype",
    title: "Beautiverse",
    tagline: "A beauty and makeup ordering prototype.",
    summary:
      "A student e-commerce prototype for beauty and makeup products, with customer, employee and admin roles for browsing products, placing orders and managing them.",
    purpose:
      "Lets customers browse beauty products and place orders, while employees and administrators manage products and move each order from pending to completed.",
    problem:
      "The project explores how customers and administrators can handle a basic online ordering process for beauty products in one application — from browsing and ordering to reviewing and completing orders.",
    solution:
      "A simple e-commerce prototype with separate customer, employee and admin roles. Customers browse products, add them to a cart and place orders; staff manage products and move each order from Pending to Processing to Completed or Cancelled.",
    period: "2025 – 2026",
    role: "Web Developer",
    organization: NU,
    status: "Student prototype",
    hero: BEAUTIVERSE_SCREENS.admin,
    contributions: [
      {
        area: "UI/UX design",
        text: "Designed and refined the login, registration and dashboard interfaces for customers, employees and administrators.",
      },
      {
        area: "Development",
        text: "Expanded the admin and employee dashboards, including their product-management views and styling.",
      },
      {
        area: "Integration",
        text: "Updated the PHP add-product endpoint to handle product images, connecting the React dashboards to the MySQL database.",
      },
    ],
    features: [
      {
        title: "Shop and order",
        description:
          "Customers browse products, add them to a cart, place orders and see their order history in their own dashboard.",
        media: BEAUTIVERSE_SCREENS.profile,
      },
      {
        title: "Order approval & tracking",
        description: "Employees and administrators review each order and update its status.",
        steps: ["Pending", "Processing", "Completed or Cancelled"],
      },
      {
        title: "Product management",
        description: "Employees and administrators add, edit and remove products, including product images and stock.",
      },
      {
        title: "Admin dashboard",
        description:
          "Statistics across users, employees, products, stock, orders and revenue, plus account and employee management.",
      },
    ],
    gallery: [BEAUTIVERSE_SCREENS.admin, BEAUTIVERSE_SCREENS.profile],
    outcomes: [
      { label: "A working prototype of the full order flow across customer, employee and admin roles." },
    ],
    limitations: [
      "A student demo project, not an operating store.",
      "Product data is sample data; no real transactions have been made.",
      "No online payment processing or shipping integration.",
    ],
    stack: [
      { label: "Frontend", items: ["React 19", "Vite", "Recharts"] },
      { label: "Backend & database", items: ["PHP", "MySQL"] },
    ],
    links: {},
  },
  {
    slug: "maddy-cassy",
    category: "Web Application · Gadget Rental",
    title: "Maddy & Cassy Rentals",
    tagline: "Rent the gear. Create the moment.",
    summary:
      "A rental website for cameras, iPhones and other gadgets, with online booking, GCash payments verified by the team, and automatically generated invoices and rental agreements.",
    purpose:
      "Lets customers in Metro Manila browse cameras and iPhones, reserve rental dates, pay through GCash and sign the rental agreement online.",
    problem:
      "Customers looking to rent cameras, smartphones and other gadgets need an easier way to explore rental options, check rental details and arrange a reservation, instead of relying entirely on separate conversations and manual inquiries.",
    solution:
      "A customer-facing rental website that presents the catalog, rental requirements and a step-by-step booking flow — from choosing dates to paying, verifying identity and signing the agreement online. An admin side handles payment review, agreements and equipment handover.",
    period: "2026",
    role: "Website Developer",
    roles: ["Website Developer", "Assistant Website Team Leader"],
    status: "Live on Vercel",
    hero: {
      src: "/assets/projects/maddy-cassy/screenshot-1.webp",
      alt: "Maddy & Cassy Rentals home page: 'Rent the Gear. Create the Moment.' with a carousel of rental gear including the DJI Osmo Action 6.",
      width: 1440,
      height: 900,
      frame: "browser",
    },
    contributions: [
      {
        area: "Development",
        text: "Built the rental calendar and booking flow, the catalog and dashboard pages, and the About Us page.",
      },
      {
        area: "Development",
        text: "Built admin tools for payment review, agreement signing, equipment release and return condition tracking, notifications and paginated admin lists.",
      },
      {
        area: "Integration",
        text: "Migrated the inventory from Firebase to a Supabase schema, added booking email notifications and moved sign-in to a 6-digit email code.",
      },
      {
        area: "Team role",
        text: "As assistant website team leader, helped coordinate development work and resolve implementation issues.",
      },
      {
        area: "Version control",
        text: "Authored 43 of the 71 commits in the project's git history (September 2026).",
      },
    ],
    features: [
      {
        title: "Booking & GCash checkout",
        description:
          "A 50% non-refundable down payment or the full amount secures the booking. Payments are made through GCash and verified manually by the team.",
        steps: [
          "Choose gear & dates",
          "Share the rental plan",
          "Pay via GCash",
          "Verify identity & sign",
          "Pick up or arrange delivery",
        ],
      },
      {
        title: "Catalog with daily rates",
        description: "Cameras and iPhones organised by category, with a daily rate on every listing.",
      },
      {
        title: "Invoices & agreements",
        description: "Invoices and rental agreements are generated automatically; agreements are signed electronically.",
      },
      {
        title: "Admin operations",
        description:
          "Staff review payments, track agreements, record equipment condition at release and return, and follow notifications.",
      },
      {
        title: "Favorites & discounts",
        description: "Customers save favorite items and get birthday-month and 11th-rental loyalty discounts at checkout.",
      },
    ],
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
      { label: "Framework", items: ["Next.js 16", "React 19", "TypeScript"] },
      { label: "Backend & database", items: ["Supabase"] },
      { label: "Forms & validation", items: ["React Hook Form", "Zod"] },
      { label: "Documents & signing", items: ["pdf-lib", "react-signature-canvas"] },
      { label: "Motion", items: ["GSAP"] },
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
