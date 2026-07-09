export interface NormalizedResumeData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  summary: string;
  skills: {
    frontend: string[];
    backend: string[];
    database: string[];
    tools: string[];
    other: string[];
  };
  experience: Array<{
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    techStack: string[];
    description: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    score?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  achievements: string[];
  languages: string[];
  keywords: string[];
}

export function renderText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(renderText).filter(Boolean).join(", ");
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return [
      obj.name,
      obj.title,
      obj.role,
      obj.company,
      obj.issuer,
      obj.year,
      obj.description,
    ]
      .map(renderText)
      .filter(Boolean)
      .join(" - ");
  }
  return "";
}

export function safeArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(item => renderText(item).trim()).filter(Boolean);
  }
  const single = renderText(value).trim();
  return single ? [single] : [];
}

export function normalizeCertification(value: any): { name: string; issuer: string; year: string } {
  if (!value) {
    return { name: "", issuer: "", year: "" };
  }
  if (typeof value === "string") {
    return { name: value, issuer: "", year: "" };
  }
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return { name: renderText(value), issuer: "", year: "" };
    }
    return {
      name: renderText(value.name || value.title || value.certName || ""),
      issuer: renderText(value.issuer || value.organization || value.authority || ""),
      year: renderText(value.year || value.date || value.issueDate || "")
    };
  }
  return { name: String(value), issuer: "", year: "" };
}

export function normalizeExperience(value: any): any {
  if (!value || typeof value !== "object") {
    return {
      role: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      bullets: []
    };
  }
  return {
    role: renderText(value.role || value.jobTitle || value.title || ""),
    company: renderText(value.company || value.employer || ""),
    location: renderText(value.location || value.city || ""),
    startDate: renderText(value.startDate || value.start || ""),
    endDate: renderText(value.endDate || value.end || ""),
    bullets: safeArray(value.bullets || value.description || value.highlights || [])
  };
}

export function normalizeProject(value: any): any {
  if (!value || typeof value !== "object") {
    return {
      name: "",
      techStack: [],
      description: "",
      bullets: []
    };
  }
  return {
    name: renderText(value.name || value.title || ""),
    techStack: safeArray(value.techStack || value.technologies || value.skills || []),
    description: renderText(value.description || value.summary || ""),
    bullets: safeArray(value.bullets || value.highlights || [])
  };
}

export function normalizeEducation(value: any): any {
  if (!value || typeof value !== "object") {
    return {
      degree: "",
      institution: "",
      year: "",
      score: ""
    };
  }
  return {
    degree: renderText(value.degree || value.major || value.fieldOfStudy || ""),
    institution: renderText(value.institution || value.school || value.university || ""),
    year: renderText(value.year || value.date || value.graduationYear || ""),
    score: renderText(value.score || value.gpa || value.grade || "")
  };
}

export function normalizeResumeData(data: unknown): any {
  if (!data || typeof data !== "object") {
    return {
      personalInfo: {
        fullName: "",
        jobTitle: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        portfolio: ""
      },
      summary: "",
      skills: {
        frontend: [],
        backend: [],
        database: [],
        tools: [],
        other: []
      },
      experience: [],
      projects: [],
      education: [],
      certifications: [],
      achievements: [],
      languages: [],
      keywords: []
    };
  }

  const raw = data as Record<string, any>;

  // Personal Info
  const rawPersonalInfo = raw.personalInfo || {};
  const personalInfo = {
    fullName: renderText(rawPersonalInfo.fullName || ""),
    jobTitle: renderText(rawPersonalInfo.jobTitle || ""),
    email: renderText(rawPersonalInfo.email || ""),
    phone: renderText(rawPersonalInfo.phone || ""),
    location: renderText(rawPersonalInfo.location || ""),
    linkedin: renderText(rawPersonalInfo.linkedin || ""),
    github: renderText(rawPersonalInfo.github || ""),
    portfolio: renderText(rawPersonalInfo.portfolio || "")
  };

  // Summary
  const summary = renderText(raw.summary || "");

  // Skills
  const rawSkills = raw.skills || {};
  const skills = {
    frontend: safeArray(rawSkills.frontend || []),
    backend: safeArray(rawSkills.backend || []),
    database: safeArray(rawSkills.database || []),
    tools: safeArray(rawSkills.tools || []),
    other: safeArray(rawSkills.other || [])
  };

  // Experience
  const experience = Array.isArray(raw.experience)
    ? raw.experience.map(normalizeExperience)
    : [];

  // Projects
  const projects = Array.isArray(raw.projects)
    ? raw.projects.map(normalizeProject)
    : [];

  // Education
  const education = Array.isArray(raw.education)
    ? raw.education.map(normalizeEducation)
    : [];

  // Certifications
  const certifications = Array.isArray(raw.certifications)
    ? raw.certifications.map(normalizeCertification)
    : [];

  // Achievements
  const achievements = safeArray(raw.achievements || []);

  // Languages
  const languages = safeArray(raw.languages || []);

  // Keywords
  const keywords = safeArray(raw.keywords || []);

  return {
    personalInfo,
    summary,
    skills,
    experience,
    projects,
    education,
    certifications,
    achievements,
    languages,
    keywords
  };
}

export function normalizeStringArray(value: any): string[] {
  return safeArray(value);
}
