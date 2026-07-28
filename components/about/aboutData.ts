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
  "Basic computer literacy",
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
