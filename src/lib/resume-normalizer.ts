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

export function normalizeStringArray(value: any): string[] {
  if (!value) return [];
  if (!Array.isArray(value)) {
    const single = renderText(value);
    return single ? [single] : [];
  }
  return value
    .map(item => renderText(item).trim())
    .filter(Boolean);
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
    bullets: normalizeStringArray(value.bullets || value.description || value.highlights || [])
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
    techStack: normalizeStringArray(value.techStack || value.technologies || value.skills || []),
    description: renderText(value.description || value.summary || ""),
    bullets: normalizeStringArray(value.bullets || value.highlights || [])
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

export function normalizeResumeData(data: any): any {
  if (!data) {
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

  // Personal Info
  const rawPersonalInfo = data.personalInfo || {};
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
  const summary = renderText(data.summary || "");

  // Skills
  const rawSkills = data.skills || {};
  const skills = {
    frontend: normalizeStringArray(rawSkills.frontend || []),
    backend: normalizeStringArray(rawSkills.backend || []),
    database: normalizeStringArray(rawSkills.database || []),
    tools: normalizeStringArray(rawSkills.tools || []),
    other: normalizeStringArray(rawSkills.other || [])
  };

  // Experience
  const experience = Array.isArray(data.experience)
    ? data.experience.map(normalizeExperience)
    : [];

  // Projects
  const projects = Array.isArray(data.projects)
    ? data.projects.map(normalizeProject)
    : [];

  // Education
  const education = Array.isArray(data.education)
    ? data.education.map(normalizeEducation)
    : [];

  // Certifications
  const certifications = Array.isArray(data.certifications)
    ? data.certifications.map(normalizeCertification)
    : [];

  // Achievements
  const achievements = normalizeStringArray(data.achievements || []);

  // Languages
  const languages = normalizeStringArray(data.languages || []);

  // Keywords
  const keywords = normalizeStringArray(data.keywords || []);

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
