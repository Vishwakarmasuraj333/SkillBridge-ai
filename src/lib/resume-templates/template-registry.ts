export interface TemplateConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  layoutType: "classic" | "modern" | "ats" | "executive" | "sidebar" | "developer" | "corporate" | "elegant" | "tech" | "compact";
  colorPalette: "indigo" | "dark" | "emerald" | "violet" | "slate" | "amber" | "crimson" | "teal" | "navy" | "minimal" | "purple" | "orange" | "green";
  fontStyle: "sans" | "serif" | "mono";
  isFree: boolean;
}

export const templatesListRegistry: TemplateConfig[] = [
  // --- ATS Friendly ---
  {
    id: "ats-classic",
    name: "ATS Classic",
    category: "ATS Friendly",
    description: "Standard single column ATS-compliant layout with clean divider lines.",
    tags: ["ATS Friendly", "Minimal", "Classic"],
    layoutType: "ats",
    colorPalette: "minimal",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "ats-minimal",
    name: "ATS Minimal",
    category: "ATS Friendly",
    description: "Maximum compliance format optimized for automated applicant parsers.",
    tags: ["ATS Friendly", "Minimal"],
    layoutType: "ats",
    colorPalette: "minimal",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "ats-compact",
    name: "ATS Compact",
    category: "ATS Friendly",
    description: "A space-saving layout built to squeeze maximum data on a single page.",
    tags: ["ATS Friendly", "Compact"],
    layoutType: "compact",
    colorPalette: "minimal",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "no-photo-ats",
    name: "No Photo ATS",
    category: "ATS Friendly",
    description: "Standard layout focusing on core competencies without image placeholders.",
    tags: ["ATS Friendly", "Classic"],
    layoutType: "ats",
    colorPalette: "slate",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "black-white-professional",
    name: "Black White Professional",
    category: "ATS Friendly",
    description: "A highly formal layout using clean grid columns and strict black and white contrast.",
    tags: ["ATS Friendly", "Corporate", "Classic"],
    layoutType: "ats",
    colorPalette: "minimal",
    fontStyle: "serif",
    isFree: true
  },
  {
    id: "classic-harvard",
    name: "Classic Harvard Style",
    category: "ATS Friendly",
    description: "An academic layout mimicking Ivy League resumes using traditional fonts.",
    tags: ["ATS Friendly", "Classic", "Academic"],
    layoutType: "ats",
    colorPalette: "minimal",
    fontStyle: "serif",
    isFree: true
  },

  // --- Software Engineer ---
  {
    id: "software-engineer-pro",
    name: "Software Engineer Pro",
    category: "Software Engineer",
    description: "Tech-oriented layout showing languages and frame tools near the top.",
    tags: ["Developer", "Tech", "Modern"],
    layoutType: "modern",
    colorPalette: "indigo",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "backend-engineer-dark",
    name: "Backend Engineer Dark",
    category: "Software Engineer",
    description: "A terminal-themed layout styled for system builders and database engineers.",
    tags: ["Developer", "Tech", "Dark"],
    layoutType: "developer",
    colorPalette: "dark",
    fontStyle: "mono",
    isFree: true
  },
  {
    id: "python-developer-minimal",
    name: "Python Developer Minimal",
    category: "Software Engineer",
    description: "A clean minimalist profile layout designed for data scientists and backend devs.",
    tags: ["Developer", "Minimal"],
    layoutType: "ats",
    colorPalette: "slate",
    fontStyle: "mono",
    isFree: true
  },
  {
    id: "experienced-developer",
    name: "Experienced Developer",
    category: "Software Engineer",
    description: "A structure optimized to highlight progressive roles and systems projects.",
    tags: ["Developer", "Tech", "Executive"],
    layoutType: "executive",
    colorPalette: "navy",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "senior-engineer",
    name: "Senior Engineer",
    category: "Software Engineer",
    description: "A layout designed to place tech leadership, system design, and mentoring focus first.",
    tags: ["Developer", "Executive"],
    layoutType: "executive",
    colorPalette: "slate",
    fontStyle: "sans",
    isFree: true
  },

  // --- Frontend Developer ---
  {
    id: "frontend-blue",
    name: "Frontend Blue",
    category: "Frontend Developer",
    description: "A vibrant modern card-accent style showcasing design capabilities.",
    tags: ["Developer", "Modern", "Creative"],
    layoutType: "modern",
    colorPalette: "indigo",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "react-developer-sidebar",
    name: "React Developer Sidebar",
    category: "Frontend Developer",
    description: "A dual column split profile to display tech stack filters alongside projects.",
    tags: ["Developer", "Sidebar"],
    layoutType: "sidebar",
    colorPalette: "teal",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "teal-developer",
    name: "Teal Developer",
    category: "Frontend Developer",
    description: "A clean layout with sharp modern margins and vibrant green-blue touches.",
    tags: ["Developer", "Modern"],
    layoutType: "modern",
    colorPalette: "teal",
    fontStyle: "sans",
    isFree: true
  },

  // --- Full Stack Developer ---
  {
    id: "full-stack-modern",
    name: "Full Stack Modern",
    category: "Full Stack Developer",
    description: "Highly structural layout designed to separate client-side and server-side skills.",
    tags: ["Developer", "Tech"],
    layoutType: "modern",
    colorPalette: "violet",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "mern-stack-clean",
    name: "MERN Stack Clean",
    category: "Full Stack Developer",
    description: "A clean grid design presenting databases and APIs with visual contrast.",
    tags: ["Developer", "Tech", "Minimal"],
    layoutType: "ats",
    colorPalette: "emerald",
    fontStyle: "mono",
    isFree: true
  },
  {
    id: "next-js-developer",
    name: "Next.js Developer",
    category: "Full Stack Developer",
    description: "Optimized for JavaScript frameworks, highlighting component library skills.",
    tags: ["Developer", "Tech"],
    layoutType: "tech",
    colorPalette: "slate",
    fontStyle: "sans",
    isFree: true
  },

  // --- Data Analyst ---
  {
    id: "data-analyst-clean",
    name: "Data Analyst Clean",
    category: "Data Analyst",
    description: "Highlights mathematical backgrounds, business metrics, and database details.",
    tags: ["Data", "Minimal"],
    layoutType: "ats",
    colorPalette: "navy",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "data-scientist-modern",
    name: "Data Scientist Modern",
    category: "Data Analyst",
    description: "Highlights quantitative models, pipelines, and machine learning stacks.",
    tags: ["Data", "Tech"],
    layoutType: "modern",
    colorPalette: "emerald",
    fontStyle: "mono",
    isFree: true
  },
  {
    id: "ai-engineer-pro",
    name: "AI Engineer Pro",
    category: "Data Analyst",
    description: "A terminal style presentation for LLM, PyTorch, and cloud engineers.",
    tags: ["Data", "Tech", "Dark"],
    layoutType: "developer",
    colorPalette: "dark",
    fontStyle: "mono",
    isFree: true
  },

  // --- UI/UX Designer ---
  {
    id: "ui-designer-creative",
    name: "UI Designer Creative",
    category: "UI/UX Designer",
    description: "Showcases aesthetics with a striking asymmetrical structure.",
    tags: ["Designer", "Creative"],
    layoutType: "sidebar",
    colorPalette: "purple",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "ux-researcher-elegant",
    name: "UX Researcher Elegant",
    category: "UI/UX Designer",
    description: "An elegant serif-based design focus for human-computer interaction designers.",
    tags: ["Designer", "Elegant"],
    layoutType: "elegant",
    colorPalette: "crimson",
    fontStyle: "serif",
    isFree: true
  },
  {
    id: "orange-designer",
    name: "Orange Designer",
    category: "UI/UX Designer",
    description: "A warm, high-contrast creative profile designed for digital creators.",
    tags: ["Designer", "Creative"],
    layoutType: "modern",
    colorPalette: "orange",
    fontStyle: "sans",
    isFree: true
  },

  // --- Product Manager ---
  {
    id: "product-manager-executive",
    name: "Product Manager Executive",
    category: "Product Manager",
    description: "A layout structured to present product metrics, scale, and cross-team focus.",
    tags: ["Executive", "Corporate"],
    layoutType: "corporate",
    colorPalette: "navy",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "project-based-resume",
    name: "Project Based Resume",
    category: "Product Manager",
    description: "Focuses on delivery timelines and technical program details.",
    tags: ["Executive", "Modern"],
    layoutType: "modern",
    colorPalette: "slate",
    fontStyle: "sans",
    isFree: true
  },

  // --- Marketing ---
  {
    id: "marketing-specialist-modern",
    name: "Marketing Specialist Modern",
    category: "Marketing",
    description: "A vibrant format ideal for SEO, growth hack, and analytics managers.",
    tags: ["Marketing", "Creative"],
    layoutType: "modern",
    colorPalette: "purple",
    fontStyle: "sans",
    isFree: true
  },

  // --- Corporate ---
  {
    id: "corporate-elite",
    name: "Corporate Elite",
    category: "Corporate",
    description: "Premium executive layout with deep slate borders and clear layout spacing.",
    tags: ["Corporate", "Executive"],
    layoutType: "corporate",
    colorPalette: "slate",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "navy-corporate",
    name: "Navy Corporate",
    category: "Corporate",
    description: "Double border design styled with rich classic navy corporate palettes.",
    tags: ["Corporate", "Classic"],
    layoutType: "corporate",
    colorPalette: "navy",
    fontStyle: "sans",
    isFree: true
  },

  // --- Executive ---
  {
    id: "executive-pro",
    name: "Executive Pro",
    category: "Executive",
    description: "Ivy league serif styling built for directors and management profiles.",
    tags: ["Executive", "Classic"],
    layoutType: "executive",
    colorPalette: "minimal",
    fontStyle: "serif",
    isFree: true
  },

  // --- Creative ---
  {
    id: "creative-sidebar",
    name: "Creative Sidebar",
    category: "Creative",
    description: "Vibrant left column split layout highlighting contact metrics and profile.",
    tags: ["Creative", "Sidebar"],
    layoutType: "sidebar",
    colorPalette: "indigo",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "purple-creative",
    name: "Purple Creative",
    category: "Creative",
    description: "Asymmetrical columns combined with a purple palette to stand out.",
    tags: ["Creative", "Sidebar"],
    layoutType: "sidebar",
    colorPalette: "purple",
    fontStyle: "sans",
    isFree: true
  },

  // --- Base Templates Re-mapped ---
  {
    id: "developer-dark",
    name: "Developer Dark",
    category: "Software Engineer",
    description: "A light-contrast monospaced layout designed for code builders.",
    tags: ["Developer", "Tech"],
    layoutType: "developer",
    colorPalette: "dark",
    fontStyle: "mono",
    isFree: true
  },
  {
    id: "tech-gradient",
    name: "Tech Gradient",
    category: "Software Engineer",
    description: "Vibrant cyber style accents mapping frameworks and project tags.",
    tags: ["Developer", "Tech"],
    layoutType: "tech",
    colorPalette: "violet",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "compact-one-page",
    name: "Compact One Page",
    category: "One Page",
    description: "Highly compressed spacing to guarantee fitting data on a single page.",
    tags: ["Compact", "Minimal"],
    layoutType: "compact",
    colorPalette: "slate",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "elegant-serif",
    name: "Elegant Serif",
    category: "Minimal",
    description: "A serif-font centered layout built for classical humanities and arts portfolios.",
    tags: ["Minimal", "Classic"],
    layoutType: "elegant",
    colorPalette: "minimal",
    fontStyle: "serif",
    isFree: true
  },
  {
    id: "modern-blue",
    name: "Modern Blue",
    category: "Modern",
    description: "Clean modern columns styled with tech-oriented deep blue borders.",
    tags: ["Modern", "Classic"],
    layoutType: "modern",
    colorPalette: "indigo",
    fontStyle: "sans",
    isFree: true
  },

  // --- Additional Layouts ---
  {
    id: "minimal-black",
    name: "Minimal Black",
    category: "Minimal",
    description: "Clean black-only headers with crisp sans spacing.",
    tags: ["Minimal", "Modern"],
    layoutType: "ats",
    colorPalette: "minimal",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "clean-grey",
    name: "Clean Grey",
    category: "Minimal",
    description: "A neutral slate grey design with a modern technical header.",
    tags: ["Minimal", "Modern"],
    layoutType: "ats",
    colorPalette: "slate",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "timeline-resume",
    name: "Timeline Resume",
    category: "Modern",
    description: "Left borders mapping roles to a vertical timeline visual representation.",
    tags: ["Modern", "Creative"],
    layoutType: "modern",
    colorPalette: "indigo",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "left-sidebar-pro",
    name: "Left Sidebar Pro",
    category: "Sidebar",
    description: "A formal sidebar layout containing skills, contact and education.",
    tags: ["Sidebar", "Minimal"],
    layoutType: "sidebar",
    colorPalette: "slate",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "right-sidebar-modern",
    name: "Right Sidebar Modern",
    category: "Sidebar",
    description: "A modern reversed sidebar layout showing contact metrics on the right side.",
    tags: ["Sidebar", "Modern"],
    layoutType: "sidebar",
    colorPalette: "indigo",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "photo-header-resume",
    name: "Photo Header Resume",
    category: "Modern",
    description: "Layout with a dedicated top header space for an elegant personal profile.",
    tags: ["Modern", "Creative"],
    layoutType: "modern",
    colorPalette: "indigo",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "green-modern",
    name: "Green Modern",
    category: "Modern",
    description: "A modern design accented with beautiful forest green details.",
    tags: ["Modern", "Creative"],
    layoutType: "modern",
    colorPalette: "green",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "orange-creative",
    name: "Orange Creative",
    category: "Creative",
    description: "Vibrant and warm layouts accented with beautiful sunset orange.",
    tags: ["Creative", "Modern"],
    layoutType: "modern",
    colorPalette: "orange",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "blue-grid-resume",
    name: "Blue Grid Resume",
    category: "Creative",
    description: "Grid visual cards structure to group education, skills, and experience blocks.",
    tags: ["Creative", "Modern"],
    layoutType: "modern",
    colorPalette: "indigo",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "split-column-resume",
    name: "Split Column Resume",
    category: "Sidebar",
    description: "A symmetrical split format ideal for balancing core career details.",
    tags: ["Sidebar", "Modern"],
    layoutType: "sidebar",
    colorPalette: "slate",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "card-section-resume",
    name: "Card Section Resume",
    category: "Modern",
    description: "Groups projects and work histories into clean visual cards.",
    tags: ["Modern", "Creative"],
    layoutType: "modern",
    colorPalette: "violet",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "minimal-line-resume",
    name: "Minimal Line Resume",
    category: "Minimal",
    description: "Horizontal borders and line styling for maximum structural clarity.",
    tags: ["Minimal", "ATS Friendly"],
    layoutType: "ats",
    colorPalette: "minimal",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "bold-header-resume",
    name: "Bold Header Resume",
    category: "Modern",
    description: "Vibrant high contrast header bar to draw immediate attention to candidates.",
    tags: ["Modern", "Creative"],
    layoutType: "modern",
    colorPalette: "indigo",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "indian-fresher-resume",
    name: "Indian Fresher Resume",
    category: "Minimal",
    description: "Clean single-page layout matching conventions of Indian freshers.",
    tags: ["Minimal", "Classic"],
    layoutType: "ats",
    colorPalette: "navy",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "internship-resume",
    name: "Internship Resume",
    category: "Minimal",
    description: "Tailored to showcase coursework, projects, and university activities.",
    tags: ["Minimal", "Academic"],
    layoutType: "ats",
    colorPalette: "slate",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "bsc-it-fresher",
    name: "BSc IT Fresher",
    category: "Minimal",
    description: "Showcases computer science foundations, code repositories and labs.",
    tags: ["Minimal", "Tech"],
    layoutType: "ats",
    colorPalette: "indigo",
    fontStyle: "sans",
    isFree: true
  },
  {
    id: "software-fresher",
    name: "Software Fresher",
    category: "Minimal",
    description: "A crisp resume format targeting entry-level tech developer jobs.",
    tags: ["Minimal", "Tech"],
    layoutType: "ats",
    colorPalette: "emerald",
    fontStyle: "mono",
    isFree: true
  }
];
