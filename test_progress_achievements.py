"""
Verification Test: Progress and Achievements 404 Resolution
Validates backend API routes and frontend Next.js pages for /student/progress and /student/achievements.
"""

import sys
import json
import unittest
import urllib.request

API_BASE = "http://localhost:8000"
FRONTEND_BASE = "http://localhost:3002"

class TestProgressAndAchievements(unittest.TestCase):
    def test_01_backend_progress_endpoint(self):
        url = f"{API_BASE}/api/student/progress/1"
        req = urllib.request.Request(url, headers={"User-Agent": "VidyaFlow-Test"})
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.getcode(), 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["user"]["id"], 1)
            self.assertIn("aggregate_mastery_percent", data)
            self.assertTrue(data["total_lessons_tracked"] > 0)
            self.assertTrue(len(data["lessons_progress"]) > 0)
            self.assertTrue(len(data["concept_mastery"]) > 0)
            self.assertIn("strong", data["mastery_breakdown"])

    def test_02_backend_progress_default_endpoint(self):
        url = f"{API_BASE}/api/student/progress"
        req = urllib.request.Request(url, headers={"User-Agent": "VidyaFlow-Test"})
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.getcode(), 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["user"]["name"], "Ananya Sharma")

    def test_03_backend_achievements_endpoint(self):
        url = f"{API_BASE}/api/student/achievements/1"
        req = urllib.request.Request(url, headers={"User-Agent": "VidyaFlow-Test"})
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.getcode(), 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["user_id"], 1)
            self.assertEqual(data["total_achievements"], 5)
            self.assertEqual(data["unlocked_count"], 4)
            self.assertEqual(data["locked_count"], 1)
            self.assertTrue(data["total_xp"] > 320)
            self.assertEqual(len(data["achievements"]), 5)

            # Validate achievement codes
            codes = {a["code"] for a in data["achievements"]}
            self.assertIn("first_lesson_started", codes)
            self.assertIn("concept_explorer", codes)
            self.assertIn("sign_master", codes)
            self.assertIn("equation_pro", codes)
            self.assertIn("lesson_champion", codes)

    def test_04_backend_achievements_default_endpoint(self):
        url = f"{API_BASE}/api/student/achievements"
        req = urllib.request.Request(url, headers={"User-Agent": "VidyaFlow-Test"})
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.getcode(), 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["student_name"], "Ananya Sharma")

    def test_05_frontend_progress_page_renders_200(self):
        url = f"{FRONTEND_BASE}/student/progress"
        req = urllib.request.Request(url, headers={"User-Agent": "VidyaFlow-Test"})
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.getcode(), 200)
            html = resp.read().decode("utf-8")
            self.assertIn("Learning Progress &amp; Mastery", html)
            self.assertIn("AGGREGATE MASTERY", html)

    def test_06_frontend_achievements_page_renders_200(self):
        url = f"{FRONTEND_BASE}/student/achievements"
        req = urllib.request.Request(url, headers={"User-Agent": "VidyaFlow-Test"})
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.getcode(), 200)
            html = resp.read().decode("utf-8")
            self.assertIn("Achievements &amp; Badges", html)
            self.assertIn("TOTAL XP POINTS", html)

    def test_07_regression_student_routes_remain_functional(self):
        for route in ["/student/dashboard", "/student/videos", "/student/learning"]:
            url = f"{FRONTEND_BASE}{route}"
            req = urllib.request.Request(url, headers={"User-Agent": "VidyaFlow-Test"})
            with urllib.request.urlopen(req) as resp:
                self.assertEqual(resp.getcode(), 200, f"Route {route} returned status {resp.getcode()}")


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestProgressAndAchievements)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
