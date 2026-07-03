"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Cpu,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Upload,
  BarChart3,
  GitCompare,
  FileCode,
  GraduationCap,
  History,
  Settings,
  Sun,
  Moon,
  FileText
} from "lucide-react";
import LogoutConfirmModal from "./LogoutConfirmModal";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  upload: Upload,
  analysis: BarChart3,
  builder: FileText,
  match: GitCompare,
  cover: FileCode,
  interview: GraduationCap,
  history: History,
  settings: Settings,
};

export default function DashboardSidebarClient({
  navItems,
  user,
  children,
}: {
  navItems: NavItem[];
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const isLight = document.body.classList.contains("light-theme");
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "light") {
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

  return (
    <div className="flex w-full h-full text-foreground transition-colors duration-300">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-card border-r border-border h-full justify-between">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-90">
              <Cpu className="h-5 w-5 text-primary" />
              <span>SkillBridge<span className="text-primary">AI</span></span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom panel theme toggle & user details */}
        <div className="border-t border-border bg-black/5 dark:bg-black/20">
          {/* Theme Toggle inside Sidebar */}
          <div className="p-4 pb-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer bg-card"
            >
              <span className="flex items-center gap-2">
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-primary" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">Toggle</span>
            </button>
          </div>

          <div className="p-4 pt-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-border bg-card mb-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-border text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer bg-card"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-background/80 backdrop-blur-sm">
          <div 
            className="fixed inset-0"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-card border-r border-border h-full flex flex-col justify-between p-6 shadow-2xl animate-slide-in">
            {/* Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary border border-border cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="flex flex-col flex-1">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 font-bold text-lg tracking-tight mb-8">
                <Cpu className="h-5 w-5 text-primary" />
                <span>SkillBridge<span className="text-primary">AI</span></span>
              </Link>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = iconMap[item.icon] || LayoutDashboard;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Panel */}
            <div className="border-t border-border pt-4">
              {/* Mobile theme toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer bg-background mb-3"
              >
                <span className="flex items-center gap-2">
                  {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-primary" />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">Toggle</span>
              </button>

              <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-border bg-black/5 dark:bg-black/20 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-border text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Mobile Header Bar */}
        <header className="flex md:hidden items-center justify-between px-6 h-16 border-b border-border bg-card shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Cpu className="h-5 w-5 text-primary" />
            <span>SkillBridge<span className="text-primary">AI</span></span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary border border-border cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </main>
      </div>

      {/* Custom Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
