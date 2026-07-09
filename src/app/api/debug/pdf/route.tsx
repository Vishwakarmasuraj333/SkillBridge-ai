export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { renderToBuffer } from "@react-pdf/renderer";
import { ResumePdfDocument } from "@/lib/pdf/resume-pdf-document";
import { StructuredResumeData } from "@/components/resume-templates/types";

export async function GET() {
  try {
    const sampleData: StructuredResumeData = {
      personalInfo: {
        fullName: "Suraj Vishwakarma",
        jobTitle: "Full Stack Developer",
        email: "suraj@example.com",
        phone: "+91 9999999999",
        location: "Mumbai, India",
        linkedin: "linkedin.com/in/suraj",
        github: "github.com/suraj",
        portfolio: "suraj.dev"
      },
      summary: "Passionate Full Stack Developer with experience building scalable web applications and AI-driven platforms. Highly skilled in React, Next.js, Node.js, and relational databases.",
      skills: {
        frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux"],
        backend: ["Node.js", "Express.js", "Prisma", "REST APIs"],
        database: ["MySQL", "TiDB", "PostgreSQL", "MongoDB"],
        tools: ["Git", "GitHub", "Docker", "VS Code", "Vercel"],
        other: ["Agile Development", "System Design", "Technical Writing"]
      },
      experience: [
        {
          role: "Full Stack Engineer",
          company: "SkillBridge AI",
          location: "Remote",
          startDate: "Jan 2024",
          endDate: "Present",
          bullets: [
            "Developed responsive AI resume builder utilizing Next.js and Tailwind CSS.",
            "Integrated server-side PDF generation, reducing export generation overhead.",
            "Collaborated with design teams to establish dynamic templating systems."
          ]
        },
        {
          role: "Software Developer Intern",
          company: "Fototrendz",
          location: "Mumbai",
          startDate: "Jun 2023",
          endDate: "Dec 2023",
          bullets: [
            "Maintained frontend modules for high-traffic media portals.",
            "Optimized database queries, improving page load speeds by 15%."
          ]
        }
      ],
      projects: [
        {
          name: "SkillBridge AI",
          techStack: ["Next.js", "TypeScript", "Prisma", "MySQL"],
          description: "An AI-powered resume builder and optimizer featuring multiple styling themes and immediate PDF exports.",
          bullets: [
            "Designed and built custom templates mapped to distinct CSS theme families.",
            "Implemented server-side resume parser and optimizer integration."
          ]
        },
        {
          name: "E-commerce Dashboard",
          techStack: ["React", "Node.js", "MongoDB"],
          description: "Administrative interface managing inventory, orders, and analytical charts.",
          bullets: [
            "Integrated chart visualizations for sales statistics and dynamic order statuses."
          ]
        }
      ],
      education: [
        {
          degree: "BSc in Information Technology",
          institution: "Mumbai University",
          year: "2023",
          score: "9.2 CGPA"
        }
      ],
      certifications: [
        {
          name: "Full Stack Web Development Certification",
          issuer: "Udemy",
          year: "2023"
        }
      ]
    };

    const pdfBuffer = await renderToBuffer(
      <ResumePdfDocument data={sampleData} templateId="classic-clean" />
    );

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="debug-sample-resume.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("[DEBUG_PDF_ERROR]", error);
    return new Response(JSON.stringify({ error: "Failed to generate debug PDF document." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
