"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Loader2,
  AlertCircle,
  Award,
  PlusCircle,
  CheckCircle,
  BadgeAlert,
  ChevronRight,
  Info,
  FileText,
} from "lucide-react";

interface Resume {
  id: string;
  filename: string;
}

interface AnalysisResult {
  id: string;
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  suggestions: string[];
  skillsFound: string[];
  skillsToAdd: string[];
  checklist?: string[];
  isMock?: boolean;
}

export default function ResumeAnalyzerPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
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
    fetchResumes();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      setError("Please select a resume to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch("/api/analysis/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedResumeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume.");
      }

      setAnalysis(data.analysis);
      setActiveTab("overview");
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-foreground transition-colors duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Resume Analyzer</h1>
        <p className="text-muted-foreground mt-1">Get instant feedback, scoring, and critical keyword gaps on your uploaded resume.</p>
      </div>

      {/* Control Selector Panel */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-md">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Select Resume for Review
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
          <button
            onClick={handleAnalyze}
            disabled={loading || resumes.length === 0}
            className="w-full sm:w-auto h-11 inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running AI Scan...</span>
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                <span>Scan Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex gap-3 text-sm text-destructive items-start animate-zoom-in">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Results Dashboard */}
      {analysis && (
        <div className="space-y-6 animate-zoom-in">
          {analysis.isMock && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-600 dark:text-amber-400">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Development Mock Mode</p>
                <p className="leading-relaxed">Using simulated response because no API credentials were configured in your <code>.env</code> file. To use real AI parsing, add your <code>GEMINI_API_KEY</code> or <code>OPENAI_API_KEY</code>.</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left panel: Score Circle & Tab triggers */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-card border border-border text-center shadow-md flex flex-col items-center">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">ATS Score</h2>
                
                {/* Circular Gauge */}
                <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-8 border-secondary">
                  <span className="text-4xl font-extrabold">{analysis.score}</span>
                  <span className="text-xs text-muted-foreground absolute bottom-4">out of 100</span>
                  
                  {/* Visual indicator color band */}
                  <div
                    className={`absolute inset-0 rounded-full border-8 border-transparent pointer-events-none ${
                      analysis.score >= 80
                        ? "border-t-emerald-500 border-r-emerald-500"
                        : analysis.score >= 60
                        ? "border-t-amber-500 border-r-amber-500"
                        : "border-t-red-500"
                    }`}
                  />
                </div>

                <div className="mt-6 flex flex-col items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      analysis.score >= 80
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : analysis.score >= 60
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                    }`}
                  >
                    {analysis.score >= 80 ? "Optimal Resume" : analysis.score >= 60 ? "Needs Improvements" : "Needs Review"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-2 text-center max-w-[200px]">
                    Parsed using advanced applicant tracking guidelines.
                  </p>
                </div>
              </div>

              {/* Sidebar View Tabs */}
              <div className="bg-card border border-border rounded-2xl p-4 shadow-md space-y-1">
                {[
                  { id: "overview", label: "Overview", icon: FileText },
                  { id: "strengths", label: "Strengths & Weaknesses", icon: Award },
                  { id: "skills", label: "Skills & Keywords", icon: PlusCircle },
                  { id: "checklist", label: "Action Checklist", icon: CheckCircle },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <TabIcon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Panel: Content tabs */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-md min-h-[420px]">
              {/* Overview tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Resume Summary</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{analysis.summary}</p>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="text-md font-bold mb-4">Core Recommendations</h3>
                    <div className="space-y-3">
                      {analysis.suggestions.map((rec, i) => (
                        <div key={i} className="flex gap-3 text-sm text-muted-foreground items-start">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses tab */}
              {activeTab === "strengths" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-md font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Key Strengths</span>
                      </h3>
                      <ul className="space-y-3">
                        {analysis.strengths.map((str, i) => (
                          <li key={i} className="text-xs text-muted-foreground leading-relaxed p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                            {str}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-md font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        <BadgeAlert className="h-4 w-4" />
                        <span>Identified Weaknesses</span>
                      </h3>
                      <ul className="space-y-3">
                        {analysis.weaknesses.map((weak, i) => (
                          <li key={i} className="text-xs text-muted-foreground leading-relaxed p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                            {weak}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills tab */}
              {activeTab === "skills" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-md font-bold text-blue-500 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Detected Skills</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skillsFound.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-md font-bold text-violet-500 flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        <span>Recommended Keywords to Add</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skillsToAdd.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-lg text-xs font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
                    <div className="border-t border-border pt-6 space-y-3">
                      <h3 className="text-md font-bold text-red-500 flex items-center gap-2">
                        <BadgeAlert className="h-4 w-4" />
                        <span>Critical Missing Keywords</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold animate-pulse-subtle"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action checklist tab */}
              {activeTab === "checklist" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold mb-2">Actionable Checklist</h3>
                  <div className="space-y-3">
                    {(analysis.checklist || [
                      "Incorporate identified missing keywords into project details.",
                      "Quantify work scopes with performance metrics.",
                      "Verify link credentials and contact properties."
                    ]).map((item, i) => (
                      <div key={i} className="flex gap-3 text-sm text-muted-foreground items-start">
                        <input
                          type="checkbox"
                          defaultChecked={i === 0}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1 shrink-0"
                        />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
