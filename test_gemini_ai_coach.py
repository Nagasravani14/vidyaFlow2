"""
VidyaFlow Verification Test: Gemini API Key Configuration and AI Coach
Tests all 10 requirements from the specification.
"""

import sys
import json
import unittest
import urllib.request
import urllib.error

API_BASE = "http://localhost:8000"
FRONTEND_BASE = "http://localhost:3002"


def post_json(url: str, payload: dict):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "VidyaFlow-Test"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.getcode(), json.loads(resp.read().decode("utf-8"))


def get_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "VidyaFlow-Test"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.getcode(), json.loads(resp.read().decode("utf-8"))


class TestGeminiAICoach(unittest.TestCase):
    def test_01_backend_health_and_status(self):
        status, data = get_json(f"{API_BASE}/")
        self.assertEqual(status, 200)
        self.assertEqual(data["app"], "VidyaFlow")

        # Test AI Coach status endpoint
        status, coach_status = get_json(f"{API_BASE}/api/chat/status")
        self.assertEqual(status, 200)
        self.assertEqual(coach_status["status"], "online")
        self.assertTrue(coach_status["gemini_configured"])

    def test_02_config_loads_api_key_securely(self):
        from backend.app.config import settings

        self.assertIsNotNone(settings.api_key)
        self.assertTrue(len(settings.api_key) > 10)
        # Verify key is never accidentally empty or placeholder
        self.assertNotEqual(settings.api_key, "your_gemini_api_key_here")

    def test_03_normal_chat_request_in_english(self):
        payload = {
            "user_id": 1,
            "message": "Why do we change signs when moving terms across the equals sign in linear equations?",
            "language": "en",
            "chapter_id": 1,
            "board": "Telangana State Board",
            "grade_level": 8,
            "subject": "Mathematics",
        }
        status, resp = post_json(f"{API_BASE}/api/chat/message", payload)
        self.assertEqual(status, 200)
        self.assertTrue(len(resp["reply"]) > 20)
        self.assertEqual(resp["language"], "en")
        self.assertIsNotNone(resp["session_id"])
        self.assertTrue(len(resp["source_references"]) > 0)

    def test_04_chapter_specific_context_included(self):
        payload = {
            "user_id": 1,
            "message": "What is the core rule for solving equations with variables on both sides?",
            "language": "en",
            "chapter_id": 98,
        }
        status, resp = post_json(f"{API_BASE}/api/chat/message", payload)
        self.assertEqual(status, 200)
        self.assertIn("Linear Equations", resp["chapter_title"])
        self.assertTrue(any("Linear Equations" in s or "Concept" in s for s in resp["source_references"]))

    def test_05_multilingual_telugu_support(self):
        payload = {
            "user_id": 1,
            "message": "ఏకఘాత సమీకరణాలు సాధించడంలో ట్రాన్స్‌పోజిషన్ పద్ధతిని వివరించండి.",
            "language": "te",
            "chapter_id": 1,
        }
        status, resp = post_json(f"{API_BASE}/api/chat/message", payload)
        self.assertEqual(status, 200)
        self.assertEqual(resp["language"], "te")
        self.assertTrue(len(resp["reply"]) > 10)

    def test_06_multilingual_hindi_support(self):
        payload = {
            "user_id": 1,
            "message": "रैखिक समीकरणों में चर का मान कैसे ज्ञात करते हैं?",
            "language": "hi",
            "chapter_id": 1,
        }
        status, resp = post_json(f"{API_BASE}/api/chat/message", payload)
        self.assertEqual(status, 200)
        self.assertEqual(resp["language"], "hi")
        self.assertTrue(len(resp["reply"]) > 10)

    def test_07_chat_history_persisted(self):
        status, history = get_json(f"{API_BASE}/api/chat/history/1")
        self.assertEqual(status, 200)
        self.assertTrue(isinstance(history, list))
        self.assertTrue(len(history) >= 2)
        # Check sender alternation
        senders = [m["sender"] for m in history]
        self.assertIn("user", senders)
        self.assertIn("coach", senders)

    def test_08_graceful_missing_key_handling(self):
        from backend.app.services.gemini_service import GeminiService

        mock_svc = GeminiService()
        mock_svc._client = None
        # Mock is_configured returning False
        mock_svc.is_configured = lambda: False

        res = mock_svc.generate_chat_response("What is an equation?")
        self.assertIn("Gemini API Key Missing", res["reply"])
        self.assertEqual(res["type"], "configuration_error")

    def test_09_regression_check_other_modules(self):
        # Progress endpoint
        status, prog = get_json(f"{API_BASE}/api/student/progress/1")
        self.assertEqual(status, 200)
        # Achievements endpoint
        status, ach = get_json(f"{API_BASE}/api/student/achievements/1")
        self.assertEqual(status, 200)
        # Videos endpoint
        status, vids = get_json(f"{API_BASE}/api/videos?grade_level=8&subject=Mathematics")
        self.assertEqual(status, 200)

    def test_10_frontend_coach_page_renders_cleanly(self):
        req = urllib.request.Request(f"{FRONTEND_BASE}/student/coach", headers={"User-Agent": "VidyaFlow-Test"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            self.assertEqual(resp.getcode(), 200)
            html = resp.read().decode("utf-8")
            self.assertIn("Socratic AI Coach", html)
            self.assertIn("Linear Equations in One Variable", html)


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestGeminiAICoach)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
