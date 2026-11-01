# VidyaFlow — Automated Textbook to Mind Map & Quiz Dataset Generator

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Pydantic v2](https://img.shields.io/badge/pydantic-v2-green.svg)](https://docs.pydantic.dev/)
[![Gemini API](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-orange.svg)](https://ai.google.dev/)
[![Tests Passing](https://img.shields.io/badge/tests-18%2F18%20passing-brightgreen.svg)]()

A production-ready, automated educational content generation pipeline that ingests raw textbook PDF archives for **Classes 6–10** (Mathematics, Physical Science, Biological Science, General Science, and Social Studies) and outputs fully validated, structured educational datasets ready for immediate ingestion into the **VidyaFlow** learning platform.

---

## 🌟 Key Features

1. **Intelligent PDF Inventory & Provenance Discovery (`textbook_inventory.json`)**
   - Recursively discovers textbooks in nested folders and varying naming conventions.
   - Accurately classifies Class (6–10), Subject, Board (*Telangana State Board SCERT*), Medium (*English*), and Edition (*2026–27*).
   - Computes SHA256 hashes to detect and deduplicate duplicate textbooks.

2. **Robust Multi-Strategy Text Extraction (`output/extracted_chapters/`)**
   - Multi-strategy Table-of-Contents (TOC) parser handling columnar layouts, month markings, and multi-line titles.
   - Automatically computes physical PDF page to printed book page offset.
   - Cleans repeated recurring headers/footers (`"SCERT, TELANGANA"`, `"Government's Gift..."`) while preserving mathematical formulas, tables, and section hierarchies.
   - Low-confidence OCR detection for scanned or low-character pages.

3. **Structured Educational Summaries (`summary.json`)**
   - Generates age-appropriate chapter overviews, learning objectives, main concepts, key definitions, formulas with symbols/units, key facts, and revision notes.
   - Grounded strictly in extracted textbook text without hallucinations.

4. **Interactive 3-Level Mind Maps (`mindmap.json`)**
   - Hierarchical JSON tree directly consumable by React visualizers (`react-flow`, `@xyflow/react`, D3).
   - Maximum tree depth $\le 3$ below the central topic root.
   - Stable deterministic concept IDs (`concept_...`, `topic_...`) and inter-concept relationship edges.

5. **Strict 20-Question Quiz Banks (`quiz.json`)**
   - Exactly **20 MCQs per chapter** with strict difficulty partitioning:
     - **7 Easy** (Definitions, direct facts, basic recognition)
     - **8 Medium** (Application, standard calculations, multi-step reasoning)
     - **5 Hard** (Higher-order thinking, analytical evaluation)
   - Ordered monotonically from **Easy $\rightarrow$ Medium $\rightarrow$ Hard**.
   - Exactly 4 distinct options (`A`, `B`, `C`, `D`) and exactly 1 correct answer.
   - Every question links directly to a `concept_id` in the chapter's mind map.
   - Detailed concise explanations with source page citations.
   - **Math & Physics Numerical Verification:** SymPy / Python evaluation verifies calculations and checks option uniqueness.

6. **Dual Execution Engine: Gemini API & Offline Deterministic Engine**
   - **Live Mode:** Powered by Google Gemini (`gemini-2.5-flash` with rate limiting, exponential backoff, structured Pydantic outputs, and fallback to `gemini-1.5-pro`).
   - **Offline Deterministic Mode:** High-quality offline textbook extraction and NLP synthesis ensuring full pipeline functionality even without an active API key or internet connection.

7. **Strict Automated Validation & Reporting (`validation_report.json`, `generation_report.json`)**
   - 100% compliance gate: checks schema validity, question counts, difficulty breakdown, option integrity, concept linkages, and mind map depth before marking a chapter complete.
   - Automatically packages all verified outputs into `vidyaflow_generated_content.zip`.

---

## 📂 Output Hierarchy & Packaging

The final distribution archive `vidyaflow_generated_content.zip` follows this clean structure:

```
vidyaflow_generated_content/
├── class_6/
│   ├── mathematics/
│   │   ├── chapter_01/
│   │   │   ├── metadata.json       # Chapter provenance, source PDF, page ranges, IDs
│   │   │   ├── extracted_text.txt  # Cleaned, extracted textbook chapter text
│   │   │   ├── summary.json        # Structured educational summary and formulas
│   │   │   ├── mindmap.json        # Interactive 3-level mind map JSON tree
│   │   │   └── quiz.json           # Exactly 20 validated MCQs (7 Easy, 8 Med, 5 Hard)
│   │   └── ...
│   ├── general_science/
│   └── social_studies/
├── class_7/
├── class_8/
├── class_9/
├── class_10/
├── textbook_inventory.json         # Audit log of all discovered PDFs with hashes
├── chapter_inventory.json          # Complete inventory of all extracted chapters
├── generation_report.json          # Pipeline run statistics, token usage, execution time
├── validation_report.json          # Verification audit of every single chapter & question
└── README.md                       # Distribution documentation
```

---

## 🛠️ Technology Stack

- **Language:** Python 3.11+
- **PDF Extraction:** `pypdf >= 5.0.0`
- **AI Synthesis:** Google Gemini API (`google-genai >= 1.0.0`, `google-generativeai >= 0.8.0`)
- **Schema Validation:** `pydantic >= 2.6.0`
- **Math Verification:** `sympy >= 1.12`
- **Testing:** `pytest >= 8.0.0`
- **Optional OCR:** `pytesseract >= 0.3.10`, `pdf2image >= 1.17.0`, `pillow >= 10.0.0`

---

## 🚀 Quick Start Guide

### 1. Installation

Clone or open the repository directory, create a virtual environment, and install dependencies:

```bash
# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and insert your Gemini API Key (if using live AI generation):
```ini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FALLBACK_MODEL=gemini-1.5-pro
```
*(Note: If no API key is provided, the system automatically runs in deterministic offline mode.)*

---

## 💻 Running the Generator

### Pilot Run (1 Chapter Verification)
Test the entire pipeline end-to-end on Chapter 1 of Class 6 Social Studies:
```bash
python main.py --pilot
```

### 1-Chapter per Textbook Test Run
Extract and validate the first chapter of every textbook discovered (15 unique textbooks):
```bash
python main.py --limit-chapters 1 --force
```

### Full Batch Run
Process all chapters across all textbooks:
```bash
python main.py
```

### Targeted Filtering
Process specific classes or subjects:
```bash
# Process only Class 8 textbooks
python main.py --class 8

# Process only Mathematics across all classes
python main.py --subject "Mathematics"

# Run explicitly offline without API calls
python main.py --offline
```

---

## 🧪 Running Automated Tests

Run the full pytest suite to verify all inventory, extraction, math verification, validator, and multilingual adapter logic:

```bash
python -m pytest vidyaflow_generator/tests -v
```

All 18 comprehensive unit and integration tests will execute and validate the pipeline components.

---

## 📋 JSON Schemas & Data Contracts

All output files adhere strictly to documented Pydantic schemas located under `vidyaflow_generator/models/`:

| Schema File | Purpose | Key Attributes |
|-------------|---------|----------------|
| `models/inventory.py` | `TextbookRecord`, `ChapterRecord` | SHA256 hash, physical-to-printed page offset, canonical IDs |
| `models/summary.py` | `ChapterSummary` | Overview, learning objectives, definitions, formulas, revision notes |
| `models/mindmap.py` | `MindMapData` | Root node, nested children ($\le 3$ levels), relationships |
| `models/quiz.py` | `QuizBank`, `QuizQuestion` | 20 MCQs, 7/8/5 difficulty, 4 unique options A-D, concept node links |
| `models/report.py` | `GenerationReport`, `ValidationReport` | Timing, token usage, chapter-by-chapter validation audit |

Detailed sample JSON schemas and examples are provided in the `schemas/` directory.
