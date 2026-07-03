"use client";

import { useState, useEffect } from "react";
import {
  GitCompare,
  Loader2,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Award,
  BookOpen,
  Info,
} from "lucide-react";

interface Resume {
  id: string;
  filename: string;
}

interface MatchResult {
  id: string;
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendedKeywords: string[];
  experienceGap: string;
  improvementPoints: string[];
  isMock?: boolean;
}

export default function JobMatcherPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [error, setError] = useState("");

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

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedResumeId) {
      setError("Please select a resume.");
      return;
    }

    if (!jobDescriptionText.trim()) {
      setError("Please paste the job description.");
      return;
    }

    setLoading(true);
    setMatch(null);

    try {
      const response = await fetch("/api/analysis/job-match", {
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
        throw new Error(data.error || "Failed to compare resume with job.");
      }

      setMatch(data.analysis);
    } catch (err: any) {
      setError(err.message || "An error occurred during comparison.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-foreground transition-colors duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Description Matcher</h1>
        <p className="text-muted-foreground mt-1">Compare your resume against a specific job posting to check keyword fit and alignment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side (5 cols): Input form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md">
            <form onSubmit={handleMatch} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex gap-3 text-sm text-destructive items-start animate-zoom-in">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
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
                  Target Job Title
                </label>
                <input
                  id="job-title"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  disabled={loading}
                  className="block w-full h-11 rounded-xl border border-input bg-background/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              {/* Job Description Textarea */}
              <div>
                <label htmlFor="job-desc" className="block text-sm font-medium text-muted-foreground mb-2">
                  Job Description Text
                </label>
                <textarea
                  id="job-desc"
                  rows={8}
                  value={jobDescriptionText}
                  onChange={(e) => setJobDescriptionText(e.target.value)}
                  placeholder="Paste the target job description requirements, qualifications, and duties..."
                  disabled={loading}
                  className="block w-full p-4 rounded-xl border border-input bg-background/50 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading || resumes.length === 0 || !jobDescriptionText.trim()}
                className="w-full h-11 inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing Match...</span>
                  </>
                ) : (
                  <>
                    <GitCompare className="h-4 w-4" />
                    <span>Check Match alignment</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side (7 cols): Analysis Results View */}
        <div className="lg:col-span-7 space-y-6">
          {match ? (
            <div className="space-y-6 animate-zoom-in">
              {match.isMock && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-600 dark:text-amber-400">
                  <Info className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Development Mock Mode</p>
                    <p className="leading-relaxed">Using mock comparison because no API credentials were configured in <code>.env</code>. To run actual matching, supply active key variables.</p>
                  </div>
                </div>
              )}

              {/* Match Score Display */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-md flex items-center gap-6">
                <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-8 border-secondary shrink-0">
                  <span className="text-2xl font-extrabold">{match.matchPercentage}%</span>
                  
                  {/* Gauge Ring */}
                  <div
                    className={`absolute inset-0 rounded-full border-8 border-transparent pointer-events-none ${
                      match.matchPercentage >= 80
                        ? "border-t-emerald-500 border-r-emerald-500"
                        : match.matchPercentage >= 60
                        ? "border-t-amber-500 border-r-amber-500"
                        : "border-t-red-500"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Target Compatibility Score</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    This represents your resume's current vocabulary match ratio against target job listing specifications.
                  </p>
                </div>
              </div>

              {/* Skills Breakdown */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-md space-y-6">
                {/* Matching Skills */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Matching Skills ({match.matchingSkills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {match.matchingSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="space-y-3 border-t border-border pt-4">
                  <h4 className="text-sm font-bold text-red-500 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 animate-pulse-subtle" />
                    <span>Critical Missing Skills ({match.missingSkills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {match.missingSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Keywords */}
                <div className="space-y-3 border-t border-border pt-4">
                  <h4 className="text-sm font-bold text-violet-500 flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>Recommended Match Keywords ({match.recommendedKeywords.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {match.recommendedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-lg text-xs font-semibold"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Experience Gap & Improvement Points */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-md space-y-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Experience Gap Analysis</span>
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{match.experienceGap}</p>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span>Tailoring Action Items</span>
                  </h4>
                  <div className="space-y-2.5">
                    {match.improvementPoints.map((point, i) => (
                      <div key={i} className="flex gap-2.5 text-xs text-muted-foreground items-start">
                        <span className="h-4 w-4 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 font-bold text-[9px] mt-0.5">
                          {i + 1}
                        </span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-card border border-border shadow-md text-center flex flex-col items-center justify-center h-full min-h-[350px]">
              <GitCompare className="h-12 w-12 text-muted-foreground mb-4 opacity-55 animate-pulse-subtle" />
              <h3 className="font-semibold text-foreground">No Match Run Yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
                Paste your target job listing qualifications on the left to start checking compliance scores.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
