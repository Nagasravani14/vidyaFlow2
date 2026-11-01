# VidyaFlow Educational Platform - Generated Textbook Dataset

## Overview
This archive contains automated textbook curriculum extractions, structured interactive mind maps, and rigorously validated 20-question quiz banks generated for the **VidyaFlow** educational platform.

## Summary Statistics
- **Total Textbooks Discovered:** 16
- **Total Textbooks Successfully Extracted:** 16
- **Total Chapters Mapped:** 15
- **Total Questions Validated:** 300
- **Chapters Passed Validation:** 15
- **Chapters Requiring Review:** 0
- **Generated At:** 2026-11-01T10:11:34.004998+00:00

## Directory Organization
```
vidyaflow_generated_content/
├── class_6/
│   ├── mathematics/
│   │   ├── chapter_01/
│   │   │   ├── metadata.json       # Chapter provenance, source page range, IDs
│   │   │   ├── extracted_text.txt  # Cleaned, extracted textbook chapter text
│   │   │   ├── summary.json        # Structured educational summary and formulas
│   │   │   ├── mindmap.json        # Interactive 3-level mind map JSON tree
│   │   │   └── quiz.json           # Exactly 20 validated MCQs (7 Easy, 8 Med, 5 Hard)
...
├── textbook_inventory.json         # Complete audit log of all discovered PDFs
├── chapter_inventory.json          # Dataset of all detected chapters and offsets
├── generation_report.json          # Coverage, statistics, and hierarchy
├── validation_report.json          # Strict compliance and mathematical verification details
└── README.md                       # This documentation
```

## Ready for VidyaFlow Integration
All schemas strictly align with VidyaFlow platform interfaces:
- Mind maps are nested JSON trees directly renderable by React mind-map graph visualizers.
- Quizzes contain exactly 20 questions with 4 distinct options (A, B, C, D) and concept-level links.
- Provenance is preserved with source page references, textbook IDs, and chapter IDs.
