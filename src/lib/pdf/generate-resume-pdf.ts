import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { StructuredResumeData } from "../../components/resume-templates/types";
import { getPdfTheme, PdfTheme } from "./pdf-template-themes";

export async function generateResumePdfBuffer({
  data,
  templateId,
}: {
  data: StructuredResumeData;
  templateId: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  
  // Embed safe standard fonts
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const theme = getPdfTheme(templateId);
  const isDark = theme.backgroundColor.r < 0.1 && theme.backgroundColor.g < 0.1 && theme.backgroundColor.b < 0.1;

  // Page setup
  const pageWidth = 595.276;
  const pageHeight = 841.89;
  const marginLeft = 45;
  const marginRight = 45;
  const marginTop = 50;
  const marginBottom = 50;
  const contentWidth = pageWidth - marginLeft - marginRight;

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - marginTop;

  // Apply dark mode background if needed
  if (isDark) {
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(theme.backgroundColor.r, theme.backgroundColor.g, theme.backgroundColor.b),
    });
  }

  // Draw footer helper
  function drawFooterOnPage(pageInstance: any) {
    const footerText = "Generated with SkillBridge AI";
    const size = 8;
    const textWidth = fontRegular.widthOfTextAtSize(footerText, size);
    pageInstance.drawText(footerText, {
      x: (pageWidth - textWidth) / 2,
      y: 25,
      size,
      font: fontRegular,
      color: rgb(theme.mutedColor.r, theme.mutedColor.g, theme.mutedColor.b),
    });
  }

  // Space check helper that adds pages when running out of vertical spacing
  function checkSpace(needed: number) {
    if (y - needed < marginBottom) {
      drawFooterOnPage(page);
      page = doc.addPage([pageWidth, pageHeight]);
      if (isDark) {
        page.drawRectangle({
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          color: rgb(theme.backgroundColor.r, theme.backgroundColor.g, theme.backgroundColor.b),
        });
      }
      y = pageHeight - marginTop;
    }
  }

  // Word wrap utility
  function wrapText(text: string, maxWidth: number, fontSize: number, font: any): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  // Safe draw helper for simple text
  function drawText(text: string, options: { font: any; size: number; color: any; xOffset?: number }) {
    const xPos = marginLeft + (options.xOffset || 0);
    page.drawText(text, {
      x: xPos,
      y: y,
      font: options.font,
      size: options.size,
      color: options.color,
    });
  }

  // Draw Section Title
  function drawSectionTitle(title: string) {
    checkSpace(30);
    y -= 10;
    // Draw Section Header
    drawText(title, { font: fontBold, size: 10.5, color: rgb(theme.primaryColor.r, theme.primaryColor.g, theme.primaryColor.b) });
    y -= 4;
    // Draw thin line below header
    page.drawLine({
      start: { x: marginLeft, y: y },
      end: { x: pageWidth - marginRight, y: y },
      thickness: 1,
      color: rgb(theme.secondaryColor.r, theme.secondaryColor.g, theme.secondaryColor.b),
    });
    y -= 10;
  }

  // ==========================================
  // HEADER SECTION
  // ==========================================
  const personal = data.personalInfo || {};
  const name = personal.fullName || "Candidate Name";
  const title = personal.jobTitle || "";

  checkSpace(100);

  // Name
  const nameSize = 20;
  drawText(name, { font: fontBold, size: nameSize, color: rgb(theme.headingColor.r, theme.headingColor.g, theme.headingColor.b) });
  y -= nameSize + 4;

  // Title
  if (title) {
    const titleSize = 11.5;
    drawText(title, { font: fontItalic, size: titleSize, color: rgb(theme.secondaryColor.r, theme.secondaryColor.g, theme.secondaryColor.b) });
    y -= titleSize + 6;
  }

  // Contact Info Line (Phone | Email | Location | Linkedin)
  const contactParts: string[] = [];
  if (personal.phone) contactParts.push(personal.phone);
  if (personal.email) contactParts.push(personal.email);
  if (personal.location) contactParts.push(personal.location);
  if (personal.linkedin) {
    const cleanLnk = personal.linkedin.replace(/https?:\/\/(www\.)?/, "");
    contactParts.push(cleanLnk);
  }
  
  const contactText = contactParts.join("  |  ");
  if (contactText) {
    const contactLines = wrapText(contactText, contentWidth, 8.5, fontRegular);
    for (const line of contactLines) {
      drawText(line, { font: fontRegular, size: 8.5, color: rgb(theme.mutedColor.r, theme.mutedColor.g, theme.mutedColor.b) });
      y -= 12;
    }
  }

  y -= 8;

  // Draw header bottom separator
  page.drawLine({
    start: { x: marginLeft, y: y },
    end: { x: pageWidth - marginRight, y: y },
    thickness: 1.5,
    color: rgb(theme.secondaryColor.r, theme.secondaryColor.g, theme.secondaryColor.b),
  });
  y -= 15;

  // ==========================================
  // SUMMARY SECTION
  // ==========================================
  if (data.summary) {
    drawSectionTitle("Professional Summary");
    const summaryLines = wrapText(data.summary, contentWidth, 9, fontRegular);
    for (const line of summaryLines) {
      checkSpace(12);
      drawText(line, { font: fontRegular, size: 9, color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b) });
      y -= 12;
    }
    y -= 5;
  }

  // ==========================================
  // SKILLS SECTION
  // ==========================================
  const rawSkills = data.skills || {};
  const skillCategories = Object.entries(rawSkills).filter(([_, list]) => Array.isArray(list) && list.length > 0);
  if (skillCategories.length > 0) {
    drawSectionTitle("Skills");
    for (const [category, list] of skillCategories) {
      const skillsStr = `${category.toUpperCase()}: ${(list as string[]).join(", ")}`;
      const skillLines = wrapText(skillsStr, contentWidth, 9, fontRegular);
      for (const line of skillLines) {
        checkSpace(12);
        // Highlight label in bold
        if (line === skillLines[0]) {
          const catPrefix = `${category.toUpperCase()}: `;
          const prefixWidth = fontBold.widthOfTextAtSize(catPrefix, 9);
          
          // Draw category in bold
          page.drawText(catPrefix, {
            x: marginLeft,
            y: y,
            font: fontBold,
            size: 9,
            color: rgb(theme.primaryColor.r, theme.primaryColor.g, theme.primaryColor.b),
          });
          
          // Draw rest of line in regular
          const restText = line.substring(catPrefix.length);
          page.drawText(restText, {
            x: marginLeft + prefixWidth,
            y: y,
            font: fontRegular,
            size: 9,
            color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
          });
        } else {
          drawText(line, { font: fontRegular, size: 9, color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b) });
        }
        y -= 12;
      }
      y -= 2;
    }
    y -= 5;
  }

  // ==========================================
  // WORK EXPERIENCE SECTION
  // ==========================================
  const experiences = data.experience || [];
  if (experiences.length > 0) {
    drawSectionTitle("Work Experience");
    for (const exp of experiences) {
      checkSpace(40);

      // Role and Dates
      const roleText = `${exp.role || "Role"} - ${exp.company || "Company"}`;
      const dateText = `${exp.startDate || ""} - ${exp.endDate || ""}`;
      
      const roleWidth = fontBold.widthOfTextAtSize(roleText, 9.5);
      const dateWidth = fontRegular.widthOfTextAtSize(dateText, 8.5);

      // Draw role
      page.drawText(roleText, {
        x: marginLeft,
        y: y,
        font: fontBold,
        size: 9.5,
        color: rgb(theme.primaryColor.r, theme.primaryColor.g, theme.primaryColor.b),
      });

      // Draw date aligned to right
      page.drawText(dateText, {
        x: pageWidth - marginRight - dateWidth,
        y: y,
        font: fontRegular,
        size: 8.5,
        color: rgb(theme.mutedColor.r, theme.mutedColor.g, theme.mutedColor.b),
      });
      y -= 12;

      // Location
      if (exp.location) {
        checkSpace(12);
        drawText(exp.location, { font: fontItalic, size: 8.5, color: rgb(theme.mutedColor.r, theme.mutedColor.g, theme.mutedColor.b) });
        y -= 11;
      }

      // Bullets
      if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
        for (const bullet of exp.bullets) {
          const wrapped = wrapText(bullet, contentWidth - 15, 9, fontRegular);
          for (const bLine of wrapped) {
            checkSpace(12);
            // Draw bullet marker for the first line of the wrapped bullet
            if (bLine === wrapped[0]) {
              page.drawText("•", {
                x: marginLeft + 4,
                y: y,
                font: fontRegular,
                size: 9,
                color: rgb(theme.secondaryColor.r, theme.secondaryColor.g, theme.secondaryColor.b),
              });
            }
            // Draw text slightly offset
            page.drawText(bLine, {
              x: marginLeft + 14,
              y: y,
              font: fontRegular,
              size: 9,
              color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
            });
            y -= 12;
          }
        }
      }
      y -= 6;
    }
    y -= 5;
  }

  // ==========================================
  // PROJECTS SECTION
  // ==========================================
  const projects = data.projects || [];
  if (projects.length > 0) {
    drawSectionTitle("Featured Projects");
    for (const proj of projects) {
      checkSpace(35);

      const projName = proj.name || "Project";
      const techText = proj.techStack && proj.techStack.length > 0 ? `[${proj.techStack.join(", ")}]` : "";

      page.drawText(projName, {
        x: marginLeft,
        y: y,
        font: fontBold,
        size: 9.5,
        color: rgb(theme.primaryColor.r, theme.primaryColor.g, theme.primaryColor.b),
      });

      if (techText) {
        const nameWidth = fontBold.widthOfTextAtSize(projName, 9.5);
        page.drawText(techText, {
          x: marginLeft + nameWidth + 8,
          y: y,
          font: fontItalic,
          size: 8.5,
          color: rgb(theme.secondaryColor.r, theme.secondaryColor.g, theme.secondaryColor.b),
        });
      }
      y -= 12;

      // Project description
      if (proj.description) {
        const descLines = wrapText(proj.description, contentWidth, 9, fontRegular);
        for (const line of descLines) {
          checkSpace(12);
          drawText(line, { font: fontRegular, size: 9, color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b) });
          y -= 12;
        }
      }

      // Project bullets
      if (Array.isArray(proj.bullets) && proj.bullets.length > 0) {
        for (const bullet of proj.bullets) {
          const wrapped = wrapText(bullet, contentWidth - 15, 9, fontRegular);
          for (const bLine of wrapped) {
            checkSpace(12);
            if (bLine === wrapped[0]) {
              page.drawText("•", {
                x: marginLeft + 4,
                y: y,
                font: fontRegular,
                size: 9,
                color: rgb(theme.secondaryColor.r, theme.secondaryColor.g, theme.secondaryColor.b),
              });
            }
            page.drawText(bLine, {
              x: marginLeft + 14,
              y: y,
              font: fontRegular,
              size: 9,
              color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
            });
            y -= 12;
          }
        }
      }
      y -= 6;
    }
    y -= 5;
  }

  // ==========================================
  // EDUCATION SECTION
  // ==========================================
  const educationList = data.education || [];
  if (educationList.length > 0) {
    drawSectionTitle("Education");
    for (const edu of educationList) {
      checkSpace(25);

      const eduHeader = `${edu.degree || "Degree"}, ${edu.institution || "Institution"}`;
      const eduYear = edu.year || "";
      const yearWidth = fontRegular.widthOfTextAtSize(eduYear, 8.5);

      page.drawText(eduHeader, {
        x: marginLeft,
        y: y,
        font: fontBold,
        size: 9.5,
        color: rgb(theme.primaryColor.r, theme.primaryColor.g, theme.primaryColor.b),
      });

      page.drawText(eduYear, {
        x: pageWidth - marginRight - yearWidth,
        y: y,
        font: fontRegular,
        size: 8.5,
        color: rgb(theme.mutedColor.r, theme.mutedColor.g, theme.mutedColor.b),
      });
      y -= 12;

      if (edu.score) {
        checkSpace(11);
        drawText(`Score: ${edu.score}`, { font: fontItalic, size: 8.5, color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b) });
        y -= 11;
      }
      y -= 4;
    }
    y -= 5;
  }

  // ==========================================
  // CERTIFICATIONS SECTION
  // ==========================================
  const certs = data.certifications || [];
  if (certs.length > 0) {
    drawSectionTitle("Certifications");
    for (const cert of certs) {
      checkSpace(12);
      
      const certName = cert.name || "";
      const certIssuer = cert.issuer ? ` - ${cert.issuer}` : "";
      const certYear = cert.year ? ` (${cert.year})` : "";
      
      const certText = `•  ${certName}${certIssuer}${certYear}`;
      const wrappedCerts = wrapText(certText, contentWidth, 9, fontRegular);

      for (const line of wrappedCerts) {
        checkSpace(12);
        page.drawText(line, {
          x: marginLeft,
          y: y,
          font: fontRegular,
          size: 9,
          color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
        });
        y -= 12;
      }
    }
    y -= 5;
  }

  // Draw final footer on the last page
  drawFooterOnPage(page);

  // Save document to byte array
  return await doc.save();
}
