import { StructuredResumeData } from "@/components/resume-templates/types";
import { normalizeResumeData, renderText, normalizeStringArray } from "./resume-normalizer";

export function renderResumeHtml(
  templateId: string,
  rawStructuredData: any,
  isPremiumUser: boolean
): string {
  const data: any = normalizeResumeData(rawStructuredData);
  const { personalInfo, summary, skills, experience, projects, education, certifications, achievements } = data;

  // Set font links & styles based on templateId
  let fontLink = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">';
  let bodyFont = 'font-family: "Inter", sans-serif;';
  let primaryColor = "#2563eb"; // Blue 600

  if (templateId === "classic-clean" || templateId === "elegant-serif") {
    fontLink = '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">';
    bodyFont = 'font-family: "Lora", serif;';
  } else if (templateId === "developer-dark" || templateId === "minimal-ats") {
    fontLink = '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet">';
    bodyFont = 'font-family: "Fira Code", monospace;';
  }

  // Force white background for printing
  const bgColor = "#ffffff";
  const textColor = "#1f2937";
  const borderColor = "#e5e7eb";

  // Watermark/Footer
  const footerHtml = isPremiumUser
    ? ""
    : `<div class="watermark" style="text-align: center; font-size: 9px; color: #9ca3af; margin-top: 30px; border-top: 1px solid ${borderColor}; padding-top: 10px; font-family: sans-serif;">Created with SkillBridge AI Resume Builder</div>`;

  // HTML content builders
  const skillsHtml = () => {
    if (!skills || Object.values(skills).every((arr: any) => !arr || arr.length === 0)) return "";
    return `
      <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="skills-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          ${skills.frontend?.length ? `<p style="font-size: 10.5px; margin: 0;"><strong>Frontend:</strong> ${skills.frontend.join(", ")}</p>` : ''}
          ${skills.backend?.length ? `<p style="font-size: 10.5px; margin: 0;"><strong>Backend:</strong> ${skills.backend.join(", ")}</p>` : ''}
          ${skills.database?.length ? `<p style="font-size: 10.5px; margin: 0;"><strong>Database:</strong> ${skills.database.join(", ")}</p>` : ''}
          ${skills.tools?.length ? `<p style="font-size: 10.5px; margin: 0;"><strong>Tools:</strong> ${skills.tools.join(", ")}</p>` : ''}
          ${skills.other?.length ? `<p style="font-size: 10.5px; margin: 0;"><strong>Other:</strong> ${skills.other.join(", ")}</p>` : ''}
        </div>
      </div>
    `;
  };

  const experienceHtml = () => {
    if (!experience || experience.length === 0) return "";
    return `
      <div class="section">
        <div class="section-title">Professional Experience</div>
        ${experience.map((exp: any) => `
          <div class="item" style="margin-bottom: 12px; page-break-inside: avoid;">
            <div class="item-header" style="display: flex; justify-content: space-between; font-size: 11px;">
              <span><strong style="color: #111827;">${renderText(exp.role)}</strong> at <strong>${renderText(exp.company)}</strong></span>
              <span style="color: #6b7280; font-weight: 500;">${renderText(exp.startDate)} - ${renderText(exp.endDate)}</span>
            </div>
            <div style="font-size: 9.5px; color: #6b7280; font-style: italic; margin-bottom: 4px;">${renderText(exp.location)}</div>
            ${exp.bullets?.length ? `
              <ul class="bullets" style="margin-top: 4px; padding-left: 15px; font-size: 10px; color: #374151; line-height: 1.4;">
                ${normalizeStringArray(exp.bullets).map(b => `<li style="margin-bottom: 2px;">${renderText(b)}</li>`).join("")}
              </ul>
            ` : ""}
          </div>
        `).join("")}
      </div>
    `;
  };

  const projectsHtml = () => {
    if (!projects || projects.length === 0) return "";
    return `
      <div class="section">
        <div class="section-title">Projects</div>
        ${projects.map((proj: any) => `
          <div class="item" style="margin-bottom: 12px; page-break-inside: avoid;">
            <div class="item-header" style="display: flex; justify-content: space-between; font-size: 11px;">
              <span><strong style="color: #111827;">${renderText(proj.name)}</strong></span>
              <span style="font-size: 9.5px; color: ${primaryColor}; font-weight: bold;">${proj.techStack ? normalizeStringArray(proj.techStack).join(", ") : ""}</span>
            </div>
            <p style="margin: 4px 0; font-size: 10px; color: #374151; line-height: 1.4;">${renderText(proj.description)}</p>
            ${proj.bullets?.length ? `
              <ul class="bullets" style="padding-left: 15px; font-size: 10px; color: #374151; line-height: 1.4;">
                ${normalizeStringArray(proj.bullets).map(b => `<li style="margin-bottom: 2px;">${renderText(b)}</li>`).join("")}
              </ul>
            ` : ""}
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
        ${education.map((edu: any) => `
          <div class="item-header" style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; page-break-inside: avoid;">
            <span><strong>${renderText(edu.degree)}</strong> - <em>${renderText(edu.institution)}</em> ${edu.score ? `(${renderText(edu.score)})` : ''}</span>
            <span style="color: #6b7280; font-weight: 500;">${renderText(edu.year)}</span>
          </div>
        `).join("")}
      </div>
    `;
  };

  const certsHtml = () => {
    const hasCerts = certifications && certifications.length > 0;
    const hasAchievements = achievements && achievements.length > 0;
    if (!hasCerts && !hasAchievements) return "";
    return `
      <div class="section" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; page-break-inside: avoid;">
        ${hasCerts ? `
          <div>
            <div class="section-title">Certifications</div>
            <ul class="bullets" style="padding-left: 15px; font-size: 10px; color: #374151; line-height: 1.4;">
              ${normalizeStringArray(certifications).map(c => `<li style="margin-bottom: 2px;">${renderText(c)}</li>`).join("")}
            </ul>
          </div>
        ` : ''}
        ${hasAchievements ? `
          <div>
            <div class="section-title">Achievements</div>
            <ul class="bullets" style="padding-left: 15px; font-size: 10px; color: #374151; line-height: 1.4;">
              ${normalizeStringArray(achievements).map(a => `<li style="margin-bottom: 2px;">${renderText(a)}</li>`).join("")}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  };

  let layoutHtml = '';

  if (templateId === "creative-sidebar") {
    layoutHtml = `
      <div style="display: grid; grid-template-columns: 1fr 2.2fr; min-height: 100vh;">
        <!-- Left Sidebar (dark accent, but cleanly contrasted for print) -->
        <div style="background-color: #0f172a; color: #cbd5e1; padding: 40px 20px; border-right: 1px solid #1e293b;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 0 0 5px 0;">${renderText(personalInfo.fullName)}</h1>
          <p style="color: #38bdf8; font-size: 11px; font-weight: 600; margin: 0 0 25px 0; text-transform: uppercase; letter-spacing: 0.5px;">${renderText(personalInfo.jobTitle)}</p>

          <div style="margin-bottom: 25px;">
            <div style="font-size: 10px; font-weight: bold; color: #ffffff; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 4px; margin-bottom: 8px; letter-spacing: 0.5px;">Contact</div>
            <div style="font-size: 9.5px; line-height: 1.6;">
              <p style="margin: 3px 0;">📞 ${renderText(personalInfo.phone)}</p>
              <p style="margin: 3px 0;">✉️ ${renderText(personalInfo.email)}</p>
              <p style="margin: 3px 0;">📍 ${renderText(personalInfo.location)}</p>
              ${personalInfo.linkedin ? `<p style="margin: 3px 0;">🔗 ${renderText(personalInfo.linkedin).replace(/https?:\/\/(www\.)?/, "")}</p>` : ''}
            </div>
          </div>

          ${skills && Object.values(skills).some((arr: any) => arr && arr.length > 0) ? `
            <div style="margin-bottom: 25px;">
              <div style="font-size: 10px; font-weight: bold; color: #ffffff; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 4px; margin-bottom: 8px; letter-spacing: 0.5px;">Skills</div>
              <div style="font-size: 9px; line-height: 1.5;">
                ${Object.entries(skills).map(([cat, items]) => {
                  const arr = normalizeStringArray(items);
                  if (arr.length === 0) return "";
                  return `<p style="margin: 0 0 4px 0;"><strong style="color: #38bdf8; text-transform: capitalize;">${cat}:</strong> ${arr.join(", ")}</p>`;
                }).join("")}
              </div>
            </div>
          ` : ''}

          ${education && education.length > 0 ? `
            <div>
              <div style="font-size: 10px; font-weight: bold; color: #ffffff; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 4px; margin-bottom: 8px; letter-spacing: 0.5px;">Education</div>
              <div style="font-size: 9px; line-height: 1.5;">
                ${education.map((edu: any) => `
                  <div style="margin-bottom: 8px;">
                    <p style="font-weight: bold; color: #ffffff; margin: 0;">${renderText(edu.degree)}</p>
                    <p style="margin: 0; color: #94a3b8;">${renderText(edu.institution)}</p>
                    <p style="color: #64748b; margin: 0;">${renderText(edu.year)}</p>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Main Body Area -->
        <div style="padding: 40px 30px; background-color: #ffffff; color: #1e293b;">
          ${summary ? `
            <div style="margin-bottom: 25px;">
              <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-bottom: 8px; color: #0f172a; letter-spacing: 0.5px;">Professional Profile</div>
              <p style="font-size: 10.5px; color: #334155; line-height: 1.5; text-align: justify; margin: 0;">${renderText(summary)}</p>
            </div>
          ` : ''}

          ${experienceHtml()}
          ${projectsHtml()}
          ${certsHtml()}
        </div>
      </div>
    `;
  } else {
    // Top Headers for other layouts
    let headerHtml = '';

    if (templateId === "modern-blue") {
      headerHtml = `
        <div style="border-left: 4px solid #2563eb; padding-left: 15px; margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0;">${renderText(personalInfo.fullName)}</h1>
          <p style="font-size: 12px; font-weight: bold; color: #2563eb; margin: 2px 0 0 0; text-transform: uppercase;">${renderText(personalInfo.jobTitle)}</p>
          <div style="font-size: 9.5px; color: #64748b; margin-top: 8px; display: flex; flex-wrap: wrap; gap: 12px;">
            <span>📞 ${renderText(personalInfo.phone)}</span>
            <span>✉️ ${renderText(personalInfo.email)}</span>
            <span>📍 ${renderText(personalInfo.location)}</span>
            ${personalInfo.linkedin ? `<span>🔗 ${renderText(personalInfo.linkedin).replace(/https?:\/\/(www\.)?/, "")}</span>` : ''}
          </div>
        </div>
      `;
    } else if (templateId === "developer-dark") {
      // Light-contrasted mono layout for print
      headerHtml = `
        <div style="border: 1px solid #e5e7eb; background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
          <div style="color: #4f46e5; font-size: 9px; margin-bottom: 6px; font-family: monospace;">&gt; cat developer_profile.md</div>
          <h1 style="font-size: 20px; font-weight: bold; color: #111827; margin: 0;">${renderText(personalInfo.fullName)}</h1>
          <p style="font-size: 11px; color: #4f46e5; margin: 4px 0 0 0; font-family: monospace;">${renderText(personalInfo.jobTitle)}</p>
          <div style="font-size: 9.5px; color: #4b5563; margin-top: 10px; display: flex; flex-wrap: wrap; gap: 12px; font-family: monospace;">
            <span>TEL: ${renderText(personalInfo.phone)}</span>
            <span>EMAIL: ${renderText(personalInfo.email)}</span>
            <span>LOC: ${renderText(personalInfo.location)}</span>
          </div>
        </div>
      `;
    } else if (templateId === "tech-gradient") {
      headerHtml = `
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: 800; color: #1e3a8a; margin: 0;">${renderText(personalInfo.fullName)}</h1>
          <p style="font-size: 11px; color: #3b82f6; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">${renderText(personalInfo.jobTitle)}</p>
          <div style="font-size: 9.5px; color: #4b5563; margin-top: 8px; display: flex; flex-wrap: wrap; gap: 12px;">
            <span>📞 ${renderText(personalInfo.phone)}</span>
            <span>✉️ ${renderText(personalInfo.email)}</span>
            <span>📍 ${renderText(personalInfo.location)}</span>
          </div>
        </div>
      `;
    } else if (templateId === "corporate-elite") {
      headerHtml = `
        <div style="border-bottom: 3px double #1e3a8a; padding-bottom: 10px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 style="font-size: 24px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; margin: 0;">${renderText(personalInfo.fullName)}</h1>
              <p style="font-size: 11px; color: #4b5563; margin: 3px 0 0 0; font-weight: 600;">${renderText(personalInfo.jobTitle)}</p>
            </div>
            <div style="text-align: right; font-size: 9.5px; color: #4b5563; line-height: 1.4;">
              <p style="margin: 0;">${renderText(personalInfo.phone)} | ${renderText(personalInfo.email)}</p>
              <p style="margin: 0;">${renderText(personalInfo.location)}</p>
            </div>
          </div>
        </div>
      `;
    } else {
      // Classic Clean / Minimal ATS / Executive Pro / Elegant Serif / Compact One Page
      headerHtml = `
        <div style="text-align: center; border-bottom: 1px solid ${borderColor}; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0; color: #111827;">${renderText(personalInfo.fullName)}</h1>
          <p style="font-size: 11px; font-style: italic; color: #4b5563; margin: 4px 0 0 0;">${renderText(personalInfo.jobTitle)}</p>
          <div style="font-size: 9.5px; color: #4b5563; margin-top: 8px; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
            <span>${renderText(personalInfo.phone)}</span>
            <span>•</span>
            <span>${renderText(personalInfo.email)}</span>
            <span>•</span>
            <span>${renderText(personalInfo.location)}</span>
          </div>
        </div>
      `;
    }

    // Force small compact font size for compact layout
    const compactStyle = templateId === "compact-one-page" ? 'font-size: 10px; line-height: 1.25;' : '';

    layoutHtml = `
      <div style="padding: 40px; min-height: 100%; ${compactStyle}">
        ${headerHtml}

        ${summary ? `
          <div class="section">
            <div class="section-title">Professional Summary</div>
            <p style="font-size: 10.5px; line-height: 1.4; text-align: justify; color: #374151; margin: 0;">${renderText(summary)}</p>
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

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${personalInfo.fullName || "Candidate"} - Resume</title>
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
          margin-bottom: 18px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          border-bottom: 1.5px solid #111827;
          padding-bottom: 3px;
          margin-bottom: 8px;
          color: #111827;
          letter-spacing: 0.5px;
        }
        .bullets {
          list-style-type: disc;
        }
        @media print {
          body {
            background-color: #ffffff;
            color: #000000;
          }
          .watermark {
            position: running(footer);
          }
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        ${layoutHtml}
        ${footerHtml}
      </div>
    </body>
    </html>
  `;
}
