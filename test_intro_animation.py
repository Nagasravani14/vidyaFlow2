"""
VidyaFlow Verification Test: Cinematic Intro Animation
Tests all requirements for the imported intro animation and system integrity.
"""

import sys
import unittest
import urllib.request

FRONTEND_BASE = "http://localhost:3002"

class TestIntroAnimation(unittest.TestCase):
    def test_01_landing_page_renders_with_intro_elements(self):
        req = urllib.request.Request(f"{FRONTEND_BASE}/", headers={"User-Agent": "VidyaFlow-Test"})
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.getcode(), 200)
            html = resp.read().decode("utf-8")
            # Verify VidyaFlow brand & intro button are present
            self.assertIn("VidyaFlow", html)
            self.assertIn("Replay intro animation", html)
            self.assertIn("Intro", html)

    def test_02_hero_heroes_image_asset_served(self):
        req = urllib.request.Request(f"{FRONTEND_BASE}/hero-heroes.png", headers={"User-Agent": "VidyaFlow-Test"})
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.getcode(), 200)
            data = resp.read()
            # Verify PNG signature: \x89PNG\r\n\x1a\n
            self.assertTrue(data.startswith(b"\x89PNG\r\n\x1a\n"))
            self.assertEqual(len(data), 2222072)

    def test_03_subroutes_remain_functional(self):
        routes = [
            "/student/dashboard",
            "/student/videos",
            "/student/quiz",
            "/parent/dashboard",
            "/teacher/dashboard",
        ]
        for r in routes:
            req = urllib.request.Request(f"{FRONTEND_BASE}{r}", headers={"User-Agent": "VidyaFlow-Test"})
            with urllib.request.urlopen(req) as resp:
                self.assertEqual(resp.getcode(), 200, f"Route {r} failed with status {resp.getcode()}")

if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestIntroAnimation)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
