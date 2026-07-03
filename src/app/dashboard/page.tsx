import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  FileText,
  Award,
  GraduationCap,
  FileCode,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Upload,
  Cpu,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DashboardOverview() {
  // 1. Authenticate user
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    redirect("/login");
  }

  const userId = decoded.userId;

  // 2. Fetch stats
  const totalResumes = await prisma.resume.count({
    where: { userId },
  });

  const totalInterviews = await prisma.interviewQuestion.count({
    where: { userId },
  });

  const totalCoverLetters = await prisma.coverLetter.count({
    where: { userId },
  });

  const totalJobMatches = await prisma.resumeAnalysis.count({
    where: { userId, type: "JOB_MATCH" },
  });

  const totalBuilderDocs = await prisma.resumeBuilderDocument.count({
    where: { userId },
  });

  // Calculate Average ATS score from standalone reviews
  const avgScoreResult = await prisma.resumeAnalysis.aggregate({
    where: { userId, type: "RESUME_ANALYSIS", score: { not: null } },
    _avg: { score: true },
  });
  const avgScore = avgScoreResult._avg.score ? Math.round(avgScoreResult._avg.score) : 0;

  // Fetch full user details to check premium badge
  const fullUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true, premiumUntil: true },
  });
  const isPremiumActive = !!(fullUser?.isPremium && (!fullUser.premiumUntil || new Date(fullUser.premiumUntil) > new Date()));

  // 3. Fetch recent analyses
  const recentAnalyses = await prisma.resumeAnalysis.findMany({
    where: { userId },
    include: {
      resume: { select: { fileName: true, title: true } },
      jobDescription: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch recent builder documents
  const recentBuilderDocs = await prisma.resumeBuilderDocument.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 3,
  });

  // 4. Fetch recent logs (Activity logs must be real newest first)
  const recentLogs = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8 text-foreground transition-colors duration-300">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            {isPremiumActive ? (
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold rounded-full">
                ★ PREMIUM ACTIVE
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold rounded-full">
                FREE ACCOUNT
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">Welcome back, {decoded.name}. Here is your resume analyzer status.</p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/dashboard/resume-builder"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Build Professional Resume</span>
          </Link>
          <Link
            href="/dashboard/resume-upload"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-secondary hover:bg-muted text-foreground border border-border transition-all cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Upload New Resume</span>
          </Link>
        </div>
      </div>

      {/* Empty State Call-To-Action (CTA) if no resumes exist */}
      {totalResumes === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-border bg-card text-center flex flex-col items-center justify-center space-y-4 shadow-md animate-zoom-in">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <Upload className="h-10 w-10 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold">Upload your first resume</h3>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Get started by uploading your resume or pasting your resume text. Once uploaded, you can scan for ATS optimization, compare against job listings, and practice dynamic mock interviews!
          </p>
          <Link
            href="/dashboard/resume-upload"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md cursor-pointer font-sans"
          >
            <span>Get Started Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        /* Stats Grid - Show actual database counts */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Total Resumes */}
          <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm hover:border-primary/10 transition-all">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Total Resumes</p>
              <p className="text-2xl font-bold">{totalResumes}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          {/* Generated Resumes */}
          <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm hover:border-primary/10 transition-all">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">AI Resumes</p>
              <p className="text-2xl font-bold">{totalBuilderDocs}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 shrink-0">
              <Cpu className="h-5 w-5" />
            </div>
          </div>

          {/* Average ATS Score */}
          <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm hover:border-primary/10 transition-all">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Avg ATS Score</p>
              <p className="text-2xl font-bold">{avgScore > 0 ? `${avgScore}%` : "N/A"}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shrink-0">
              <Award className="h-5 w-5" />
            </div>
          </div>

          {/* Job Matches */}
          <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm hover:border-primary/10 transition-all">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Job Matches</p>
              <p className="text-2xl font-bold">{totalJobMatches}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          {/* Interview Sets */}
          <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm hover:border-primary/10 transition-all">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Interview Sets</p>
              <p className="text-2xl font-bold">{totalInterviews}</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-400 shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>

          {/* Cover Letters */}
          <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm hover:border-primary/10 transition-all">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Cover Letters</p>
              <p className="text-2xl font-bold">{totalCoverLetters}</p>
            </div>
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500 dark:text-pink-400 shrink-0">
              <FileCode className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Layout (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Recent Analyses Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Recent AI Resume Analyses</span>
              </h2>
              <Link
                href="/dashboard/history"
                className="text-xs font-semibold text-primary hover:text-primary/95 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>View History</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
              {recentAnalyses.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="font-semibold">No analyses run yet</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-6">Upload a resume and start analyzing or matching job scopes.</p>
                  <Link
                    href="/dashboard/resume-upload"
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-secondary border border-border hover:bg-muted cursor-pointer"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-black/5 dark:bg-black/10 text-muted-foreground font-semibold">
                        <th className="p-4 pl-6">Resume</th>
                        <th className="p-4">Analysis Type</th>
                        <th className="p-4 text-center">Score / Match</th>
                        <th className="p-4 text-right pr-6">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {recentAnalyses.map((item) => (
                        <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-black/10 transition-colors">
                          <td className="p-4 pl-6 font-medium truncate max-w-[180px]">
                            {item.resume?.fileName || item.resume?.title || "Unnamed Resume"}
                          </td>
                          <td className="p-4">
                            {item.type === "JOB_MATCH" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Job Match: {item.jobDescription?.title || "Role"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                Standalone Review
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`font-semibold px-2 py-0.5 rounded-md text-xs border ${
                                (item.score ?? item.matchPercentage ?? 0) >= 80
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : (item.score ?? item.matchPercentage ?? 0) >= 60
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                              }`}
                            >
                              {item.score ?? item.matchPercentage ?? 0}%
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6 text-muted-foreground text-xs font-mono">
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Recent Professional Resumes Widget */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary animate-pulse" />
              <span>Recent AI Generated Resumes</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentBuilderDocs.length === 0 ? (
                <div className="col-span-3 p-8 bg-card border border-border rounded-2xl text-center text-xs text-muted-foreground italic">
                  No professional resumes generated yet. Use the Resume Builder to generate one!
                </div>
              ) : (
                recentBuilderDocs.map((doc) => (
                  <div key={doc.id} className="p-4 bg-card border border-border rounded-2xl space-y-3 hover:border-primary/20 transition-all flex flex-col justify-between shadow-sm">
                    <div>
                      <h4 className="text-xs font-bold truncate text-foreground">{doc.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">{doc.templateId}</p>
                    </div>
                    <Link
                      href={`/dashboard/resume-builder/${doc.id}`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: Recent Activities */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Recent Activity Logs</span>
            </h2>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-md space-y-4">
              {recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No recent actions recorded.</p>
              ) : (
                <div className="relative border-l border-border pl-4 space-y-6">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-card animate-pulse-subtle" />
                      <p className="text-sm font-semibold leading-none">{log.action}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-normal">{log.message || log.details}</p>
                      <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick tips panel */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/5 border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-primary opacity-20">
              <Sparkles className="h-16 w-16 animate-pulse-subtle" />
            </div>
            <h3 className="text-md font-bold mb-2">Pro Prep Tip</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Resumes with ATS scores above 80% are 3x more likely to clear preliminary bots. Run the **Job Matcher** to tailor keyword ratios to your target job listing before applying.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
