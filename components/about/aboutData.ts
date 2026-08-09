// Single source of truth for all About-page content.
// Every fact here is sourced from Fatima's uploaded résumé details and certificate files.
// Do not add achievements, dates, institutions, or credentials that are not verified.

export const HERO_CONTENT = {
  eyebrow: "ABOUT ME",
  name: "Fatima Klye M. Sierra",
  tagline:
    "Web & Mobile Developer creating practical digital solutions through thoughtful design, reliable development, and user-focused technology.",
  statusLabel: "Web & Mobile Application Developer",
  introParagraphs: [
    "I develop responsive web and mobile applications that transform ideas and real-world requirements into functional digital systems. My work includes interface development, database integration, application testing, system documentation, and AI-assisted development.",
    "I focus on building practical, accessible, and dependable solutions that improve user experiences and support organizations, students, personnel, and communities.",
  ],
  portrait: {
    src: "/assets/about/fatima-sierra-professional.jpg",
    alt: "Professional portrait of Fatima Klye M. Sierra",
  },
  buttons: {
    primary: { label: "Explore My Projects", href: "/projects" },
    secondary: {
      label: "Download Resume",
      href: "/assets/resume/fatima-sierra-resume.pdf",
    },
  },
};

export type StoryChapter = {
  id: string;
  number: string;
  kicker: string;
  title: string;
  paragraph: string;
  tags: string[];
  imageAlt: string;
  imagePlaceholderLabel: string;
  /**
   * Path under /public. The file does not need to exist yet — MyStorySection
   * checks the filesystem and falls back to a labeled placeholder until it
   * does. Drop a real photo at this exact path and it appears automatically,
   * no code changes needed.
   */
  image?: string;
  imagePosition?: string;
};

