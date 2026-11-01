"""
VidyaFlow Verification Test: Mock YouTube Video Resources
Tests all 9 requirements using Python standard library (urllib & json).
"""

import sys
import json
import unittest
import urllib.request
import urllib.parse

API_BASE = "http://localhost:8000"
FRONTEND_BASE = "http://localhost:3002"

EXPECTED_SUBTOPICS = [
    "Introduction to Algebra",
    "Variables and Constants",
    "Algebraic Expressions",
    "Terms, Coefficients and Factors",
    "Like and Unlike Terms",
    "Addition of Algebraic Expressions",
    "Subtraction of Algebraic Expressions",
    "Introduction to Linear Equations",
    "Solving Simple Linear Equations",
    "Word Problems Using Linear Equations",
]

EXPECTED_MOCK_URLS = [
    f"https://www.youtube.com/watch?v=MOCK_LINEAR_{i:03d}" for i in range(1, 11)
]


def http_get(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "VidyaFlow-Test"})
    with urllib.request.urlopen(req) as response:
        status = response.getcode()
        body = response.read().decode("utf-8")
        try:
            data = json.loads(body)
        except Exception:
            data = body
        return status, data


def http_post_json(url: str, payload: dict):
    body_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body_bytes,
        headers={"Content-Type": "application/json", "User-Agent": "VidyaFlow-Test"},
        method="POST",
    )
    with urllib.request.urlopen(req) as response:
        status = response.getcode()
        body = response.read().decode("utf-8")
        return status, json.loads(body)


class TestVideoResources(unittest.TestCase):
    def test_01_all_10_resources_exist_with_correct_metadata(self):
        status, videos = http_get(f"{API_BASE}/api/videos?grade_level=8&subject=Mathematics")
        self.assertEqual(status, 200)
        self.assertEqual(len(videos), 10, f"Expected 10 videos, got {len(videos)}")

        actual_subtopics = [v["topic"] for v in videos]
        actual_urls = [v["video_url"] for v in videos]

        for exp_topic in EXPECTED_SUBTOPICS:
            self.assertIn(exp_topic, actual_subtopics, f"Missing subtopic: {exp_topic}")

        for exp_url in EXPECTED_MOCK_URLS:
            self.assertIn(exp_url, actual_urls, f"Missing mock url: {exp_url}")

        for v in videos:
            self.assertTrue(v["is_mock"], f"Video {v['id']} should have is_mock=True")
            self.assertEqual(v["board"], "Telangana SCERT")
            self.assertEqual(v["grade_level"], 8)
            self.assertEqual(v["subject"], "Mathematics")
            self.assertEqual(v["resource_type"], "youtube")
            self.assertTrue(v["thumbnail_url"].endswith(".svg"), "Thumbnail should point to SVG asset")
            self.assertTrue(len(v["tags"]) > 0, "Video must have tags")
            self.assertIn(v["difficulty"], ["Beginner", "Intermediate", "Advanced"])

    def test_02_subtopics_endpoint(self):
        status, data = http_get(f"{API_BASE}/api/videos/subtopics/list?grade_level=8&subject=Mathematics")
        self.assertEqual(status, 200)
        self.assertEqual(len(data["subtopics"]), 10)

    def test_03_filter_by_subtopic(self):
        topic_enc = urllib.parse.quote("Variables and Constants")
        status, videos = http_get(f"{API_BASE}/api/videos?grade_level=8&subject=Mathematics&subtopic={topic_enc}")
        self.assertEqual(status, 200)
        self.assertEqual(len(videos), 1)
        self.assertEqual(videos[0]["topic"], "Variables and Constants")
        self.assertEqual(videos[0]["video_url"], "https://www.youtube.com/watch?v=MOCK_LINEAR_002")

    def test_04_filter_by_difficulty(self):
        status, videos = http_get(f"{API_BASE}/api/videos?grade_level=8&subject=Mathematics&difficulty=Intermediate")
        self.assertEqual(status, 200)
        self.assertTrue(len(videos) >= 4)
        for v in videos:
            self.assertEqual(v["difficulty"], "Intermediate")

    def test_05_search_videos(self):
        status, videos = http_get(f"{API_BASE}/api/videos?grade_level=8&subject=Mathematics&search=transposition")
        self.assertEqual(status, 200)
        self.assertTrue(len(videos) >= 1)
        self.assertIn("Solving Linear Equations", videos[0]["title"])

    def test_06_multilingual_support(self):
        status, videos_te = http_get(f"{API_BASE}/api/videos?grade_level=8&subject=Mathematics&language=te")
        self.assertEqual(status, 200)
        self.assertIn("బీజగణితం", videos_te[0]["title"])

        status, videos_hi = http_get(f"{API_BASE}/api/videos?grade_level=8&subject=Mathematics&language=hi")
        self.assertEqual(status, 200)
        self.assertIn("बीजगणित", videos_hi[0]["title"])

    def test_07_mark_completed_and_idempotency(self):
        video_id = 2
        payload = {"user_id": 1, "watch_time_seconds": 720}

        # First completion call
        status1, data1 = http_post_json(f"{API_BASE}/api/videos/{video_id}/complete", payload)
        self.assertEqual(status1, 200)
        self.assertTrue(data1["success"])
        self.assertTrue(data1["completed"])

        # Second completion call (must avoid duplicates)
        status2, data2 = http_post_json(f"{API_BASE}/api/videos/{video_id}/complete", payload)
        self.assertEqual(status2, 200)
        self.assertTrue(data2["success"])
        self.assertTrue(data2["completed"])

    def test_08_progress_summary_stats(self):
        status, stats = http_get(f"{API_BASE}/api/videos/progress/summary?user_id=1&grade_level=8&subject=Mathematics")
        self.assertEqual(status, 200)
        self.assertEqual(stats["total_videos"], 10)
        self.assertTrue(stats["completed_videos"] >= 2)
        self.assertTrue(stats["completion_percentage"] >= 20.0)

    def test_09_frontend_page_renders_cleanly(self):
        status, html = http_get(f"{FRONTEND_BASE}/student/videos")
        self.assertEqual(status, 200)
        self.assertIn("Class 8 Mathematics", html)
        self.assertIn("Linear Algebra Learning Videos", html)


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestVideoResources)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
