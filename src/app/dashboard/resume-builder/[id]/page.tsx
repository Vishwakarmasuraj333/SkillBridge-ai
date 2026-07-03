"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Loader2,
  Lock,
  Layers,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  X
} from "lucide-react";
import Link from "next/link";
import UpgradeModal from "@/components/dashboard/UpgradeModal";
import { templatesList } from "@/components/resume-templates/templates";
import { normalizeResumeData } from "@/lib/resume-normalizer";

export default function ResumeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // Data States
  const [resumeDocument, setResumeDocument] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [structuredData, setStructuredData] = useState<any>(null);
  const [templateId, setTemplateId] = useState("classic-clean");

  // Loading/Processing states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [improving, setImproving] = useState(false);

  // Status/Alerts
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showImproveModal, setShowImproveModal] = useState(false);

  // Advanced AI Rewrite Options
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [improveStyle, setImproveStyle] = useState("ATS Friendly");
  const [makeOnePage, setMakeOnePage] = useState(true);

  // Navigation track
  const [activeEditorTab, setActiveEditorTab] = useState("personalInfo");

  const fetchData = async () => {
    try {
      const docRes = await fetch(`/api/resume-builder/${id}`);
      const docData = await docRes.json();
      if (docRes.ok) {
        setResumeDocument(docData.document);
        setTemplateId(docData.document.templateId);
        setStructuredData(normalizeResumeData(docData.document.structuredData));
      } else {
        throw new Error(docData.error || "Failed to load document.");
      }

      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      if (userRes.ok) {
        setUser(userData.user);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to retrieve document details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const isPremiumUser = !!(user?.isPremium && (!user.premiumUntil || new Date(user.premiumUntil) > new Date()));

  // Editor modification updates
  const handleUpdateField = (section: string, field: string, value: any) => {
    setStructuredData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleUpdateArrayField = (section: string, index: number, field: string, value: any) => {
    setStructuredData((prev: any) => {
      const updatedArray = [...prev[section]];
      updatedArray[index] = {
        ...updatedArray[index],
        [field]: value
      };
      return {
        ...prev,
        [section]: updatedArray
      };
    });
  };

  // Generic list additions
  const handleAddArrayItem = (section: string, newItemTemplate: any) => {
    setStructuredData((prev: any) => ({
      ...prev,
      [section]: [...(prev[section] || []), newItemTemplate]
    }));
  };

  const handleRemoveArrayItem = (section: string, index: number) => {
    setStructuredData((prev: any) => ({
      ...prev,
      [section]: prev[section].filter((_: any, i: number) => i !== index)
    }));
  };

  // Bullet items additions
  const handleAddBullet = (section: string, itemIdx: number) => {
    setStructuredData((prev: any) => {
      const items = [...prev[section]];
      items[itemIdx].bullets = [...(items[itemIdx].bullets || []), "New achievement bullet point..."];
      return { ...prev, [section]: items };
    });
  };

  const handleUpdateBullet = (section: string, itemIdx: number, bulletIdx: number, value: string) => {
    setStructuredData((prev: any) => {
      const items = [...prev[section]];
      const bullets = [...items[itemIdx].bullets];
      bullets[bulletIdx] = value;
      items[itemIdx].bullets = bullets;
      return { ...prev, [section]: items };
    });
  };

  const handleRemoveBullet = (section: string, itemIdx: number, bulletIdx: number) => {
    setStructuredData((prev: any) => {
      const items = [...prev[section]];
      items[itemIdx].bullets = items[itemIdx].bullets.filter((_: any, i: number) => i !== bulletIdx);
      return { ...prev, [section]: items };
    });
  };

  // Skill items edits
  const handleAddSkill = (category: string) => {
    setStructuredData((prev: any) => {
      const skills = { ...prev.skills };
      skills[category] = [...(skills[category] || []), "New Skill"];
      return { ...prev, skills };
    });
  };

  const handleUpdateSkill = (category: string, idx: number, value: string) => {
    setStructuredData((prev: any) => {
      const skills = { ...prev.skills };
      const categoryArray = [...skills[category]];
      categoryArray[idx] = value;
      skills[category] = categoryArray;
      return { ...prev, skills };
    });
  };

  const handleRemoveSkill = (category: string, idx: number) => {
    setStructuredData((prev: any) => {
      const skills = { ...prev.skills };
      skills[category] = skills[category].filter((_: any, i: number) => i !== idx);
      return { ...prev, skills };
    });
  };

  // Template change switcher
  const handleTemplateChange = (id: string) => {
    const selected = templatesList.find(t => t.id === id);
    if (selected?.type === "PREMIUM" && !isPremiumUser) {
      setShowUpgradeModal(true);
      return;
    }
    setTemplateId(id);
  };

  // Save updates to MySQL
  const handleSaveChanges = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/resume-builder/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          structuredData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save updates.");
      }

      setSuccess("Changes saved successfully to database.");
    } catch (err: any) {
      setError(err.message || "Failed to save document.");
    } finally {
      setSaving(false);
    }
  };

  // PDF download
  const handleDownloadPDF = async () => {
    setDownloading(true);
    setError("");
    setSuccess("");
    try {
      // First save current edits
      await fetch(`/api/resume-builder/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          structuredData,
        }),
      });

      const res = await fetch(`/api/resume-builder/${id}/download`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Download rendering failed.");
      }

      // Download file stream
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Get filename from response header or compute fallback
      const contentDisposition = res.headers.get("content-disposition");
      let filename = "Resume.pdf";
      if (contentDisposition) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccess("PDF downloaded successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  // Advanced AI Rewrite Trigger
  const handleImproveWithAI = async () => {
    setImproving(true);
    setError("");
    setSuccess("");
    setShowImproveModal(false);
    try {
      const res = await fetch(`/api/resume-builder/${id}/improve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          style: improveStyle,
          onePage: makeOnePage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI improvement failed.");
      }

      setStructuredData(normalizeResumeData(data.document.structuredData));
      setSuccess("Resume rewritten successfully using Gemini!");
    } catch (err: any) {
      setError(err.message || "AI rewrite failed.");
    } finally {
      setImproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading split editor workspace...</p>
      </div>
    );
  }

  // Get active template renderer component
  const activeTemplate = templatesList.find(t => t.id === templateId) || templatesList[0];
  const TemplateComponent = activeTemplate.component;

  return (
    <div className="min-h-[90vh] lg:h-[90vh] flex flex-col -m-6 md:-m-10 text-foreground overflow-y-auto lg:overflow-hidden">
      
      {/* Editor Header Panel */}
      <header className="h-16 border-b border-border bg-card px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/resume-builder"
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="font-bold text-sm leading-none truncate max-w-[200px]">{resumeDocument?.title || "Edit Resume"}</h2>
            <span className="text-[10px] font-mono text-muted-foreground mt-1 block">Template: {activeTemplate.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Template Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Template:</span>
            <select
              value={templateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
            >
              {templatesList.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.type === "PREMIUM" && !isPremiumUser ? "🔒" : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowImproveModal(true)}
            disabled={improving || saving || downloading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {improving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 animate-pulse" />}
            <span className="hidden md:inline">AI Rewrite</span>
          </button>

          <button
            onClick={handleSaveChanges}
            disabled={saving || improving || downloading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">Save</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading || improving || saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-bold text-xs shadow-md shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* Editor/Preview Main Body Split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        
        {/* Left Side: Section Editors */}
        <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-background lg:h-full">
          {/* Sub Navigation Section Tabs */}
          <div className="flex border-b border-border bg-card overflow-x-auto shrink-0 scrollbar-none">
            {[
              { id: "templates", label: "Templates" },
              { id: "personalInfo", label: "Contact" },
              { id: "summary", label: "Summary" },
              { id: "skills", label: "Skills" },
              { id: "experience", label: "Experience" },
              { id: "projects", label: "Projects" },
              { id: "education", label: "Education" },
              { id: "extras", label: "Additional" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveEditorTab(tab.id)}
                className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeEditorTab === tab.id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Section Input Forms container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Status alerts inside editor */}
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2 animate-zoom-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-500 flex items-center gap-2 animate-zoom-in">
                <Check className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Templates Grid Tab */}
            {activeEditorTab === "templates" && (
              <div className="space-y-4 animate-zoom-in">
                <h3 className="text-sm font-bold border-b border-border pb-1">Choose Resume Layout</h3>
                <p className="text-xs text-muted-foreground">Select one of our 10 professional resume designs. Premium templates require an active upgrade.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {templatesList.map((t) => {
                    const isPremium = t.type === "PREMIUM";
                    const isLocked = isPremium && !isPremiumUser;
                    const isActive = t.id === templateId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleTemplateChange(t.id)}
                        className={`group relative flex flex-col text-left rounded-2xl border bg-card p-4 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                          isActive
                            ? "border-primary ring-2 ring-primary/20 bg-primary/[0.02]"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {/* Mock design representation box */}
                        <div className="w-full h-24 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden bg-secondary/50 border border-border">
                          {t.id === "developer-dark" ? (
                            <div className="absolute inset-0 bg-zinc-900 font-mono text-[6px] p-2 text-emerald-400 select-none">
                              &gt; cat developer.md<br/>
                              # Profile<br/>
                              Developer Profile...
                            </div>
                          ) : t.id === "tech-gradient" ? (
                            <div className="absolute inset-0 bg-white flex flex-col">
                              <div className="w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                              <div className="flex-1 p-2 flex flex-col justify-between">
                                <div className="h-2 w-12 bg-blue-300 rounded" />
                                <div className="space-y-1">
                                  <div className="h-1.5 w-full bg-zinc-200 rounded" />
                                  <div className="h-1.5 w-5/6 bg-zinc-200 rounded" />
                                </div>
                              </div>
                            </div>
                          ) : t.id === "creative-sidebar" ? (
                            <div className="absolute inset-0 flex bg-white">
                              <div className="w-1/3 bg-slate-900 p-1 flex flex-col gap-1">
                                <div className="h-1.5 w-full bg-slate-400 rounded-sm" />
                                <div className="h-1 w-2/3 bg-slate-600 rounded-sm" />
                              </div>
                              <div className="flex-1 p-2 space-y-1">
                                <div className="h-2 w-1/2 bg-slate-400 rounded" />
                                <div className="h-1.5 w-full bg-zinc-200 rounded" />
                                <div className="h-1.5 w-full bg-zinc-200 rounded" />
                              </div>
                            </div>
                          ) : t.id === "corporate-elite" ? (
                            <div className="absolute inset-0 p-2 flex flex-col justify-between bg-white">
                              <div className="border-b-2 border-indigo-900 pb-1 flex justify-between">
                                <div className="h-2 w-1/3 bg-indigo-900 rounded" />
                                <div className="h-1.5 w-1/4 bg-zinc-400 rounded" />
                              </div>
                              <div className="space-y-1">
                                <div className="h-1.5 w-full bg-zinc-300 rounded" />
                                <div className="h-1.5 w-5/6 bg-zinc-300 rounded" />
                              </div>
                            </div>
                          ) : t.id === "classic-clean" || t.id === "elegant-serif" ? (
                            <div className="absolute inset-0 p-2 flex flex-col justify-between items-center text-center bg-white">
                              <div className="space-y-1">
                                <div className="h-2 w-16 bg-zinc-700 rounded" />
                                <div className="h-1.5 w-24 bg-zinc-400 rounded" />
                              </div>
                              <div className="h-1.5 w-full bg-zinc-200 rounded" />
                            </div>
                          ) : (
                            <div className="absolute inset-0 p-2 flex flex-col justify-between bg-white">
                              <div className="flex gap-2">
                                <div className="h-2.5 w-2.5 bg-blue-500 rounded-full shrink-0" />
                                <div className="h-2 w-1/2 bg-zinc-600 rounded" />
                              </div>
                              <div className="space-y-1">
                                <div className="h-1.5 w-full bg-zinc-200 rounded" />
                                <div className="h-1.5 w-5/6 bg-zinc-200 rounded" />
                              </div>
                            </div>
                          )}
                          
                          {/* Locked icon overlay */}
                          {isLocked && (
                            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center text-white">
                              <div className="p-2 bg-black/75 rounded-full border border-white/20">
                                <Lock className="h-4 w-4 text-amber-400" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Text info */}
                        <div className="flex justify-between items-start w-full">
                          <h4 className="font-bold text-xs group-hover:text-primary transition-colors">{t.name}</h4>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            isPremium
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-zinc-500/10 text-zinc-500 border border-border"
                          }`}>
                            {t.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-normal line-clamp-2">{t.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeEditorTab === "personalInfo" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold border-b border-border pb-1">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
                    <input
                      type="text"
                      value={structuredData.personalInfo.fullName || ""}
                      onChange={(e) => handleUpdateField("personalInfo", "fullName", e.target.value)}
                      className="block w-full h-10 px-3 rounded-lg border border-input bg-card text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Job Title</label>
                    <input
                      type="text"
                      value={structuredData.personalInfo.jobTitle || ""}
                      onChange={(e) => handleUpdateField("personalInfo", "jobTitle", e.target.value)}
                      className="block w-full h-10 px-3 rounded-lg border border-input bg-card text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Email</label>
                    <input
                      type="text"
                      value={structuredData.personalInfo.email || ""}
                      onChange={(e) => handleUpdateField("personalInfo", "email", e.target.value)}
                      className="block w-full h-10 px-3 rounded-lg border border-input bg-card text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Phone</label>
                    <input
                      type="text"
                      value={structuredData.personalInfo.phone || ""}
                      onChange={(e) => handleUpdateField("personalInfo", "phone", e.target.value)}
                      className="block w-full h-10 px-3 rounded-lg border border-input bg-card text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Location</label>
                    <input
                      type="text"
                      value={structuredData.personalInfo.location || ""}
                      onChange={(e) => handleUpdateField("personalInfo", "location", e.target.value)}
                      className="block w-full h-10 px-3 rounded-lg border border-input bg-card text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">LinkedIn Link</label>
                    <input
                      type="text"
                      value={structuredData.personalInfo.linkedin || ""}
                      onChange={(e) => handleUpdateField("personalInfo", "linkedin", e.target.value)}
                      className="block w-full h-10 px-3 rounded-lg border border-input bg-card text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">GitHub Link</label>
                    <input
                      type="text"
                      value={structuredData.personalInfo.github || ""}
                      onChange={(e) => handleUpdateField("personalInfo", "github", e.target.value)}
                      className="block w-full h-10 px-3 rounded-lg border border-input bg-card text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Portfolio Link</label>
                    <input
                      type="text"
                      value={structuredData.personalInfo.portfolio || ""}
                      onChange={(e) => handleUpdateField("personalInfo", "portfolio", e.target.value)}
                      className="block w-full h-10 px-3 rounded-lg border border-input bg-card text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Summary Tab */}
            {activeEditorTab === "summary" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold border-b border-border pb-1">Professional Summary</h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block">Profile Statement</label>
                  <textarea
                    rows={8}
                    value={structuredData.summary || ""}
                    onChange={(e) => setStructuredData((prev: any) => ({ ...prev, summary: e.target.value }))}
                    className="block w-full p-3 rounded-lg border border-input bg-card text-xs text-foreground focus:outline-none focus:border-primary resize-y leading-relaxed"
                    placeholder="Write a professional summary statement..."
                  />
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeEditorTab === "skills" && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold border-b border-border pb-1">Core Tech Stack Skills</h3>
                
                {["frontend", "backend", "database", "tools", "other"].map((category) => {
                  const items = structuredData.skills[category] || [];
                  return (
                    <div key={category} className="space-y-2 p-4 bg-card border border-border rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold uppercase text-primary tracking-wide capitalize">{category} Skills</span>
                        <button
                          onClick={() => handleAddSkill(category)}
                          className="px-2.5 py-1 rounded bg-secondary hover:bg-muted border border-border text-[10px] font-bold text-foreground transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Item</span>
                        </button>
                      </div>

                      {items.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground italic">No skills listed in this category.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {items.map((skill: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-1 bg-background border border-border rounded p-1">
                              <input
                                type="text"
                                value={skill}
                                onChange={(e) => handleUpdateSkill(category, idx, e.target.value)}
                                className="w-full bg-transparent border-none text-[10.5px] px-1 text-foreground focus:outline-none focus:ring-0"
                              />
                              <button
                                onClick={() => handleRemoveSkill(category, idx)}
                                className="text-muted-foreground hover:text-red-400 p-0.5"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Experience Tab */}
            {activeEditorTab === "experience" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-1">
                  <h3 className="text-sm font-bold">Employment & Experience</h3>
                  <button
                    onClick={() => handleAddArrayItem("experience", {
                      role: "Software Developer",
                      company: "New Company Inc.",
                      location: "New York, NY",
                      startDate: "Jan 2026",
                      endDate: "Present",
                      bullets: ["Implemented web solutions..."]
                    })}
                    className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted border border-border text-[11px] font-semibold text-foreground transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Job Work</span>
                  </button>
                </div>

                {(!structuredData.experience || structuredData.experience.length === 0) ? (
                  <p className="text-xs text-muted-foreground italic text-center py-10">No professional experience listed.</p>
                ) : (
                  <div className="space-y-6">
                    {structuredData.experience.map((exp: any, expIdx: number) => (
                      <div key={expIdx} className="p-4 rounded-xl bg-card border border-border space-y-4 relative">
                        <button
                          onClick={() => handleRemoveArrayItem("experience", expIdx)}
                          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/5 border border-border cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Role / Title</label>
                            <input
                              type="text"
                              value={exp.role || ""}
                              onChange={(e) => handleUpdateArrayField("experience", expIdx, "role", e.target.value)}
                              className="block w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Company</label>
                            <input
                              type="text"
                              value={exp.company || ""}
                              onChange={(e) => handleUpdateArrayField("experience", expIdx, "company", e.target.value)}
                              className="block w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Location</label>
                            <input
                              type="text"
                              value={exp.location || ""}
                              onChange={(e) => handleUpdateArrayField("experience", expIdx, "location", e.target.value)}
                              className="block w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase">Start Date</label>
                              <input
                                type="text"
                                value={exp.startDate || ""}
                                onChange={(e) => handleUpdateArrayField("experience", expIdx, "startDate", e.target.value)}
                                className="block w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase">End Date</label>
                              <input
                                type="text"
                                value={exp.endDate || ""}
                                onChange={(e) => handleUpdateArrayField("experience", expIdx, "endDate", e.target.value)}
                                className="block w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Bullets Sub-section */}
                        <div className="space-y-2 border-t border-border pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Achievement Bullets</span>
                            <button
                              onClick={() => handleAddBullet("experience", expIdx)}
                              className="px-2 py-1 rounded bg-secondary hover:bg-muted border border-border text-[9px] font-bold text-foreground transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add Bullet</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {exp.bullets?.map((bullet: string, bulletIdx: number) => (
                              <div key={bulletIdx} className="flex gap-2 items-start bg-background p-1.5 rounded border border-border">
                                <textarea
                                  rows={2}
                                  value={bullet}
                                  onChange={(e) => handleUpdateBullet("experience", expIdx, bulletIdx, e.target.value)}
                                  className="w-full bg-transparent border-none text-[10.5px] leading-relaxed resize-none focus:outline-none focus:ring-0 text-foreground"
                                />
                                <button
                                  onClick={() => handleRemoveBullet("experience", expIdx, bulletIdx)}
                                  className="text-muted-foreground hover:text-red-400 p-0.5 shrink-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Projects Tab */}
            {activeEditorTab === "projects" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-1">
                  <h3 className="text-sm font-bold">Project Portfolios</h3>
                  <button
                    onClick={() => handleAddArrayItem("projects", {
                      name: "New Software Application",
                      techStack: ["React", "Node.js"],
                      description: "Created a full platform containing visual dashboard components...",
                      bullets: []
                    })}
                    className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted border border-border text-[11px] font-semibold text-foreground transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                {(!structuredData.projects || structuredData.projects.length === 0) ? (
                  <p className="text-xs text-muted-foreground italic text-center py-10">No projects listed.</p>
                ) : (
                  <div className="space-y-6">
                    {structuredData.projects.map((proj: any, projIdx: number) => (
                      <div key={projIdx} className="p-4 rounded-xl bg-card border border-border space-y-4 relative">
                        <button
                          onClick={() => handleRemoveArrayItem("projects", projIdx)}
                          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/5 border border-border cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Project Name</label>
                            <input
                              type="text"
                              value={proj.name || ""}
                              onChange={(e) => handleUpdateArrayField("projects", projIdx, "name", e.target.value)}
                              className="block w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Tech Stack (comma separated)</label>
                            <input
                              type="text"
                              value={proj.techStack?.join(", ") || ""}
                              onChange={(e) => handleUpdateArrayField("projects", projIdx, "techStack", e.target.value.split(",").map(s => s.trim()))}
                              className="block w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase block">Description</label>
                          <textarea
                            rows={3}
                            value={proj.description || ""}
                            onChange={(e) => handleUpdateArrayField("projects", projIdx, "description", e.target.value)}
                            className="block w-full p-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Education Tab */}
            {activeEditorTab === "education" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-1">
                  <h3 className="text-sm font-bold">Academic Education</h3>
                  <button
                    onClick={() => handleAddArrayItem("education", {
                      degree: "B.S. Software Engineering",
                      institution: "State University",
                      year: "2026",
                      score: "3.7 GPA"
                    })}
                    className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted border border-border text-[11px] font-semibold text-foreground transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Degree</span>
                  </button>
                </div>

                {(!structuredData.education || structuredData.education.length === 0) ? (
                  <p className="text-xs text-muted-foreground italic text-center py-10">No education items listed.</p>
                ) : (
                  <div className="space-y-6">
                    {structuredData.education.map((edu: any, eduIdx: number) => (
                      <div key={eduIdx} className="p-4 rounded-xl bg-card border border-border space-y-4 relative">
                        <button
                          onClick={() => handleRemoveArrayItem("education", eduIdx)}
                          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/5 border border-border cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Degree / Course</label>
                            <input
                              type="text"
                              value={edu.degree || ""}
                              onChange={(e) => handleUpdateArrayField("education", eduIdx, "degree", e.target.value)}
                              className="block w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Institution / School</label>
                            <input
                              type="text"
                              value={edu.institution || ""}
                              onChange={(e) => handleUpdateArrayField("education", eduIdx, "institution", e.target.value)}
                              className="block w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Graduation Year</label>
                            <input
                              type="text"
                              value={edu.year || ""}
                              onChange={(e) => handleUpdateArrayField("education", eduIdx, "year", e.target.value)}
                              className="block w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Score / GPA (optional)</label>
                            <input
                              type="text"
                              value={edu.score || ""}
                              onChange={(e) => handleUpdateArrayField("education", eduIdx, "score", e.target.value)}
                              className="block w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Extras Tab */}
            {activeEditorTab === "extras" && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold border-b border-border pb-1">Additional Credentials</h3>
                
                {/* Certifications list */}
                <div className="space-y-3 p-4 bg-card border border-border rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase text-primary tracking-wide">Certifications</span>
                    <button
                      onClick={() => handleAddArrayItem("certifications", "New Professional Certification")}
                      className="px-2 py-1 rounded bg-secondary hover:bg-muted border border-border text-[9px] font-bold text-foreground transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  </div>
                  {(!structuredData.certifications || structuredData.certifications.length === 0) ? (
                    <p className="text-[10px] text-muted-foreground italic">No certifications listed.</p>
                  ) : (
                    <div className="space-y-2">
                      {structuredData.certifications.map((cert: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center bg-background border border-border rounded p-1.5">
                          <input
                            type="text"
                            value={cert}
                            onChange={(e) => {
                              const updated = [...structuredData.certifications];
                              updated[idx] = e.target.value;
                              setStructuredData((prev: any) => ({ ...prev, certifications: updated }));
                            }}
                            className="w-full bg-transparent border-none text-[10.5px] px-1 text-foreground focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const updated = structuredData.certifications.filter((_: any, i: number) => i !== idx);
                              setStructuredData((prev: any) => ({ ...prev, certifications: updated }));
                            }}
                            className="text-muted-foreground hover:text-red-400 p-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Achievements list */}
                <div className="space-y-3 p-4 bg-card border border-border rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase text-primary tracking-wide">Achievements</span>
                    <button
                      onClick={() => handleAddArrayItem("achievements", "New Career Milestone Achievement")}
                      className="px-2 py-1 rounded bg-secondary hover:bg-muted border border-border text-[9px] font-bold text-foreground transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  </div>
                  {(!structuredData.achievements || structuredData.achievements.length === 0) ? (
                    <p className="text-[10px] text-muted-foreground italic">No achievements listed.</p>
                  ) : (
                    <div className="space-y-2">
                      {structuredData.achievements.map((ach: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center bg-background border border-border rounded p-1.5">
                          <input
                            type="text"
                            value={ach}
                            onChange={(e) => {
                              const updated = [...structuredData.achievements];
                              updated[idx] = e.target.value;
                              setStructuredData((prev: any) => ({ ...prev, achievements: updated }));
                            }}
                            className="w-full bg-transparent border-none text-[10.5px] px-1 text-foreground focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const updated = structuredData.achievements.filter((_: any, i: number) => i !== idx);
                              setStructuredData((prev: any) => ({ ...prev, achievements: updated }));
                            }}
                            className="text-muted-foreground hover:text-red-400 p-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Resume Live A4 Page Preview */}
        <div className="w-full lg:w-1/2 bg-secondary/35 p-4 sm:p-8 flex justify-center items-start overflow-y-auto min-h-[600px] lg:min-h-0">
          <div 
            className="w-full max-w-[800px] border border-border/80 rounded-xl overflow-hidden bg-white text-black shadow-2xl scale-[0.98] origin-top transition-all duration-300"
            style={{ minHeight: "1000px" }}
          >
            {/* Direct template render pass */}
            <TemplateComponent data={normalizeResumeData(structuredData)} isPremiumUser={isPremiumUser} />
          </div>
        </div>
      </div>

      {/* Upgrade SaaS plan payment modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => {
          fetchData();
        }}
      />

      {/* AI Improvement Rewrite Dialog Modal */}
      {showImproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowImproveModal(false)} />
          <div className="relative bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden flex flex-col text-left animate-zoom-in text-foreground">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span>Gemini Resume Rewrite Optimizer</span>
              </h3>
              <button
                onClick={() => setShowImproveModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Provide target instructions and Gemini will professionalize all bullet points, improve phrasing impact, fix grammar, and tailor keywords.
              </p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Developer Role</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="block w-full h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
                  >
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Software Engineer">Software Engineer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Optimization Style</label>
                  <select
                    value={improveStyle}
                    onChange={(e) => setImproveStyle(e.target.value)}
                    className="block w-full h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
                  >
                    <option value="ATS Friendly">ATS Friendly</option>
                    <option value="Add Stronger Bullet Points">Add Stronger Bullet Points</option>
                    <option value="Fix Grammar & Add Missing Keywords">Fix Grammar & Add Keywords</option>
                  </select>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-black/5 dark:bg-black/25 border border-border">
                  <input
                    type="checkbox"
                    id="optimize-one-page"
                    checked={makeOnePage}
                    onChange={(e) => setMakeOnePage(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="optimize-one-page" className="text-xs font-semibold cursor-pointer select-none text-muted-foreground">
                    Compact layouts for single-page rules
                  </label>
                </div>
              </div>

              <button
                onClick={handleImproveWithAI}
                disabled={improving}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                {improving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Rewriting & Aligning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span>Improve Resume with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
