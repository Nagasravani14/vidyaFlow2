import fs from "fs";
import path from "path";

export interface ChapterMetadata {
  chapter_id: string;
  textbook_id?: string;
  board: string;
  class: number;
  subject: string;
  chapter_number: number;
  chapter_title: string;
  source_pdf?: string;
  start_page?: number;
  end_page?: number;
  has_quiz: boolean;
  quiz_count: number;
  has_mindmap: boolean;
  folder_path: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  question_id: string;
  chapter_id: string;
  concept_id?: string;
  question: string;
  question_type?: string;
  options: QuizOption[];
  correct_answer?: string;
  explanation?: string;
  difficulty?: string;
  source_page?: number;
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  children?: MindMapNode[];
}

export interface ChapterMindMapData {
  chapter_id: string;
  title: string;
  root: MindMapNode;
}

// Known mapping of SQLite lesson IDs to dataset chapter IDs
const LESSON_ID_TO_CHAPTER_ID: Record<number, string> = {
  1: "class_6_mathematics_ch01_knowing_our_numbers",
  15: "class_6_general_science_ch01_our_food",
  31: "class_6_social_studies_ch01_reading_and_making_maps",
  47: "class_7_mathematics_ch01_integers",
  62: "class_7_general_science_ch01_general_science",
  78: "class_7_social_studies_ch01_reading_maps_of_different_kind",
  97: "class_8_mathematics_ch01_rational_numbers",
  112: "class_8_general_ch01_graphs_of_motion",
  123: "class_8_social_studies_ch01_reading_and_analysis_of_maps",
  143: "class_9_mathematics_ch01_real_numbers",
  158: "class_9_physical_science_ch01_matter_around_us",
  170: "class_9_biological_science_ch01_cell_structure_and_functions",
  181: "class_9_social_studies_ch01_our_earth",
  203: "class_10_mathematics_ch01_real_numbers",
  217: "class_10_social_studies_ch01_1_india_relief_features",
};

/**
 * Locate the local dataset directory in the project environment.
 * Checks multiple standard paths in order to support both project root
 * and frontend/ execution directories.
 */
function findDatasetBaseDir(): string | null {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, "..", "dataset_textbooks"),
    path.resolve(cwd, "..", "dataset_quiz"),
    path.resolve(cwd, "..", "dataset_quizs"),
    path.resolve(cwd, "dataset_textbooks"),
    path.resolve(cwd, "dataset_quiz"),
    path.resolve(cwd, "dataset_quizs"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const generatedContentPath = path.join(candidate, "vidyaflow_generated_content");
      if (fs.existsSync(generatedContentPath)) {
        return generatedContentPath;
      }
    }
  }

  return null;
}

// In-memory cache of discovered chapters
let cachedChapters: ChapterMetadata[] | null = null;
let lastCacheScanTime = 0;
const CACHE_TTL_MS = 60 * 1000;

function scanAllChapters(): ChapterMetadata[] {
  const now = Date.now();
  if (cachedChapters && now - lastCacheScanTime < CACHE_TTL_MS) {
    return cachedChapters;
  }

  const baseDir = findDatasetBaseDir();
  if (!baseDir) {
    return [];
  }

  const chapters: ChapterMetadata[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    const hasMetadata = entries.some((e) => e.isFile() && e.name === "metadata.json");

    if (hasMetadata) {
      try {
        const metaPath = path.join(currentDir, "metadata.json");
        const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));

        const quizPath = path.join(currentDir, "quiz.json");
        const hasQuiz = fs.existsSync(quizPath);
        let quizCount = 0;

        if (hasQuiz) {
          try {
            const quizData = JSON.parse(fs.readFileSync(quizPath, "utf-8"));
            quizCount = Array.isArray(quizData.questions) ? quizData.questions.length : 0;
          } catch {
            quizCount = 0;
          }
        }

        const mindmapPath = path.join(currentDir, "mindmap.json");
        const hasMindmap = fs.existsSync(mindmapPath);

        chapters.push({
          chapter_id: meta.chapter_id,
          textbook_id: meta.textbook_id,
          board: meta.board || "Telangana State Board (SCERT)",
          class: Number(meta.class),
          subject: meta.subject,
          chapter_number: Number(meta.chapter_number),
          chapter_title: meta.chapter_title,
          source_pdf: meta.source_pdf,
          start_page: meta.start_page,
          end_page: meta.end_page,
          has_quiz: hasQuiz,
          quiz_count: quizCount,
          has_mindmap: hasMindmap,
          folder_path: currentDir,
        });
      } catch (err) {
        console.warn(`Error reading chapter at ${currentDir}:`, err);
      }
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(currentDir, entry.name));
      }
    }
  }

  try {
    walk(baseDir);
  } catch (err) {
    console.warn("Failed scanning dataset base directory:", err);
  }

  // Sort chapters by class ascending, then subject, then chapter number
  chapters.sort((a, b) => {
    if (a.class !== b.class) return a.class - b.class;
    if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
    return a.chapter_number - b.chapter_number;
  });

  cachedChapters = chapters;
  lastCacheScanTime = now;
  return chapters;
}

export function getAllChapters(): ChapterMetadata[] {
  return scanAllChapters();
}

