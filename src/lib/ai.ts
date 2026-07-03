import { generateGeminiContent, getWorkingGeminiModel } from "./gemini";
import { generateOpenAIContent } from "./openai";

function hasGeminiKey(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

function hasOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

function parseJSONSafely(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  cleaned = cleaned.trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    try {
      // Repaired JSON syntax for trailing commas or mismatched quotes
      const repaired = cleaned
        .replace(/,(\s*[}\]])/g, "$1")
        .replace(/[\u201c\u201d]/g, '"');
      return JSON.parse(repaired);
    } catch (repairError) {
      console.error("Failed to parse JSON content:", cleaned);
      throw new Error("AI provider returned invalid JSON format.");
    }
  }
}

// Coordinate AI execution with fallback loop
export async function generateJSONWithAI(
  prompt: string,
  systemInstruction: string,
  schemaHint?: string
): Promise<{ text: string; isMock: boolean; model: string }> {
  // 1. Try Gemini primary
  if (hasGeminiKey()) {
    try {
      const { text, modelUsed } = await generateGeminiContent(prompt, systemInstruction);
      return { text, isMock: false, model: modelUsed };
    } catch (geminiError: any) {
      console.error("Gemini primary connection failed:", geminiError);
      
      // If OpenAI is not configured, bubble up the Gemini error immediately
      if (!hasOpenAIKey()) {
        throw new Error(`Gemini connection error: ${geminiError.message || geminiError}`);
      }
    }
  }

  // 2. Try OpenAI fallback
  if (hasOpenAIKey()) {
    try {
      const text = await generateOpenAIContent(prompt, systemInstruction);
      return { text, isMock: false, model: process.env.OPENAI_MODEL || "gpt-4o-mini" };
    } catch (openAiError: any) {
      console.error("OpenAI fallback connection failed:", openAiError);
      throw new Error(`OpenAI fallback error: ${openAiError.message || openAiError}`);
    }
  }

  // 3. Both missing: fallback to development mock mode
  return { text: "", isMock: true, model: "mock-mode" };
}

// 1. Resume Analyzer
export async function analyzeResumeWithAI(resumeText: string) {
  const systemInstruction = `You are an expert ATS (Applicant Tracking System) recruiter. Analyze the provided resume text and return a JSON object with this exact structure:
{
  "score": 85,
  "summary": "Professional summary of the resume...",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "skillsFound": ["Skill 1", "Skill 2"],
  "skillsToAdd": ["Skill 3", "Skill 4"],
  "checklist": ["Action 1", "Action 2"]
}`;

  const { text, isMock, model } = await generateJSONWithAI(resumeText, systemInstruction);

  if (isMock) {
    return {
      isMock: true,
      model,
      score: 72,
      summary: "The candidate demonstrates solid foundational experience in software engineering, showing familiarity with JavaScript, React, and general frontend development. However, the resume lacks details on achievements, metrics, and backend integration.",
      strengths: [
        "Strong frontend experience with modern frameworks like React and Next.js.",
        "Demonstrated project work in single-page applications.",
        "Clean formatting and clear section divisions."
      ],
      weaknesses: [
        "Lack of metrics (e.g., speed improvements, efficiency gains, user count growth).",
        "Sparse details on testing practices or CI/CD pipelines.",
        "Backend skills are mentioned but not backed by project details."
      ],
      missingKeywords: ["Typescript", "REST APIs", "Unit Testing", "CI/CD", "Node.js", "Docker"],
      suggestions: [
        "Quantify your accomplishments: change 'worked on frontend' to 'improved load times by 20% by refactoring state management'.",
        "Add a dedicated section for technical achievements and developer tools.",
        "Ensure your contact details include a professional GitHub or portfolio link."
      ],
      skillsFound: ["JavaScript", "HTML5", "CSS3", "React", "Tailwind CSS", "Git"],
      skillsToAdd: ["TypeScript", "Node.js", "Express", "Prisma", "Docker"],
      checklist: [
        "Add quantitative metrics to at least 3 bullet points.",
        "Incorporate at least 4 of the missing keywords identified.",
        "Ensure all URLs are clickable and profile is updated."
      ]
    };
  }

  const parsed = parseJSONSafely(text);
  // Ensure checklist array mappings
  const checklist = parsed.checklist || parsed.improvementChecklist || [];
  return { ...parsed, checklist, isMock: false, model };
}

// 2. Job Description Matcher
export async function matchResumeWithJobAI(resumeText: string, jobDescription: string) {
  const systemInstruction = `You are an ATS analyzer comparing a candidate's resume against a job description. Analyze both texts and return a JSON object with this exact structure:
{
  "matchPercentage": 75,
  "matchingSkills": ["Skill 1", "Skill 2"],
  "missingSkills": ["Skill 3", "Skill 4"],
  "recommendedKeywords": ["Keyword 1", "Keyword 2"],
  "experienceGap": "Analysis of the experience gap between the candidate's resume and the job requirements...",
  "improvementPoints": ["Improvement Point 1", "Improvement Point 2"]
}`;

  const promptInput = `RESUME TEXT:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`;
  const { text, isMock, model } = await generateJSONWithAI(promptInput, systemInstruction);

  if (isMock) {
    return {
      isMock: true,
      model,
      matchPercentage: 65,
      matchingSkills: ["React", "JavaScript", "Tailwind CSS", "Git"],
      missingSkills: ["TypeScript", "Next.js Route Handlers", "MySQL", "Prisma ORM"],
      recommendedKeywords: ["Full Stack", "Backend Development", "Database Schema", "Authentication", "Deployment"],
      experienceGap: "The target job requires experience in full-stack architecture including MySQL databases, APIs, and authentication flow. The candidate's resume shows mostly frontend-focused work, with no direct references to database schemas, Prisma, or Node.js backend integration.",
      improvementPoints: [
        "Update the summary statement to reflect full-stack aspirations or baseline Node.js/express skills.",
        "Add a personal project that demonstrates database migrations or Prisma schema configuration.",
        "Mention backend services or API routes that you have built or configured in past projects."
      ]
    };
  }

  const parsed = parseJSONSafely(text);
  return { ...parsed, isMock: false, model };
}

