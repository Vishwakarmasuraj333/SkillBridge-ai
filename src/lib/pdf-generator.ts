import puppeteer from "puppeteer";
import { StructuredResumeData } from "../components/resume-templates/types";
import { normalizeResumeData } from "./resume-normalizer";

// Generate HTML string for the PDF rendering
export function generateResumeHTML(templateId: string, data: StructuredResumeData, isPremium: boolean): string {
  const { personalInfo, summary, skills, experience, projects, education, certifications, achievements } = data;

  // Choose stylesheet & colors based on templateId
  let fontLink = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">';
  let bodyFont = 'font-family: "Inter", sans-serif;';

  const isDark = templateId === "developer-dark" || templateId === "tech-gradient";
  const bgColor = isDark ? "#09090b" : "#ffffff";
  const textColor = isDark ? "#fafafa" : "#1f2937";
  const borderColor = isDark ? "#27272a" : "#e5e7eb";

  // Footer/Watermark logic
  const footerHtml = isPremium 
    ? "" 
    : `<div class="watermark" style="text-align: center; font-size: 10px; color: ${isDark ? "#71717a" : "#9ca3af"}; margin-top: 30px; border-top: 1px solid ${borderColor}; padding-top: 10px;">Created with SkillBridge AI Resume Builder</div>`;

  if (templateId === "classic-clean" || templateId === "elegant-serif") {
    fontLink = '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">';
    bodyFont = 'font-family: "Lora", serif;';
  } else if (templateId === "developer-dark") {
    fontLink = '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet">';
    bodyFont = 'font-family: "Fira Code", monospace;';
  }

  // Define template-specific layouts
  let layoutHtml = '';

  // Render sub-sections
  const skillsHtml = () => {
    if (!skills || Object.values(skills).every(arr => !arr || arr.length === 0)) return "";
    return `
      <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="skills-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          ${skills.frontend?.length ? `<p style="font-size: 10.5px;"><strong>Frontend:</strong> ${skills.frontend.join(", ")}</p>` : ''}
          ${skills.backend?.length ? `<p style="font-size: 10.5px;"><strong>Backend:</strong> ${skills.backend.join(", ")}</p>` : ''}
          ${skills.database?.length ? `<p style="font-size: 10.5px;"><strong>Database:</strong> ${skills.database.join(", ")}</p>` : ''}
          ${skills.tools?.length ? `<p style="font-size: 10.5px;"><strong>Tools:</strong> ${skills.tools.join(", ")}</p>` : ''}
          ${skills.other?.length ? `<p style="font-size: 10.5px;"><strong>Other:</strong> ${skills.other.join(", ")}</p>` : ''}
        </div>
      </div>
    `;
  };

  const experienceHtml = () => {
    if (!experience || experience.length === 0) return "";
    return `
      <div class="section">
        <div class="section-title">Work History</div>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="role"><strong>${exp.role}</strong> - ${exp.company}</span>
              <span class="date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <div style="font-size: 10px; color: ${isDark ? "#a1a1aa" : "#4b5563"}; font-style: italic;">${exp.location}</div>
            <ul class="bullets">
              ${exp.bullets.map(b => `<li>${b}</li>`).join("")}
            </ul>
          </div>
        `).join("")}
      </div>
    `;
  };

  const projectsHtml = () => {
    if (!projects || projects.length === 0) return "";
    return `
      <div class="section">
        <div class="section-title">Featured Projects</div>
        ${projects.map(proj => `
          <div class="item">
            <div class="item-header">
              <span class="role"><strong>${proj.name}</strong></span>
              <span class="date" style="font-size: 10px; color: ${isDark ? "#60a5fa" : "#2563eb"}; font-weight: bold;">${proj.techStack?.join(", ") || ""}</span>
            </div>
            <p style="margin-top: 4px; font-size: 11px; color: ${isDark ? "#d4d4d8" : "#374151"};">${proj.description}</p>
            ${proj.bullets?.length ? `<ul class="bullets">${proj.bullets.map(b => `<li>${b}</li>`).join("")}</ul>` : ''}
          </div>
        `).join("")}
      </div>
    `;
  };

  const educationHtml = () => {
    if (!education || education.length === 0) return "";
    return `
      <div class="section">
        <div class="section-title">Education</div>
        ${education.map(edu => `
          <div class="item-header" style="margin-bottom: 5px;">
            <span><strong>${edu.degree}</strong>, <em>${edu.institution}</em> ${edu.score ? `(${edu.score})` : ''}</span>
            <span class="date"><strong>${edu.year}</strong></span>
          </div>
        `).join("")}
      </div>
    `;
  };

  const certsHtml = () => {
    if ((!certifications || certifications.length === 0) && (!achievements || achievements.length === 0)) return "";
    return `
      <div class="section" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        ${certifications?.length ? `
          <div>
            <div class="section-title">Certifications</div>
            <ul class="bullets" style="padding-left: 15px;">
              ${certifications.map(c => `<li>${c}</li>`).join("")}
            </ul>
          </div>
        ` : ''}
        ${achievements?.length ? `
          <div>
            <div class="section-title">Achievements</div>
            <ul class="bullets" style="padding-left: 15px;">
              ${achievements.map(a => `<li>${a}</li>`).join("")}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  };

  // Build the layout based on templateId
  if (templateId === "creative-sidebar") {
    layoutHtml = `
      <div style="display: grid; grid-template-columns: 1fr 2.2fr; min-height: 100vh;">
        <!-- Sidebar -->
        <div style="background-color: #0f172a; color: #cbd5e1; padding: 30px 20px; border-right: 1px solid #1e293b;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: bold; margin-bottom: 5px;">${personalInfo.fullName}</h1>
          <p style="color: #38bdf8; font-size: 11px; font-weight: 600; margin-bottom: 25px; text-transform: uppercase;">${personalInfo.jobTitle}</p>

          <div style="margin-bottom: 25px;">
            <div style="font-size: 10px; font-weight: bold; color: #ffffff; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 4px; margin-bottom: 8px; letter-spacing: 0.5px;">Contact Info</div>
            <div style="font-size: 9.5px; line-height: 1.6;">
              <p>📞 ${personalInfo.phone}</p>
              <p>✉️ ${personalInfo.email}</p>
              <p>📍 ${personalInfo.location}</p>
              ${personalInfo.linkedin ? `<p>🔗 ${personalInfo.linkedin.replace(/https?:\/\/(www\.)?/, "")}</p>` : ''}
            </div>
          </div>

          ${skills && Object.values(skills).some(arr => arr && arr.length > 0) ? `
            <div style="margin-bottom: 25px;">
              <div style="font-size: 10px; font-weight: bold; color: #ffffff; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 4px; margin-bottom: 8px; letter-spacing: 0.5px;">Expertise</div>
              <div style="font-size: 9.5px; line-height: 1.6;">
                ${Object.entries(skills).map(([cat, items]) => {
                  if (!items || items.length === 0) return "";
                  return `<p style="margin-bottom: 4px;"><strong style="color: #38bdf8; text-transform: capitalize;">${cat}:</strong> ${items.join(", ")}</p>`;
                }).join("")}
              </div>
            </div>
          ` : ''}

          ${education && education.length > 0 ? `
            <div>
              <div style="font-size: 10px; font-weight: bold; color: #ffffff; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 4px; margin-bottom: 8px; letter-spacing: 0.5px;">Education</div>
              <div style="font-size: 9.5px; line-height: 1.6;">
                ${education.map(edu => `
                  <div style="margin-bottom: 10px;">
                    <p style="font-weight: bold; color: #ffffff; margin: 0;">${edu.degree}</p>
                    <p style="margin: 0; color: #94a3b8;">${edu.institution}</p>
                    <p style="color: #64748b; margin: 0;">${edu.year}</p>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Main Area -->
        <div style="padding: 40px 30px; background-color: #ffffff; color: #1e293b;">
          ${summary ? `
            <div style="margin-bottom: 25px;">
              <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-bottom: 8px; color: #0f172a; letter-spacing: 0.5px;">Professional Profile</div>
              <p style="font-size: 11px; color: #334155; line-height: 1.5; text-align: justify; margin: 0;">${summary}</p>
            </div>
          ` : ''}

          ${experienceHtml()}
          ${projectsHtml()}
          ${certsHtml()}
        </div>
      </div>
    `;
  } else {
    // Standard templates
    let headerHtml = '';

    if (templateId === "modern-blue") {
      headerHtml = `
        <div style="border-left: 4px solid #2563eb; padding-left: 15px; margin-bottom: 20px;">
          <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0;">${personalInfo.fullName}</h1>
          <p style="font-size: 13px; font-weight: bold; color: #2563eb; margin: 2px 0 0 0; text-transform: uppercase;">${personalInfo.jobTitle}</p>
          <div style="font-size: 10px; color: #64748b; margin-top: 8px; display: flex; flex-wrap: wrap; gap: 12px;">
            <span>📞 ${personalInfo.phone}</span>
            <span>✉️ ${personalInfo.email}</span>
            <span>📍 ${personalInfo.location}</span>
            ${personalInfo.linkedin ? `<span>🔗 ${personalInfo.linkedin.replace(/https?:\/\/(www\.)?/, "")}</span>` : ''}
          </div>
        </div>
      `;
    } else if (templateId === "developer-dark") {
      headerHtml = `
        <div style="border: 1px solid #27272c; background-color: #18181b; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
          <div style="color: #60a5fa; font-size: 10px; margin-bottom: 8px; font-family: monospace;">&gt; cat developer_profile.md</div>
          <h1 style="font-size: 22px; font-weight: bold; color: #ffffff; margin: 0;">${personalInfo.fullName}</h1>
          <p style="font-size: 12px; color: #60a5fa; margin: 4px 0 0 0;">${personalInfo.jobTitle}</p>
          <div style="font-size: 10px; color: #71717a; margin-top: 10px; display: flex; flex-wrap: wrap; gap: 12px; font-family: monospace;">
            <span>TEL: ${personalInfo.phone}</span>
            <span>EMAIL: ${personalInfo.email}</span>
            <span>LOC: ${personalInfo.location}</span>
          </div>
        </div>
      `;
    } else if (templateId === "tech-gradient") {
      headerHtml = `
        <div style="border-bottom: 1px solid #27272a; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="font-size: 26px; font-weight: 800; background: linear-gradient(to right, #60a5fa, #818cf8, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">${personalInfo.fullName}</h1>
          <p style="font-size: 12px; color: #a1a1aa; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">${personalInfo.jobTitle}</p>
          <div style="font-size: 10px; color: #71717a; margin-top: 10px; display: flex; flex-wrap: wrap; gap: 12px;">
            <span>📞 ${personalInfo.phone}</span>
            <span>✉️ ${personalInfo.email}</span>
            <span>📍 ${personalInfo.location}</span>
          </div>
        </div>
      `;
    } else {
      // Default / Classic Clean
      headerHtml = `
        <div style="text-align: center; border-bottom: 1px solid ${borderColor}; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0; color: ${isDark ? "#ffffff" : "#111827"};">${personalInfo.fullName}</h1>
          <p style="font-size: 12px; font-style: italic; color: ${isDark ? "#a1a1aa" : "#4b5563"}; margin: 4px 0 0 0;">${personalInfo.jobTitle}</p>
          <div style="font-size: 10px; color: ${isDark ? "#71717a" : "#6b7280"}; margin-top: 8px; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
            <span>${personalInfo.phone}</span>
            <span>•</span>
            <span>${personalInfo.email}</span>
            <span>•</span>
            <span>${personalInfo.location}</span>
          </div>
        </div>
      `;
    }

    layoutHtml = `
      <div style="padding: 40px; min-height: 100%;">
        ${headerHtml}

        ${summary ? `
          <div class="section">
            <div class="section-title">Summary</div>
            <p style="font-size: 11px; line-height: 1.5; text-align: justify; color: ${isDark ? "#d4d4d8" : "#374151"}; margin: 0;">${summary}</p>
          </div>
        ` : ''}

        ${experienceHtml()}
        ${projectsHtml()}
        ${skillsHtml()}
        ${educationHtml()}
        ${certsHtml()}
      </div>
    `;
  }

  // Wrap in boilerplate HTML containing printing setup
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${personalInfo.fullName} - Resume</title>
      ${fontLink}
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          ${bodyFont}
          background-color: ${bgColor};
          color: ${textColor};
          line-height: 1.4;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: ${templateId === "modern-blue" ? "#2563eb" : (templateId === "developer-dark" ? "#60a5fa" : (isDark ? "#ffffff" : "#1f2937"))};
          border-bottom: 1px solid ${borderColor};
          padding-bottom: 4px;
          margin-bottom: 10px;
        }
        .item {
          margin-bottom: 12px;
          page-break-inside: avoid;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: ${isDark ? "#ffffff" : "#111827"};
        }
        .role {
          font-weight: 700;
        }
        .date {
          font-weight: 500;
          color: ${isDark ? "#a1a1aa" : "#6b7280"};
        }
        .bullets {
          margin-top: 5px;
          padding-left: 18px;
          font-size: 10.5px;
          color: ${isDark ? "#d4d4d8" : "#4b5563"};
        }
        .bullets li {
          margin-bottom: 3px;
        }
        @media print {
          body {
            background-color: ${bgColor};
            color: ${textColor};
          }
          html, body {
            height: 99%;
          }
          .print-footer {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
          }
        }
      </style>
    </head>
    <body>
      ${layoutHtml}
      ${footerHtml}
    </body>
    </html>
  `;
}

export async function generatePDF(templateId: string, data: StructuredResumeData, isPremium: boolean): Promise<Buffer> {
  const normalizedData = normalizeResumeData(data);
  const html = generateResumeHTML(templateId, normalizedData, isPremium);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" as any });
    
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0px",
        bottom: "0px",
        left: "0px",
        right: "0px",
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export async function generateResumePdfBuffer({ html, fileName }: { html: string; fileName?: string }): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" as any });
    
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "12mm",
        right: "12mm",
        bottom: "12mm",
        left: "12mm"
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
