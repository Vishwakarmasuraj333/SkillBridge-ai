"use client";

import React from "react";
import { templatesListRegistry, TemplateConfig } from "@/lib/resume-templates/template-registry";
import { normalizeResumeData, renderText, normalizeStringArray } from "@/lib/resume-normalizer";

interface ResumeTemplateRendererProps {
  templateId: string;
  resumeData: any;
  mode?: "preview" | "pdf" | "editor";
}

// Map color palettes to actual hex/tailwind values
const PALETTES = {
  indigo: { primary: "#2563eb", accent: "#3b82f6", text: "#1e293b", bg: "#eff6ff", border: "#bfdbfe" },
  dark: { primary: "#0f172a", accent: "#6366f1", text: "#1e293b", bg: "#f8fafc", border: "#cbd5e1" },
  emerald: { primary: "#059669", accent: "#10b981", text: "#1e293b", bg: "#ecfdf5", border: "#a7f3d0" },
  violet: { primary: "#7c3aed", accent: "#8b5cf6", text: "#1e293b", bg: "#f5f3ff", border: "#ddd6fe" },
  slate: { primary: "#475569", accent: "#64748b", text: "#1e293b", bg: "#f8fafc", border: "#e2e8f0" },
  amber: { primary: "#d97706", accent: "#f59e0b", text: "#1e293b", bg: "#fffbeb", border: "#fde68a" },
  crimson: { primary: "#dc2626", accent: "#ef4444", text: "#1e293b", bg: "#fef2f2", border: "#fecaca" },
  teal: { primary: "#0d9488", accent: "#14b8a6", text: "#1e293b", bg: "#f0fdfa", border: "#99f6e4" },
  navy: { primary: "#1e3a8a", accent: "#3b82f6", text: "#1e293b", bg: "#eff6ff", border: "#bfdbfe" },
  purple: { primary: "#9333ea", accent: "#a855f7", text: "#1e293b", bg: "#faf5ff", border: "#e9d5ff" },
  orange: { primary: "#ea580c", accent: "#f97316", text: "#1e293b", bg: "#fff7ed", border: "#ffedd5" },
  green: { primary: "#16a34a", accent: "#22c55e", text: "#1e293b", bg: "#f0fdf4", border: "#bbf7d0" },
  minimal: { primary: "#000000", accent: "#374151", text: "#171717", bg: "#ffffff", border: "#e5e5e5" }
};

const FONTS = {
  sans: "font-family: 'Inter', system-ui, -apple-system, sans-serif;",
  serif: "font-family: 'Lora', Georgia, 'Times New Roman', serif;",
  mono: "font-family: 'Fira Code', 'Courier New', monospace;"
};