export const MY_STORY_CONTENT = {
  eyebrow: "MY STORY",
  title: "Cooking to Coding",
  subtitle: "How I turned creativity into technology",
  intro:
    "Before I ever wrote a line of code, I was in the kitchen — measuring, mixing, and learning that good things take patience. This is the story of how that same curiosity led me somewhere I never expected: technology.",
  closing:
    "From cooking to coding, one thing never really changed — I just enjoy making something good.",
};

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "where-it-started",
    number: "01",
    kicker: "Home Economics",
    title: "Where It Started",
    paragraph:
      "Long before code editors, my hands were busy with flour, knives, and recipe cards. I took Home Economics before college and loved following a process step by step until it became something real. Cooking taught me patience, precision, and the quiet satisfaction of building something from scratch — habits I'd need again later.",
    tags: ["Creativity", "Patience", "Craft"],
    imageAlt: "Fatima cooking and preparing dishes during her Home Economics days",
    imagePlaceholderLabel: "Add photo — save as story/01-where-it-started.jpg",
    image: "/assets/about/story/01-where-it-started.jpg",
  },
  {
    id: "the-realization",
    number: "02",
    kicker: "The Shift",
    title: "Growing Curiosity",
    paragraph:
      "As much as I loved the kitchen, a different kind of curiosity crept in. I started paying attention to how apps worked, how websites were put together, and how a single tap could make a screen respond. It wasn't a dramatic change — just a quiet realization I couldn't ignore.",
    tags: ["Curiosity", "Exploration"],
    imageAlt: "Fatima exploring apps and websites, the early spark of her interest in tech",
    imagePlaceholderLabel: "Add photo — save as story/02-growing-curiosity.jpg",
    image: "/assets/about/story/02-growing-curiosity.jpg",
  },
  {
    id: "choosing-it",
    number: "03",
    kicker: "The Decision",
    title: "Choosing IT",
    paragraph:
      "When it was time to choose a college course, I chose Information Technology. Part of it was curiosity — I wanted to build things with code the way I once built dishes with ingredients. Part of it was practical: tech meant more opportunities and a more stable future. Looking back, it wasn't leaving cooking behind — just choosing a new set of tools to keep creating.",
    tags: ["Decision Making", "Growth", "Opportunity"],
    imageAlt: "Fatima at the start of her Information Technology studies",
    imagePlaceholderLabel: "Add photo — save as story/03-choosing-it.jpg",
    image: "/assets/about/story/03-choosing-it.jpg",
  },
  {
    id: "learning-the-craft",
    number: "04",
    kicker: "Building Foundations",
    title: "Learning the Craft",
    paragraph:
      "College brought Next.js, React, databases, and a lot of late nights figuring things out. I earned Dean's Lister honors, completed IT Specialist certifications in HTML & CSS and Databases, and kept showing up for workshops on UI/UX, cybersecurity, and cloud computing. Every course and certificate was another ingredient added to the recipe.",
    tags: ["Growth", "Discipline", "Continuous Learning"],
    imageAlt: "Fatima studying and building her Information Technology foundations",
    imagePlaceholderLabel: "Add photo — save as story/04-learning-the-craft.jpg",
    image: "/assets/about/story/04-learning-the-craft.jpg",
  },
  {
    id: "building-projects",
    number: "05",
    kicker: "Turning Ideas Into Systems",
    title: "Building Real Projects",
    paragraph:
      "Learning stopped being just theory once I started building — IGNIS SAFE's fire-safety web and mobile platforms, an ID tracking system for a campus office, and Beautiverse, a storefront for a beauty community. Each project meant designing real interfaces, connecting databases, and testing until things actually worked. It felt a lot like a recipe: plan it, build it, taste-test, adjust, repeat.",
    tags: ["Problem Solving", "Collaboration", "Craftsmanship"],
    imageAlt: "Fatima working on web and mobile application projects",
    imagePlaceholderLabel: "Add photo — save as story/05-building-projects.jpg",
    image: "/assets/about/story/05-building-projects.jpg",
  },
  {
    id: "where-i-am-now",
    number: "06",
    kicker: "Today",
    title: "Where I Am Now",
    paragraph:
      "Today, I'm a Web & Mobile Application Developer building responsive apps with Next.js, React, and Flutter — from interface design to database integration and testing. The same patience I learned in the kitchen still shows up in how I debug and build: step by step, until it works. I'm looking for opportunities where I can keep growing, keep building, and keep making something good.",
    tags: ["Growth", "Purpose", "Technology"],
    imageAlt: "Fatima today, working as a web and mobile application developer",
    imagePlaceholderLabel: "Add photo — save as story/06-where-i-am-now.jpg",
    image: "/assets/about/story/06-where-i-am-now.jpg",
  },
];

export type KnowledgeItem = {
  title: string;
  description: string;
};

export const KNOWLEDGE_CONTENT = {
  eyebrow: "TECHNICAL KNOWLEDGE",
  title: "Knowledge & Capabilities",
  intro:
    "A focused overview of the technologies, development practices, and problem-solving skills I use to build practical and reliable digital solutions.",
};

export const CORE_KNOWLEDGE: KnowledgeItem[] = [
  {
    title: "Web Application Development",
    description:
      "Next.js, React, TypeScript, JavaScript, HTML, CSS, responsive interfaces, reusable components, and accessible layouts.",
  },
  {
    title: "Mobile Application Development",
    description:
      "Flutter, Dart, Supabase integration, mobile interface development, testing, and responsive application behavior.",
  },
  {
    title: "Database Integration",
    description:
      "Supabase, PostgreSQL, authentication, structured data management, CRUD operations, and real-time data workflows.",
  },
  {
    title: "UI and User Experience",
    description:
      "Responsive interface design, user-centered layouts, accessibility considerations, consistency, and usability improvement.",
  },
  {
    title: "Application Testing",
    description:
      "Functional testing, test-case preparation, validation, debugging, responsive testing, and system verification.",
  },
  {
    title: "System Documentation",
    description:
      "Requirements organization, technical documentation, test documentation, workflow explanation, and project presentation.",
  },
  {
    title: "Version Control",
    description:
      "Git, GitHub, repository organization, source-code management, and collaborative development workflows.",
  },
  {
    title: "AI-Assisted Development",
    description:
      "ChatGPT and Claude for planning, research support, debugging assistance, documentation, and development workflow improvement.",
  },
];

