import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import DashboardSidebarClient from "@/components/dashboard/DashboardSidebarClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Server-side Authentication Guard
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  let user = null;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true },
      });
    }
  }

  if (!user) {
    redirect("/login");
  }

  // 2. Navigation items
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { name: "Resume Upload", href: "/dashboard/resume-upload", icon: "upload" },
    { name: "Resume Analyzer", href: "/dashboard/resume-analyzer", icon: "analysis" },
    { name: "Resume Builder", href: "/dashboard/resume-builder", icon: "builder" },
    { name: "Job Matcher", href: "/dashboard/job-matcher", icon: "match" },
    { name: "Cover Letter", href: "/dashboard/cover-letter", icon: "cover" },
    { name: "Interview Coach", href: "/dashboard/interview-coach", icon: "interview" },
    { name: "History", href: "/dashboard/history", icon: "history" },
    { name: "Settings", href: "/dashboard/settings", icon: "settings" },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Navigation */}
      <DashboardSidebarClient 
        navItems={navItems} 
        user={{ id: user.id, name: user.name, email: user.email }}
      >
        {children}
      </DashboardSidebarClient>
    </div>
  );
}
