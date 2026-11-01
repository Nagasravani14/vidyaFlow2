"use client";

import React, { useState, useEffect } from "react";
import {
  GitFork,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  ChevronRight,
  ChevronDown,
  Layers,
  BookOpen,
  Sparkles,
  AlertCircle,
  Info,
} from "lucide-react";

interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  children?: MindMapNode[];
}

interface ChapterMindMapProps {
  chapterId?: string;
  lessonId?: number | string;
  initialTitle?: string;
  onSelectNode?: (node: MindMapNode) => void;
}

export default function ChapterMindMap({
  chapterId,
  lessonId,
  initialTitle,
  onSelectNode,
}: ChapterMindMapProps) {
  const [root, setRoot] = useState<MindMapNode | null>(null);
  const [title, setTitle] = useState<string>(initialTitle || "Chapter Mind Map");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  useEffect(() => {
    async function fetchMindMap() {
      try {
        setLoading(true);
        setErrorMsg(null);
        setSelectedNode(null);
        setCollapsedNodes({});

        const params = new URLSearchParams();
        if (chapterId) params.set("chapter_id", chapterId);
        if (lessonId) params.set("lesson_id", String(lessonId));

        const res = await fetch(`/api/dataset/mindmap?${params.toString()}`);
        const data = await res.json();

        if (data.available && data.root) {
          setRoot(data.root);
          setTitle(data.title || initialTitle || "Chapter Mind Map");
          setSelectedNode(data.root);
        } else {
          setRoot(null);
          setErrorMsg(data.message || "Mind map is not available for this chapter yet.");
        }
      } catch (err: any) {
        console.error("Failed to load mind map:", err);
        setErrorMsg("Mind map is not available for this chapter yet.");
        setRoot(null);
      } finally {
        setLoading(false);
      }
    }

    if (chapterId || lessonId) {
      fetchMindMap();
    }
  }, [chapterId, lessonId, initialTitle]);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNodeClick = (node: MindMapNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  const expandAll = () => setCollapsedNodes({});
  const collapseAll = () => {
    if (!root || !root.children) return;
    const collapsed: Record<string, boolean> = {};
    function mark(n: MindMapNode) {
      if (n.id !== "root") collapsed[n.id] = true;
      if (n.children) n.children.forEach(mark);
    }
    root.children.forEach(mark);
    setCollapsedNodes(collapsed);
  };

  if (loading) {
    return (
      <div className="glass-card p-10 rounded-2xl border border-white/10 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-400 font-mono">Loading chapter mind map from dataset...</p>
      </div>
    );
  }

  if (errorMsg || !root) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-white/10 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Mind Map Unavailable</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          {errorMsg || "Mind map is not available for this chapter yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <GitFork className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
              AUTHENTIC DATASET MIND MAP
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Hierarchical concept tree extracted directly from curriculum textbook
          </p>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
              className="p-1 rounded text-gray-400 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-gray-300">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="p-1 rounded text-gray-400 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={expandAll}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono transition border border-white/10"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono transition border border-white/10"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Main Content Area: Mind Map Tree + Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Mind Map Tree View */}
        <div
          className="lg:col-span-2 overflow-x-auto p-4 rounded-xl bg-black/30 border border-white/5 min-h-[420px]"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}
        >
          {/* Central Root Node */}
          <div className="mb-6">
            <div
              onClick={() => handleNodeClick(root)}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                selectedNode?.id === root.id
                  ? "bg-gradient-to-r from-purple-900/60 to-cyan-900/60 border-cyan-400 text-white shadow-neon-cyan scale-[1.02]"
                  : "bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border-purple-500/40 text-purple-200 hover:border-purple-400"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-bold text-sm tracking-wide">{root.label}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-cyan-300 border border-cyan-500/30">
                Central Concept
              </span>
            </div>
          </div>

          {/* Topics and Subtopics */}
          <div className="space-y-4 pl-4 border-l-2 border-cyan-500/30">
            {root.children &&
              root.children.map((topic, topicIdx) => {
                const isTopicCollapsed = collapsedNodes[topic.id];
                const hasTopicChildren = topic.children && topic.children.length > 0;
                const isTopicSelected = selectedNode?.id === topic.id;

                return (
                  <div key={topic.id} className="relative space-y-2">
                    {/* Topic Node */}
                    <div
                      onClick={() => handleNodeClick(topic)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        isTopicSelected
                          ? "bg-cyan-500/25 border-cyan-400 text-white shadow-neon-cyan scale-[1.01]"
                          : "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {hasTopicChildren && (
                        <button
                          onClick={(e) => toggleCollapse(topic.id, e)}
                          className="p-0.5 rounded text-gray-400 hover:text-white"
                        >
                          {isTopicCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      <span className="font-semibold">{topic.label}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        Topic {topicIdx + 1}
                      </span>
                    </div>

                    {/* Subtopics (if expanded) */}
                    {!isTopicCollapsed && hasTopicChildren && (
                      <div className="space-y-2.5 pl-6 border-l-2 border-purple-500/20 ml-3 pt-1">
                        {topic.children!.map((subtopic) => {
                          const isSubCollapsed = collapsedNodes[subtopic.id];
                          const hasSubChildren = subtopic.children && subtopic.children.length > 0;
                          const isSubSelected = selectedNode?.id === subtopic.id;

                          return (
                            <div key={subtopic.id} className="space-y-1.5">
                              {/* Subtopic Node */}
                              <div
                                onClick={() => handleNodeClick(subtopic)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] cursor-pointer transition-all ${
                                  isSubSelected
                                    ? "bg-purple-500/25 border-purple-400 text-white shadow-neon-purple scale-[1.01]"
                                    : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/10"
                                }`}
                              >
                                {hasSubChildren && (
                                  <button
                                    onClick={(e) => toggleCollapse(subtopic.id, e)}
                                    className="p-0.5 rounded text-gray-400 hover:text-white"
                                  >
                                    {isSubCollapsed ? (
                                      <ChevronRight className="w-3 h-3" />
                                    ) : (
                                      <ChevronDown className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                                <span>{subtopic.label}</span>
                              </div>

                              {/* Concept Leaf Nodes */}
                              {!isSubCollapsed && hasSubChildren && (
                                <div className="flex flex-wrap gap-1.5 pl-5 ml-2 border-l border-white/10 pt-1">
                                  {subtopic.children!.map((concept) => {
                                    const isConceptSelected = selectedNode?.id === concept.id;
                                    return (
                                      <button
                                        key={concept.id}
                                        onClick={() => handleNodeClick(concept)}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition border ${
                                          isConceptSelected
                                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-neon-green"
                                            : "bg-black/40 border-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/5"
                                        }`}
                                      >
                                        • {concept.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Selected Node Details Inspector */}
        <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 border-b border-white/10 pb-2">
            <Info className="w-4 h-4" />
            <span>NODE DETAILS INSPECTOR</span>
          </div>

          {selectedNode ? (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase block mb-0.5">
                  Concept Title
                </span>
                <h4 className="text-sm font-bold text-white">{selectedNode.label}</h4>
              </div>

              {selectedNode.description && (
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">
                    Textbook Excerpt / Description
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 font-sans">
                    {selectedNode.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                <div className="p-2 rounded bg-white/5">
                  <span className="text-gray-400 block">Node ID:</span>
                  <span className="text-cyan-300 font-semibold">{selectedNode.id}</span>
                </div>
                <div className="p-2 rounded bg-white/5">
                  <span className="text-gray-400 block">Sub-Nodes:</span>
                  <span className="text-purple-300 font-semibold">
                    {selectedNode.children ? selectedNode.children.length : 0}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-500">
              Click any node in the tree to inspect details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