const DEVICON_BASE =
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";
const SIMPLE_ICONS_BASE = "https://cdn.jsdelivr.net/npm/simple-icons@15/icons";

export type TechnologyItem = {
  name: string;
  mark: string;
  icon: string;
};

export type TechnologyGroup = {
  id: string;
  label: string;
  items: TechnologyItem[];
};

export const CORE_TECHNOLOGIES_CONTENT = {
  eyebrow: "CORE TECHNOLOGIES",
  title: "Tools & Technologies I Work With",
};

export const TECHNOLOGY_GROUPS: TechnologyGroup[] = [
  {
    id: "frontend",
    label: "Frontend Development",
    items: [
      { name: "Next.js", mark: "NX", icon: `${DEVICON_BASE}/nextjs/nextjs-original.svg` },
      { name: "React", mark: "RE", icon: `${DEVICON_BASE}/react/react-original.svg` },
      { name: "TypeScript", mark: "TS", icon: `${DEVICON_BASE}/typescript/typescript-original.svg` },
      { name: "JavaScript", mark: "JS", icon: `${DEVICON_BASE}/javascript/javascript-original.svg` },
      { name: "HTML", mark: "HT", icon: `${DEVICON_BASE}/html5/html5-original.svg` },
      { name: "CSS", mark: "CS", icon: `${DEVICON_BASE}/css3/css3-original.svg` },
    ],
  },
  {
    id: "mobile",
    label: "Mobile Development",
    items: [
      { name: "Flutter", mark: "FL", icon: `${DEVICON_BASE}/flutter/flutter-original.svg` },
      { name: "Dart", mark: "DA", icon: `${DEVICON_BASE}/dart/dart-original.svg` },
      { name: "Java", mark: "JV", icon: `${DEVICON_BASE}/java/java-original.svg` },
    ],
  },
  {
    id: "backend-database",
    label: "Backend & Database",
    items: [
      { name: "Supabase", mark: "SU", icon: `${DEVICON_BASE}/supabase/supabase-original.svg` },
      { name: "PostgreSQL", mark: "PG", icon: `${DEVICON_BASE}/postgresql/postgresql-original.svg` },
    ],
  },
  {
    id: "tools",
    label: "Development Tools",
    items: [
      { name: "Git", mark: "GT", icon: `${DEVICON_BASE}/git/git-original.svg` },
      { name: "GitHub", mark: "GH", icon: `${DEVICON_BASE}/github/github-original.svg` },
      { name: "Visual Studio Code", mark: "VS", icon: `${DEVICON_BASE}/vscode/vscode-original.svg` },
      { name: "Cursor", mark: "CU", icon: `${SIMPLE_ICONS_BASE}/cursor.svg` },
      { name: "Figma", mark: "FI", icon: `${DEVICON_BASE}/figma/figma-original.svg` },
      { name: "Canva", mark: "CV", icon: `${SIMPLE_ICONS_BASE}/canva.svg` },
      { name: "ChatGPT", mark: "AI", icon: `${SIMPLE_ICONS_BASE}/openai.svg` },
      { name: "Claude", mark: "AI", icon: `${SIMPLE_ICONS_BASE}/claude.svg` },
    ],
  },
];

export type CapabilityItem = {
  id: "build" | "integrate" | "test" | "document";
  verb: string;
  title: string;
  description: string;
};

export const CAPABILITIES_CONTENT = {
  eyebrow: "CAPABILITIES",
  title: "What I Can Do",
};

export const CAPABILITIES: CapabilityItem[] = [
  {
    id: "build",
    verb: "Build",
    title: "Web & Mobile Applications",
    description:
      "Responsive web apps and cross-platform mobile apps with Next.js, React, and Flutter.",
  },
  {
    id: "integrate",
    verb: "Integrate",
    title: "Database & Authentication",
    description:
      "Supabase and PostgreSQL data models, authentication, and real-time workflows.",
  },
  {
    id: "test",
    verb: "Test",
    title: "Functional & Responsive Testing",
    description:
      "Test-case preparation, functional validation, debugging, and responsive testing.",
  },
  {
    id: "document",
    verb: "Document",
    title: "Technical Documentation & Workflows",
    description:
      "Requirements organization, technical documentation, and workflow explanation for handoff.",
  },
];

