"""
VidyaFlow2 Verification Test: Chapter-wise Quizzes and Mind Maps
Tests actual local dataset loading, multiple chapters, answer verification,
and frontend route stability.
"""

import sys
import json
import unittest
import urllib.request
import urllib.error

FRONTEND_BASE = "http://localhost:3002"


def get_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "VidyaFlow-Test"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.getcode(), json.loads(resp.read().decode("utf-8"))


def post_json(url: str, payload: dict):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "VidyaFlow-Test"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.getcode(), json.loads(resp.read().decode("utf-8"))


class TestChapterQuizAndMindMaps(unittest.TestCase):
    def test_01_dataset_chapters_discovered(self):
        status, data = get_json(f"{FRONTEND_BASE}/api/dataset/chapters")
        self.assertEqual(status, 200)
        self.assertTrue(data["success"])
        self.assertEqual(data["count"], 15)
        chapters = data["chapters"]
        chapter_ids = [c["chapter_id"] for c in chapters]
        self.assertIn("class_8_mathematics_ch01_rational_numbers", chapter_ids)
        self.assertIn("class_6_mathematics_ch01_knowing_our_numbers", chapter_ids)
        self.assertIn("class_7_mathematics_ch01_integers", chapter_ids)
        self.assertIn("class_10_mathematics_ch01_real_numbers", chapter_ids)

    def test_02_class_8_quiz_loaded_answers_hidden(self):
        status, data = get_json(
            f"{FRONTEND_BASE}/api/dataset/quiz?chapter_id=class_8_mathematics_ch01_rational_numbers"
        )
        self.assertEqual(status, 200)
        self.assertTrue(data["available"])
        self.assertEqual(data["chapter_title"], "Rational Numbers")
        self.assertEqual(data["total_questions"], 20)
        q1 = data["questions"][0]
        self.assertIn("Rational Numbers", q1["question"])
        self.assertEqual(len(q1["options"]), 4)
        # CRITICAL: Correct answer must NOT be revealed before submission
        self.assertNotIn("correct_answer", q1)
        self.assertNotIn("explanation", q1)

    def test_03_class_6_quiz_displays_different_questions(self):
        status, data = get_json(
            f"{FRONTEND_BASE}/api/dataset/quiz?chapter_id=class_6_mathematics_ch01_knowing_our_numbers"
        )
        self.assertEqual(status, 200)
        self.assertTrue(data["available"])
        self.assertEqual(data["chapter_title"], "Knowing Our Numbers")
        self.assertEqual(data["total_questions"], 20)
        q1 = data["questions"][0]
        self.assertIn("Knowing Our Numbers", q1["question"])

    def test_04_check_answer_submission_correct(self):
        # In Rational Numbers q01, correct answer is A
        payload = {
            "chapter_id": "class_8_mathematics_ch01_rational_numbers",
            "question_id": "class_8_mathematics_ch01_rational_numbers_q01",
            "selected_option": "A",
        }
        status, res = post_json(f"{FRONTEND_BASE}/api/dataset/quiz/check", payload)
        self.assertEqual(status, 200)
        self.assertTrue(res["success"])
        self.assertTrue(res["is_correct"])
        self.assertEqual(res["correct_answer"], "A")
        self.assertTrue(len(res["explanation"]) > 10)

    def test_05_check_answer_submission_incorrect(self):
        # In Rational Numbers q01, option C is incorrect
        payload = {
            "chapter_id": "class_8_mathematics_ch01_rational_numbers",
            "question_id": "class_8_mathematics_ch01_rational_numbers_q01",
            "selected_option": "C",
        }
        status, res = post_json(f"{FRONTEND_BASE}/api/dataset/quiz/check", payload)
        self.assertEqual(status, 200)
        self.assertTrue(res["success"])
        self.assertFalse(res["is_correct"])
        self.assertEqual(res["correct_answer"], "A")
        self.assertTrue(len(res["explanation"]) > 10)

    def test_06_mindmap_loaded_class_8(self):
        status, data = get_json(
            f"{FRONTEND_BASE}/api/dataset/mindmap?chapter_id=class_8_mathematics_ch01_rational_numbers"
        )
        self.assertEqual(status, 200)
        self.assertTrue(data["available"])
        self.assertEqual(data["title"], "Rational Numbers")
        self.assertIsNotNone(data["root"])
        self.assertEqual(data["root"]["label"], "Rational Numbers")
        self.assertTrue(len(data["root"]["children"]) > 0)

    def test_07_mindmap_loaded_class_6_different_content(self):
        status, data = get_json(
            f"{FRONTEND_BASE}/api/dataset/mindmap?chapter_id=class_6_mathematics_ch01_knowing_our_numbers"
        )
        self.assertEqual(status, 200)
        self.assertTrue(data["available"])
        self.assertEqual(data["title"], "Knowing Our Numbers")
        self.assertIsNotNone(data["root"])
        self.assertEqual(data["root"]["label"], "Knowing Our Numbers")
        self.assertNotEqual(data["root"]["label"], "Rational Numbers")

    def test_08_chapter_lookup_by_lesson_id(self):
        # Lesson 97 maps to Class 8 Rational Numbers
        status, data = get_json(f"{FRONTEND_BASE}/api/dataset/quiz?lesson_id=97")
        self.assertEqual(status, 200)
        self.assertTrue(data["available"])
        self.assertEqual(data["chapter_title"], "Rational Numbers")

        # Lesson 1 maps to Class 6 Knowing Our Numbers
        status, data2 = get_json(f"{FRONTEND_BASE}/api/dataset/quiz?lesson_id=1")
        self.assertEqual(status, 200)
        self.assertTrue(data2["available"])
        self.assertEqual(data2["chapter_title"], "Knowing Our Numbers")

    def test_09_concept_map_page_renders_with_tabs(self):
        req = urllib.request.Request(
            f"{FRONTEND_BASE}/student/concept-map?chapter_id=class_8_mathematics_ch01_rational_numbers",
            headers={"User-Agent": "VidyaFlow-Test"},
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            self.assertEqual(resp.getcode(), 200)
            html = resp.read().decode("utf-8")
            self.assertTrue("concept-map" in html or "Loading chapter workspace" in html)

    def test_10_quiz_page_renders_cleanly(self):
        req = urllib.request.Request(
            f"{FRONTEND_BASE}/student/quiz?chapter_id=class_8_mathematics_ch01_rational_numbers",
            headers={"User-Agent": "VidyaFlow-Test"},
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            self.assertEqual(resp.getcode(), 200)
            html = resp.read().decode("utf-8")
            self.assertTrue("student/quiz" in html or "Loading quiz engine" in html)

    def test_11_regression_learning_and_dashboard_pages(self):
        for path in ["/student/learning", "/student/dashboard", "/student/progress", "/student/coach"]:
            req = urllib.request.Request(f"{FRONTEND_BASE}{path}", headers={"User-Agent": "VidyaFlow-Test"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                self.assertEqual(resp.getcode(), 200)


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestChapterQuizAndMindMaps)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
