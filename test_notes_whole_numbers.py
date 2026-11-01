"""
VidyaFlow Verification Test: Class 8 Mathematics — Whole Numbers Notes & Summaries
Tests the four fully populated sections: AI Summary, Key Formulas, Definitions, and Flashcards.
"""

import sys
import os
import unittest
import urllib.request

FRONTEND_BASE = "http://localhost:3002"

# Read mock file directly
MOCK_FILE = os.path.join("frontend", "lib", "mockWholeNumbersNotes.ts")
with open(MOCK_FILE, "r", encoding="utf-8") as f:
    MOCK_CONTENT = f.read()


class TestWholeNumbersNotesAndSummaries(unittest.TestCase):
    def test_01_notes_page_renders_200(self):
        req = urllib.request.Request(f"{FRONTEND_BASE}/student/notes", headers={"User-Agent": "VidyaFlow-Test"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            self.assertEqual(resp.getcode(), 200)
            html = resp.read().decode("utf-8")
            self.assertTrue("student/notes" in html or "Loading notes" in html)

    def test_02_ai_summary_content_present_in_dataset(self):
        self.assertIn("W = {0, 1, 2, 3, ...}", MOCK_CONTENT)
        self.assertIn("number line", MOCK_CONTENT.lower())
        self.assertIn("closure property", MOCK_CONTENT.lower())
        self.assertIn("commutative property", MOCK_CONTENT.lower())
        self.assertIn("associative property", MOCK_CONTENT.lower())
        self.assertIn("distributive property", MOCK_CONTENT.lower())
        self.assertIn("additive identity", MOCK_CONTENT.lower())
        self.assertIn("multiplicative identity", MOCK_CONTENT.lower())

    def test_03_key_formulas_populated(self):
        self.assertIn("a + b = b + a", MOCK_CONTENT)
        self.assertIn("a × b = b × a", MOCK_CONTENT)
        self.assertIn("(a + b) + c = a + (b + c)", MOCK_CONTENT)
        self.assertIn("(a × b) × c = a × (b × c)", MOCK_CONTENT)
        self.assertIn("a × (b + c) = (a × b) + (a × c)", MOCK_CONTENT)
        self.assertIn("a + 0 = 0 + a = a", MOCK_CONTENT)
        self.assertIn("a × 1 = 1 × a = a", MOCK_CONTENT)
        self.assertIn("a × 0 = 0 × a = 0", MOCK_CONTENT)

    def test_04_definitions_populated(self):
        terms = [
            "Whole Numbers",
            "Natural Numbers",
            "Number Line",
            "Closure Property",
            "Commutative Property",
            "Associative Property",
            "Distributive Property",
            "Additive Identity",
            "Multiplicative Identity",
        ]
        for term in terms:
            self.assertIn(f'term: "{term}"', MOCK_CONTENT)

    def test_05_flashcards_populated(self):
        prompts = [
            "What is the smallest whole number?",
            "What is the additive identity for whole numbers?",
            "What is the multiplicative identity for whole numbers?",
            "Is addition of whole numbers commutative?",
            "Is subtraction of whole numbers commutative?",
            "What is the closure property for whole numbers under multiplication?",
            "What is the associative property of addition for whole numbers?",
            "What is the successor of 99 in whole numbers?",
        ]
        for prompt in prompts:
            self.assertIn(prompt, MOCK_CONTENT)

    def test_06_chapter_notes_by_query_param(self):
        req = urllib.request.Request(
            f"{FRONTEND_BASE}/student/notes?chapter_id=2",
            headers={"User-Agent": "VidyaFlow-Test"},
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            self.assertEqual(resp.getcode(), 200)


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestWholeNumbersNotesAndSummaries)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
