"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  Loader2,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Eye,
  Info
} from "lucide-react";

interface Resume {
  id: string;
  filename: string;
}

interface Question {
  question: string;
  type: string;
  sampleAnswer: string;
}

interface InterviewResult {
  id: string;
  role: string;
  level: string;
  questions: Question[];
  createdAt?: string;
  isMock?: boolean;
}

export default function InterviewCoachPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Intermediate");
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [interview, setInterview] = useState<InterviewResult | null>(null);
  const [error, setError] = useState("");
  const [visibleAnswers, setVisibleAnswers] = useState<Record<number, boolean>>({});

  // Previous Interview Sessions List States
  const [previousSessions, setPreviousSessions] = useState<InterviewResult[]>([]);

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

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/interview");
      const data = await response.json();
      if (response.ok) {
        const mapped = (data.sessions || []).map((s: any) => ({
          id: s.id,
          role: s.role || "Target Role",
          level: s.level || "Intermediate",
          createdAt: s.createdAt,
          questions: typeof s.questions === "string" ? JSON.parse(s.questions) : s.questions
        }));
        setPreviousSessions(mapped);
      }
    } catch (err) {
      console.error("Failed to load interview sessions:", err);
    }
  };

  useEffect(() => {
    fetchResumes();
    fetchSessions();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedResumeId) {
      setError("Please select a resume.");
      return;
    }

    if (!role.trim()) {
      setError("Please specify the target job role.");
      return;
    }

    setLoading(true);
    setInterview(null);
    setVisibleAnswers({});

    try {
      const response = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          role,
          level,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate interview questions.");
      }

      // Format from api response
      const resultSession = {
        id: data.interview.id,
        role: data.interview.role,
        level: data.interview.level,
        questions: typeof data.interview.questions === "string" 
          ? JSON.parse(data.interview.questions) 
          : data.interview.questions
      };

      setInterview(resultSession);
      fetchSessions();
    } catch (err: any) {
      setError(err.message || "An error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (index: number) => {
    setVisibleAnswers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSelectPrevious = (session: InterviewResult) => {
    setInterview(session);
    setVisibleAnswers({});
    setError("");
  };

  return (
    <div className="space-y-8 text-foreground transition-colors duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Interview Coach</h1>
        <p className="text-muted-foreground mt-1">Simulate interviews by generating targeted, role-specific questions and click to review sample answers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side (4 cols): Coach Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md">
            <form onSubmit={handleGenerate} className="space-y-6">
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

              {/* Target Job Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-muted-foreground mb-2">
                  Target Job Role
                </label>
                <input
                  id="role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Backend Developer"
                  required
                  disabled={loading}
                  className="block w-full h-11 rounded-xl border border-input bg-background/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              {/* Difficulty Level */}
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-muted-foreground mb-2">
                  Difficulty Level
                </label>
                <select
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={loading}
                  className="block w-full h-11 rounded-xl border border-input bg-background/50 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="Beginner" className="bg-card text-foreground">Beginner</option>
                  <option value="Intermediate" className="bg-card text-foreground">Intermediate</option>
                  <option value="Advanced" className="bg-card text-foreground">Advanced</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || resumes.length === 0 || !role.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Coach Plan...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4" />
                    <span>Generate Prep Set</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side (8 cols): Question Cards list */}
        <div className="lg:col-span-8 space-y-6">
          {interview ? (
            <div className="space-y-6 animate-zoom-in">
              {interview.isMock && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-600 dark:text-amber-400">
                  <Info className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Development Mock Mode</p>
                    <p className="leading-relaxed">Using simulated interview questions checklist since no API credentials were configured in your <code>.env</code> file.</p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-xl font-bold leading-tight">Prep Set for {interview.role}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Level: {interview.level} &bull; Generated dynamically based on your experience</p>
                </div>
              </div>

              {/* Questions stack */}
              <div className="space-y-4">
                {interview.questions.map((q, i) => {
                  const isAnswerVisible = !!visibleAnswers[i];
                  return (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all space-y-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          {/* Badge indicator */}
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              q.type && q.type.toLowerCase() === "technical"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : q.type && q.type.toLowerCase() === "project"
                                ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {q.type || "Technical"} Question
                          </span>
                          <h4 className="text-md font-bold leading-snug">{q.question}</h4>
                        </div>
                        <button
                          onClick={() => toggleAnswer(i)}
                          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary shrink-0 transition-colors cursor-pointer bg-card"
                        >
                          {isAnswerVisible ? <ChevronDown className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 transform rotate-180" />}
                        </button>
                      </div>

                      {isAnswerVisible && (
                        <div className="pt-4 border-t border-border bg-black/5 dark:bg-black/10 p-4 rounded-xl border border-border/80 animate-zoom-in">
                          <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-primary">
                            <Sparkles className="h-3 w-3" />
                            <span>Sample Recommended Answer / Recruiter Target</span>
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{q.sampleAnswer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 border border-dashed border-border rounded-2xl bg-card/50 text-center flex flex-col items-center justify-center min-h-[300px]">
              <GraduationCap className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
              <p className="font-semibold">No interview session generated yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                Fill out the target role and skill complexity level on the left and start the AI session.
              </p>
            </div>
          )}

          {/* Previous Interview Sessions History */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md">
            <h3 className="text-md font-bold mb-4">Interview Prep History</h3>
            {previousSessions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No previous interview coaching sessions.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {previousSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSelectPrevious(session)}
                    className="p-3.5 rounded-xl border border-border/80 bg-black/5 dark:bg-black/10 hover:border-primary/30 transition-all cursor-pointer flex justify-between items-start gap-2 group"
                  >
                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-bold group-hover:text-primary transition-colors truncate">
                        {session.role} ({session.level})
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {session.questions.length} Questions generated
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