export const LEARNING_EXPOSURE: string[] = [
  "Cybersecurity awareness",
  "Cloud computing concepts",
  "Internet of Things concepts",
  "API development concepts",
  "Node.js, Prisma, and MySQL concepts",
  "Data analytics and visualization",
  "Basic JavaScript training",
  "Startup and digital-product development",
];

export const PROFESSIONAL_SKILLS: string[] = [
  "Organizational skills",
  "Strategic planning and scheduling",
  "Time management",
  "Verbal and written communication",
  "Collaboration",
  "Adaptability",
];

export type CertificateCategory =
  | "professional"
  | "completion"
  | "workshop"
  | "webinar";

export type CertificateRecord = {
  id: string;
  title: string;
  type: string;
  issuer: string;
  date?: string;
  credentialId?: string;
  expiration?: string;
  location?: string;
  controlNumber?: string;
  certificateNumber?: string;
  platform?: string;
  duration?: string;
  focus?: string;
  category: CertificateCategory;
  featured?: boolean;
  fileUrl: string;
  fileType: "pdf" | "image";
  previewImage?: string;
  previewAlt: string;
};

export const CREDENTIALS_CONTENT = {
  eyebrow: "PROFESSIONAL DEVELOPMENT",
  title: "Certificates & Credentials",
  intro:
    "Verified certifications, completed training, workshops, and industry learning activities that support my continued technical development.",
};

export const CERTIFICATE_FILTERS: { id: "all" | CertificateCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "professional", label: "Professional Certifications" },
  { id: "completion", label: "Course Completions" },
  { id: "workshop", label: "Workshops & Training" },
  { id: "webinar", label: "Webinars & Orientations" },
];