// 3. Cover Letter Generator
export async function generateCoverLetterAI(
  resumeText: string,
  jobData: { jobTitle: string; company?: string; jobDescriptionText: string }
) {
  const systemInstruction = `You are a professional career coach. Based on the candidate's resume and target job context, generate a highly personalized, compelling, and professional cover letter. Return a JSON object with this exact structure:
{
  "title": "Tailored Cover Letter for [Company Name/Role]",
  "content": "Dear Hiring Manager,\\n\\nI am writing to express my strong interest in the [Role] position... [Tailored content matching resume strengths to job requirements]... \\n\\nSincerely,\\n[Candidate Name]"
}`;

  const promptInput = `RESUME:\n${resumeText}\n\nJOB DETAILS:\nTitle: ${jobData.jobTitle}\nCompany: ${jobData.company || "target company"}\nDescription: ${jobData.jobDescriptionText}`;
  const { text, isMock, model } = await generateJSONWithAI(promptInput, systemInstruction);

  if (isMock) {
    return {
      isMock: true,
      model,
      title: `Tailored Cover Letter - ${jobData.jobTitle} Role`,
      content: `Dear Hiring Team,

I am writing to express my enthusiastic interest in the ${jobData.jobTitle} position ${jobData.company ? `at ${jobData.company}` : ""}. With my background in building responsive frontend applications and full-stack solutions, I am confident in my ability to contribute effectively to your development team.

In reviewing your job requirements, I noticed a strong emphasis on React, TypeScript, and clean code principles. During my recent work, I have focused on refactoring components, integrating RESTful API endpoints, and utilizing modern design systems like Tailwind CSS to deliver user-centric layouts. For example, I have successfully reduced bundle sizes and styled clean user dashboards that improve client engagement.

Furthermore, I am eager to apply and expand my capabilities in backend engineering, database schema migrations, and REST architecture using Node.js. I thrive in collaborative environments where continuous learning and high-quality implementation are valued.

Thank you for your time and consideration. I look forward to discussing how my skills and background align with your team's needs.

Sincerely,
Job Seeker`
    };
  }

  const parsed = parseJSONSafely(text);
  return { ...parsed, isMock: false, model };
}

// 4. Interview Coach
export async function generateInterviewQuestionsAI(
  resumeText: string,
  role: string,
  level: string,
  type: string
) {
  const systemInstruction = `You are an expert technical interviewer. Based on the candidate's resume, target role "${role}", target difficulty level "${level}", and question focus type "${type}" (HR, Technical, Project Based, Mixed), generate a list of 5-8 relevant interview questions. Return a JSON object with this exact structure:
{
  "role": "${role}",
  "level": "${level}",
  "questions": [
    {
      "question": "The interview question text...",
      "type": "${type}",
      "sampleAnswer": "A short, structured sample answer highlighting what the interviewer is looking for."
    }
  ]
}`;

  const promptInput = `RESUME:\n${resumeText}\n\nTARGET ROLE: ${role}\nLEVEL: ${level}\nTYPE FOCUS: ${type}`;
  const { text, isMock, model } = await generateJSONWithAI(promptInput, systemInstruction);

  if (isMock) {
    return {
      isMock: true,
      model,
      role: role || "Full Stack Developer",
      level: level || "Intermediate",
      questions: [
        {
          "question": "Can you walk me through your experience building web applications with React and state management?",
          "type": type || "HR",
          "sampleAnswer": "Start by introducing your projects, focus on why you chose React, discuss how you managed state (e.g., Context API or Redux), and describe a specific challenge you solved regarding component re-rendering."
        },
        {
          "question": "In Prisma 7, what is a driver adapter, and why is it now required when connecting to databases like MySQL?",
          "type": type || "Technical",
          "sampleAnswer": "In Prisma 7, driver adapters are required because the native Rust-based engine query execution has been streamlined. It compiles to pure JS/TS, requiring an external driver (like @prisma/adapter-mariadb for MySQL) to handle connection pooling."
        },
        {
          "question": "Explain a project where you handled user authentication. How did you secure passwords and maintain login state?",
          "type": type || "Project Based",
          "sampleAnswer": "Mention hashing passwords using bcryptjs, storing them in a MySQL database, issuing a JWT on login, and storing the token securely in an HTTP-only cookie to prevent XSS attacks."
        }
      ]
    };
  }

  const parsed = parseJSONSafely(text);
  return { ...parsed, isMock: false, model };
}

// Signature wrappers for backwards compatibility
export async function analyzeResume(resumeText: string) {
  return analyzeResumeWithAI(resumeText);
}

export async function matchJob(resumeText: string, jobDescription: string) {
  return matchResumeWithJobAI(resumeText, jobDescription);
}

export async function generateCoverLetter(resumeText: string, jobDescriptionText: string) {
  return generateCoverLetterAI(resumeText, { jobTitle: "Software Engineer", jobDescriptionText });
}

export async function generateInterview(resumeText: string, role: string, level: string) {
  return generateInterviewQuestionsAI(resumeText, role, level, "Mixed");
}
