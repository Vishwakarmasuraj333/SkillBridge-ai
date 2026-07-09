import React from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { StructuredResumeData } from "../../components/resume-templates/types";

// Map templates to theme settings
interface Theme {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  mutedColor: string;
  backgroundColor: string;
  accentBackground: string;
  borderBottomColor: string;
  layoutStyle: "standard" | "sidebar";
}

export function getPdfTheme(templateId: string): Theme {
  const normalizedId = templateId.toLowerCase();

  if (normalizedId.includes("classic") || normalizedId.includes("serif")) {
    return {
      primaryColor: "#111827",
      secondaryColor: "#4b5563",
      textColor: "#1f2937",
      mutedColor: "#6b7280",
      backgroundColor: "#ffffff",
      accentBackground: "#f9fafb",
      borderBottomColor: "#374151",
      layoutStyle: "standard",
    };
  }

  if (normalizedId.includes("modern") || normalizedId.includes("blue") || normalizedId.includes("frontend")) {
    return {
      primaryColor: "#1d4ed8",
      secondaryColor: "#2563eb",
      textColor: "#1f2937",
      mutedColor: "#4b5563",
      backgroundColor: "#ffffff",
      accentBackground: "#eff6ff",
      borderBottomColor: "#3b82f6",
      layoutStyle: "standard",
    };
  }

  if (normalizedId.includes("dark") || normalizedId.includes("developer")) {
    return {
      primaryColor: "#38bdf8",
      secondaryColor: "#f1f5f9",
      textColor: "#e2e8f0",
      mutedColor: "#94a3b8",
      backgroundColor: "#0f172a",
      accentBackground: "#1e293b",
      borderBottomColor: "#38bdf8",
      layoutStyle: "standard",
    };
  }

  if (normalizedId.includes("sidebar") || normalizedId.includes("creative")) {
    return {
      primaryColor: "#0f172a",
      secondaryColor: "#0284c7",
      textColor: "#334155",
      mutedColor: "#64748b",
      backgroundColor: "#ffffff",
      accentBackground: "#f8fafc",
      borderBottomColor: "#0284c7",
      layoutStyle: "sidebar",
    };
  }

  if (normalizedId.includes("gradient") || normalizedId.includes("tech")) {
    return {
      primaryColor: "#8b5cf6",
      secondaryColor: "#a78bfa",
      textColor: "#1f2937",
      mutedColor: "#4b5563",
      backgroundColor: "#ffffff",
      accentBackground: "#f5f3ff",
      borderBottomColor: "#8b5cf6",
      layoutStyle: "standard",
    };
  }

  if (normalizedId.includes("compact") || normalizedId.includes("ats") || normalizedId.includes("minimal")) {
    return {
      primaryColor: "#000000",
      secondaryColor: "#333333",
      textColor: "#222222",
      mutedColor: "#555555",
      backgroundColor: "#ffffff",
      accentBackground: "#fafafa",
      borderBottomColor: "#222222",
      layoutStyle: "standard",
    };
  }

  // Executive / Corporate default
  return {
    primaryColor: "#1e3a8a",
    secondaryColor: "#1e40af",
    textColor: "#1f2937",
    mutedColor: "#4b5563",
    backgroundColor: "#ffffff",
    accentBackground: "#f8fafc",
    borderBottomColor: "#1e3a8a",
    layoutStyle: "standard",
  };
}