export const CERTIFICATES: CertificateRecord[] = [
  // Professional Certifications (featured)
  {
    id: "html-and-css",
    title: "HTML and CSS",
    type: "Information Technology Specialist",
    issuer: "Certiport / Pearson",
    date: "June 8, 2026",
    credentialId: "w63hn-48eh",
    expiration: "Five years after the date of issue",
    category: "professional",
    featured: true,
    fileUrl: "/assets/certificates/professional/html-and-css.pdf",
    fileType: "pdf",
    previewImage: "/assets/certificates/professional/html-and-css-preview.png",
    previewAlt: "HTML and CSS Information Technology Specialist certificate",
  },
  {
    id: "databases",
    title: "Databases",
    type: "Information Technology Specialist",
    issuer: "Certiport / Pearson",
    date: "June 3, 2025",
    credentialId: "oeeq-uSrC",
    category: "professional",
    featured: true,
    fileUrl: "/assets/certificates/professional/databases.pdf",
    fileType: "pdf",
    previewImage: "/assets/certificates/professional/databases-preview.png",
    previewAlt: "Databases Information Technology Specialist certificate",
  },

  // Course Completions
  {
    id: "modern-web-ai-uiux",
    title: "Modern Web + AI (UI/UX)",
    type: "Certificate of Completion",
    issuer: "NU Dasmariñas Computer Society",
    date: "April 23, 2025",
    category: "completion",
    fileUrl: "/assets/certificates/completion/modern-web-ai-uiux.pdf",
    fileType: "pdf",
    previewImage: "/assets/certificates/completion/modern-web-ai-uiux-preview.png",
    previewAlt: "Modern Web + AI (UI/UX) certificate of completion",
  },
  {
    id: "beyond-spreadsheets",
    title: "Beyond Spreadsheets: Visualizing Data's Story Through Analytics",
    type: "Certificate of Completion",
    issuer: "NU Dasmariñas Computer Society",
    category: "completion",
    fileUrl: "/assets/certificates/completion/beyond-spreadsheets-may7.pdf",
    fileType: "pdf",
    previewImage: "/assets/certificates/completion/beyond-spreadsheets-may7-preview.png",
    previewAlt:
      "Beyond Spreadsheets: Visualizing Data's Story Through Analytics certificate of completion",
  },

  // Workshops & Technical Training
  {
    id: "tech4all-uiux",
    title: "TECH4ALL: UI/UX Design",
    type: "Hands-on UI/UX workshop",
    issuer:
      "Junior Philippine Computer Society – NU Dasmariñas Chapter and NU Dasmariñas Computer Society",
    date: "January 31, 2026",
    focus: "User-centered design and UI/UX skill development",
    category: "workshop",
    fileUrl: "/assets/certificates/workshops/tech4all-uiux-workshop.pdf",
    fileType: "pdf",
    previewImage: "/assets/certificates/workshops/tech4all-uiux-workshop-preview.png",
    previewAlt: "TECH4ALL UI/UX Design workshop certificate",
  },
  {
    id: "armada-logics-javascript",
    title: "Armada Logics 3-Day Online Coding Training for Basic JavaScript",
    type: "Coding training",
    issuer: "Armada Logics",
    date: "October 31, 2024",
    duration: "1.5 hours",
    focus: "Basic JavaScript",
    category: "workshop",
    fileUrl: "/assets/certificates/workshops/armada-logics-basic-javascript.png",
    fileType: "image",
    previewAlt:
      "Armada Logics 3-Day Online Coding Training for Basic JavaScript certificate of participation",
  },

  // Webinars & Orientations
  {
    id: "cybersecurity-orientation",
    title: "Cybersecurity Orientation",
    type: "Certificate of Attendance",
    issuer: "Department of Information and Communications Technology Region IV-A",
    date: "May 17, 2024",
    location: "National University Dasmariñas",
    controlNumber: "006-PC04-05172024",
    category: "webinar",
    fileUrl: "/assets/certificates/webinars/cybersecurity-orientation-dict.pdf",
    fileType: "pdf",
    previewImage: "/assets/certificates/webinars/cybersecurity-orientation-dict-preview.png",
    previewAlt: "Cybersecurity Orientation certificate of attendance",
  },
  {
    id: "digital-startup-dsdap",
    title: "Digital Startup Development and Acceleration Program Caravan",
    type: "Certificate of Participation",
    issuer: "DICT Region IV-A, ICT Industry Development Bureau",
    date: "May 17, 2024",
    location: "National University – Dasmariñas Campus",
    controlNumber: "R4A_IIDB_DSDAP-08 / R4A_IIDB_DICT-R4A-2025123",
    category: "webinar",
    fileUrl: "/assets/certificates/webinars/digital-startup-dsdap.pdf",
    fileType: "pdf",
    previewImage: "/assets/certificates/webinars/digital-startup-dsdap-preview.png",
    previewAlt:
      "Digital Startup Development and Acceleration Program Caravan certificate of participation",
  },
  {
    id: "egovph-orientation",
    title: "eGOVPh Super App Orientation",
    type: "Certificate of Participation",
    issuer: "Department of Information and Communications Technology Region IV-A",
    date: "May 17, 2024",
    controlNumber: "R4A-eGOV-0517-003",
    certificateNumber: "DICT-R4A-EGOV-20591",
    category: "webinar",
    fileUrl: "/assets/certificates/webinars/egovph-super-app-orientation.pdf",
    fileType: "pdf",
    previewImage: "/assets/certificates/webinars/egovph-super-app-orientation-preview.png",
    previewAlt: "eGOVPh Super App Orientation certificate of participation",
  },
  {
    id: "women-leading-innovation",
    title:
      "Women Leading Innovation: Cybersecurity and Systems Biology for a Safer World",
    type: "Certificate of Participation",
    issuer: "CSP – SIG on Women in Computing",
    date: "November 8, 2024",
    category: "webinar",
    fileUrl: "/assets/certificates/webinars/women-leading-innovation-csp.pdf",
    fileType: "pdf",
    previewImage: "/assets/certificates/webinars/women-leading-innovation-csp-preview.png",
    previewAlt:
      "Women Leading Innovation: Cybersecurity and Systems Biology for a Safer World certificate of participation",
  },
  {
    id: "building-apis-nodejs",
    title: "Building Powerful APIs with Node.js, Prisma and MySQL",
    type: "Certificate of Participation",
    issuer: "Dev Squads",
    date: "November 30, 2024",
    platform: "Google Meet",
    category: "webinar",
    fileUrl: "/assets/certificates/webinars/building-apis-nodejs-prisma-mysql.pdf",
    fileType: "pdf",
    previewImage: "/assets/certificates/webinars/building-apis-nodejs-prisma-mysql-preview.png",
    previewAlt: "Building Powerful APIs with Node.js, Prisma and MySQL certificate",
  },
  {
    id: "software-development-101",
    title: "Software Development 101: A Beginner's Guide",
    type: "Certificate of Participation",
    issuer: "Mindoro State University – Bongabong Campus, College of Computer Studies",
    date: "December 14, 2024",
    category: "webinar",
    fileUrl: "/assets/certificates/webinars/software-development-101-minsu.png",
    fileType: "image",
    previewAlt: "Software Development 101: A Beginner's Guide certificate of participation",
  },
  {
    id: "iotverse",
    title:
      "IOTVERSE: A Webinar on the Future of Connectivity and Advancing Innovation on the Internet of Things",
    type: "Certificate of Participation",
    issuer: "Mindoro State University – Bongabong Campus, College of Computer Studies",
    date: "December 17, 2024",
    category: "webinar",
    fileUrl: "/assets/certificates/webinars/iotverse-minsu.pdf",
    fileType: "pdf",
    previewImage: "/assets/certificates/webinars/iotverse-minsu-preview.png",
    previewAlt:
      "IOTVERSE: A Webinar on the Future of Connectivity and Advancing Innovation on the Internet of Things certificate",
  },
  {
    id: "coding-to-csuite",
    title: "From Coding to C-Suite: Career Pathways for Women in Tech",
    type: "Certificate of Attendance",
    issuer: "CSP – Women in Computing",
    date: "February 21, 2025",
    category: "webinar",
    fileUrl: "/assets/certificates/webinars/from-coding-to-csuite-csp.png",
    fileType: "image",
    previewAlt: "From Coding to C-Suite: Career Pathways for Women in Tech certificate",
  },
  {
    id: "intro-tech-world-cloud",
    title: "Introduction to Tech World and Cloud Computing",
    type: "Certificate of Participation",
    issuer: "INF234",
    date: "February 24, 2025",
    category: "webinar",
    fileUrl: "/assets/certificates/webinars/intro-tech-world-cloud-computing-inf234.pdf",
    fileType: "pdf",
    previewImage: "/assets/certificates/webinars/intro-tech-world-cloud-computing-inf234-preview.png",
    previewAlt: "Introduction to Tech World and Cloud Computing certificate",
  },
  {
    id: "exploring-cloud-computing-construction",
    title:
      "Exploring the Tech World: Cloud Computing's Role in Construction Management",
    type: "Certificate of Participation",
    issuer: "INF234",
    date: "February 24, 2025",
    category: "webinar",
    fileUrl:
      "/assets/certificates/webinars/exploring-cloud-computing-construction-inf234.pdf",
    fileType: "pdf",
    previewImage:
      "/assets/certificates/webinars/exploring-cloud-computing-construction-inf234-preview.png",
    previewAlt:
      "Exploring the Tech World: Cloud Computing's Role in Construction Management certificate",
  },
];

