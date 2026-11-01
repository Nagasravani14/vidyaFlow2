"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import AICoachChatbot from "@/components/AICoachChatbot";
import {
  Video,
  Play,
  Pause,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  BookOpen,
  ArrowRight,
  ExternalLink,
  X,
  Volume2,
  Maximize2,
  RotateCcw,
  Sun,
  Moon,
  Globe,
  Award,
  ChevronRight,
  Info,
  Check,
  Flame,
  ListOrdered,
  Tag,
  BookmarkCheck,
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface VideoResource {
  id: number;
  title: string;
  title_te?: string;
  title_hi?: string;
  description: string;
  description_te?: string;
  description_hi?: string;
  board: string;
  grade_level: number;
  subject: string;
  chapter: string;
  chapter_id?: number;
  topic: string;
  video_url: string;
  thumbnail_url: string;
  duration: string;
  language: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
  resource_type: string;
  is_mock: boolean;
  related_concepts: string[];
  key_takeaways: string[];
  order_index: number;
  is_completed: boolean;
  completed_at?: string;
}

interface VideoProgressStats {
  total_videos: number;
  completed_videos: number;
  completion_percentage: number;
  subtopics_covered: number;
  total_subtopics: number;
}

// Color schemes per subtopic index for sleek icon gradients
const ACCENT_COLORS = [
  { from: "from-cyan-500", to: "to-blue-600", text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  { from: "from-purple-500", to: "to-pink-600", text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  { from: "from-emerald-500", to: "to-teal-600", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { from: "from-amber-500", to: "to-orange-600", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { from: "from-indigo-500", to: "to-violet-600", text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30" },
  { from: "from-sky-500", to: "to-cyan-600", text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" },
  { from: "from-rose-500", to: "to-pink-600", text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
  { from: "from-violet-500", to: "to-purple-600", text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30" },
  { from: "from-teal-500", to: "to-emerald-600", text: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30" },
  { from: "from-fuchsia-500", to: "to-rose-600", text: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/30" },
];

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [stats, setStats] = useState<VideoProgressStats>({
    total_videos: 10,
    completed_videos: 0,
    completion_percentage: 0,
    subtopics_covered: 0,
    total_subtopics: 10,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "te" | "hi">("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Active Video Modal Player
  const [activeVideo, setActiveVideo] = useState<VideoResource | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeSuccessMessage, setCompleteSuccessMessage] = useState("");

  const studentId = 1; // Demo student: Ananya Sharma

  // 1. Fetch Videos & Subtopics
  const loadVideosData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        grade_level: "8",
        subject: "Mathematics",
        language: selectedLanguage,
        user_id: String(studentId),
      });

      const [videosData, subtopicsData, statsData] = await Promise.all([
        fetchFromAPI(`/api/videos?${params.toString()}`),
        fetchFromAPI(`/api/videos/subtopics/list?grade_level=8&subject=Mathematics`),
        fetchFromAPI(`/api/videos/progress/summary?user_id=${studentId}&grade_level=8&subject=Mathematics`),
      ]);

      if (Array.isArray(videosData)) setVideos(videosData);
      if (subtopicsData?.subtopics) setSubtopics(subtopicsData.subtopics);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error("Error loading video resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideosData();
  }, [selectedLanguage]);

  // Simulation timer for playback
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Filtered Videos
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      // Subtopic Filter
      if (selectedSubtopic !== "all" && v.topic.toLowerCase() !== selectedSubtopic.toLowerCase()) {
        return false;
      }
      // Difficulty Filter
      if (selectedDifficulty !== "all" && v.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = v.title.toLowerCase().includes(query);
        const inTopic = v.topic.toLowerCase().includes(query);
        const inDesc = v.description.toLowerCase().includes(query);
        const inTags = v.tags?.some((t) => t.toLowerCase().includes(query));
        if (!inTitle && !inTopic && !inDesc && !inTags) return false;
      }
      return true;
    });
  }, [videos, selectedSubtopic, selectedDifficulty, searchQuery]);

  // Mark video as completed
  const handleMarkCompleted = async (videoId: number) => {
    try {
      setIsCompleting(true);
      const res = await fetchFromAPI(`/api/videos/${videoId}/complete`, {
        method: "POST",
        body: JSON.stringify({ user_id: studentId, watch_time_seconds: 600 }),
      });

      if (res?.success) {
        // Update local state
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId ? { ...v, is_completed: true, completed_at: res.completed_at } : v
          )
        );

        if (activeVideo && activeVideo.id === videoId) {
          setActiveVideo((prev) => (prev ? { ...prev, is_completed: true, completed_at: res.completed_at } : null));
        }

        // Refresh stats
        const statsData = await fetchFromAPI(
          `/api/videos/progress/summary?user_id=${studentId}&grade_level=8&subject=Mathematics`
        );
        if (statsData) setStats(statsData);

        setCompleteSuccessMessage(res.message || "Completed! Progress updated.");
        setTimeout(() => setCompleteSuccessMessage(""), 4000);
      }
    } catch (err) {
      console.error("Failed to mark video completed:", err);
    } finally {
      setIsCompleting(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        isDark ? "bg-[#0B0F19] text-gray-100" : "bg-[#F0F5FF] text-slate-800"
      }`}
    >
      <Sidebar currentRole="student" />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5 transition-colors border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className={isDark ? "text-cyan-400" : "text-blue-600"}>Student Portal</span>
              <span className="text-gray-500">/</span>
              <span className={isDark ? "text-purple-400" : "text-indigo-600"}>Videos & Visual Learning</span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-400">Class 8 Mathematics</span>
            </div>
            <h1
              className={`text-2xl md:text-3xl font-extrabold ${
                isDark
                  ? "bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent"
                  : "text-slate-900"
              }`}
            >
              Class 8 Mathematics — Linear Algebra
            </h1>
            <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-slate-600"}`}>
              Telangana SCERT • Chapter 2: Linear Equations in One Variable • 10 Structured Video Lessons
            </p>
          </div>

          {/* Controls: Theme & Language Toggles */}
          <div className="flex items-center gap-3">
            {/* Language Selection */}
            <div
              className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs font-semibold ${
                isDark ? "bg-white/5 border-white/10" : "bg-white border-blue-200 shadow-sm"
              }`}
            >
              <Globe className="w-3.5 h-3.5 ml-2 text-cyan-400" />
              {(["en", "te", "hi"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-2.5 py-1 rounded-lg transition text-xs font-bold ${
                    selectedLanguage === lang
                      ? isDark
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                        : "bg-blue-600 text-white"
                      : isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  {lang === "en" ? "English" : lang === "te" ? "తెలుగు" : "हिन्दी"}
                </button>
              ))}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                isDark
                  ? "bg-white/5 border-white/10 text-amber-300 hover:bg-white/10"
                  : "bg-white border-blue-200 text-slate-700 hover:bg-blue-50 shadow-sm"
              }`}
              title="Toggle Light / Dark Mode"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>

        {/* Hero Progress Banner */}
        <div
          className={`relative rounded-3xl p-6 md:p-8 overflow-hidden border transition-all ${
            isDark
              ? "bg-gradient-to-br from-indigo-950/70 via-purple-950/40 to-[#0B0F19] border-cyan-500/30 shadow-neon-cyan"
              : "bg-gradient-to-br from-blue-100 via-indigo-50 to-white border-blue-200 shadow-md"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isDark ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-blue-600 text-white"
                  }`}
                >
                  Section: Linear Algebra Learning Videos
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isDark ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Structured Curriculum List
                </span>
              </div>
              <h2
                className={`text-xl md:text-2xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Linear Algebra Video Syllabus (10 Lessons)
              </h2>
              <p className={`text-sm ${isDark ? "text-gray-300" : "text-slate-600"}`}>
                Browse through all 10 core subtopics organized sequentially from fundamental concepts to multi-step word
                problems. Click any video in the list to open the learning player and track completion.
              </p>
            </div>

            {/* Live Progress Card */}
            <div
              className={`p-4 md:p-5 rounded-2xl border min-w-[260px] flex flex-col justify-between ${
                isDark ? "bg-white/5 border-white/10 backdrop-blur-md" : "bg-white/90 border-blue-200 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-75">Chapter Mastery</span>
                <span
                  className={`text-sm font-extrabold ${
                    isDark ? "text-cyan-400" : "text-blue-600"
                  }`}
                >
                  {stats.completed_videos} of {stats.total_videos} Completed
                </span>
              </div>

              {/* Progress Bar */}
              <div
                className={`w-full h-3 rounded-full overflow-hidden ${
                  isDark ? "bg-white/10" : "bg-slate-200"
                }`}
              >
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${stats.completion_percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-3 text-xs opacity-80">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {stats.completion_percentage}% Done
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  {stats.subtopics_covered} / {stats.total_subtopics} Subtopics
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div
          className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between ${
            isDark ? "bg-[#111827] border-white/10" : "bg-white border-blue-200 shadow-sm"
          }`}
        >
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by lesson title, subtopic, formula, or tag..."
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border focus:outline-none transition ${
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-cyan-400"
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Subtopic Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold opacity-75 hidden sm:inline">Subtopic:</span>
              <select
                value={selectedSubtopic}
                onChange={(e) => setSelectedSubtopic(e.target.value)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border focus:outline-none cursor-pointer ${
                  isDark
                    ? "bg-[#1E293B] border-white/10 text-gray-200"
                    : "bg-white border-slate-300 text-slate-700"
                }`}
              >
                <option value="all">All Subtopics (10)</option>
                {subtopics.map((t, idx) => (
                  <option key={idx} value={t}>
                    {idx + 1}. {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter Pills */}
            <div className="flex items-center gap-1.5">
              {(["all", "Beginner", "Intermediate", "Advanced"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedDifficulty === diff
                      ? isDark
                        ? "bg-purple-600 text-white shadow-neon-purple"
                        : "bg-indigo-600 text-white"
                      : isDark
                      ? "bg-white/5 text-gray-400 hover:bg-white/10"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {diff === "all" ? "All Levels" : diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Video Resources Structured List View */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-24 rounded-2xl border ${
                  isDark ? "bg-white/5 border-white/10" : "bg-slate-200 border-slate-300"
                }`}
              />
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div
            className={`p-12 text-center rounded-2xl border ${
              isDark ? "bg-white/5 border-white/10" : "bg-white border-blue-200"
            }`}
          >
            <Video className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-bold">No video lessons match your filter</h3>
            <p className="text-sm text-gray-400 mt-1">Try resetting your search query or choosing &quot;All Subtopics&quot;.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSubtopic("all");
                setSelectedDifficulty("all");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredVideos.map((video, idx) => {
              const accent = ACCENT_COLORS[(video.order_index - 1) % ACCENT_COLORS.length];
              return (
                <div
                  key={video.id}
                  className={`group rounded-2xl border p-4 md:p-5 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    video.is_completed
                      ? isDark
                        ? "bg-[#111827]/90 border-emerald-500/30 hover:border-emerald-400/50"
                        : "bg-emerald-50/40 border-emerald-200 hover:border-emerald-300"
                      : isDark
                      ? "bg-[#111827] border-white/10 hover:border-cyan-400/50 hover:shadow-neon-cyan"
                      : "bg-white border-blue-100 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  {/* Left: Index + Interactive Play Circle */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {/* Lesson Index Number */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border ${
                        video.is_completed
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : isDark
                          ? `${accent.bg} ${accent.text} ${accent.border}`
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {video.order_index < 10 ? `0${video.order_index}` : video.order_index}
                    </div>

                    {/* Circular Play Button Indicator */}
                    <button
                      onClick={() => setActiveVideo(video)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-md ${
                        video.is_completed
                          ? "bg-gradient-to-tr from-emerald-500 to-teal-600 text-white"
                          : `bg-gradient-to-tr ${accent.from} ${accent.to} text-white`
                      }`}
                      title="Watch Lesson"
                    >
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </button>
                  </div>

                  {/* Middle: Video Information and Metadata */}
                  <div className="flex-1 min-w-0 space-y-1.5 cursor-pointer" onClick={() => setActiveVideo(video)}>
                    {/* Metadata Badges Row */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`font-bold ${accent.text}`}>
                        Subtopic {video.order_index}: {video.topic}
                      </span>
                      <span className="text-gray-500 hidden sm:inline">•</span>

                      {/* Difficulty Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                          video.difficulty === "Beginner"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : video.difficulty === "Intermediate"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        }`}
                      >
                        {video.difficulty}
                      </span>

                      {/* Duration */}
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {video.duration}
                      </span>

                      {/* Demo Mock Badge */}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Demo Video
                      </span>
                    </div>

                    {/* Lesson Title */}
                    <h3
                      className={`text-base md:text-lg font-bold line-clamp-1 group-hover:underline ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {video.title}
                    </h3>

                    {/* Lesson Description */}
                    <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? "text-gray-400" : "text-slate-600"}`}>
                      {video.description}
                    </p>

                    {/* Tags Pills */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {video.tags.slice(0, 4).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                              isDark ? "bg-white/5 text-gray-400" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Status and Action Buttons */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/5 flex-shrink-0">
                    {/* Completion Status Indicator */}
                    {video.is_completed ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Completed</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 font-medium px-2 py-1">
                        Not started
                      </span>
                    )}

                    {/* Watch Now Button */}
                    <button
                      onClick={() => setActiveVideo(video)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                        isDark
                          ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-neon-cyan"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch</span>
                    </button>

                    {/* Mark as Completed Toggle */}
                    <button
                      onClick={() => handleMarkCompleted(video.id)}
                      disabled={video.is_completed}
                      className={`p-2 rounded-xl border text-xs transition ${
                        video.is_completed
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 cursor-default"
                          : isDark
                          ? "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-white/10"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-300"
                      }`}
                      title={video.is_completed ? "Already Completed" : "Mark as Completed"}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dedicated Video Player Modal (Zero Broken Image Dependency) */}
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div
              className={`relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl flex flex-col ${
                isDark ? "bg-[#0E1322] border-white/15 text-gray-100" : "bg-white border-blue-200 text-slate-900"
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                      isDark ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {activeVideo.order_index}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                      {activeVideo.topic} • Class 8 Mathematics
                    </span>
                    <h2 className="text-lg md:text-xl font-bold leading-tight line-clamp-1">{activeVideo.title}</h2>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveVideo(null);
                    setIsPlaying(false);
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Self-Contained Interactive Player Canvas (No External Image Dependency) */}
              <div className="relative aspect-video w-full bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1E1B4B] flex flex-col items-center justify-center overflow-hidden border-b border-white/10">
                {/* Mathematical Grid Pattern Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

                {/* Glowing Radial Accent Blobs */}
                <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Demo Mock Notice Header */}
                <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/90 text-black shadow-lg flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Demo Video — Placeholder (Mock Demonstration)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/60 text-gray-300 border border-white/10 backdrop-blur-md">
                    No iframe embedded
                  </span>
                </div>

                {/* Central Interactive Player Content */}
                <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-4 max-w-lg">
                  {/* Central Play / Pause Button with Pulsing Glow */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-18 h-18 p-5 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-white flex items-center justify-center shadow-neon-cyan hover:scale-110 transition-transform cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 fill-white" />
                    ) : (
                      <Play className="w-8 h-8 fill-white ml-1" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <p className="text-base font-bold text-white">
                      {isPlaying ? "Simulating Lesson Video Playback..." : "Click Play to Preview Lesson"}
                    </p>
                    <p className="text-xs text-gray-300 font-medium">
                      Subtopic {activeVideo.order_index}: {activeVideo.title}
                    </p>
                  </div>

                  {/* Equalizer Visualizer during playback */}
                  {isPlaying && (
                    <div className="flex items-center gap-1.5 h-8 py-1">
                      {[40, 70, 95, 60, 85, 50, 90, 75, 45, 80, 65, 90, 55].map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-gradient-to-t from-cyan-400 to-purple-400 rounded-full animate-pulse"
                          style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Mock URL Indicator */}
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/70 border border-white/10 text-xs text-cyan-300 font-mono">
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    <span>Mock URL: {activeVideo.video_url}</span>
                  </div>
                </div>

                {/* Player Bottom Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 flex items-center justify-between text-xs text-white z-20">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="font-bold text-cyan-300 hover:text-white"
                    >
                      {isPlaying ? "Pause ❚❚" : "Play ▶"}
                    </button>
                    <span className="text-gray-400 font-mono">
                      {String(Math.floor(playbackSeconds / 60)).padStart(2, "0")}:
                      {String(playbackSeconds % 60).padStart(2, "0")} / {activeVideo.duration}
                    </span>
                    <Volume2 className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
                  </div>

                  {/* Scrubber Mock */}
                  <div className="flex-1 mx-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-cyan-400 rounded-full transition-all duration-300 ${
                        isPlaying ? "w-1/3" : "w-0"
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-gray-400">1080p HD</span>
                    <Maximize2 className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Modal Body: Information, Key Rules, Concepts & List of Related Lessons */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Feedback Toast */}
                {completeSuccessMessage && (
                  <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>{completeSuccessMessage}</span>
                  </div>
                )}

                {/* Top Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {activeVideo.topic}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      Level: {activeVideo.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-300">
                      Duration: {activeVideo.duration}
                    </span>
                  </div>

                  {/* Completion Button */}
                  <button
                    onClick={() => handleMarkCompleted(activeVideo.id)}
                    disabled={activeVideo.is_completed || isCompleting}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
                      activeVideo.is_completed
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                        : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-105"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isCompleting
                        ? "Updating Progress..."
                        : activeVideo.is_completed
                        ? `Completed ✓ (${activeVideo.completed_at || "Recorded"})`
                        : "Mark as Completed"}
                    </span>
                  </button>
                </div>

                {/* Overview Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-wider opacity-75">Overview & Objectives</h4>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                    {activeVideo.description}
                  </p>
                </div>

                {/* Key Formulas & Rules */}
                {activeVideo.key_takeaways && activeVideo.key_takeaways.length > 0 && (
                  <div
                    className={`p-4 rounded-2xl border ${
                      isDark ? "bg-white/5 border-white/10" : "bg-blue-50/70 border-blue-200"
                    }`}
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Key Learning Takeaways & Rules
                    </h4>
                    <ul className="space-y-1.5 text-xs">
                      {activeVideo.key_takeaways.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Related Learning Concepts */}
                {activeVideo.related_concepts && activeVideo.related_concepts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider opacity-75">Related Concepts</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeVideo.related_concepts.map((concept, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-xl text-xs font-medium border ${
                            isDark
                              ? "bg-purple-950/40 text-purple-200 border-purple-500/30"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Lessons Sequence List (Clean List Format) */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-bold uppercase tracking-wider opacity-75 flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-cyan-400" />
                    <span>Other Lessons in this Chapter</span>
                  </h4>
                  <div className="space-y-2">
                    {videos
                      .filter((v) => v.id !== activeVideo.id)
                      .slice(0, 4)
                      .map((rv) => (
                        <div
                          key={rv.id}
                          onClick={() => {
                            setActiveVideo(rv);
                            setIsPlaying(false);
                            setPlaybackSeconds(0);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                            isDark
                              ? "bg-white/5 border-white/10 hover:border-cyan-400/50"
                              : "bg-slate-50 border-slate-200 hover:border-blue-400"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {rv.order_index}
                            </span>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold line-clamp-1">{rv.title}</h5>
                              <span className="text-[11px] text-gray-400">{rv.topic}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[11px] font-mono text-gray-400">⏱ {rv.duration}</span>
                            <Play className="w-3.5 h-3.5 text-cyan-400" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <AICoachChatbot />
      </main>
    </div>
  );
}
