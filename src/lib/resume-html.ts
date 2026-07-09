import { StructuredResumeData } from "@/components/resume-templates/types";
import { normalizeResumeData, renderText, normalizeStringArray } from "./resume-normalizer";
import { templatesListRegistry } from "@/lib/resume-templates/template-registry";

const PALETTES = {
  indigo: { primary: "#2563eb", accent: "#3b82f6", text: "#1f2937", bg: "#eff6ff", border: "#bfdbfe" },
  dark: { primary: "#0f172a", accent: "#6366f1", text: "#1f2937", bg: "#f8fafc", border: "#cbd5e1" },
  emerald: { primary: "#059669", accent: "#10b981", text: "#1f2937", bg: "#ecfdf5", border: "#a7f3d0" },
  violet: { primary: "#7c3aed", accent: "#8b5cf6", text: "#1f2937", bg: "#f5f3ff", border: "#ddd6fe" },
  slate: { primary: "#475569", accent: "#64748b", text: "#1f2937", bg: "#f8fafc", border: "#e2e8f0" },
  amber: { primary: "#d97706", accent: "#f59e0b", text: "#1f2937", bg: "#fffbeb", border: "#fde68a" },
  crimson: { primary: "#dc2626", accent: "#ef4444", text: "#1f2937", bg: "#fef2f2", border: "#fecaca" },
  teal: { primary: "#0d9488", accent: "#14b8a6", text: "#1f2937", bg: "#f0fdfa", border: "#99f6e4" },
  navy: { primary: "#1e3a8a", accent: "#3b82f6", text: "#1f2937", bg: "#eff6ff", border: "#bfdbfe" },
  purple: { primary: "#9333ea", accent: "#a855f7", text: "#1f2937", bg: "#faf5ff", border: "#e9d5ff" },
  orange: { primary: "#ea580c", accent: "#f97316", text: "#1f2937", bg: "#fff7ed", border: "#ffedd5" },
  green: { primary: "#16a34a", accent: "#22c55e", text: "#1f2937", bg: "#f0fdf4", border: "#bbf7d0" },
  minimal: { primary: "#000000", accent: "#374151", text: "#171717", bg: "#ffffff", border: "#e5e5e5" }
};

const FONTS = {
  sans: {
    link: '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">',
    family: 'font-family: "Inter", sans-serif;'
  },
  serif: {
    link: '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">',
    family: 'font-family: "Lora", Georgia, serif;'
  },
  mono: {
    link: '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet">',
    family: 'font-family: "Fira Code", monospace;'
  }
};

