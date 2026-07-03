"use client";

import { useState, useEffect } from "react";
import {
  FileCode,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Save,
  CheckCircle2,
  Eye,
  Info
} from "lucide-react";

interface Resume {
  id: string;
  filename: string;
}

interface CoverLetterResult {
  id: string;
  title: string;
  content: string;
  createdAt?: string;
  isMock?: boolean;
}

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [coverLetter, setCoverLetter] = useState<CoverLetterResult | null>(null);
  const [editableContent, setEditableContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  // Previous Cover Letters List States
  const [previousLetters, setPreviousLetters] = useState<CoverLetterResult[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes");
      const data = await response.json();
      if (response.ok) {
        setResumes(data.resumes || []);
        if (data.resumes?.length > 0) {
          setSelectedResumeId(data.resumes[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load resumes:", err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const fetchCoverLetters = async () => {
    try {
      const response = await fetch("/api/cover-letter");
      const data = await response.json();
      if (response.ok) {
        setPreviousLetters(data.coverLetters || []);
      }
    } catch (err) {
      console.error("Failed to load cover letters:", err);
    }
  };

  useEffect(() => {
    fetchResumes();
    fetchCoverLetters();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedResumeId) {
      setError("Please select a resume.");
      return;
    }

    if (!jobDescriptionText.trim()) {
      setError("Please paste the job description.");
      return;
    }

    setLoading(true);
    setCoverLetter(null);
    setEditableContent("");

    try {
      const response = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobTitle,
          jobDescriptionText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate cover letter.");
      }

      setCoverLetter(data.coverLetter);
      setEditableContent(data.coverLetter.content);
      setSuccess("Cover letter generated and saved to your history!");
      fetchCoverLetters();
    } catch (err: any) {
      setError(err.message || "An error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!coverLetter) return;
    setSavingEdit(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/cover-letter/${coverLetter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: coverLetter.title,
          content: editableContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save cover letter.");
      }

      setSuccess("Cover letter updated successfully!");
      fetchCoverLetters();
    } catch (err: any) {
      setError(err.message || "Failed to save cover letter.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!coverLetter) return;
    const element = document.createElement("a");
    const file = new Blob([editableContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${coverLetter.title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectPrevious = (letter: CoverLetterResult) => {
    setCoverLetter(letter);
    setEditableContent(letter.content);
    setError("");
    setSuccess("");
  };

  return (
    <div className="space-y-8 text-foreground transition-colors duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Cover Letter Generator</h1>
        <p className="text-muted-foreground mt-1">Generate a highly personalized, role-specific cover letter using details from your resume and target job requirements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side (5 cols): Options Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md">
            <form onSubmit={handleGenerate} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex gap-3 text-sm text-destructive items-start animate-zoom-in">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex gap-3 text-sm text-emerald-600 dark:text-emerald-400 items-start animate-zoom-in">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Select Resume */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Select Your Resume
                </label>
                {loadingResumes ? (
                  <div className="h-11 w-full bg-secondary/50 border border-border animate-pulse rounded-xl" />
                ) : resumes.length === 0 ? (
                  <div className="h-11 border border-dashed border-border rounded-xl px-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>No resumes uploaded yet</span>
                    <a href="/dashboard/resume-upload" className="text-primary hover:underline text-xs font-semibold">Upload here</a>
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    disabled={loading}
                    className="block w-full h-11 rounded-xl border border-input bg-background/50 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  >
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id} className="bg-card text-foreground">
                        {resume.filename}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Target Job Title */}
              <div>
                <label htmlFor="job-title" className="block text-sm font-medium text-muted-foreground mb-2">
                  Company / Role Title
                </label>
                <input
                  id="job-title"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Google - Software Engineer"
                  disabled={loading}
                  className="block w-full h-11 rounded-xl border border-input bg-background/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              {/* Job Description Text */}
              <div>
                <label htmlFor="job-description" className="block text-sm font-medium text-muted-foreground mb-2">
                  Paste Job Listing Requirements
                </label>
                <textarea
                  id="job-description"
                  rows={8}
                  value={jobDescriptionText}
                  onChange={(e) => setJobDescriptionText(e.target.value)}
                  placeholder="Paste the full job listing description or requirements here..."
                  disabled={loading}
                  className="block w-full rounded-xl border border-input bg-background/50 p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading || resumes.length === 0 || !jobDescriptionText.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Drafting Letter...</span>
                  </>
                ) : (
                  <>
                    <FileCode className="h-4 w-4" />
                    <span>Draft Cover Letter</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side (7 cols): Letter Output Editor */}
        <div className="lg:col-span-7 space-y-6">
          {coverLetter ? (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-md space-y-4 animate-zoom-in">
              {coverLetter.isMock && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Development Mock Mode</p>
                    <p className="leading-relaxed">Using simulated cover letter response since no API credentials are configured in your <code>.env</code> file.</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div className="overflow-hidden">
                  <h3 className="text-lg font-bold leading-tight truncate">{coverLetter.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Saved successfully to your database history.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer bg-card"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                        <span className="text-emerald-500 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer bg-card"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>TXT</span>
                  </button>
                </div>
              </div>

              {/* Editable Area */}
              <textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                rows={16}
                className="w-full rounded-xl border border-input bg-black/5 dark:bg-black/25 p-5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-y font-sans"
              />

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editableContent.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Edited Cover Letter</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 border border-dashed border-border rounded-2xl bg-card/50 text-center flex flex-col items-center justify-center min-h-[300px]">
              <FileCode className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
              <p className="font-semibold">No cover letter drafted yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                Fill out the role details and requirements on the left, then click draft to generate a tailored copy.
              </p>
            </div>
          )}

          {/* Previous Cover Letters List */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md">
            <h3 className="text-md font-bold mb-4">Saved Cover Letters History</h3>
            {previousLetters.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No previously saved cover letters.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {previousLetters.map((letter) => (
                  <div
                    key={letter.id}
                    onClick={() => handleSelectPrevious(letter)}
                    className="p-3.5 rounded-xl border border-border/80 bg-black/5 dark:bg-black/10 hover:border-primary/30 transition-all cursor-pointer flex justify-between items-start gap-2 group"
                  >
                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-bold group-hover:text-primary transition-colors truncate">
                        {letter.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-2 truncate">
                        {letter.content.substring(0, 60)}...
                      </p>
                    </div>
                    <div className="p-1 text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                      <Eye className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