export function ResumeTemplateRenderer({ templateId, resumeData, mode = "preview" }: ResumeTemplateRendererProps) {
  const data = normalizeResumeData(resumeData);
  const { personalInfo, summary, skills, experience, projects, education, certifications, achievements } = data;

  const template = templatesListRegistry.find(t => t.id === templateId) || templatesListRegistry[0];
  const palette = PALETTES[template.colorPalette] || PALETTES.indigo;
  const fontStyle = FONTS[template.fontStyle] || FONTS.sans;

  // Render text safety
  const displayVal = (val: any) => renderText(val);

  // Apply layout CSS styles
  const isPrint = mode === "pdf";

  // Common Header Rendering Elements
  const renderContactInfo = (separator = " | ") => {
    const items = [
      personalInfo.phone ? `📞 ${displayVal(personalInfo.phone)}` : null,
      personalInfo.email ? `✉️ ${displayVal(personalInfo.email)}` : null,
      personalInfo.location ? `📍 ${displayVal(personalInfo.location)}` : null,
      personalInfo.linkedin ? `🔗 ${displayVal(personalInfo.linkedin).replace(/https?:\/\/(www\.)?/, "")}` : null
    ].filter(Boolean);
    return items.join(separator);
  };

  // 1. ATS Layout
  const renderATS = () => (
    <div style={{ padding: "30px", color: palette.text, ...isPrint ? {} : { maxWidth: "800px", margin: "0 auto" } }}>
      <div style={{ textAlign: "center", borderBottom: `1.5px solid ${palette.primary}`, paddingBottom: "10px", marginBottom: "15px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "bold", textTransform: "uppercase", margin: "0 0 4px 0", color: "#111827" }}>{displayVal(personalInfo.fullName)}</h1>
        <p style={{ fontSize: "12px", color: palette.primary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 0" }}>{displayVal(personalInfo.jobTitle)}</p>
        <div style={{ fontSize: "9.5px", color: "#4b5563" }}>
          {renderContactInfo("  •  ")}
        </div>
      </div>

      {summary && (
        <div style={{ marginBottom: "15px" }}>
          <div style={{ fontSize: "10.5px", fontWeight: "bold", textTransform: "uppercase", borderBottom: `1px solid ${palette.border}`, paddingBottom: "2px", marginBottom: "6px", color: palette.primary }}>Professional Summary</div>
          <p style={{ fontSize: "9.5px", margin: "0", lineHeight: "1.4", textAlign: "justify", color: "#374151" }}>{displayVal(summary)}</p>
        </div>
      )}

      {experience && experience.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <div style={{ fontSize: "10.5px", fontWeight: "bold", textTransform: "uppercase", borderBottom: `1px solid ${palette.border}`, paddingBottom: "2px", marginBottom: "6px", color: palette.primary }}>Work History</div>
          {experience.map((exp: any, idx: number) => (
            <div key={idx} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: "bold", color: "#111827" }}>
                <span>{displayVal(exp.role)} - {displayVal(exp.company)}</span>
                <span style={{ fontWeight: "normal", color: "#4b5563" }}>{displayVal(exp.startDate)} - {displayVal(exp.endDate)}</span>
              </div>
              <div style={{ fontSize: "9px", fontStyle: "italic", color: "#6b7280", marginBottom: "4px" }}>{displayVal(exp.location)}</div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={{ margin: "2px 0 0 0", paddingLeft: "15px", fontSize: "9px", color: "#374151", listStyleType: "disc" }}>
                  {normalizeStringArray(exp.bullets).map((bullet: string, bIdx: number) => (
                    <li key={bIdx} style={{ marginBottom: "2px" }}>{displayVal(bullet)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {projects && projects.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <div style={{ fontSize: "10.5px", fontWeight: "bold", textTransform: "uppercase", borderBottom: `1px solid ${palette.border}`, paddingBottom: "2px", marginBottom: "6px", color: palette.primary }}>Technical Projects</div>
          {projects.map((proj: any, idx: number) => (
            <div key={idx} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: "bold", color: "#111827" }}>
                <span>{displayVal(proj.name)}</span>
                <span style={{ fontSize: "8.5px", color: palette.primary }}>{normalizeStringArray(proj.techStack).join(", ")}</span>
              </div>
              <p style={{ fontSize: "9px", margin: "2px 0 4px 0", color: "#374151" }}>{displayVal(proj.description)}</p>
              {proj.bullets && proj.bullets.length > 0 && (
                <ul style={{ margin: "2px 0 0 0", paddingLeft: "15px", fontSize: "9px", color: "#374151", listStyleType: "disc" }}>
                  {normalizeStringArray(proj.bullets).map((bullet: string, bIdx: number) => (
                    <li key={bIdx} style={{ marginBottom: "1px" }}>{displayVal(bullet)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {skills && (Object.values(skills).some((arr: any) => arr && arr.length > 0)) && (
        <div style={{ marginBottom: "15px" }}>
          <div style={{ fontSize: "10.5px", fontWeight: "bold", textTransform: "uppercase", borderBottom: `1px solid ${palette.border}`, paddingBottom: "2px", marginBottom: "6px", color: palette.primary }}>Skills Profile</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "9px" }}>
            {skills.frontend && skills.frontend.length > 0 && <p style={{ margin: "0" }}><strong>Frontend:</strong> {skills.frontend.join(", ")}</p>}
            {skills.backend && skills.backend.length > 0 && <p style={{ margin: "0" }}><strong>Backend:</strong> {skills.backend.join(", ")}</p>}
            {skills.database && skills.database.length > 0 && <p style={{ margin: "0" }}><strong>Databases:</strong> {skills.database.join(", ")}</p>}
            {skills.tools && skills.tools.length > 0 && <p style={{ margin: "0" }}><strong>Tools:</strong> {skills.tools.join(", ")}</p>}
          </div>
        </div>
      )}

      {education && education.length > 0 && (
        <div>
          <div style={{ fontSize: "10.5px", fontWeight: "bold", textTransform: "uppercase", borderBottom: `1px solid ${palette.border}`, paddingBottom: "2px", marginBottom: "6px", color: palette.primary }}>Education</div>
          {education.map((edu: any, idx: number) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", marginBottom: "4px" }}>
              <span><strong>{displayVal(edu.degree)}</strong> at {displayVal(edu.institution)} {edu.score ? `(${displayVal(edu.score)})` : ""}</span>
              <span style={{ color: "#4b5563" }}>{displayVal(edu.year)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 2. Sidebar Layout
  const renderSidebar = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", minHeight: "100%", color: palette.text }}>
      <div style={{ backgroundColor: palette.primary, color: "#ffffff", padding: "30px 15px", borderRight: `1px solid ${palette.border}` }}>
        <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 4px 0" }}>{displayVal(personalInfo.fullName)}</h1>
        <p style={{ fontSize: "10.5px", color: palette.border, fontWeight: 600, textTransform: "uppercase", marginBottom: "20px" }}>{displayVal(personalInfo.jobTitle)}</p>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "3px", marginBottom: "8px" }}>Contact</div>
          <div style={{ fontSize: "8.5px", display: "flex", flexDirection: "column", gap: "5px" }}>
            {personalInfo.phone && <span>📞 {displayVal(personalInfo.phone)}</span>}
            {personalInfo.email && <span style={{ wordBreak: "break-all" }}>✉️ {displayVal(personalInfo.email)}</span>}
            {personalInfo.location && <span>📍 {displayVal(personalInfo.location)}</span>}
            {personalInfo.linkedin && <span style={{ wordBreak: "break-all" }}>🔗 {displayVal(personalInfo.linkedin).replace(/https?:\/\/(www\.)?/, "")}</span>}
          </div>
        </div>

        {skills && (Object.values(skills).some((arr: any) => arr && arr.length > 0)) && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "3px", marginBottom: "8px" }}>Skills</div>
            <div style={{ fontSize: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {Object.entries(skills).map(([cat, list]: [string, any]) => {
                const arr = normalizeStringArray(list);
                if (arr.length === 0) return null;
                return (
                  <p key={cat} style={{ margin: 0 }}>
                    <strong style={{ color: palette.border, textTransform: "capitalize" }}>{cat}:</strong> {arr.join(", ")}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div>
            <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "3px", marginBottom: "8px" }}>Education</div>
            {education.map((edu: any, idx: number) => (
              <div key={idx} style={{ fontSize: "8px", marginBottom: "8px" }}>
                <p style={{ fontWeight: "bold", margin: 0 }}>{displayVal(edu.degree)}</p>
                <p style={{ margin: "2px 0 0 0", color: palette.border }}>{displayVal(edu.institution)}</p>
                <p style={{ margin: 0, opacity: 0.8 }}>{displayVal(edu.year)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "30px 20px", backgroundColor: "#ffffff" }}>
        {summary && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", borderBottom: `2px solid ${palette.primary}`, paddingBottom: "3px", marginBottom: "8px", color: palette.primary }}>About Me</div>
            <p style={{ fontSize: "9.5px", margin: "0", lineHeight: "1.4", textAlign: "justify", color: "#374151" }}>{displayVal(summary)}</p>
          </div>
        )}

        {experience && experience.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", borderBottom: `2px solid ${palette.primary}`, paddingBottom: "3px", marginBottom: "8px", color: palette.primary }}>Professional Experience</div>
            {experience.map((exp: any, idx: number) => (
              <div key={idx} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: "bold", color: "#111827" }}>
                  <span>{displayVal(exp.role)} at {displayVal(exp.company)}</span>
                  <span style={{ fontWeight: "normal", color: "#6b7280", fontSize: "8.5px" }}>{displayVal(exp.startDate)} - {displayVal(exp.endDate)}</span>
                </div>
                <div style={{ fontSize: "8.5px", color: palette.primary, fontStyle: "italic", marginBottom: "3px" }}>{displayVal(exp.location)}</div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul style={{ margin: "2px 0 0 0", paddingLeft: "15px", fontSize: "9px", color: "#475569", listStyleType: "circle" }}>
                    {normalizeStringArray(exp.bullets).map((bullet: string, bIdx: number) => (
                      <li key={bIdx} style={{ marginBottom: "1.5px" }}>{displayVal(bullet)}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {projects && projects.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", borderBottom: `2px solid ${palette.primary}`, paddingBottom: "3px", marginBottom: "8px", color: palette.primary }}>Key Projects</div>
            {projects.map((proj: any, idx: number) => (
              <div key={idx} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: "bold", color: "#111827" }}>
                  <span>{displayVal(proj.name)}</span>
                  <span style={{ fontSize: "8.5px", color: palette.primary }}>{normalizeStringArray(proj.techStack).join(", ")}</span>
                </div>
                <p style={{ fontSize: "9px", margin: "2px 0 4px 0", color: "#475569" }}>{displayVal(proj.description)}</p>
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul style={{ margin: "2px 0 0 0", paddingLeft: "15px", fontSize: "9px", color: "#475569" }}>
                    {normalizeStringArray(proj.bullets).map((bullet: string, bIdx: number) => (
                      <li key={bIdx} style={{ marginBottom: "1px" }}>{displayVal(bullet)}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // 3. Developer Dark Layout
  const renderDeveloper = () => (
    <div style={{ padding: "30px", color: "#1e293b", backgroundColor: "#ffffff" }}>
      <div style={{ border: `1px solid ${palette.border}`, borderRadius: "6px", backgroundColor: "#f8fafc", padding: "15px", marginBottom: "20px" }}>
        <div style={{ fontSize: "9px", color: palette.primary, marginBottom: "4px", opacity: 0.8 }}>// cat contact_info.json</div>
        <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", margin: 0 }}>{displayVal(personalInfo.fullName)}</h1>
        <p style={{ fontSize: "11px", color: palette.primary, fontWeight: "bold", margin: "2px 0 8px 0" }}>{displayVal(personalInfo.jobTitle)}</p>
        <div style={{ fontSize: "9px", color: "#475569" }}>
          {renderContactInfo("  |  ")}
        </div>
      </div>

      {summary && (
        <div style={{ marginBottom: "15px" }}>
          <div style={{ fontSize: "10px", fontWeight: "bold", color: palette.primary, borderBottom: `1px solid ${palette.border}`, paddingBottom: "2px", marginBottom: "6px" }}>&gt;_ Profile</div>
          <p style={{ fontSize: "9.5px", margin: "0", lineHeight: "1.4", color: "#334155" }}>{displayVal(summary)}</p>
        </div>
      )}

      {experience && experience.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <div style={{ fontSize: "10px", fontWeight: "bold", color: palette.primary, borderBottom: `1px solid ${palette.border}`, paddingBottom: "2px", marginBottom: "6px" }}>&gt;_ Experience</div>
          {experience.map((exp: any, idx: number) => (
            <div key={idx} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", fontWeight: "bold" }}>
                <span>{displayVal(exp.role)} @ {displayVal(exp.company)}</span>
                <span style={{ color: "#64748b", fontWeight: "normal" }}>{displayVal(exp.startDate)} - {displayVal(exp.endDate)}</span>
              </div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={{ margin: "3px 0 0 0", paddingLeft: "15px", fontSize: "9px", color: "#334155" }}>
                  {normalizeStringArray(exp.bullets).map((bullet: string, bIdx: number) => (
                    <li key={bIdx} style={{ marginBottom: "2px" }}>{displayVal(bullet)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {projects && projects.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <div style={{ fontSize: "10px", fontWeight: "bold", color: palette.primary, borderBottom: `1px solid ${palette.border}`, paddingBottom: "2px", marginBottom: "6px" }}>&gt;_ Tech_Stack_Projects</div>
          {projects.map((proj: any, idx: number) => (
            <div key={idx} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", fontWeight: "bold" }}>
                <span>{displayVal(proj.name)}</span>
                <span style={{ color: palette.primary }}>[{normalizeStringArray(proj.techStack).join(", ")}]</span>
              </div>
              <p style={{ fontSize: "9px", margin: "2px 0 4px 0" }}>{displayVal(proj.description)}</p>
              {proj.bullets && proj.bullets.length > 0 && (
                <ul style={{ margin: "2px 0 0 0", paddingLeft: "15px", fontSize: "9px", color: "#334155" }}>
                  {normalizeStringArray(proj.bullets).map((bullet: string, bIdx: number) => (
                    <li key={bIdx} style={{ marginBottom: "1px" }}>{displayVal(bullet)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {skills && (Object.values(skills).some((arr: any) => arr && arr.length > 0)) && (
        <div style={{ marginBottom: "15px" }}>
          <div style={{ fontSize: "10px", fontWeight: "bold", color: palette.primary, borderBottom: `1px solid ${palette.border}`, paddingBottom: "2px", marginBottom: "6px" }}>&gt;_ Skills_Manifest</div>
          <div style={{ fontSize: "9px" }}>
            {Object.entries(skills).map(([cat, list]: [string, any]) => {
              const arr = normalizeStringArray(list);
              if (arr.length === 0) return null;
              return (
                <p key={cat} style={{ margin: "3px 0" }}>
                  <strong>const {cat}</strong> = ["{arr.join('", "')}"];
                </p>
              );
            })}
          </div>
        </div>
      )}

      {education && education.length > 0 && (
        <div>
          <div style={{ fontSize: "10px", fontWeight: "bold", color: palette.primary, borderBottom: `1px solid ${palette.border}`, paddingBottom: "2px", marginBottom: "6px" }}>&gt;_ Education</div>
          {education.map((edu: any, idx: number) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", margin: "3px 0" }}>
              <span><strong>{displayVal(edu.degree)}</strong> - {displayVal(edu.institution)}</span>
              <span style={{ color: "#64748b" }}>{displayVal(edu.year)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 4. Default / General Layout (Classic, Modern, Executive, Corporate, Elegant, Tech, Compact)
  const renderStandard = () => {
    const isCompact = template.layoutType === "compact";
    const bodyPadding = isCompact ? "20px" : "35px";
    const sectionMargin = isCompact ? "10px" : "15px";
    const itemMargin = isCompact ? "6px" : "10px";
    const fontSizeBody = isCompact ? "8.5px" : "9.5px";
    const fontSizeTitle = isCompact ? "10px" : "11px";

    let headerBlock = null;

    if (template.layoutType === "modern" || template.layoutType === "tech") {
      headerBlock = (
        <div style={{ borderLeft: `4px solid ${palette.primary}`, paddingLeft: "15px", marginBottom: "18px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#111827", margin: 0 }}>{displayVal(personalInfo.fullName)}</h1>
          <p style={{ fontSize: "11px", fontWeight: "bold", color: palette.primary, textTransform: "uppercase", margin: "2px 0 6px 0" }}>{displayVal(personalInfo.jobTitle)}</p>
          <div style={{ fontSize: "9px", color: "#4b5563" }}>
            {renderContactInfo("  |  ")}
          </div>
        </div>
      );
    } else if (template.layoutType === "corporate") {
      headerBlock = (
        <div style={{ borderBottom: `3px double ${palette.primary}`, paddingBottom: "8px", marginBottom: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: "bold", color: palette.primary, textTransform: "uppercase", margin: 0 }}>{displayVal(personalInfo.fullName)}</h1>
              <p style={{ fontSize: "11px", color: "#4b5563", fontWeight: "bold", margin: "2px 0 0 0" }}>{displayVal(personalInfo.jobTitle)}</p>
            </div>
            <div style={{ textAlign: "right", fontSize: "9px", color: "#4b5563", lineHeight: 1.3 }}>
              {personalInfo.phone && <p style={{ margin: 0 }}>{displayVal(personalInfo.phone)}</p>}
              {personalInfo.email && <p style={{ margin: 0 }}>{displayVal(personalInfo.email)}</p>}
              {personalInfo.location && <p style={{ margin: 0 }}>{displayVal(personalInfo.location)}</p>}
            </div>
          </div>
        </div>
      );
    } else if (template.layoutType === "elegant") {
      headerBlock = (
        <div style={{ textAlign: "center", borderBottom: `1.5px solid ${palette.primary}`, paddingBottom: "10px", marginBottom: "18px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#000000", fontFamily: "Lora, serif", margin: "0 0 4px 0" }}>{displayVal(personalInfo.fullName)}</h1>
          <p style={{ fontSize: "11px", color: "#4b5563", fontStyle: "italic", margin: "0 0 8px 0" }}>{displayVal(personalInfo.jobTitle)}</p>
          <div style={{ fontSize: "9px", color: "#4b5563" }}>
            {renderContactInfo("  •  ")}
          </div>
        </div>
      );
    } else {
      // Classic / Executive / Compact
      headerBlock = (
        <div style={{ textAlign: "center", borderBottom: `1px solid ${palette.border}`, paddingBottom: "10px", marginBottom: "15px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0", color: "#111827" }}>{displayVal(personalInfo.fullName)}</h1>
          <p style={{ fontSize: "11px", fontStyle: "italic", color: "#4b5563", margin: "0 0 6px 0" }}>{displayVal(personalInfo.jobTitle)}</p>
          <div style={{ fontSize: "9px", color: "#4b5563" }}>
            {renderContactInfo("  •  ")}
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: bodyPadding, color: palette.text, backgroundColor: "#ffffff" }}>
        {headerBlock}

        {summary && (
          <div style={{ marginBottom: sectionMargin }}>
            <div style={{ fontSize: fontSizeTitle, fontWeight: "bold", textTransform: "uppercase", borderBottom: `1.5px solid #111827`, paddingBottom: "2px", marginBottom: "5px", color: "#111827" }}>Profile</div>
            <p style={{ fontSize: fontSizeBody, margin: "0", lineHeight: "1.4", textAlign: "justify", color: "#374151" }}>{displayVal(summary)}</p>
          </div>
        )}

        {experience && experience.length > 0 && (
          <div style={{ marginBottom: sectionMargin }}>
            <div style={{ fontSize: fontSizeTitle, fontWeight: "bold", textTransform: "uppercase", borderBottom: `1.5px solid #111827`, paddingBottom: "2px", marginBottom: "5px", color: "#111827" }}>Experience</div>
            {experience.map((exp: any, idx: number) => (
              <div key={idx} style={{ marginBottom: itemMargin }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: fontSizeBody, fontWeight: "bold", color: "#111827" }}>
                  <span>{displayVal(exp.role)} at {displayVal(exp.company)}</span>
                  <span style={{ fontWeight: "normal", color: "#4b5563" }}>{displayVal(exp.startDate)} - {displayVal(exp.endDate)}</span>
                </div>
                <div style={{ fontSize: isCompact ? "8px" : "8.5px", color: "#6b7280", fontStyle: "italic", marginBottom: "3px" }}>{displayVal(exp.location)}</div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul style={{ margin: "2px 0 0 0", paddingLeft: "15px", fontSize: fontSizeBody, color: "#374151", listStyleType: "disc" }}>
                    {normalizeStringArray(exp.bullets).map((bullet: string, bIdx: number) => (
                      <li key={bIdx} style={{ marginBottom: "1.5px" }}>{displayVal(bullet)}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {projects && projects.length > 0 && (
          <div style={{ marginBottom: sectionMargin }}>
            <div style={{ fontSize: fontSizeTitle, fontWeight: "bold", textTransform: "uppercase", borderBottom: `1.5px solid #111827`, paddingBottom: "2px", marginBottom: "5px", color: "#111827" }}>Projects</div>
            {projects.map((proj: any, idx: number) => (
              <div key={idx} style={{ marginBottom: itemMargin }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: fontSizeBody, fontWeight: "bold", color: "#111827" }}>
                  <span>{displayVal(proj.name)}</span>
                  <span style={{ fontSize: isCompact ? "7.5px" : "8px", color: palette.primary }}>{normalizeStringArray(proj.techStack).join(", ")}</span>
                </div>
                <p style={{ fontSize: fontSizeBody, margin: "2px 0 4px 0", color: "#374151" }}>{displayVal(proj.description)}</p>
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul style={{ margin: "2px 0 0 0", paddingLeft: "15px", fontSize: fontSizeBody, color: "#374151" }}>
                    {normalizeStringArray(proj.bullets).map((bullet: string, bIdx: number) => (
                      <li key={bIdx} style={{ marginBottom: "1.5px" }}>{displayVal(bullet)}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {skills && (Object.values(skills).some((arr: any) => arr && arr.length > 0)) && (
          <div style={{ marginBottom: sectionMargin }}>
            <div style={{ fontSize: fontSizeTitle, fontWeight: "bold", textTransform: "uppercase", borderBottom: `1.5px solid #111827`, paddingBottom: "2px", marginBottom: "5px", color: "#111827" }}>Skills</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: fontSizeBody }}>
              {skills.frontend && skills.frontend.length > 0 && <p style={{ margin: "0" }}><strong>Frontend:</strong> {skills.frontend.join(", ")}</p>}
              {skills.backend && skills.backend.length > 0 && <p style={{ margin: "0" }}><strong>Backend:</strong> {skills.backend.join(", ")}</p>}
              {skills.database && skills.database.length > 0 && <p style={{ margin: "0" }}><strong>Databases:</strong> {skills.database.join(", ")}</p>}
              {skills.tools && skills.tools.length > 0 && <p style={{ margin: "0" }}><strong>Tools:</strong> {skills.tools.join(", ")}</p>}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div>
            <div style={{ fontSize: fontSizeTitle, fontWeight: "bold", textTransform: "uppercase", borderBottom: `1.5px solid #111827`, paddingBottom: "2px", marginBottom: "5px", color: "#111827" }}>Education</div>
            {education.map((edu: any, idx: number) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: fontSizeBody, marginBottom: "4px" }}>
                <span><strong>{displayVal(edu.degree)}</strong> at {displayVal(edu.institution)} {edu.score ? `(${displayVal(edu.score)})` : ""}</span>
                <span style={{ color: "#4b5563" }}>{displayVal(edu.year)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getLayout = () => {
    if (template.layoutType === "sidebar") return renderSidebar();
    if (template.layoutType === "developer") return renderDeveloper();
    if (template.layoutType === "ats") return renderATS();
    return renderStandard();
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        fontStyle,
        WebkitFontSmoothing: "antialiased"
      }}
      className={`resume-template-container template-${templateId}`}
    >
      {getLayout()}
    </div>
  );
}