export type AchievementRecord = {
  institution: string;
  title: string;
  years: string;
};

export const ACHIEVEMENTS_CONTENT = {
  eyebrow: "ACHIEVEMENTS",
  title: "Academic Recognition",
  intro:
    "Verified academic accomplishments that reflect consistent performance, discipline, and continued development.",
};

export const ACHIEVEMENTS: AchievementRecord[] = [
  {
    institution: "Bayanan Elementary School Unit 1",
    title: "Consistent with Honors, Grades 1–6",
    years: "2012–2017",
  },
  {
    institution: "Mary Mother of God Parochial School",
    title: "Consistent with Honors, Grades 7–10",
    years: "2017–2020",
  },
  {
    institution: "Lyceum of Alabang",
    title: "With High Honors",
    years: "2021–2023",
  },
  {
    institution: "Lyceum of Alabang",
    title: "Cookery NC II Passer – Gold Medalist",
    years: "2021–2023",
  },
  {
    institution: "Lyceum of Alabang",
    title: "Bread and Pastry Production NC II Passer – Gold Medalist",
    years: "2021–2023",
  },
  {
    institution: "National University – Dasmariñas",
    title: "Dean's Lister / First Honor",
    years: "Second to Third Semester, Academic Year 2023–2024",
  },
];

export type LeadershipRecord = {
  organization: string;
  role: string;
  years: string;
  hidden?: boolean;
  needsVerification?: boolean;
};

