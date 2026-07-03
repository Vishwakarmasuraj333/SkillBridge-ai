export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Skills {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  tools?: string[];
  other?: string[];
}

export interface Experience {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Project {
  name: string;
  techStack: string[];
  description: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  score?: string;
}

export interface StructuredResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  skills: Skills;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications?: any[];
  achievements?: string[];
  languages?: string[];
  keywords?: string[];
}

export interface TemplateProps {
  data: StructuredResumeData;
  isPremiumUser?: boolean;
}
