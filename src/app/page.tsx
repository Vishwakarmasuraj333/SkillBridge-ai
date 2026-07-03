import Link from "next/link";
import { ArrowRight, Sparkles, FileText, CheckCircle, Cpu, ShieldAlert, Award, FileCode, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white hover:opacity-90">
            <Cpu className="h-6 w-6 text-primary" />
            <span>SkillBridge<span className="text-primary">AI</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 flex flex-col items-center overflow-hidden">
        {/* Glow behind hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-semibold tracking-wide mb-6 animate-pulse-subtle">
            <Sparkles className="h-3 w-3" />
            <span>Powered by Gemini 1.5 Flash</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            AI Resume Analyzer &<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              Interview Coach
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your resume, compare it directly with target job descriptions, get a precise ATS score, generate custom cover letters, and prepare for interviews with tailored coaching.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl bg-primary text-white hover:bg-primary/95 transition-all shadow-lg shadow-primary/30"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login?redirect=resume-upload"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-all"
            >
              <FileText className="h-4 w-4" />
              <span>Analyze Resume</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-border bg-black/40">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Complete Suite of AI Career Tools</h2>
            <p className="text-muted-foreground">Every tool you need to stand out to recruiters and ace your next interview.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col group">
              <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-6 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">ATS Resume Review</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Get an instant ATS score out of 100 with parsed summaries, core strengths, formatting issues, and actionable checklist items.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col group">
              <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-6 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Job Matcher</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Paste job descriptions to compare skills. Identify experience gaps, keyword matches, and targeted improvements.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col group">
              <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Interview Coach</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Generate HR, technical, and project-based Q&A tailored directly to your resume and experience level (beginner to advanced).
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col group">
              <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-6 group-hover:scale-110 transition-transform">
                <FileCode className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cover Letter Creator</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Instantly draft editable, company-tailored cover letters designed to align with recruiter requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 border-t border-border">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How SkillBridge AI Works</h2>
            <p className="text-muted-foreground">Go from raw draft to interview-ready in four simple steps.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Upload Resume</h3>
              <p className="text-sm text-muted-foreground">Upload your standard PDF resume. The AI parses the text instantly.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Analyze ATS Score</h3>
              <p className="text-sm text-muted-foreground">Inspect weaknesses, keyword highlights, and formatting recommendations.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Match the Job</h3>
              <p className="text-sm text-muted-foreground">Paste any job description to compare skills and generate tailored cover letters.</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 mb-6">
                4
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Simulate Interviews</h3>
              <p className="text-sm text-muted-foreground">Ace your interview by practicing with custom generated role-specific questions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-border bg-black/40">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Simple, Free Pricing</h2>
            <p className="text-muted-foreground">Enjoy full premium access to our resume utilities at no cost.</p>
          </div>

          <div className="max-w-md mx-auto rounded-2xl bg-card border-2 border-primary p-8 shadow-xl shadow-primary/10 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider">
              Free Plan
            </div>

            <div className="text-center mb-8">
              <div className="text-5xl font-extrabold text-white mb-2">$0</div>
              <div className="text-sm text-muted-foreground">Forever free, no credit card required</div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span>Unlimited PDF Resume uploads</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span>Full ATS review and checklists</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span>Detailed Job Description matching</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span>Custom Interview Question simulator</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span>Custom Tailored Cover Letters</span>
              </li>
            </ul>

            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center px-6 py-3 font-semibold rounded-xl bg-primary text-white hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-background py-8">
        <div className="container mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-white">
            <Cpu className="h-5 w-5 text-primary" />
            <span>SkillBridge AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SkillBridge AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