export const LEADERSHIP_CONTENT = {
  eyebrow: "LEADERSHIP & INVOLVEMENT",
  title: "Roles, Service & Recognition",
  intro:
    "Leadership and organizational experiences that strengthened my communication, responsibility, collaboration, and project coordination.",
};

export const LEADERSHIP: LeadershipRecord[] = [
  {
    organization: "NU Dasmariñas Computer Society",
    role: "Former Registration Committee",
    years: "2022–2023",
  },
  {
    organization: "NU Dasmariñas Student Government",
    role: "Former Photographer",
    years: "2022–2023",
  },
  {
    organization: "NU Dasmariñas Commission on Student Elections",
    role: "Former SECA Inspector",
    years: "2022–2023",
  },
  {
    organization: "Lyceum Circle of Home Economics Community",
    role: "Leadership Awardee",
    years: "2021–2023",
  },
  {
    organization: "Lyceum Circle of Home Economics Community",
    role: "Service Awardee",
    years: "2021–2023",
  },
  {
    organization: "Lyceum Circle of Home Economics Community",
    role: "Outstanding Club Member",
    years: "2021–2023",
  },
  // The résumé lists this role with a 2012–2024 date range, which is unusually
  // broad for a single class-officer term and cannot be verified as-is.
  // Keep it hidden from the public page until the correct years are confirmed.
  {
    organization: "Class Officer",
    role: "President",
    years: "2012–2024",
    needsVerification: true,
    hidden: true,
  },
];

export type EducationRecord = {
  institution: string;
  detail: string;
  location: string;
  years: string;
};

export const EDUCATION_CONTENT = {
  eyebrow: "EDUCATION",
  title: "Academic Background",
  intro:
    "My educational path has supported the development of my technical knowledge, leadership experience, and practical problem-solving skills.",
};

export const EDUCATION: EducationRecord[] = [
  {
    institution: "National University – Dasmariñas",
    detail: "Bachelor of Science in Information Technology",
    location: "Dasmariñas, Cavite",
    years: "2023–Present",
  },
  {
    institution: "Lyceum of Alabang",
    detail: "Technical-Vocational-Livelihood Track",
    location: "Muntinlupa City",
    years: "2021–2023",
  },
  {
    institution: "Mary Mother of God Parochial School",
    detail: "",
    location: "Muntinlupa City",
    years: "2017–2020",
  },
  {
    institution: "Bayanan Elementary School Unit 1",
    detail: "",
    location: "Muntinlupa City",
    years: "2012–2017",
  },
];

export type ReferenceRecord = {
  name: string;
  title: string;
  organization: string;
  contact?: string;
};

export const REFERENCES_CONTENT = {
  eyebrow: "PROFESSIONAL REFERENCES",
  title: "References",
  intro:
    "Academic and professional references who can provide additional information about my work, collaboration, technical contributions, and professional conduct.",
  fallbackMessage: "Professional references are available upon request.",
};

// No verified reference information has been provided yet.
// Add entries here only once names, titles, and organizations are confirmed.
export const REFERENCES: ReferenceRecord[] = [];
