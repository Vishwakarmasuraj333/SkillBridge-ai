"use client";

import { useState, useEffect } from "react";
import {
  History as HistoryIcon,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  FileText,
  FileCode,
  GraduationCap,
  Calendar,
  Eye,
  X,
  Copy,
  Check,
  Sparkles,
  ChevronDown
} from "lucide-react";

interface Analysis {
  id: string;
  score: number;
  summary: string;
  resumeFilename: string;
  jobTitle: string | null;
  isJobMatch: boolean;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  suggestions: string[];
  skillsFound: string[];
  skillsToAdd: string[];
  matchPercentage: number | null;
  matchingSkills: string[];
  missingSkills: string[];
  recommendedKeywords: string[];
  experienceGap: string | null;
  improvementPoints: string[];
  createdAt: string;
}

interface Interview {
  id: string;
  role: string;
  level: string;
  resumeFilename: string;
  questions: { question: string; type: string; sampleAnswer: string }[];
  createdAt: string;
}

interface CoverLetter {
  id: string;
  title: string;
  content: string;
  resumeFilename: string;
  jobTitle: string | null;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
}

export default function HistoryPage() {
  const [activeSubTab, setActiveSubTab] = useState("analyses");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Modal View States
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<"analysis" | "cover-letter" | "interview" | null>(null);
  const [copied, setCopied] = useState(false);
  const [visibleAnswers, setVisibleAnswers] = useState<Record<number, boolean>>({});

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/history");
      const data = await response.json();
      if (response.ok) {
        setAnalyses(data.analyses || []);
        setInterviews(data.interviews || []);
        setCoverLetters(data.coverLetters || []);
        setActivityLogs(data.activityLogs || []);
      } else {
        setError(data.error || "Failed to load history items.");
      }
    } catch (err) {
      console.error("History fetch error:", err);
      setError("An unexpected error occurred while loading history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string, type: string) => {
    setDeletingId(`${type}-${id}`);
    setError("");

    try {
      const response = await fetch(`/api/history/${id}?type=${type}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete item.");
      }

      // Remove from state
      if (type === "analysis") {
        setAnalyses((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "interview") {
        setInterviews((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "cover-letter") {
        setCoverLetters((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err: any) {
      setError(err.message || "Could not delete history item.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filterAnalyses = analyses.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.resumeFilename.toLowerCase().includes(q) ||
      (item.jobTitle && item.jobTitle.toLowerCase().includes(q)) ||
      item.summary.toLowerCase().includes(q)
    );
  });

  const filterCoverLetters = coverLetters.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.resumeFilename.toLowerCase().includes(q) ||
      (item.jobTitle && item.jobTitle.toLowerCase().includes(q))
    );
  });

  const filterInterviews = interviews.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.role.toLowerCase().includes(q) ||
      item.level.toLowerCase().includes(q) ||
      item.resumeFilename.toLowerCase().includes(q)
    );
  });

  const filterLogs = activityLogs.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.action.toLowerCase().includes(q) ||
      (item.details && item.details.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 text-foreground transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <HistoryIcon className="h-8 w-8 text-primary" />
            <span>Activity History</span>
          </h1>
          <p className="text-muted-foreground mt-1">Review, look up, and delete previous ATS reports, mock interviews, and tailored letters.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex gap-3 text-sm text-destructive items-start animate-zoom-in">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Workspace search and navigation tab layout */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Navigation sub-tabs */}
        <div className="p-1.5 bg-card border border-border rounded-xl flex gap-1 w-full md:w-auto overflow-x-auto shrink-0">
          {[
            { id: "analyses", label: "ATS Scans", count: analyses.length },
            { id: "cover-letters", label: "Cover Letters", count: coverLetters.length },
            { id: "interviews", label: "Interviews", count: interviews.length },
            { id: "logs", label: "Action Logs", count: activityLogs.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                setConfirmDeleteId(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                activeSubTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-bold">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input field */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeSubTab}...`}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Data display body */}
      <div className="bg-card border border-border rounded-2xl shadow-md overflow-hidden min-h-[300px] flex flex-col justify-between">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 flex-1">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Retrieving history items...</p>
          </div>
        ) : (
          <>
            {/* 1. RESUME ANALYSES LIST */}
            {activeSubTab === "analyses" && (
              filterAnalyses.length === 0 ? (
                <div className="p-16 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center">
                  <FileText className="h-12 w-12 mb-4 opacity-40 text-primary" />
                  <p className="font-semibold">No ATS scans found</p>
                  <p className="text-xs mt-1">Try running your first scan in the Resume Analyzer tab.</p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-black/5 dark:bg-black/15 text-muted-foreground font-semibold">
                        <th className="p-4 pl-6">Resume</th>
                        <th className="p-4">Type</th>
                        <th className="p-4 text-center">Score / Match</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filterAnalyses.map((item) => (
                        <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-black/10 transition-colors">
                          <td className="p-4 pl-6 font-semibold max-w-[180px] truncate" title={item.resumeFilename}>
                            {item.resumeFilename}
                          </td>
                          <td className="p-4">
                            {item.isJobMatch ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Job Match: {item.jobTitle}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                Standalone Review
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`font-semibold px-2 py-0.5 rounded-md text-xs border ${
                                (item.score || item.matchPercentage || 0) >= 80
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : (item.score || item.matchPercentage || 0) >= 60
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                              }`}
                            >
                              {item.score || item.matchPercentage || 0}%
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground text-xs">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setSelectedType("analysis");
                                }}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer bg-card"
                                title="View scan details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {confirmDeleteId === `analysis-${item.id}` ? (
                                <div className="flex items-center justify-end gap-1.5 bg-background border border-border p-1 rounded-lg">
                                  <button
                                    onClick={() => handleDelete(item.id, "analysis")}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 transition-colors cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1 text-muted-foreground hover:text-foreground text-[10px] font-semibold cursor-pointer"
                                  >
                                    X
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(`analysis-${item.id}`)}
                                  disabled={deletingId === `analysis-${item.id}`}
                                  className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-all disabled:opacity-50 cursor-pointer bg-card"
                                >
                                  {deletingId === `analysis-${item.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* 2. COVER LETTERS LIST */}
            {activeSubTab === "cover-letters" && (
              filterCoverLetters.length === 0 ? (
                <div className="p-16 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center">
                  <FileCode className="h-12 w-12 mb-4 opacity-40 text-primary" />
                  <p className="font-semibold">No cover letters found</p>
                  <p className="text-xs mt-1">Try generating a tailored letter in the Cover Letter tab.</p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-black/5 dark:bg-black/15 text-muted-foreground font-semibold">
                        <th className="p-4 pl-6">Title</th>
                        <th className="p-4">Resume Source</th>
                        <th className="p-4">Target Job</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filterCoverLetters.map((item) => (
                        <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-black/10 transition-colors">
                          <td className="p-4 pl-6 font-semibold max-w-[200px] truncate">
                            {item.title}
                          </td>
                          <td className="p-4 text-muted-foreground truncate max-w-[150px]" title={item.resumeFilename}>
                            {item.resumeFilename}
                          </td>
                          <td className="p-4">
                            {item.jobTitle ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary text-xs">
                                {item.jobTitle}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-4 text-muted-foreground text-xs">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setSelectedType("cover-letter");
                                }}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer bg-card"
                                title="View cover letter"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {confirmDeleteId === `cover-letter-${item.id}` ? (
                                <div className="flex items-center justify-end gap-1.5 bg-background border border-border p-1 rounded-lg">
                                  <button
                                    onClick={() => handleDelete(item.id, "cover-letter")}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 transition-colors cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1 text-muted-foreground hover:text-foreground text-[10px] font-semibold cursor-pointer"
                                  >
                                    X
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(`cover-letter-${item.id}`)}
                                  disabled={deletingId === `cover-letter-${item.id}`}
                                  className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-all disabled:opacity-50 cursor-pointer bg-card"
                                >
                                  {deletingId === `cover-letter-${item.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* 3. INTERVIEW COACH LIST */}
            {activeSubTab === "interviews" && (
              filterInterviews.length === 0 ? (
                <div className="p-16 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center">
                  <GraduationCap className="h-12 w-12 mb-4 opacity-40 text-primary" />
                  <p className="font-semibold">No interview sessions found</p>
                  <p className="text-xs mt-1">Try simulating a mock coaching session in the Interview Coach tab.</p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-black/5 dark:bg-black/15 text-muted-foreground font-semibold">
                        <th className="p-4 pl-6">Role Target</th>
                        <th className="p-4">Resume Source</th>
                        <th className="p-4 text-center">Questions</th>
                        <th className="p-4">Complexity</th>
                        <th className="p-4 text-right pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filterInterviews.map((item) => (
                        <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-black/10 transition-colors">
                          <td className="p-4 pl-6 font-semibold max-w-[200px] truncate">
                            {item.role}
                          </td>
                          <td className="p-4 text-muted-foreground truncate max-w-[150px]" title={item.resumeFilename}>
                            {item.resumeFilename}
                          </td>
                          <td className="p-4 text-center font-mono text-xs">
                            {item.questions.length} Qs
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary text-xs">
                              {item.level}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setSelectedType("interview");
                                }}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer bg-card"
                                title="View coach guidelines"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {confirmDeleteId === `interview-${item.id}` ? (
                                <div className="flex items-center justify-end gap-1.5 bg-background border border-border p-1 rounded-lg">
                                  <button
                                    onClick={() => handleDelete(item.id, "interview")}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 transition-colors cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1 text-muted-foreground hover:text-foreground text-[10px] font-semibold cursor-pointer"
                                  >
                                    X
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(`interview-${item.id}`)}
                                  disabled={deletingId === `interview-${item.id}`}
                                  className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-all disabled:opacity-50 cursor-pointer bg-card"
                                >
                                  {deletingId === `interview-${item.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* 4. ACTIVITY LOGS LIST */}
            {activeSubTab === "logs" && (
              filterLogs.length === 0 ? (
                <div className="p-16 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center">
                  <HistoryIcon className="h-12 w-12 mb-4 opacity-40 text-primary" />
                  <p className="font-semibold">No action logs recorded</p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-black/5 dark:bg-black/15 text-muted-foreground font-semibold">
                        <th className="p-4 pl-6">Action / Event</th>
                        <th className="p-4">Details Description</th>
                        <th className="p-4 text-right pr-6">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filterLogs.map((item) => (
                        <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-black/10 transition-colors">
                          <td className="p-4 pl-6 font-bold text-xs">
                            {item.action}
                          </td>
                          <td className="p-4 text-muted-foreground max-w-[300px] truncate" title={item.details || ""}>
                            {item.details || "-"}
                          </td>
                          <td className="p-4 text-right pr-6 text-muted-foreground text-xs font-mono">
                            {new Date(item.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* POPUP PREVIEW MODAL */}
      {selectedItem && selectedType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedItem(null)}
          />
          <div className="relative bg-card border border-border rounded-2xl max-w-4xl w-full p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left animate-zoom-in text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {selectedType === "analysis" && (
                    <>
                      <FileText className="h-5 w-5 text-primary" />
                      <span>{selectedItem.isJobMatch ? "Job Match Analysis" : "Resume ATS Scan"}</span>
                    </>
                  )}
                  {selectedType === "cover-letter" && (
                    <>
                      <FileCode className="h-5 w-5 text-primary" />
                      <span>Saved Cover Letter</span>
                    </>
                  )}
                  {selectedType === "interview" && (
                    <>
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <span>Interview Prep Checklist</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Source Resume: {selectedItem.resumeFilename} &bull; Created {new Date(selectedItem.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary border border-border cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              
              {/* 1. Resume Analysis Details View */}
              {selectedType === "analysis" && (
                <div className="space-y-6 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-black/5 dark:bg-black/25 border border-border text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">ATS Score</span>
                      <span className="text-3xl font-extrabold text-primary">{selectedItem.score}%</span>
                    </div>
                    {selectedItem.isJobMatch && (
                      <>
                        <div className="p-4 rounded-xl bg-black/5 dark:bg-black/25 border border-border text-center">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Match Percentage</span>
                          <span className="text-3xl font-extrabold text-amber-500">{selectedItem.matchPercentage}%</span>
                        </div>
                        <div className="p-4 rounded-xl bg-black/5 dark:bg-black/25 border border-border text-center overflow-hidden">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Target Job Role</span>
                          <span className="text-sm font-bold block mt-2 truncate">{selectedItem.jobTitle}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-black/5 dark:bg-black/15 border border-border leading-relaxed">
                    <h4 className="font-bold mb-2 text-primary">Executive Summary</h4>
                    <p className="text-muted-foreground">{selectedItem.summary}</p>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-3">Identified Strengths</h4>
                      <ul className="space-y-2 text-muted-foreground text-xs leading-relaxed list-disc pl-4">
                        {selectedItem.strengths.map((str: string, idx: number) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                      <h4 className="font-bold text-red-500 dark:text-red-400 mb-3">Identified Weaknesses / Gaps</h4>
                      <ul className="space-y-2 text-muted-foreground text-xs leading-relaxed list-disc pl-4">
                        {selectedItem.weaknesses.map((weak: string, idx: number) => (
                          <li key={idx}>{weak}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Skills / Keyword Badges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
                    <div>
                      <h4 className="font-bold mb-2 text-xs">Keywords / Skills Found</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItem.skillsFound.map((sk: string, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 rounded bg-secondary text-foreground text-[10px] font-semibold border border-border">
                            {sk}
                          </span>
                        ))}
                        {selectedItem.skillsFound.length === 0 && <span className="text-xs text-muted-foreground">None identified.</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2 text-xs">Recommended Skills to Add</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItem.skillsToAdd.map((sk: string, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">
                            {sk}
                          </span>
                        ))}
                        {selectedItem.skillsToAdd.length === 0 && <span className="text-xs text-muted-foreground">None identified.</span>}
                      </div>
                    </div>
                  </div>

                  {/* Suggestions List */}
                  {selectedItem.suggestions.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <h4 className="font-bold mb-3 text-primary">Improvement Checklist Recommendations</h4>
                      <div className="space-y-2">
                        {selectedItem.suggestions.map((rec: string, idx: number) => (
                          <div key={idx} className="flex gap-2.5 text-xs text-muted-foreground items-start">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Cover Letter Details View */}
              {selectedType === "cover-letter" && (
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center bg-black/5 dark:bg-black/20 p-3 rounded-xl border border-border shrink-0">
                    <span className="text-xs text-muted-foreground font-semibold">Title: {selectedItem.title}</span>
                    <button
                      onClick={() => handleCopy(selectedItem.content)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer bg-card"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                          <span className="text-emerald-500 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Letter</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-black/5 dark:bg-black/30 p-5 rounded-xl border border-border text-sm text-muted-foreground font-sans leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                    {selectedItem.content}
                  </div>
                </div>
              )}

              {/* 3. Interview Sessions View */}
              {selectedType === "interview" && (
                <div className="space-y-4 text-sm">
                  <div className="bg-black/5 dark:bg-black/25 p-4 rounded-xl border border-border text-xs text-muted-foreground">
                    <span className="font-bold text-primary">Target Prep: {selectedItem.role}</span> ({selectedItem.level} Level)
                  </div>
                  
                  <div className="space-y-3">
                    {selectedItem.questions.map((q: any, idx: number) => {
                      const isAnswerOpen = !!visibleAnswers[idx];
                      return (
                        <div key={idx} className="p-4 rounded-xl bg-black/5 dark:bg-black/10 border border-border space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="inline-block px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold uppercase rounded mb-1">
                                {q.type || "Technical"}
                              </span>
                              <h5 className="font-bold text-sm">{q.question}</h5>
                            </div>
                            <button
                              onClick={() => {
                                setVisibleAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
                              }}
                              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border bg-card"
                            >
                              <ChevronDown className={`h-4 w-4 transition-transform ${isAnswerOpen ? "transform rotate-180" : ""}`} />
                            </button>
                          </div>
                          
                          {isAnswerOpen && (
                            <div className="p-3 bg-card border border-border rounded-lg text-xs leading-relaxed text-muted-foreground animate-zoom-in">
                              <span className="font-bold text-primary text-[10px] uppercase block mb-1 flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3" />
                                Recommended Response Draft
                              </span>
                              {q.sampleAnswer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-border pt-4 mt-4 shrink-0">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-border hover:bg-secondary/50 transition-all cursor-pointer"
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