/**
 * Resolves a chapter using multiple strategies:
 * 1. Exact chapter_id match
 * 2. SQLite lesson ID match (e.g. 1, 97, etc.)
 * 3. Class + Subject + Chapter Number match
 * 4. Title normalization match
 */
export function findChapter(query: {
  chapter_id?: string;
  lesson_id?: number | string;
  class?: number | string;
  subject?: string;
  chapter_number?: number | string;
  title?: string;
}): ChapterMetadata | null {
  const chapters = scanAllChapters();
  if (chapters.length === 0) return null;

  // 1. Direct chapter_id match
  if (query.chapter_id) {
    const byId = chapters.find((c) => c.chapter_id.toLowerCase() === query.chapter_id!.toLowerCase());
    if (byId) return byId;
  }

  // 2. Lesson ID mapping
  if (query.lesson_id) {
    const numLessonId = Number(query.lesson_id);
    const mappedChapterId = LESSON_ID_TO_CHAPTER_ID[numLessonId];
    if (mappedChapterId) {
      const byLesson = chapters.find((c) => c.chapter_id === mappedChapterId);
      if (byLesson) return byLesson;
    }
  }

  // 3. Class + Subject + Chapter Number
  if (query.class && query.subject) {
    const targetClass = Number(query.class);
    const targetSub = query.subject.toLowerCase().replace(/[^a-z0-9]/g, "");
    const targetChNum = query.chapter_number ? Number(query.chapter_number) : 1;

    const byClassSub = chapters.find((c) => {
      const cSub = c.subject.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchSub = cSub.includes(targetSub) || targetSub.includes(cSub);
      return c.class === targetClass && matchSub && c.chapter_number === targetChNum;
    });
    if (byClassSub) return byClassSub;
  }

  // 4. Title match
  if (query.title) {
    const cleanTitle = query.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const byTitle = chapters.find((c) => {
      const cTitle = c.chapter_title.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cTitle.includes(cleanTitle) || cleanTitle.includes(cTitle);
    });
    if (byTitle) return byTitle;
  }

  // Default to first chapter if nothing matched but chapters exist
  return null;
}

/**
 * Loads the quiz for a given chapter.
 * By default hides correct answers unless includeAnswers = true.
 */
export function loadChapterQuiz(
  chapter: ChapterMetadata,
  includeAnswers: boolean = false
): { chapter: ChapterMetadata; questions: QuizQuestion[] } | null {
  const quizPath = path.join(chapter.folder_path, "quiz.json");
  if (!fs.existsSync(quizPath)) return null;

  try {
    const content = JSON.parse(fs.readFileSync(quizPath, "utf-8"));
    const rawQuestions: any[] = Array.isArray(content.questions) ? content.questions : [];

    const questions: QuizQuestion[] = rawQuestions.map((q) => {
      const safeQ: QuizQuestion = {
        question_id: q.question_id,
        chapter_id: q.chapter_id,
        concept_id: q.concept_id,
        question: q.question,
        question_type: q.question_type || "mcq",
        options: Array.isArray(q.options)
          ? q.options.map((opt: any) => ({
              id: opt.id || "",
              text: opt.text || "",
            }))
          : [],
        difficulty: q.difficulty || "medium",
        source_page: q.source_page,
      };

      if (includeAnswers) {
        safeQ.correct_answer = q.correct_answer;
        safeQ.explanation = q.explanation;
      }

      return safeQ;
    });

    return { chapter, questions };
  } catch (err) {
    console.error(`Error loading quiz for ${chapter.chapter_id}:`, err);
    return null;
  }
}

/**
 * Validates a single question answer against the local dataset file.
 */
export function checkQuestionAnswer(
  chapter: ChapterMetadata,
  questionId: string,
  selectedOption: string
): {
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
} | null {
  const quizPath = path.join(chapter.folder_path, "quiz.json");
  if (!fs.existsSync(quizPath)) return null;

  try {
    const content = JSON.parse(fs.readFileSync(quizPath, "utf-8"));
    const rawQuestions: any[] = Array.isArray(content.questions) ? content.questions : [];
    const question = rawQuestions.find((q) => q.question_id === questionId);

    if (!question) return null;

    const correctAnswer = (question.correct_answer || "").trim().toUpperCase();
    const cleanSelected = (selectedOption || "").trim().toUpperCase();
    const isCorrect = correctAnswer === cleanSelected;

    return {
      is_correct: isCorrect,
      correct_answer: correctAnswer,
      explanation:
        question.explanation ||
        (isCorrect
          ? "Great job! Your answer matches the textbook concept definition."
          : `The correct answer is Option ${correctAnswer}.`),
    };
  } catch (err) {
    console.error(`Error checking answer for ${questionId}:`, err);
    return null;
  }
}

/**
 * Loads the mind map for a given chapter from its local dataset file.
 */
export function loadChapterMindMap(chapter: ChapterMetadata): ChapterMindMapData | null {
  const mapPath = path.join(chapter.folder_path, "mindmap.json");
  if (!fs.existsSync(mapPath)) return null;

  try {
    const content = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
    return {
      chapter_id: content.chapter_id || chapter.chapter_id,
      title: content.title || chapter.chapter_title,
      root: content.root,
    };
  } catch (err) {
    console.error(`Error loading mind map for ${chapter.chapter_id}:`, err);
    return null;
  }
}