export function renderResumeHtml(
  templateId: string,
  rawStructuredData: any,
  isPremiumUser: boolean
): string {
  const data: any = normalizeResumeData(rawStructuredData);
  const { personalInfo, summary, skills, experience, projects, education, certifications, achievements } = data;

  // Resolve active template settings
  const templateConfig = templatesListRegistry.find(t => t.id === templateId) || templatesListRegistry[0];
  const palette = PALETTES[templateConfig.colorPalette] || PALETTES.indigo;
  const font = FONTS[templateConfig.fontStyle] || FONTS.sans;

  const fontLink = font.link;
  const bodyFont = font.family;
  const primaryColor = palette.primary;
  const borderColor = palette.border;

  // Force clean background for print compatibility
  const bgColor = "#ffffff";
  const textColor = palette.text;

  // Watermark/Footer is disabled or small
  const footerHtml = isPremiumUser
    ? ""
    : `<div class="watermark" style="text-align: center; font-size: 8px; color: #9ca3af; margin-top: 30px; border-top: 1px solid ${borderColor}; padding-top: 8px; font-family: sans-serif;">Created with SkillBridge AI Resume Builder</div>`;

  // Section render helpers
  const skillsHtml = () => {
    if (!skills || Object.values(skills).every((arr: any) => !arr || arr.length === 0)) return "";
    return `
      <div class="section">
        <div class="section-title" style="color: ${primaryColor}; border-bottom-color: ${primaryColor};">Skills Profile</div>
        <div class="skills-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 9.5px;">
          ${skills.frontend?.length ? `<p style="margin: 0;"><strong>Frontend:</strong> ${skills.frontend.join(", ")}</p>` : ''}
          ${skills.backend?.length ? `<p style="margin: 0;"><strong>Backend:</strong> ${skills.backend.join(", ")}</p>` : ''}
          ${skills.database?.length ? `<p style="margin: 0;"><strong>Database:</strong> ${skills.database.join(", ")}</p>` : ''}
          ${skills.tools?.length ? `<p style="margin: 0;"><strong>Tools:</strong> ${skills.tools.join(", ")}</p>` : ''}
          ${skills.other?.length ? `<p style="margin: 0;"><strong>Other:</strong> ${skills.other.join(", ")}</p>` : ''}
        </div>
      </div>
    `;
  };

  const experienceHtml = () => {
    if (!experience || experience.length === 0) return "";
    return `
      <div class="section">
        <div class="section-title" style="color: ${primaryColor}; border-bottom-color: ${primaryColor};">Professional Experience</div>
        ${experience.map((exp: any) => `
          <div class="item" style="margin-bottom: 10px; page-break-inside: avoid;">
            <div class="item-header" style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: bold;">
              <span><strong style="color: #111827;">${renderText(exp.role)}</strong> at <strong>${renderText(exp.company)}</strong></span>
              <span style="color: #4b5563; font-weight: 500;">${renderText(exp.startDate)} - ${renderText(exp.endDate)}</span>
            </div>
            <div style="font-size: 9px; color: #6b7280; font-style: italic; margin-bottom: 3px;">${renderText(exp.location)}</div>
            ${exp.bullets?.length ? `
              <ul class="bullets" style="margin-top: 3px; padding-left: 15px; font-size: 9.5px; color: #374151; line-height: 1.4;">
                ${normalizeStringArray(exp.bullets).map(b => `<li style="margin-bottom: 1.5px;">${renderText(b)}</li>`).join("")}
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
        <div class="section-title" style="color: ${primaryColor}; border-bottom-color: ${primaryColor};">Projects</div>
        ${projects.map((proj: any) => `
          <div class="item" style="margin-bottom: 10px; page-break-inside: avoid;">
            <div class="item-header" style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: bold;">
              <span><strong style="color: #111827;">${renderText(proj.name)}</strong></span>
              <span style="font-size: 8.5px; color: ${primaryColor}; font-weight: bold;">${proj.techStack ? normalizeStringArray(proj.techStack).join(", ") : ""}</span>
            </div>
            <p style="margin: 3px 0; font-size: 9.5px; color: #374151; line-height: 1.4;">${renderText(proj.description)}</p>
            ${proj.bullets?.length ? `
              <ul class="bullets" style="padding-left: 15px; font-size: 9.5px; color: #374151; line-height: 1.3;">
                ${normalizeStringArray(proj.bullets).map(b => `<li style="margin-bottom: 1.5px;">${renderText(b)}</li>`).join("")}
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
        <div class="section-title" style="color: ${primaryColor}; border-bottom-color: ${primaryColor};">Education</div>
        ${education.map((edu: any) => `
          <div class="item-header" style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px; page-break-inside: avoid;">
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
      <div class="section" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; page-break-inside: avoid;">
        ${hasCerts ? `
          <div>
            <div class="section-title" style="color: ${primaryColor}; border-bottom-color: ${primaryColor};">Certifications</div>
            <ul style="padding-left: 15px; font-size: 9.5px; color: #374151; line-height: 1.4;">
              ${normalizeStringArray(certifications).map(c => `<li style="margin-bottom: 1.5px;">${renderText(c)}</li>`).join("")}
            </ul>
          </div>
        ` : ''}
        ${hasAchievements ? `
          <div>
            <div class="section-title" style="color: ${primaryColor}; border-bottom-color: ${primaryColor};">Achievements</div>
            <ul style="padding-left: 15px; font-size: 9.5px; color: #374151; line-height: 1.4;">
              ${normalizeStringArray(achievements).map(a => `<li style="margin-bottom: 1.5px;">${renderText(a)}</li>`).join("")}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  };

  let layoutHtml = '';

  if (templateConfig.layoutType === "sidebar") {
    layoutHtml = `
      <div style="display: grid; grid-template-columns: 1fr 2.2fr; min-height: 100vh;">
        <!-- Left Sidebar (primary color backdrop, clean design for print) -->
        <div style="background-color: ${primaryColor}; color: #ffffff; padding: 30px 15px; border-right: 1px solid ${borderColor};">
          <h1 style="color: #ffffff; font-size: 18px; font-weight: bold; margin: 0 0 4px 0;">${renderText(personalInfo.fullName)}</h1>
          <p style="color: #ffffff; opacity: 0.9; font-size: 10px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">${renderText(personalInfo.jobTitle)}</p>

          <div style="margin-bottom: 20px;">
            <div style="font-size: 9px; font-weight: bold; color: #ffffff; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 3px; margin-bottom: 8px;">Contact</div>
            <div style="font-size: 8.5px; line-height: 1.5;">
              <p style="margin: 3px 0;">📞 ${renderText(personalInfo.phone)}</p>
              <p style="margin: 3px 0; word-break: break-all;">✉️ ${renderText(personalInfo.email)}</p>
              <p style="margin: 3px 0;">📍 ${renderText(personalInfo.location)}</p>
              ${personalInfo.linkedin ? `<p style="margin: 3px 0; word-break: break-all;">🔗 ${renderText(personalInfo.linkedin).replace(/https?:\/\/(www\.)?/, "")}</p>` : ''}
            </div>
          </div>

          ${skills && Object.values(skills).some((arr: any) => arr && arr.length > 0) ? `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 9px; font-weight: bold; color: #ffffff; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 3px; margin-bottom: 8px;">Skills</div>
              <div style="font-size: 8px; line-height: 1.4;">
                ${Object.entries(skills).map(([cat, items]) => {
                  const arr = normalizeStringArray(items);
                  if (arr.length === 0) return "";
                  return `<p style="margin: 0 0 3px 0;"><strong style="text-transform: capitalize;">${cat}:</strong> ${arr.join(", ")}</p>`;
                }).join("")}
              </div>
            </div>
          ` : ''}

          ${education && education.length > 0 ? `
            <div>
              <div style="font-size: 9px; font-weight: bold; color: #ffffff; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 3px; margin-bottom: 8px;">Education</div>
              <div style="font-size: 8px; line-height: 1.4;">
                ${education.map((edu: any) => `
                  <div style="margin-bottom: 6px;">
                    <p style="font-weight: bold; margin: 0;">${renderText(edu.degree)}</p>
                    <p style="margin: 0; opacity: 0.9;">${renderText(edu.institution)}</p>
                    <p style="margin: 0; opacity: 0.7;">${renderText(edu.year)}</p>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Main Body Area -->
        <div style="padding: 30px 20px; background-color: #ffffff; color: ${textColor};">
          ${summary ? `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid ${primaryColor}; padding-bottom: 3px; margin-bottom: 8px; color: ${primaryColor};">About Me</div>
              <p style="font-size: 9.5px; color: #374151; line-height: 1.4; text-align: justify; margin: 0;">${renderText(summary)}</p>
            </div>
          ` : ''}

          ${experienceHtml()}
          ${projectsHtml()}
          ${certsHtml()}
        </div>
      </div>
    `;
  } else {
    // Top Headers for standard layout types
    let headerHtml = '';

    if (templateConfig.layoutType === "modern" || templateConfig.layoutType === "tech") {
      headerHtml = `
        <div style="border-left: 4px solid ${primaryColor}; padding-left: 15px; margin-bottom: 15px;">
          <h1 style="font-size: 22px; font-weight: bold; color: #111827; margin: 0;">${renderText(personalInfo.fullName)}</h1>
          <p style="font-size: 11px; font-weight: bold; color: ${primaryColor}; margin: 2px 0 0 0; text-transform: uppercase;">${renderText(personalInfo.jobTitle)}</p>
          <div style="font-size: 9px; color: #64748b; margin-top: 6px; display: flex; flex-wrap: wrap; gap: 10px;">
            <span>📞 ${renderText(personalInfo.phone)}</span>
            <span>✉️ ${renderText(personalInfo.email)}</span>
            <span>📍 ${renderText(personalInfo.location)}</span>
          </div>
        </div>
      `;
    } else if (templateConfig.layoutType === "developer") {
      headerHtml = `
        <div style="border: 1px solid ${borderColor}; background-color: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 18px;">
          <div style="color: ${primaryColor}; font-size: 8px; margin-bottom: 4px; font-family: monospace;">// profile_cat</div>
          <h1 style="font-size: 18px; font-weight: bold; color: #111827; margin: 0;">${renderText(personalInfo.fullName)}</h1>
          <p style="font-size: 10px; color: ${primaryColor}; margin: 3px 0 0 0; font-family: monospace; font-weight: bold;">${renderText(personalInfo.jobTitle)}</p>
          <div style="font-size: 9px; color: #4b5563; margin-top: 8px; display: flex; flex-wrap: wrap; gap: 10px; font-family: monospace;">
            <span>TEL: ${renderText(personalInfo.phone)}</span>
            <span>EMAIL: ${renderText(personalInfo.email)}</span>
            <span>LOC: ${renderText(personalInfo.location)}</span>
          </div>
        </div>
      `;
    } else if (templateConfig.layoutType === "corporate") {
      headerHtml = `
        <div style="border-bottom: 3px double ${primaryColor}; padding-bottom: 8px; margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 style="font-size: 22px; font-weight: bold; color: ${primaryColor}; text-transform: uppercase; margin: 0;">${renderText(personalInfo.fullName)}</h1>
              <p style="font-size: 11px; color: #4b5563; margin: 2px 0 0 0; font-weight: bold;">${renderText(personalInfo.jobTitle)}</p>
            </div>
            <div style="text-align: right; font-size: 9px; color: #4b5563; line-height: 1.3;">
              <p style="margin: 0;">${renderText(personalInfo.phone)} | ${renderText(personalInfo.email)}</p>
              <p style="margin: 0;">${renderText(personalInfo.location)}</p>
            </div>
          </div>
        </div>
      `;
    } else if (templateConfig.layoutType === "elegant") {
      headerHtml = `
        <div style="text-align: center; border-bottom: 1.5px solid ${primaryColor}; padding-bottom: 8px; margin-bottom: 18px;">
          <h1 style="font-size: 22px; font-weight: bold; margin: 0 0 4px 0; color: #000000;">${renderText(personalInfo.fullName)}</h1>
          <p style="font-size: 10.5px; color: #4b5563; font-style: italic; margin: 0 0 6px 0;">${renderText(personalInfo.jobTitle)}</p>
          <div style="font-size: 9px; color: #4b5563;">
            {renderContactInfo("  •  ")}
          </div>
        </div>
      `;
    } else {
      // Classic / Executive / ATS / Compact
      headerHtml = `
        <div style="text-align: center; border-bottom: 1px solid ${borderColor}; padding-bottom: 8px; margin-bottom: 15px;">
          <h1 style="font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0; color: #111827;">${renderText(personalInfo.fullName)}</h1>
          <p style="font-size: 10.5px; font-style: italic; color: #4b5563; margin: 0 0 6px 0;">${renderText(personalInfo.jobTitle)}</p>
          <div style="font-size: 9px; color: #4b5563; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <span>${renderText(personalInfo.phone)}</span>
            <span>•</span>
            <span>${renderText(personalInfo.email)}</span>
            <span>•</span>
            <span>${renderText(personalInfo.location)}</span>
          </div>
        </div>
      `;
    }

    const isCompact = templateConfig.layoutType === "compact";
    const compactStyle = isCompact ? 'font-size: 9px; line-height: 1.25;' : '';
    const sectionMargin = isCompact ? "12px" : "15px";

    layoutHtml = `
      <div style="padding: 30px; min-height: 100%; ${compactStyle}">
        ${headerHtml}

        ${summary ? `
          <div class="section" style="margin-bottom: ${sectionMargin};">
            <div class="section-title" style="color: ${primaryColor}; border-bottom-color: ${primaryColor};">Profile</div>
            <p style="font-size: 9.5px; line-height: 1.4; text-align: justify; color: #374151; margin: 0;">${renderText(summary)}</p>
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
          margin-bottom: 14px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          border-bottom: 1.5px solid #111827;
          padding-bottom: 2px;
          margin-bottom: 6px;
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
