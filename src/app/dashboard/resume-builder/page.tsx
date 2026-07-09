"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  Cpu, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  X
} from "lucide-react";
import Link from "next/link";
import UpgradeModal from "@/components/dashboard/UpgradeModal";

function ResumeBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialResumeId = searchParams.get("resumeId");

  const [documents, setDocuments] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Selection state for creating new
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Status/Alerts
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch documents
      const docsRes = await fetch("/api/resume-builder");
      const docsData = await docsRes.json();
      if (docsRes.ok) {
        setDocuments(docsData.documents || []);
      }

      // Fetch resumes
      const resumesRes = await fetch("/api/resumes");
      const resumesData = await resumesRes.json();
      if (resumesRes.ok) {
        setResumes(resumesData.resumes || []);
      }

      // Fetch user profile
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      if (userRes.ok) {
        setUser(userData.user);
      }
    } catch (err) {
      console.error("Failed to fetch builder data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle auto-generation if resumeId is in URL
  useEffect(() => {
    if (initialResumeId && resumes.length > 0 && !generating) {
      const match = resumes.find(r => r.id === initialResumeId);
      if (match) {
        handleGenerateResume(initialResumeId);
      }
    }
  }, [initialResumeId, resumes]);

  const handleGenerateResume = async (resumeId: string) => {
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/resume-builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate professional resume.");
      }

      setSuccess("Professional resume generated successfully!");
      // Redirect to edit page
      router.push(`/dashboard/resume-builder/${data.document.id}`);
    } catch (err: any) {
      setError(err.message || "AI generation failed.");
    } finally {
      setGenerating(false);
      setShowCreateModal(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/resume-builder/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccess("Document deleted successfully.");
        setDocuments(prev => prev.filter(doc => doc.id !== id));
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete document.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isPremiumUser = true;

  if (loading || generating) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">
          {generating ? "AI is rewriting and formatting your resume..." : "Loading resume documents..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-foreground transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Resume Builder</h1>
          <p className="text-muted-foreground mt-1">Convert your raw resume text into polished ATS-friendly templates.</p>
        </div>
        <div className="flex items-center gap-3">
          {resumes.length > 0 ? (
            <button
              onClick={() => {
                setSelectedResumeId(resumes[0]?.id || "");
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Professional Resume</span>
            </button>
          ) : (
            <Link
              href="/dashboard/resume-upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer animate-pulse-subtle"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Resume First</span>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex gap-3 text-sm text-destructive items-start animate-zoom-in">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex gap-3 text-sm text-emerald-500 dark:text-emerald-400 items-start animate-zoom-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Generated Resumes</p>
            <p className="text-2xl font-bold">{documents.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Plan Status</p>
            <p className="text-xl font-bold">{isPremiumUser ? "Premium Unlocked" : "Free Plan"}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-500/5 border border-primary/20 flex flex-col justify-center">
          <p className="text-xs font-bold text-primary">Resume Template Access</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isPremiumUser ? "All 10 professional layouts active." : "3 free templates active. Unlock 7 premium formats."}
          </p>
        </div>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border bg-card text-center flex flex-col items-center justify-center space-y-4 shadow-sm animate-zoom-in">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <Cpu className="h-8 w-8 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold">Generate your first premium resume</h3>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            Select one of your uploaded raw resumes, and our Gemini-powered engine will construct a structured, professional, ATS-friendly builder document.
          </p>
          {resumes.length > 0 ? (
            <button
              onClick={() => {
                setSelectedResumeId(resumes[0]?.id || "");
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md cursor-pointer"
            >
              <span>Build Professional Resume</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link
              href="/dashboard/resume-upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md cursor-pointer"
            >
              <span>Upload Resume to Start</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const hasPremiumTemplate = doc.templateType === "PREMIUM";
            const needsUpgrade = hasPremiumTemplate && !isPremiumUser;
            return (
              <div 
                key={doc.id}
                className="group rounded-2xl border border-border bg-card hover:border-primary/20 transition-all overflow-hidden flex flex-col justify-between shadow-md"
              >
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                      doc.templateType === "PREMIUM"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-zinc-500/10 text-zinc-500 border-border"
                    }`}>
                      {doc.templateType} TEMPLATE
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      Template: {doc.templateId}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Saved: {new Date(doc.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-border bg-black/5 dark:bg-black/10 flex gap-2 justify-between items-center">
                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-2 rounded-lg border border-border text-muted-foreground hover:text-red-400 hover:bg-red-500/5 cursor-pointer disabled:opacity-50"
                    title="Delete document"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>

                  <div className="flex gap-2">
                    {needsUpgrade ? (
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="px-3 py-2 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Unlock Edit</span>
                      </button>
                    ) : (
                      <Link
                        href={`/dashboard/resume-builder/${doc.id}`}
                        className="px-3.5 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit & Export</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden flex flex-col text-left animate-zoom-in text-foreground">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span>Build Professional Resume</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select one of your uploaded raw text resumes. Our AI parser will restructure it, repair syntax, and format the data automatically.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">Select Resume</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="block w-full h-11 rounded-xl border border-input bg-background/50 px-4 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title || r.fileName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleGenerateResume(selectedResumeId)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                <span>Generate Professional Resume</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading Resume Builder...</p>
      </div>
    }>
      <ResumeBuilderContent />
    </Suspense>
  );
}
