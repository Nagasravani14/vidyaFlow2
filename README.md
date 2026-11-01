# 🌌 VidyaFlow — Adaptive Learning Web Application

> **Next-Generation Adaptive Learning Web Application for Classes 6–10**  
> Supporting Telangana State Board, CBSE, and ICSE syllabi with multi-language support (English, తెలుగు, हिन्दी).

---

## ⚡ Tech Stack & Architecture
- **Frontend:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Lucide React, Framer Motion.
- **Backend:** FastAPI (Python), Uvicorn, Pydantic v2, SQLite / SQLAlchemy ORM.
- **AI & Adaptive Engine:**
  - **Bayesian Knowledge Tracing (BKT):** Real-time Bayesian posterior updating with parameters $P(L_0)$, $P(T)$, $P(G)$, $P(S)$.
  - **Concept Prerequisite Graph:** Dependency tree flow with automated **Root-Cause Knowledge Gap Detection**.
  - **Dynamic Branching:** Fast learners skip to Olympiad challenge sets; struggling learners route to prerequisite remediation.
  - **Multilingual Socratic AI Coach:** Progressive 3-level hints (Conceptual Nudge $\rightarrow$ Step Breakdown $\rightarrow$ Key Formula/Rule) in English, Telugu, and Hindi (**strictly assistive; never alters raw BKT mastery**).
- **Curriculum Dataset Ingestion:** Automated parser reading `dataset_textbooks/` containing Telangana State Board Class 8 Mathematics textbooks (Linear Equations in One Variable & Integer Operations).

---

## 🎨 Spider-Verse Futuristic Dark Theme
- **Backgrounds:** Deep midnight blue (`#0B0F19`, `#111827`)
- **Neon Accents:** Electric Cyan (`#06B6D4`), Vibrant Purple (`#8B5CF6`), Emerald Green (`#10B981`), Amber (`#F59E0B`), Coral Red (`#EF4444`)
- **Glassmorphism:** Frosted glass cards (`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl`)

---

## 🚀 Quick Start Guide

### 1. Launch the FastAPI Backend
```bash
# In the project root:
.\.venv\Scripts\uvicorn.exe backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)*

### 2. Launch the Next.js Frontend
```bash
# In the frontend directory:
cd frontend
npm run dev
```
*Application will be live at: [http://localhost:3000](http://localhost:3000)*

---

## 📂 Core Portals & Routes

| Role / Module | Route | Key Capabilities |
| :--- | :--- | :--- |
| **Role Selector** | `/` | Portal landing for Student, Teacher, and Parent |
| **Student Dashboard** | `/student/dashboard` | Personalized banner ("Good morning, Ananya"), Today's learning sprint, active chapter, BKT progress, concept map preview |
| **Concept Prerequisite Graph** | `/student/concept-map` | Interactive node graph showing mastery (`Strong`, `Developing`, `Needs Support`), dependency flow, and root-cause gaps |
| **Adaptive Quiz Engine** | `/student/quiz` | Real-time question evaluation, BKT mastery delta meter, progressive 3-level hints, dynamic branching |
| **Chapter Summaries & Notes** | `/student/notes` | Textbook AI summary, key formulas with copy, definitions, interactive flip flashcards |
| **Socratic AI Coach** | `/student/coach` | Drawer/dock chatbot with progressive guidance in English, Telugu, and Hindi |
| **Teacher Portal** | `/teacher/dashboard` | Class 8A (32 students) distribution, AI Class Insights, "AI Suggests, Teacher Decides" Approve/Reject interventions |
| **Parent Portal** | `/parent/dashboard` | Subject progress (Math 78%, Science 84%, English 91%), weekly AI insights, teacher notes, test readiness |

---

## 🧪 Automated Test Suite
Run the comprehensive test suite verifying all 11 backend endpoints and BKT calculations:
```bash
.\.venv\Scripts\python.exe test_api_endpoints.py
```
