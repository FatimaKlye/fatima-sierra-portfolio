export type ProjectFeature = {
  title: string;
  description: string;
};

export type ProjectChallenge = {
  challenge: string;
  solution: string;
};

export type ProjectMedia = {
  src: string;
  alt: string;
};

export type ProjectVideo = {
  src: string;
  poster?: string;
};

export type ProjectLinks = {
  repoUrl: string;
  liveUrl?: string;
  videoUrl?: string;
};

export type ProjectDetail = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  technologies: string[];
  status: string;
  role: string;
  heroImage: ProjectMedia;
  overview: {
    whatItIs: string;
    createdFor: string;
    problem: string;
    whyNeeded: string;
  };
  problemAndSolution: {
    problem: string;
    solution: string;
  };
  contributions: string[];
  features: ProjectFeature[];
  gallery: ProjectMedia[];
  video?: ProjectVideo;
  impact: string[];
  challenges: ProjectChallenge[];
  skills: string[];
  links: ProjectLinks;
};

export const PROJECT_DETAILS: ProjectDetail[] = [
  {
    slug: "ignis-safe-website",
    category: "Web Application · Public Safety",
    title: "IGNIS SAFE Website",
    summary:
      "A companion web platform for the IGNIS SAFE fire-safety program, giving administrators and the public a reliable place to manage and access fire-safety information.",
    technologies: ["Next.js", "TypeScript", "Supabase"],
    status: "Completed · Academic Capstone Project",
    role: "Contributing Web Developer",
    heroImage: {
      src: "/assets/projects/ignis-safe-website/hero.svg",
      alt: "IGNIS SAFE website dashboard preview",
    },
    overview: {
      whatItIs:
        "IGNIS SAFE Website is the web-based companion to the IGNIS SAFE fire-safety learning system. It gives program coordinators a central place to publish resources, manage content, and support the mobile learning experience.",
      createdFor:
        "Built for the coordinators and administrators of the IGNIS SAFE fire-safety education program, and for community members seeking accessible fire-safety information.",
      problem:
        "Fire-safety information for the program was scattered across static documents and manual processes, making it hard to keep resources current or manage them at scale.",
      whyNeeded:
        "A structured web platform was needed so program content could be updated, organized, and delivered consistently, in step with the mobile learning application.",
    },
    problemAndSolution: {
      problem:
        "Program staff had no centralized system to publish and maintain fire-safety resources, which meant updates were slow, inconsistent, and hard to track across the team.",
      solution:
        "The team built a Next.js and Supabase powered platform with structured content management, giving staff a straightforward interface to publish and update resources without touching code, while keeping the data in sync with the broader IGNIS SAFE program.",
    },
    contributions: [
      "Contributed to building and styling responsive page layouts using Next.js and TypeScript.",
      "Helped implement Supabase data queries for displaying program resources and content.",
      "Assisted in testing page functionality and fixing layout and interaction issues across devices.",
      "Collaborated with teammates on documentation to support future maintenance of the platform.",
    ],
    features: [
      {
        title: "Program Resource Hub",
        description:
          "A structured library of fire-safety resources that keeps information organized and easy for both staff and the public to find.",
      },
      {
        title: "Administrative Tools",
        description:
          "Interfaces that let coordinators manage and update program content without needing developer support.",
      },
      {
        title: "Supabase-Backed Data Layer",
        description:
          "A managed backend that keeps content consistent and reliably synced across the website and mobile experience.",
      },
      {
        title: "Responsive Interface",
        description:
          "A layout that adapts cleanly across desktop and mobile browsers, so the platform is usable in any setting.",
      },
    ],
    gallery: [
      {
        src: "/assets/projects/ignis-safe-website/hero.svg",
        alt: "IGNIS SAFE website home preview",
      },
      {
        src: "/assets/projects/ignis-safe-website/screen-dashboard.svg",
        alt: "IGNIS SAFE website dashboard screen",
      },
      {
        src: "/assets/projects/ignis-safe-website/screen-detail.svg",
        alt: "IGNIS SAFE website content management screen",
      },
    ],
    impact: [
      "Gives program coordinators a faster way to publish and maintain accurate fire-safety information.",
      "Provides the community with an accessible reference point for fire-safety resources alongside the mobile app.",
      "Reduces the manual effort needed to keep program content current across the team.",
    ],
    challenges: [
      {
        challenge:
          "Keeping content structure flexible enough for non-technical staff to manage without breaking page layouts.",
        solution:
          "Worked with the team to design a predictable content schema in Supabase and reusable components so new resources could be added safely.",
      },
      {
        challenge:
          "Coordinating the website's data model with the separate mobile application team.",
        solution:
          "Communicated closely with the mobile team to align on shared data structures in Supabase, reducing integration issues later in the project.",
      },
    ],
    skills: [
      "Practical experience building with Next.js and TypeScript in a team setting.",
      "Working with Supabase for structured content and data management.",
      "Coordinating technical decisions across a multi-platform project (web and mobile).",
      "Testing and refining responsive layouts across devices.",
    ],
    links: {
      repoUrl: "https://github.com/paulosierra797/ignis-safe",
    },
  },
  {
    slug: "ignis-safe-mobile",
    category: "Mobile Application · Educational Technology",
    title: "IGNIS SAFE Mobile Application",
    summary:
      "A mobile fire-safety learning app that combines structured lessons, assessments, and interactive Unity-based simulations to make fire-safety education more engaging.",
    technologies: ["Flutter", "Dart", "Supabase", "Unity"],
    status: "Completed · Academic Capstone Project",
    role: "Lead Mobile Developer",
    heroImage: {
      src: "/assets/projects/ignis-safe-mobile/hero.svg",
      alt: "IGNIS SAFE mobile application interface preview",
    },
    overview: {
      whatItIs:
        "IGNIS SAFE Mobile is a Flutter-based learning application that teaches fire-safety concepts through structured lessons, knowledge assessments, and hands-on Unity simulations.",
      createdFor:
        "Designed for students and community members who need an engaging, practical way to learn fire-safety procedures rather than relying on static reading materials.",
      problem:
        "Traditional fire-safety instruction is often passive, text-heavy, and difficult to retain, leaving learners underprepared for real emergency scenarios.",
      whyNeeded:
        "An interactive, mobile-first learning tool was needed to make fire-safety concepts easier to understand, practice, and remember.",
    },
    problemAndSolution: {
      problem:
        "Learners frequently disengage from conventional fire-safety materials, which limits how much of the content they actually retain or can apply in an emergency.",
      solution:
        "IGNIS SAFE Mobile pairs structured lesson content with short assessments and Unity-built simulations, so learners can practice decision-making in a realistic, low-stakes environment while progress is tracked through Supabase.",
    },
    contributions: [
      "Led the design and development of the Flutter application, including navigation, lesson flows, and assessment screens.",
      "Designed and implemented the Supabase schema for storing lessons, quiz results, and learner progress.",
      "Integrated the Unity-based simulation modules into the Flutter application.",
      "Personally tested lesson flows and simulation triggers across Android devices and resolved usability issues found during testing.",
      "Wrote setup and usage documentation to support continued development of the app.",
    ],
    features: [
      {
        title: "Structured Lesson Modules",
        description:
          "Fire-safety topics broken into clear, digestible lessons that guide learners step by step.",
      },
      {
        title: "Knowledge Assessments",
        description:
          "Short quizzes after each module that reinforce learning and give learners a way to check their understanding.",
      },
      {
        title: "Unity-Based Simulations",
        description:
          "Interactive scenarios that let learners practice fire-safety responses in a realistic, hands-on way instead of just reading about them.",
      },
      {
        title: "Progress Tracking",
        description:
          "Supabase-backed tracking of lesson completion and quiz scores, so learners and instructors can see progress over time.",
      },
    ],
    gallery: [
      {
        src: "/assets/projects/ignis-safe-mobile/hero.svg",
        alt: "IGNIS SAFE mobile home screen preview",
      },
      {
        src: "/assets/projects/ignis-safe-mobile/screen-dashboard.svg",
        alt: "IGNIS SAFE mobile lesson dashboard screen",
      },
      {
        src: "/assets/projects/ignis-safe-mobile/screen-detail.svg",
        alt: "IGNIS SAFE mobile assessment screen",
      },
    ],
    impact: [
      "Helps students and community members build fire-safety knowledge through active practice rather than passive reading.",
      "Gives educators a structured tool for teaching fire-safety procedures with measurable outcomes.",
      "Makes fire-safety simulations more accessible by delivering them on everyday mobile devices.",
    ],
    challenges: [
      {
        challenge:
          "Embedding Unity simulations inside a Flutter application without disrupting app performance or navigation.",
        solution:
          "Researched and implemented a Flutter-Unity integration approach, carefully managing simulation load and transitions to keep the app responsive.",
      },
      {
        challenge:
          "Structuring learner progress data so lessons, quizzes, and simulation results stayed consistent.",
        solution:
          "Designed a normalized Supabase schema that linked learner records to lesson and assessment results, then validated it through repeated test runs.",
      },
    ],
    skills: [
      "Cross-platform mobile development with Flutter and Dart.",
      "Integrating Unity simulations into a mobile application shell.",
      "Designing a Supabase data schema for learning progress and assessments.",
      "End-to-end testing of interactive, multi-module mobile experiences.",
      "Writing technical documentation for future collaborators.",
    ],
    links: {
      repoUrl: "https://github.com/FatimaKlye/ignis_safe_mobile",
    },
  },
  {
    slug: "itso-id-tracker",
    category: "Web Application · Campus System",
    title: "ITSO ID Tracker",
    summary:
      "An ID processing and tracking system built for a campus ITSO office to streamline issuance, status updates, and record-keeping.",
    technologies: ["Next.js", "TypeScript", "Supabase"],
    status: "Completed · Academic Team Project",
    role: "Contributing Developer",
    heroImage: {
      src: "/assets/projects/itso-id-tracker/hero.svg",
      alt: "ITSO ID Tracker interface preview",
    },
    overview: {
      whatItIs:
        "ITSO ID Tracker is a web application that digitizes the process of issuing and tracking campus IDs, replacing manual logbooks with a searchable, status-driven system.",
      createdFor:
        "Built for the campus ITSO (Information Technology Services Office) staff who process ID requests, and for students who need visibility into their ID request status.",
      problem:
        "ID issuance was previously tracked manually, making it slow to look up a request's status and easy to lose track of pending or completed IDs.",
      whyNeeded:
        "The office needed a reliable digital system to record requests, update statuses, and keep an accurate, searchable history of issued IDs.",
    },
    problemAndSolution: {
      problem:
        "Manual, paper-based tracking made it difficult for staff to quickly check a request's status or maintain accurate records as request volume grew.",
      solution:
        "The team built a Next.js and Supabase system that logs each ID request, tracks its status through the issuance workflow, and keeps a searchable digital record for staff to reference.",
    },
    contributions: [
      "Contributed to building interface components for viewing and updating ID request records.",
      "Helped implement Supabase queries for filtering and searching ID records by status.",
      "Assisted with testing the request workflow to confirm status updates behaved correctly.",
      "Worked with teammates to refine the interface based on feedback from ITSO staff.",
    ],
    features: [
      {
        title: "Request Status Tracking",
        description:
          "A clear view of where each ID request stands, from submission through issuance.",
      },
      {
        title: "Searchable Records",
        description:
          "Fast lookup of ID records by name or status, replacing manual logbook searches.",
      },
      {
        title: "Centralized Record-Keeping",
        description:
          "A single digital source of truth for ID issuance history, reducing lost or duplicated records.",
      },
      {
        title: "Staff-Focused Interface",
        description:
          "A straightforward layout built around how ITSO staff actually process requests day to day.",
      },
    ],
    gallery: [
      {
        src: "/assets/projects/itso-id-tracker/hero.svg",
        alt: "ITSO ID Tracker home preview",
      },
      {
        src: "/assets/projects/itso-id-tracker/screen-dashboard.svg",
        alt: "ITSO ID Tracker records dashboard screen",
      },
      {
        src: "/assets/projects/itso-id-tracker/screen-detail.svg",
        alt: "ITSO ID Tracker request detail screen",
      },
    ],
    impact: [
      "Gives ITSO staff a faster, more reliable way to process and track ID requests.",
      "Reduces the risk of lost or inconsistent records compared to manual logbooks.",
      "Improves the experience for students by making ID status easier to check and confirm.",
    ],
    challenges: [
      {
        challenge:
          "Modeling a request-status workflow that matched the office's actual issuance process.",
        solution:
          "Worked closely with teammates to map out the real ITSO workflow before implementing the status states in Supabase, reducing rework later on.",
      },
      {
        challenge:
          "Making record search fast and dependable as the number of ID entries grew.",
        solution:
          "Helped refine Supabase queries and indexing so searches stayed responsive as test data volume increased.",
      },
    ],
    skills: [
      "Building record-management interfaces with Next.js and TypeScript.",
      "Writing and refining Supabase queries for search and filtering.",
      "Translating a real office workflow into a working software system.",
      "Collaborating with a team on iterative feedback and testing.",
    ],
    links: {
      repoUrl: "https://github.com/seandrodejo/itso-id-tracker1",
    },
  },
  {
    slug: "beautiverse",
    category: "Web Application · Beauty & Commerce",
    title: "Beautiverse",
    summary:
      "A digital storefront and community platform connecting beauty enthusiasts with products, services, and content in one place.",
    technologies: ["Next.js", "TypeScript", "Supabase"],
    status: "Completed · Academic Team Project",
    role: "Contributing Developer",
    heroImage: {
      src: "/assets/projects/beautiverse/hero.svg",
      alt: "Beautiverse interface preview",
    },
    overview: {
      whatItIs:
        "Beautiverse is a web platform that brings together a product storefront and community content for beauty enthusiasts, built as a combined commerce and content experience.",
      createdFor:
        "Created for beauty enthusiasts and small beauty businesses who want a shared space to discover products and services alongside community content.",
      problem:
        "Beauty enthusiasts often have to jump between separate shopping sites and content platforms, with no unified place to browse products and related content together.",
      whyNeeded:
        "A combined platform was needed so users could discover products and engage with beauty-related content without switching between disconnected tools.",
    },
    problemAndSolution: {
      problem:
        "Existing options split shopping and community content across different platforms, making the experience fragmented for users interested in both.",
      solution:
        "The team built Beautiverse as a single Next.js and Supabase application that combines a product storefront with community-facing content, giving users one place to browse and engage.",
    },
    contributions: [
      "Contributed to building storefront and content page components in Next.js and TypeScript.",
      "Helped structure Supabase tables for products and related content.",
      "Assisted in testing the storefront browsing experience across desktop and mobile breakpoints.",
      "Collaborated with the team on UI refinements based on peer feedback during development.",
    ],
    features: [
      {
        title: "Product Storefront",
        description:
          "A browsable catalog of beauty products and services, organized for easy discovery.",
      },
      {
        title: "Community Content Space",
        description:
          "A section for beauty-related content that keeps users engaged beyond just shopping.",
      },
      {
        title: "Unified Browsing Experience",
        description:
          "One platform for products and content, reducing the need to switch between separate sites.",
      },
      {
        title: "Responsive Storefront Layout",
        description:
          "A layout that adapts across devices so browsing feels natural on both desktop and mobile.",
      },
    ],
    gallery: [
      {
        src: "/assets/projects/beautiverse/hero.svg",
        alt: "Beautiverse storefront preview",
      },
      {
        src: "/assets/projects/beautiverse/screen-dashboard.svg",
        alt: "Beautiverse storefront catalog screen",
      },
      {
        src: "/assets/projects/beautiverse/screen-detail.svg",
        alt: "Beautiverse product detail screen",
      },
    ],
    impact: [
      "Gives beauty enthusiasts a single place to discover products and related content.",
      "Supports small beauty businesses and creators by giving their offerings more visibility.",
      "Reduces friction for users who previously had to use multiple disconnected platforms.",
    ],
    challenges: [
      {
        challenge:
          "Designing a data model that could support both storefront products and community content without becoming overly complex.",
        solution:
          "Worked with the team to separate product and content concerns into distinct, related Supabase tables, keeping queries manageable as features grew.",
      },
      {
        challenge:
          "Keeping the storefront layout consistent and readable across a wide range of screen sizes.",
        solution:
          "Iterated on responsive layouts through peer testing, adjusting breakpoints until browsing felt natural on both mobile and desktop.",
      },
    ],
    skills: [
      "Building commerce-style interfaces with Next.js and TypeScript.",
      "Structuring Supabase data models for combined commerce and content use cases.",
      "Responsive UI development and cross-device testing.",
      "Iterating on design based on team and peer feedback.",
    ],
    links: {
      repoUrl: "https://github.com/andreii2404/Beautiverse-digi",
    },
  },
];

export function getProjectDetailBySlug(slug: string): ProjectDetail | undefined {
  return PROJECT_DETAILS.find((project) => project.slug === slug);
}

export function getAdjacentProjects(slug: string): {
  previous: ProjectDetail | null;
  next: ProjectDetail | null;
} {
  const index = PROJECT_DETAILS.findIndex((project) => project.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  const previous =
    PROJECT_DETAILS[(index - 1 + PROJECT_DETAILS.length) % PROJECT_DETAILS.length];
  const next = PROJECT_DETAILS[(index + 1) % PROJECT_DETAILS.length];

  return { previous, next };
}
