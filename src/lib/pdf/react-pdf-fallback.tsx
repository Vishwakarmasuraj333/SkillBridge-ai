import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { StructuredResumeData } from "../../components/resume-templates/types";

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: "#333333",
    lineHeight: 1.5,
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#111827",
    paddingBottom: 12,
    marginBottom: 15,
    textAlign: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111117",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  jobTitle: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 3,
    fontStyle: "italic",
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 8,
    fontSize: 9,
    color: "#555555",
  },
  contactItem: {
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 3,
    marginBottom: 8,
    color: "#2563eb",
  },
  summary: {
    fontSize: 9.5,
    color: "#374151",
    textAlign: "justify",
  },
  item: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontWeight: "bold",
    marginBottom: 2,
  },
  itemTitle: {
    fontWeight: "bold",
    fontSize: 10,
    color: "#111111",
  },
  itemDate: {
    fontSize: 9,
    color: "#4b5563",
  },
  itemSubtitle: {
    fontSize: 9,
    color: "#6b7280",
    fontStyle: "italic",
    marginBottom: 4,
  },
  bulletList: {
    marginLeft: 10,
    marginTop: 2,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bulletPoint: {
    width: 8,
    fontSize: 9,
    color: "#4b5563",
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: "#374151",
  },
  skillsGrid: {
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
    color: "#1f2937",
    fontSize: 9.5,
  },
  skillsText: {
    fontWeight: "normal",
    color: "#4b5563",
  },
  educationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
});

interface ReactPdfResumeProps {
  data: StructuredResumeData;
}

export function ReactPdfResume({ data }: ReactPdfResumeProps) {
  const { personalInfo, summary, skills, experience, projects, education } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{personalInfo?.fullName || "Candidate Name"}</Text>
          {personalInfo?.jobTitle ? <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text> : null}
          <View style={styles.contactInfo}>
            {personalInfo?.phone ? <Text style={styles.contactItem}>📞 {personalInfo.phone}</Text> : null}
            {personalInfo?.email ? <Text style={styles.contactItem}>✉️ {personalInfo.email}</Text> : null}
            {personalInfo?.location ? <Text style={styles.contactItem}>📍 {personalInfo.location}</Text> : null}
            {personalInfo?.linkedin ? <Text style={styles.contactItem}>🔗 {personalInfo.linkedin.replace(/https?:\/\/(www\.)?/, "")}</Text> : null}
          </View>
        </View>

        {/* Summary */}
        {summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {experience && experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {exp.role} at {exp.company}
                  </Text>
                  <Text style={styles.itemDate}>
                    {exp.startDate} - {exp.endDate}
                  </Text>
                </View>
                {exp.location ? <Text style={styles.itemSubtitle}>{exp.location}</Text> : null}
                {exp.bullets && exp.bullets.length > 0 ? (
                  <View style={styles.bulletList}>
                    {exp.bullets.map((bullet, bIndex) => (
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
        ) : null}

        {/* Projects */}
        {projects && projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{proj.name}</Text>
                  {proj.techStack && proj.techStack.length > 0 ? (
                    <Text style={styles.itemDate}>({proj.techStack.join(", ")})</Text>
                  ) : null}
                </View>
                {proj.description ? (
                  <Text style={{ fontSize: 9, color: "#374151", marginBottom: 3 }}>
                    {proj.description}
                  </Text>
                ) : null}
                {proj.bullets && proj.bullets.length > 0 ? (
                  <View style={styles.bulletList}>
                    {proj.bullets.map((bullet, bIndex) => (
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
        ) : null}

        {/* Skills */}
        {skills && Object.values(skills).some((arr) => arr && arr.length > 0) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsGrid}>
              {skills.frontend && skills.frontend.length > 0 ? (
                <View style={styles.skillsCategory}>
                  <Text style={styles.skillsLabel}>
                    Frontend: <Text style={styles.skillsText}>{skills.frontend.join(", ")}</Text>
                  </Text>
                </View>
              ) : null}
              {skills.backend && skills.backend.length > 0 ? (
                <View style={styles.skillsCategory}>
                  <Text style={styles.skillsLabel}>
                    Backend: <Text style={styles.skillsText}>{skills.backend.join(", ")}</Text>
                  </Text>
                </View>
              ) : null}
              {skills.database && skills.database.length > 0 ? (
                <View style={styles.skillsCategory}>
                  <Text style={styles.skillsLabel}>
                    Database: <Text style={styles.skillsText}>{skills.database.join(", ")}</Text>
                  </Text>
                </View>
              ) : null}
              {skills.tools && skills.tools.length > 0 ? (
                <View style={styles.skillsCategory}>
                  <Text style={styles.skillsLabel}>
                    Tools: <Text style={styles.skillsText}>{skills.tools.join(", ")}</Text>
                  </Text>
                </View>
              ) : null}
              {skills.other && skills.other.length > 0 ? (
                <View style={styles.skillsCategory}>
                  <Text style={styles.skillsLabel}>
                    Other: <Text style={styles.skillsText}>{skills.other.join(", ")}</Text>
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Education */}
        {education && education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <Text style={{ fontWeight: "bold", fontSize: 9.5 }}>
                  {edu.degree} - {edu.institution} {edu.score ? `(${edu.score})` : ""}
                </Text>
                <Text style={{ color: "#4b5563", fontSize: 9 }}>{edu.year}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function generateReactPdfBuffer(data: StructuredResumeData): Promise<Buffer> {
  const stream = await pdf(<ReactPdfResume data={data} />).toBuffer();
  return Buffer.from(stream as any);
}
