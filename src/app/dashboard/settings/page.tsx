"use client";

import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Sliders,
  Shield,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
  Loader2,
  Edit2,
  Save,
  X,
  LogOut,
  Sparkles,
  CreditCard
} from "lucide-react";
import LogoutConfirmModal from "@/components/dashboard/LogoutConfirmModal";
import UpgradeModal from "@/components/dashboard/UpgradeModal";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
  isPremium?: boolean;
  premiumUntil?: string;
}

interface ConfigStatus {
  hasDatabase: boolean;
  hasGemini: boolean;
  hasOpenAI: boolean;
  hasRazorpayKeyId?: boolean;
  hasRazorpayKeySecret?: boolean;
  hasPublicRazorpayKeyId?: boolean;
  hasRazorpayWebhookSecret?: boolean;
  hasAppUrl?: boolean;
  razorpayMode?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  // Name Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Health Test States
  const [testingConnection, setTestingConnection] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Logout States
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setEditName(data.user.name);
        setConfig(data.configStatus);
      }
    } catch (err) {
      console.error("Failed to load user info:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchUserData();

    // Check current theme
    const isLight = document.body.classList.contains("light-theme");
    setTheme(isLight ? "light" : "dark");
  }, []);

  const runHealthCheck = async () => {
    setTestingConnection(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/ai/health");
      const data = await response.json();
      if (response.ok) {
        setHealthStatus(data);
        setSuccess("Connection health test completed!");
      } else {
        throw new Error(data.error || "Failed to complete connection checks.");
      }
    } catch (err: any) {
      setError(err.message || "Connection health check failed.");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setSavingName(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile name.");
      }

      setSuccess("Profile name updated successfully!");
      setUser(data.user);
      setIsEditing(false);
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while updating profile.");
    } finally {
      setSavingName(false);
    }
  };

  const toggleTheme = (targetTheme: string) => {
    setTheme(targetTheme);
    if (targetTheme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  };

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to sign out from the server.");
    }
    router.refresh();
    router.push("/login");
  };

  if (!mounted) return null;

  const isPremiumActive = !!(user?.isPremium && (!user.premiumUntil || new Date(user.premiumUntil) > new Date()));

  return (
    <div className="space-y-8 text-foreground transition-colors duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <span>System Settings</span>
        </h1>
        <p className="text-muted-foreground mt-1">Manage your account profile, UI themes, payment plan, and view integration guidelines.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 cols): Account, UI Customization & Membership Plan */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* User Profile Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-md font-bold flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary" />
                <span>User Profile Settings</span>
              </h3>
              {!isEditing && user && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {user ? (
              isEditing ? (
                <form onSubmit={handleUpdateName} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-name" className="text-xs font-semibold text-muted-foreground">
                      Full Name
                    </label>
                    <input
                      id="edit-name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      disabled={savingName}
                      className="block w-full h-11 rounded-xl border border-input bg-background/50 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block">
                      Email Address (Read-only)
                    </label>
                    <input
                      type="text"
                      value={user.email}
                      disabled
                      className="block w-full h-11 rounded-xl border border-border bg-black/10 dark:bg-black/30 px-4 text-sm text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={savingName || !editName.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer"
                    >
                      {savingName ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(user.name);
                        setError("");
                      }}
                      disabled={savingName}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl border border-border hover:bg-secondary/50 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/5 dark:bg-black/10 p-4 rounded-xl border border-border">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</p>
                    <p className="text-sm font-semibold">{user.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</p>
                    <p className="text-sm font-semibold">{user.email}</p>
                  </div>
                </div>
              )
            ) : (
              <div className="h-24 bg-secondary/20 animate-pulse rounded-xl" />
            )}
          </div>

          {/* Membership Premium Upgrade Panel */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-md font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span>SaaS Plan Membership</span>
              </h3>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                isPremiumActive
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              }`}>
                {isPremiumActive ? "PREMIUM PLAN" : "FREE PLAN"}
              </span>
            </div>

            {isPremiumActive ? (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                <p className="text-sm font-bold text-emerald-400">Lifetime Premium Access Active</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Thank you for supporting SkillBridge AI! All 10 professional resume templates, advanced AI rewriting tools, and watermark-free PDF exports are fully unlocked on your account.
                </p>
                {user?.premiumUntil && (
                  <p className="text-[10px] font-semibold font-mono text-emerald-500/80 pt-1">
                    Plan valid until: {new Date(user.premiumUntil).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                <p className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
                  <span>All templates are currently free for portfolio/demo launch.</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Enjoy premium designs, unlimited export, and advanced AI builder features without any payment during our launch period.
                </p>
              </div>
            )}
          </div>

          {/* Theme Settings Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md space-y-4">
            <h3 className="text-md font-bold flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <span>UI Theme Preferences</span>
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">Choose your visual appearance template. Theme updates persist locally on your web browser.</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => toggleTheme("dark")}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                  theme === "dark"
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Moon className="h-6 w-6 text-primary" />
                <span className="text-xs font-semibold">Dark Theme (Default)</span>
              </button>

              <button
                onClick={() => toggleTheme("light")}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                  theme === "light"
                    ? "border-primary bg-primary/5 text-foreground font-semibold"
                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Sun className="h-6 w-6 text-amber-500" />
                <span className="text-xs font-semibold">Light Theme</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): System Configuration Help */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md space-y-4">
            <h3 className="text-md font-bold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Integration Keys Status</span>
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Below are the configuration status details of local database connections and cloud-based AI parser models. Run the health test to check real-time API credentials.
            </p>

            <div className="space-y-3 pt-2">
              {/* Database */}
              <div className="space-y-1 bg-black/5 dark:bg-black/25 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>DATABASE_URL</span>
                  {healthStatus ? (
                    healthStatus.database.connected ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold">
                        CONNECTED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded text-[10px] font-bold animate-pulse">
                        FAILED
                      </span>
                    )
                  ) : config?.hasDatabase ? (
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold">
                      CONFIGURED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded text-[10px] font-bold animate-pulse">
                      MISSING
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-muted-foreground">Source: MySQL server-side</p>
                {healthStatus?.database.error && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 leading-normal">{healthStatus.database.error}</p>
                )}
              </div>

              {/* Gemini */}
              <div className="space-y-1 bg-black/5 dark:bg-black/25 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>GEMINI_API_KEY</span>
                  {healthStatus ? (
                    healthStatus.gemini.working ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold">
                        WORKING
                      </span>
                    ) : healthStatus.gemini.configured ? (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded text-[10px] font-bold animate-pulse">
                        FAILED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-zinc-500/10 dark:bg-zinc-500/25 text-zinc-600 dark:text-zinc-400 border border-border rounded text-[10px] font-bold">
                        MISSING
                      </span>
                    )
                  ) : config?.hasGemini ? (
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold">
                      CONFIGURED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-zinc-500/10 dark:bg-zinc-500/25 text-zinc-600 dark:text-zinc-400 border border-border rounded text-[10px] font-bold">
                      MISSING
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-muted-foreground">Source: Gemini (Primary Provider)</p>
                {healthStatus?.gemini.working && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Model: {healthStatus.gemini.model}</p>
                )}
                {healthStatus?.gemini.error && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 leading-normal">{healthStatus.gemini.error}</p>
                )}
              </div>

              {/* OpenAI */}
              <div className="space-y-1 bg-black/5 dark:bg-black/25 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>OPENAI_API_KEY</span>
                  {healthStatus ? (
                    healthStatus.openai.working ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold">
                        WORKING
                      </span>
                    ) : healthStatus.openai.error && healthStatus.openai.error.includes("fallback") ? (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded text-[10px] font-bold">
                        OPTIONAL FALLBACK FAILED
                      </span>
                    ) : healthStatus.openai.configured ? (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded text-[10px] font-bold animate-pulse">
                        FAILED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-zinc-500/10 dark:bg-zinc-500/25 text-zinc-600 dark:text-zinc-400 border border-border rounded text-[10px] font-bold">
                        MISSING
                      </span>
                    )
                  ) : config?.hasOpenAI ? (
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold">
                      CONFIGURED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-zinc-500/10 dark:bg-zinc-500/25 text-zinc-600 dark:text-zinc-400 border border-border rounded text-[10px] font-bold">
                      MISSING
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-muted-foreground">Source: OpenAI (Optional Fallback)</p>
                {healthStatus?.openai.working && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Model: {healthStatus.openai.model}</p>
                )}
                {healthStatus?.openai.error && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 leading-normal font-medium">{healthStatus.openai.error}</p>
                )}
              </div>

              {/* Razorpay Configurations */}
              <div className="space-y-2.5 bg-black/5 dark:bg-black/25 p-4 rounded-xl border border-border">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span>Razorpay API Config</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${
                    config?.hasRazorpayKeyId && config?.hasRazorpayKeySecret && config?.hasPublicRazorpayKeyId && config?.hasRazorpayWebhookSecret && config?.hasAppUrl
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse"
                  }`}>
                    {config?.hasRazorpayKeyId && config?.hasRazorpayKeySecret && config?.hasPublicRazorpayKeyId && config?.hasRazorpayWebhookSecret && config?.hasAppUrl
                      ? "CONFIGURED"
                      : "PARTIAL/MISSING"}
                  </span>
                </div>
                
                <div className="text-[11px] space-y-1.5 pt-1 border-t border-border/40">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Razorpay Public Key:</span>
                    <span className={config?.hasPublicRazorpayKeyId ? "text-emerald-500 font-semibold" : "text-red-500 font-semibold"}>
                      {config?.hasPublicRazorpayKeyId ? "Configured" : "Missing"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Razorpay Server Key:</span>
                    <span className={config?.hasRazorpayKeyId ? "text-emerald-500 font-semibold" : "text-red-500 font-semibold"}>
                      {config?.hasRazorpayKeyId ? "Configured" : "Missing"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Razorpay Secret:</span>
                    <span className={config?.hasRazorpayKeySecret ? "text-emerald-500 font-semibold" : "text-red-500 font-semibold"}>
                      {config?.hasRazorpayKeySecret ? "Configured" : "Missing"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Razorpay Webhook Secret:</span>
                    <span className={config?.hasRazorpayWebhookSecret ? "text-emerald-500 font-semibold" : "text-red-500 font-semibold"}>
                      {config?.hasRazorpayWebhookSecret ? "Configured" : "Missing"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">APP_URL:</span>
                    <span className={config?.hasAppUrl ? "text-emerald-500 font-semibold" : "text-red-500 font-semibold"}>
                      {config?.hasAppUrl ? "Configured" : "Missing"}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/40 pt-1.5">
                    <span className="text-muted-foreground font-semibold">Payment Mode:</span>
                    <span className={`font-bold capitalize ${config?.razorpayMode === "live" ? "text-emerald-500" : config?.razorpayMode === "test" ? "text-amber-500" : "text-red-500"}`}>
                      {config?.razorpayMode || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 p-3 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-600 dark:text-amber-400 space-y-1">
                  <p className="font-bold">⚠️ KYC Setup Note:</p>
                  <p>To accept live payments, complete Razorpay KYC using your real PAN and bank details in Razorpay Dashboard. PAN is not stored in this app.</p>
                  <p className="italic text-[9px] mt-1 pt-1 border-t border-amber-500/10">PAN/KYC is completed only on Razorpay Dashboard. This app only stores Razorpay API keys and payment records.</p>
                </div>
              </div>
            </div>

            {/* Graceful OpenAI message if OpenAI fails but Gemini works */}
            {((healthStatus && healthStatus.gemini.working && !healthStatus.openai.working) || 
              (healthStatus?.openai.error && healthStatus.openai.error.includes("fallback"))) && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-[10px] text-emerald-600 dark:text-emerald-400 leading-normal animate-zoom-in">
                OpenAI quota is unavailable, but Gemini is working and will power all AI features.
              </div>
            )}

            <button
              onClick={runHealthCheck}
              disabled={testingConnection}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50 mt-2 cursor-pointer"
            >
              {testingConnection ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Testing Connections...</span>
                </>
              ) : (
                <span>Run Connection Test</span>
              )}
            </button>
          </div>

          {/* Quick Logout Widget */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md space-y-4">
            <h3 className="text-md font-bold">Sign Out Session</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Exiting your dashboard terminates the secure cookies session.
            </p>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold rounded-xl bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-600 text-red-500 dark:text-red-400 hover:text-white transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Custom Sign Out modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      {/* Upgrade SaaS plan payment modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={fetchUserData}
      />
    </div>
  );
}