export function ResumePdfDocument({
  data,
  templateId,
}: {
  data: StructuredResumeData;
  templateId: string;
}) {
  const theme = getPdfTheme(templateId);
  const isDark = theme.backgroundColor === "#0f172a";

  const styles = StyleSheet.create({
    page: {
      padding: 35,
      fontFamily: "Helvetica",
      fontSize: 9.5,
      color: theme.textColor,
      backgroundColor: theme.backgroundColor,
      lineHeight: 1.4,
    },
    header: {
      borderBottomWidth: 1.5,
      borderBottomColor: theme.borderBottomColor,
      paddingBottom: 10,
      marginBottom: 15,
      textAlign: theme.layoutStyle === "standard" ? "center" : "left",
    },
    name: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.primaryColor,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    jobTitle: {
      fontSize: 12,
      color: theme.secondaryColor,
      marginTop: 3,
      fontStyle: "italic",
    },
    contactInfo: {
      flexDirection: "row",
      justifyContent: theme.layoutStyle === "standard" ? "center" : "flex-start",
      flexWrap: "wrap",
      marginTop: 8,
      fontSize: 8.5,
      color: theme.mutedColor,
    },
    contactItem: {
      marginHorizontal: 8,
      marginVertical: 2,
    },
    section: {
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: "bold",
      textTransform: "uppercase",
      borderBottomWidth: 1,
      borderBottomColor: theme.borderBottomColor,
      paddingBottom: 3,
      marginBottom: 8,
      color: theme.primaryColor,
    },
    summary: {
      fontSize: 9,
      color: theme.textColor,
      textAlign: "justify",
    },
    item: {
      marginBottom: 8,
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      fontWeight: "bold",
      marginBottom: 2,
    },
    itemTitle: {
      fontWeight: "bold",
      fontSize: 9.5,
      color: theme.primaryColor,
    },
    itemDate: {
      fontSize: 8.5,
      color: theme.mutedColor,
    },
    itemSubtitle: {
      fontSize: 8.5,
      color: theme.mutedColor,
      fontStyle: "italic",
      marginBottom: 4,
    },
    bulletList: {
      marginLeft: 10,
      marginTop: 2,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletPoint: {
      width: 8,
      fontSize: 9,
      color: theme.secondaryColor,
    },
    bulletText: {
      flex: 1,
      fontSize: 9,
      color: theme.textColor,
    },
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 2,
    },
    skillsCategory: {
      width: "50%",
      marginBottom: 6,
      paddingRight: 10,
    },
    skillsLabel: {
      fontWeight: "bold",
      color: theme.primaryColor,
      fontSize: 9,
    },
    skillsText: {
      fontWeight: "normal",
      color: theme.textColor,
    },
    educationItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    sidebarContainer: {
      flexDirection: "row",
      minHeight: "100%",
    },
    sidebarLeft: {
      width: "30%",
      backgroundColor: theme.accentBackground,
      padding: 15,
      marginRight: 15,
      borderRadius: 4,
    },
    sidebarRight: {
      width: "70%",
    },
    sidebarSection: {
      marginBottom: 15,
    },
    sidebarSectionTitle: {
      fontSize: 10,
      fontWeight: "bold",
      textTransform: "uppercase",
      borderBottomWidth: 1,
      borderBottomColor: theme.borderBottomColor,
      paddingBottom: 2,
      marginBottom: 6,
      color: theme.primaryColor,
    },
  });

  // Render Section Templates
  const renderSummary = () =>
    data.summary ? (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summary}>{data.summary}</Text>
      </View>
    ) : null;

  const renderExperience = () =>
    data.experience && data.experience.length > 0 ? (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {data.experience.map((exp: any, index: number) => (
          <View key={index} style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>
                {exp.role} - {exp.company}
              </Text>
              <Text style={styles.itemDate}>
                {exp.startDate} - {exp.endDate}
              </Text>
            </View>
            {exp.location ? <Text style={styles.itemSubtitle}>{exp.location}</Text> : null}
            {exp.bullets && exp.bullets.length > 0 ? (
              <View style={styles.bulletList}>
                {exp.bullets.map((bullet: string, bIndex: number) => (
                  <View key={bIndex} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </View>
    ) : null;

  const renderProjects = () =>
    data.projects && data.projects.length > 0 ? (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projects</Text>
        {data.projects.map((proj: any, index: number) => (
          <View key={index} style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{proj.name}</Text>
              {proj.techStack && proj.techStack.length > 0 ? (
                <Text style={styles.itemDate}>({proj.techStack.join(", ")})</Text>
              ) : null}
            </View>
            {proj.description ? (
              <Text style={{ fontSize: 8.5, color: theme.textColor, marginBottom: 3 }}>
                {proj.description}
              </Text>
            ) : null}
            {proj.bullets && proj.bullets.length > 0 ? (
              <View style={styles.bulletList}>
                {proj.bullets.map((bullet: string, bIndex: number) => (
                  <View key={bIndex} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </View>
    ) : null;

  const renderSkills = () =>
    data.skills && Object.values(data.skills).some((arr: any) => arr && arr.length > 0) ? (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {Object.entries(data.skills).map(([cat, items]: [string, any]) => {
            if (!items || items.length === 0) return null;
            return (
              <View key={cat} style={styles.skillsCategory}>
                <Text style={styles.skillsLabel}>
                  {cat.toUpperCase()}: <Text style={styles.skillsText}>{items.join(", ")}</Text>
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    ) : null;

  const renderEducation = () =>
    data.education && data.education.length > 0 ? (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {data.education.map((edu: any, index: number) => (
          <View key={index} style={styles.educationItem}>
            <Text style={{ fontWeight: "bold", fontSize: 9, color: theme.primaryColor }}>
              {edu.degree} - {edu.institution} {edu.score ? `(${edu.score})` : ""}
            </Text>
            <Text style={{ color: theme.mutedColor, fontSize: 8.5 }}>{edu.year}</Text>
          </View>
        ))}
      </View>
    ) : null;

  const renderCertifications = () =>
    data.certifications && data.certifications.length > 0 ? (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications & Achievements</Text>
        {data.certifications.map((cert: any, index: number) => {
          const parts = [cert.name, cert.issuer, cert.year].filter(Boolean);
          if (parts.length === 0) return null;
          return (
            <View key={index} style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>{parts.join(" - ")}</Text>
            </View>
          );
        })}
      </View>
    ) : null;

  // Render layouts based on structure theme
  if (theme.layoutStyle === "sidebar") {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.sidebarContainer}>
            {/* Left Sidebar */}
            <View style={styles.sidebarLeft}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.primaryColor }}>
                {data.personalInfo?.fullName || "Candidate"}
              </Text>
              <Text style={{ fontSize: 10, color: theme.secondaryColor, fontStyle: "italic", marginBottom: 15 }}>
                {data.personalInfo?.jobTitle || ""}
              </Text>

              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>Contact Info</Text>
                {data.personalInfo?.phone ? <Text style={{ fontSize: 8, marginBottom: 4 }}>📞 {data.personalInfo.phone}</Text> : null}
                {data.personalInfo?.email ? <Text style={{ fontSize: 8, marginBottom: 4 }}>✉️ {data.personalInfo.email}</Text> : null}
                {data.personalInfo?.location ? <Text style={{ fontSize: 8, marginBottom: 4 }}>📍 {data.personalInfo.location}</Text> : null}
              </View>

              {data.skills && Object.values(data.skills).some((arr: any) => arr && arr.length > 0) ? (
                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarSectionTitle}>Expertise</Text>
                  {Object.entries(data.skills).map(([cat, items]: [string, any]) => {
                    if (!items || items.length === 0) return null;
                    return (
                      <View key={cat} style={{ marginBottom: 6 }}>
                        <Text style={{ fontSize: 8.5, fontWeight: "bold", color: theme.primaryColor }}>
                          {cat.toUpperCase()}
                        </Text>
                        <Text style={{ fontSize: 8, color: theme.textColor }}>
                          {items.join(", ")}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {data.education && data.education.length > 0 ? (
                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarSectionTitle}>Education</Text>
                  {data.education.map((edu: any, index: number) => (
                    <View key={index} style={{ marginBottom: 6 }}>
                      <Text style={{ fontSize: 8.5, fontWeight: "bold", color: theme.primaryColor }}>
                        {edu.degree}
                      </Text>
                      <Text style={{ fontSize: 8, color: theme.textColor }}>
                        {edu.institution} ({edu.year})
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            {/* Right Main Body */}
            <View style={styles.sidebarRight}>
              {renderSummary()}
              {renderExperience()}
              {renderProjects()}
              {renderCertifications()}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  // Standard Standard Layout
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.personalInfo?.fullName || "Candidate"}</Text>
          {data.personalInfo?.jobTitle ? <Text style={styles.jobTitle}>{data.personalInfo.jobTitle}</Text> : null}
          <View style={styles.contactInfo}>
            {data.personalInfo?.phone ? <Text style={styles.contactItem}>📞 {data.personalInfo.phone}</Text> : null}
            {data.personalInfo?.email ? <Text style={styles.contactItem}>✉️ {data.personalInfo.email}</Text> : null}
            {data.personalInfo?.location ? <Text style={styles.contactItem}>📍 {data.personalInfo.location}</Text> : null}
            {data.personalInfo?.linkedin ? <Text style={styles.contactItem}>🔗 {data.personalInfo.linkedin}</Text> : null}
          </View>
        </View>

        {renderSummary()}
        {renderExperience()}
        {renderProjects()}
        {renderSkills()}
        {renderEducation()}
        {renderCertifications()}
      </Page>
    </Document>
  );
}
