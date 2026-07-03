"use client";

import { useState, useEffect } from "react";
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Trash2, 
  Eye, 
  X,
  Keyboard,
  Cpu,
  BarChart3
} from "lucide-react";
import Link from "next/link";

interface Resume {
  id: string;
  title: string;
  fileName: string;
  createdAt: string;
  extractionMethod?: string;
  textLength?: number;
}

export default function ResumeUploadPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Tab and Form states
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [savingText, setSavingText] = useState(false);

  // Auto-analysis checkbox states
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [analyzingAfterUpload, setAnalyzingAfterUpload] = useState(false);
  const [atsScorePreview, setAtsScorePreview] = useState<number | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  // Error and success alerts
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);
  const [showManualPasteButton, setShowManualPasteButton] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Modal preview states
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [previewText, setPreviewText] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Deletion confirmations
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes");
      const data = await response.json();
      if (response.ok) {
        setResumes(data.resumes || []);
      }
    } catch (err) {
      console.error("Failed to load resumes:", err);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setSuccess("");
    setAtsScorePreview(null);
    setAnalysisId(null);
    setShowManualPasteButton(false);
    setDebugInfo(null);
    
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
      const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".docx"];
      if (!allowed.includes(ext)) {
        setError("Invalid file type. Supported formats: PDF, JPG, JPEG, PNG, WEBP, DOCX.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setUploading(false);
    setUploading(true);
    setError("");
    setSuccess("");
    setAtsScorePreview(null);
    setAnalysisId(null);
    setShowManualPasteButton(false);
    setDebugInfo(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.code === "EXTRACTION_FAILED") {
          setError(`We could not read this file automatically (Failed at stage: ${data.stage || "pdf-parse"}). Please paste resume text manually below.`);
          setShowManualPasteButton(true);
          if (data.debug) {
            setDebugInfo(data.debug);
          }
          return;
        }
        throw new Error(data.error || data.message || "Failed to upload resume.");
      }

      setSuccess(`Resume uploaded successfully! Parsed using: ${data.extractionMethod}. Extracted characters: ${data.textLength}`);
      setUploadedResumeId(data.resume?.id || null);
      setFile(null);
      
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // 1. Refresh list
      await fetchResumes();

      // 2. Trigger auto-analysis if checked
      if (autoAnalyze && data.resume?.id) {
        setAnalyzingAfterUpload(true);
        try {
          const analysisResponse = await fetch("/api/analysis/resume", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ resumeId: data.resume.id }),
          });
          const analysisData = await analysisResponse.json();
          if (analysisResponse.ok) {
            setAtsScorePreview(analysisData.analysis.score);
            setAnalysisId(analysisData.analysis.id);
            setSuccess((prev) => `${prev} | Auto-analysis complete! ATS score preview: ${analysisData.analysis.score}%`);
          } else {
            setError(`Resume saved successfully, but auto-analysis failed: ${analysisData.error || "AI query failed"}. You can analyze it manually.`);
          }
        } catch (analysisErr) {
          setError("Resume saved successfully, but auto-analysis failed. You can analyze it manually later.");
        } finally {
          setAnalyzingAfterUpload(false);
        }
      }

      window.dispatchEvent(new Event("resumeChanged"));
    } catch (err: any) {
      setError(err.message || "An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pasteTitle.trim().length < 2) {
      setError("Resume title must be at least 2 characters long.");
      return;
    }
    if (pasteText.trim().length < 80) {
      setError("Resume text must be at least 80 characters long.");
      return;
    }

    setSavingText(true);
    setError("");
    setSuccess("");
    setAtsScorePreview(null);
    setAnalysisId(null);
    setDebugInfo(null);

    try {
      const response = await fetch("/api/resumes/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: pasteTitle,
          text: pasteText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save resume.");
      }

      setSuccess("Resume text saved successfully!");
      setUploadedResumeId(data.resume?.id || null);
      setPasteTitle("");
      setPasteText("");
      
      // 1. Refresh list
      await fetchResumes();

      // 2. Trigger auto-analysis if checked
      if (autoAnalyze && data.resume?.id) {
        setAnalyzingAfterUpload(true);
        try {
          const analysisResponse = await fetch("/api/analysis/resume", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ resumeId: data.resume.id }),
          });
          const analysisData = await analysisResponse.json();
          if (analysisResponse.ok) {
            setAtsScorePreview(analysisData.analysis.score);
            setAnalysisId(analysisData.analysis.id);
            setSuccess((prev) => `${prev} | Auto-analysis complete! ATS score preview: ${analysisData.analysis.score}%`);
          } else {
            setError(`Resume saved successfully, but auto-analysis failed: ${analysisData.error || "AI query failed"}. You can analyze it manually.`);
          }
        } catch (analysisErr) {
          setError("Resume saved successfully, but auto-analysis failed. You can analyze it manually later.");
        } finally {
          setAnalyzingAfterUpload(false);
        }
      }

      window.dispatchEvent(new Event("resumeChanged"));
    } catch (err: any) {
      setError(err.message || "An error occurred while saving resume.");
    } finally {
      setSavingText(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    setDeletingId(id);
    setError("");
    setSuccess("");
    setAtsScorePreview(null);
    setAnalysisId(null);

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete resume.");
      }

      setSuccess("Resume deleted successfully.");
      setResumes((prev) => prev.filter((r) => r.id !== id));
      
      window.dispatchEvent(new Event("resumeChanged"));
    } catch (err: any) {
      setError(err.message || "Could not delete resume.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleOpenPreview = async (resume: Resume) => {
    setPreviewResume(resume);
    setPreviewText("");
    setLoadingPreview(true);
    try {
      const response = await fetch(`/api/resumes/${resume.id}`);
      const data = await response.json();
      if (response.ok) {
        setPreviewText(data.resume?.text || "No text extracted.");
      } else {
        setPreviewText(data.error || "Failed to load parsed text.");
      }
    } catch (err) {
      setPreviewText("An error occurred while loading parsed text.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const switchToManualTab = () => {
    setActiveTab("paste");
    if (file) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
      setPasteTitle(cleanTitle);
    } else {
      setPasteTitle("My Resume");
    }
    setError("");
    setSuccess("");
    setShowManualPasteButton(false);
  };

  return (
    <div className="space-y-8 text-foreground transition-colors duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Resume</h1>
        <p className="text-muted-foreground mt-1">Provide your resume to analyze its contents, calculate ATS scores, and generate interview questions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Upload & Paste Panels */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-1.5 bg-card border border-border rounded-xl flex gap-1 w-fit">
            <button
              onClick={() => {
                setActiveTab("file");
                setError("");
                setSuccess("");
                setAtsScorePreview(null);
                setAnalysisId(null);
                setShowManualPasteButton(false);
                setDebugInfo(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "file"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Upload Document / Image</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("paste");
                setError("");
                setSuccess("");
                setAtsScorePreview(null);
                setAnalysisId(null);
                setShowManualPasteButton(false);
                setDebugInfo(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "paste"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Keyboard className="h-4 w-4" />
              <span>Paste Resume Text</span>
            </button>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border shadow-md space-y-6">
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex flex-col gap-3 text-sm text-destructive items-start animate-zoom-in">
                <div className="flex gap-3 items-start w-full">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-semibold">{error}</span>
                </div>
                
                {/* Debug Payload for development/testing visibility */}
                {debugInfo && (
                  <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/15 text-xs font-mono w-full space-y-1">
                    <p className="font-bold">Debug Info:</p>
                    <p>Filename: {debugInfo.fileName}</p>
                    <p>Mime: {debugInfo.mimeType}</p>
                    <p>Size: {(debugInfo.size / 1024 / 1024).toFixed(3)} MB</p>
                    <p>pdf-parse chars: {debugInfo.pdfParseTextLength}</p>
                    <p>Gemini vision attempted: {String(debugInfo.geminiAttempted)}</p>
                    <p>Gemini vision text length: {debugInfo.geminiTextLength}</p>
                  </div>
                )}

                {showManualPasteButton && (
                  <div className="flex justify-end w-full gap-2 mt-1">
                    <button
                      onClick={switchToManualTab}
                      className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 text-xs font-bold transition-all cursor-pointer shadow-md shadow-destructive/20"
                    >
                      Paste Resume Text Instead
                    </button>
                  </div>
                )}
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-4 animate-zoom-in">
                <div className="flex gap-3 text-sm text-emerald-600 dark:text-emerald-400 items-start">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <span className="font-semibold">{success}</span>
                </div>

                {uploadedResumeId && (
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <Link
                      href={`/dashboard/resume-analyzer`}
                      className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold transition-all shadow-md cursor-pointer flex items-center gap-1"
                    >
                      <span>Analyze Resume</span>
                    </Link>
                    <Link
                      href={`/dashboard/resume-builder?resumeId=${uploadedResumeId}`}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold transition-all shadow-lg cursor-pointer flex items-center gap-1"
                    >
                      <span>Build Professional Resume</span>
                    </Link>
                    <Link
                      href={`/dashboard/job-matcher`}
                      className="px-3.5 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Job Match</span>
                    </Link>
                  </div>
                )}

                {atsScorePreview !== null && (
                  <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">ATS Score Preview</span>
                      <p className="text-2xl font-extrabold text-foreground">{atsScorePreview}%</p>
                    </div>
                    {analysisId && (
                      <Link
                        href={`/dashboard/resume-analyzer`}
                        className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>View Analysis Report</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Checkbox for auto-analysis options */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/5 dark:bg-black/25 border border-border w-fit">
              <input
                type="checkbox"
                id="auto-analyze"
                checked={autoAnalyze}
                onChange={(e) => setAutoAnalyze(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="auto-analyze" className="text-xs font-semibold cursor-pointer select-none text-muted-foreground hover:text-foreground">
                Analyze automatically after upload (Get ATS Score immediately)
              </label>
            </div>

            {activeTab === "file" ? (
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                {/* Upload Dropzone */}
                <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 transition-all bg-black/5 dark:bg-black/15 relative">
                  <input
                    type="file"
                    id="file-input"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading || analyzingAfterUpload}
                  />
                  <div className="flex flex-col items-center">
                    <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 animate-pulse-subtle">
                      <Upload className="h-8 w-8" />
                    </div>
                    <p className="font-semibold text-sm">
                      {file ? file.name : "Select or drag your resume file here"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports PDF, DOCX, JPG, PNG, WEBP files up to 10MB"}
                    </p>
                  </div>
                </div>

                {file && (
                  <div className="p-4 rounded-xl bg-secondary border border-border text-xs space-y-1">
                    <p className="font-bold text-foreground">Selected File Metadata:</p>
                    <p className="text-muted-foreground">Name: {file.name}</p>
                    <p className="text-muted-foreground">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="text-muted-foreground">Type: {file.type || "application/octet-stream"}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading || !file || analyzingAfterUpload}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Reading your resume...</span>
                    </>
                  ) : analyzingAfterUpload ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Running auto-analysis...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Upload & Parse Resume</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="paste-title" className="text-sm font-semibold">
                    Resume Title
                  </label>
                  <input
                    type="text"
                    id="paste-title"
                    value={pasteTitle}
                    onChange={(e) => setPasteTitle(e.target.value)}
                    placeholder="e.g. My Software Engineer Resume"
                    className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="paste-text" className="text-sm font-semibold">
                      Resume Text (Paste content here)
                    </label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {pasteText.length} characters (min 80)
                    </span>
                  </div>
                  <textarea
                    id="paste-text"
                    rows={8}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste the raw text of your resume (experience, education, skills, projects)..."
                    className="w-full p-4 rounded-xl border border-input bg-background/50 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-y font-sans leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingText || !pasteTitle.trim() || pasteText.trim().length < 80 || analyzingAfterUpload}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {savingText ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Saving resume text...</span>
                    </>
                  ) : analyzingAfterUpload ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Running auto-analysis...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Save Resume Text</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Uploaded Resumes List */}
        <div className="space-y-4 animate-zoom-in">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>My Resumes ({resumes.length})</span>
          </h2>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-md space-y-4 max-h-[500px] overflow-y-auto">
            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">No resumes uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="p-4 rounded-xl border border-border bg-black/5 dark:bg-black/25 flex gap-3 hover:border-primary/20 transition-all justify-between items-start"
                  >
                    <div className="flex gap-3 overflow-hidden">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate max-w-[130px]" title={resume.title || resume.fileName}>
                          {resume.title || resume.fileName}
                        </p>
                        <div className="flex flex-col gap-1 mt-1 text-[10px] text-muted-foreground font-medium">
                          <div className="flex items-center gap-1.5">
                            <Cpu className="h-3 w-3 text-primary" />
                            <span className="capitalize">{resume.extractionMethod || "unknown"}</span>
                          </div>
                          {resume.textLength !== undefined && (
                            <p className="font-mono text-[9px]">{resume.textLength} chars</p>
                          )}
                          <div className="flex items-center gap-1.5 text-[9px]">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenPreview(resume)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer bg-card border border-border"
                        title="View parsed text"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {confirmDeleteId === resume.id ? (
                        <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-lg">
                          <button
                            onClick={() => handleDeleteResume(resume.id)}
                            disabled={deletingId === resume.id}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded cursor-pointer"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={deletingId === resume.id}
                            className="px-2 py-1 text-muted-foreground hover:text-foreground text-[10px] font-semibold cursor-pointer"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(resume.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer bg-card border border-border"
                          title="Delete resume"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Text Modal */}
      {previewResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setPreviewResume(null)}
          />
          <div className="relative bg-card border border-border rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left animate-zoom-in text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4 shrink-0">
              <div className="overflow-hidden">
                <h3 className="text-lg font-bold truncate max-w-[500px]">
                  Parsed Text: {previewResume.title || previewResume.fileName}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Parsed content extracted for ATS scanning</p>
              </div>
              <button
                onClick={() => setPreviewResume(null)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary border border-border cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-black/5 dark:bg-black/30 p-4 rounded-xl border border-border text-sm text-muted-foreground leading-relaxed font-mono whitespace-pre-wrap">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm">Retrieving parsed text...</p>
                </div>
              ) : (
                previewText
              )}
            </div>

            <div className="flex justify-end border-t border-border pt-4 mt-4 shrink-0">
              <button
                onClick={() => setPreviewResume(null)}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-border hover:bg-secondary/50 transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
