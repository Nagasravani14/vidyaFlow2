"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  GitFork,
  BotMessageSquare,
  Sparkles,
  Award,
  BarChart3,
  FileText,
  Video,
  Layers,
  GraduationCap,
  Users,
  HeartHandshake,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  currentRole?: "student" | "teacher" | "parent";
}

export default function Sidebar({ currentRole = "student" }: SidebarProps) {
  const pathname = usePathname();

  const studentNavItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Learning", href: "/student/learning", icon: BookOpen },
    { label: "Concept Map", href: "/student/concept-map", icon: GitFork },
    { label: "AI Coach", href: "/student/coach", icon: BotMessageSquare },
    { label: "Practice", href: "/student/quiz?mode=adaptive", icon: Sparkles },
    { label: "Tests", href: "/student/quiz?mode=diagnostic", icon: Layers },
    { label: "Notes & Summaries", href: "/student/notes", icon: FileText },
    { label: "Videos", href: "/student/videos", icon: Video },
    { label: "Progress", href: "/student/progress", icon: BarChart3 },
    { label: "Achievements", href: "/student/achievements", icon: Award },
  ];

  const teacherNavItems = [
    { label: "Class Overview", href: "/teacher/dashboard", icon: LayoutDashboard },
    { label: "AI Interventions", href: "/teacher/dashboard#interventions", icon: Sparkles },
    { label: "Student Insights", href: "/teacher/dashboard#students", icon: Users },
    { label: "Curriculum Map", href: "/student/concept-map", icon: GitFork },
  ];

  const parentNavItems = [
    { label: "Child Overview", href: "/parent/dashboard", icon: HeartHandshake },
    { label: "Weekly Insights", href: "/parent/dashboard#insights", icon: Sparkles },
    { label: "Teacher Updates", href: "/parent/dashboard#updates", icon: BookOpen },
    { label: "Test Schedule", href: "/parent/dashboard#tests", icon: Layers },
  ];

  const navItems =
    currentRole === "teacher"
      ? teacherNavItems
      : currentRole === "parent"
      ? parentNavItems
      : studentNavItems;

  const roleBadge = {
    student: { text: "Student Portal", color: "from-cyan-500/20 to-purple-500/20 text-cyan-400 border-cyan-500/30" },
    teacher: { text: "Teacher Portal", color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30" },
    parent: { text: "Parent Portal", color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30" },
  }[currentRole];

  return (
    <aside className="w-64 min-h-screen bg-[#0B0F19]/90 border-r border-white/10 flex flex-col justify-between p-4 sticky top-0 backdrop-blur-xl z-30">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              VidyaFlow
            </h1>
            <p className="text-[11px] text-gray-400 font-mono tracking-wider">ADAPTIVE LEARNING</p>
          </div>
        </div>

        {/* Role Pill Indicator */}
        <div className="px-3 mb-6">
          <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center justify-between bg-gradient-to-r ${roleBadge.color}`}>
            <span>{roleBadge.text}</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href.includes("?") && pathname === item.href.split("?")[0]);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher & Bottom Utility */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400">
          <p className="font-semibold text-gray-300 mb-1">Switch Role Portal</p>
          <div className="grid grid-cols-3 gap-1 mt-1">
            <Link
              href="/student/dashboard"
              className={`text-center py-1 rounded text-[11px] transition ${
                currentRole === "student" ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50" : "hover:bg-white/10 text-gray-400"
              }`}
            >
              Student
            </Link>
            <Link
              href="/teacher/dashboard"
              className={`text-center py-1 rounded text-[11px] transition ${
                currentRole === "teacher" ? "bg-purple-500/30 text-purple-300 border border-purple-500/50" : "hover:bg-white/10 text-gray-400"
              }`}
            >
              Teacher
            </Link>
            <Link
              href="/parent/dashboard"
              className={`text-center py-1 rounded text-[11px] transition ${
                currentRole === "parent" ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50" : "hover:bg-white/10 text-gray-400"
              }`}
            >
              Parent
            </Link>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-gray-200 rounded-lg hover:bg-white/5 transition"
        >
          <LogOut className="w-3.5 h-3.5 text-gray-500" />
          <span>Exit to Role Landing</span>
        </Link>
      </div>
    </aside>
  );
}
