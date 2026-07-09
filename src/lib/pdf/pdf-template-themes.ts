export interface PdfTheme {
  primaryColor: { r: number; g: number; b: number };
  secondaryColor: { r: number; g: number; b: number };
  textColor: { r: number; g: number; b: number };
  mutedColor: { r: number; g: number; b: number };
  backgroundColor: { r: number; g: number; b: number };
  headingColor: { r: number; g: number; b: number };
  accentColor: { r: number; g: number; b: number };
  layoutType: "classic" | "modern" | "sidebar" | "dark" | "compact" | "executive" | "ats";
}

const HEX_THEMES: Record<string, { primary: string; secondary: string; text: string; muted: string; bg: string; heading: string; accent: string; layout: PdfTheme["layoutType"] }> = {
  "classic-clean": {
    primary: "#111827",
    secondary: "#4b5563",
    text: "#1f2937",
    muted: "#6b7280",
    bg: "#ffffff",
    heading: "#111827",
    accent: "#f3f4f6",
    layout: "classic",
  },
  "elegant-serif": {
    primary: "#0f172a",
    secondary: "#334155",
    text: "#1e293b",
    muted: "#64748b",
    bg: "#ffffff",
    heading: "#0f172a",
    accent: "#f8fafc",
    layout: "classic",
  },
  "modern-blue": {
    primary: "#1e3a8a",
    secondary: "#3b82f6",
    text: "#1f2937",
    muted: "#4b5563",
    bg: "#ffffff",
    heading: "#1e3a8a",
    accent: "#eff6ff",
    layout: "modern",
  },
  "frontend-blue": {
    primary: "#0284c7",
    secondary: "#0ea5e9",
    text: "#1f2937",
    muted: "#4b5563",
    bg: "#ffffff",
    heading: "#0284c7",
    accent: "#f0f9ff",
    layout: "modern",
  },
  "minimal-ats": {
    primary: "#000000",
    secondary: "#333333",
    text: "#222222",
    muted: "#555555",
    bg: "#ffffff",
    heading: "#000000",
    accent: "#fafafa",
    layout: "ats",
  },
  "compact-one-page": {
    primary: "#111827",
    secondary: "#374151",
    text: "#1f2937",
    muted: "#555555",
    bg: "#ffffff",
    heading: "#111827",
    accent: "#f9fafb",
    layout: "compact",
  },
  "executive-pro": {
    primary: "#1e3a8a",
    secondary: "#1e40af",
    text: "#1f2937",
    muted: "#4b5563",
    bg: "#ffffff",
    heading: "#1e3a8a",
    accent: "#f8fafc",
    layout: "executive",
  },
  "corporate-elite": {
    primary: "#0f172a",
    secondary: "#1e293b",
    text: "#334155",
    muted: "#64748b",
    bg: "#ffffff",
    heading: "#0f172a",
    accent: "#f8fafc",
    layout: "executive",
  },
  "creative-sidebar": {
    primary: "#0f172a",
    secondary: "#0284c7",
    text: "#334155",
    muted: "#64748b",
    bg: "#ffffff",
    heading: "#0f172a",
    accent: "#f0f9ff",
    layout: "sidebar",
  },
  "react-developer-sidebar": {
    primary: "#0f172a",
    secondary: "#0891b2",
    text: "#334155",
    muted: "#64748b",
    bg: "#ffffff",
    heading: "#0f172a",
    accent: "#ecfeff",
    layout: "sidebar",
  },
  "developer-dark": {
    primary: "#38bdf8",
    secondary: "#475569",
    text: "#cbd5e1",
    muted: "#94a3b8",
    bg: "#090d16",
    heading: "#38bdf8",
    accent: "#1e293b",
    layout: "dark",
  },
  "tech-gradient": {
    primary: "#a855f7",
    secondary: "#c084fc",
    text: "#cbd5e1",
    muted: "#94a3b8",
    bg: "#0f0f15",
    heading: "#a855f7",
    accent: "#1e1b4b",
    layout: "dark",
  },
  "software-engineer-pro": {
    primary: "#0f172a",
    secondary: "#3b82f6",
    text: "#1f2937",
    muted: "#4b5563",
    bg: "#ffffff",
    heading: "#0f172a",
    accent: "#f8fafc",
    layout: "classic",
  },
  "full-stack-modern": {
    primary: "#1e293b",
    secondary: "#64748b",
    text: "#1f2937",
    muted: "#4b5563",
    bg: "#ffffff",
    heading: "#1e293b",
    accent: "#f1f5f9",
    layout: "modern",
  },
  "ai-engineer-pro": {
    primary: "#7c3aed",
    secondary: "#8b5cf6",
    text: "#1f2937",
    muted: "#4b5563",
    bg: "#ffffff",
    heading: "#7c3aed",
    accent: "#faf5ff",
    layout: "modern",
  },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return { r, g, b };
}

export function getPdfTheme(templateId?: string): PdfTheme {
  const safeId = templateId || "classic-clean";
  const matchKey = Object.keys(HEX_THEMES).find(
    (key) => key.toLowerCase() === safeId.toLowerCase()
  );
  
  const rawTheme = HEX_THEMES[matchKey || "classic-clean"];
  
  return {
    primaryColor: hexToRgb(rawTheme.primary),
    secondaryColor: hexToRgb(rawTheme.secondary),
    textColor: hexToRgb(rawTheme.text),
    mutedColor: hexToRgb(rawTheme.muted),
    backgroundColor: hexToRgb(rawTheme.bg),
    headingColor: hexToRgb(rawTheme.heading),
    accentColor: hexToRgb(rawTheme.accent),
    layoutType: rawTheme.layout,
  };
}
