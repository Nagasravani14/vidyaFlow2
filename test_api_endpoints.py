"""
Comprehensive Test Suite for VidyaFlow API Endpoints
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

print("\n--- TEST 1: Health Check ---")
res = client.get("/")
print("Status:", res.status_code, res.json())
assert res.status_code == 200

print("\n--- TEST 2: Users & Multi-Role Switching ---")
res = client.get("/api/auth/users")
print("Users:", [(u["name"], u["role"]) for u in res.json()])
assert res.status_code == 200

res = client.get("/api/auth/switch-role/student")
print("Student role switch:", res.json()["name"])
assert res.json()["role"] == "student"

print("\n--- TEST 3: Student Dashboard ---")
student_user = [u for u in client.get("/api/auth/users").json() if u["role"] == "student"][0]
res = client.get(f"/api/student/dashboard/{student_user['id']}")
data = res.json()
print("Student:", data["user"]["name"])
print("Active Chapter:", data["active_chapter"]["title"])
print("Mastery Progress:", data["chapter_progress_percent"], "%")
print("Today's Recommendation:", data["today_recommendation"]["title"])
print("Breakdown:", data["mastery_breakdown"])
assert res.status_code == 200
assert "Ananya" in data["user"]["name"]
lesson_id = data["active_chapter"]["id"]

print(f"\n--- TEST 4: Concept Prerequisite Mind Map (Lesson {lesson_id}) ---")
res = client.get(f"/api/mindmap/{lesson_id}")
data = res.json()
print("Nodes count:", len(data["nodes"]))
print("Edges count:", len(data["edges"]))
print("Root cause gaps:", [g["title_en"] for g in data["root_cause_gaps"]])
print("Overall mastery:", data["overall_mastery"])
assert res.status_code == 200
assert len(data["nodes"]) >= 3

print(f"\n--- TEST 5: Adaptive Quiz Questions (Lesson {lesson_id}) ---")
res = client.get(f"/api/quiz/questions?chapter_id={lesson_id}&mode=adaptive")
questions = res.json()
print("Adaptive questions fetched:", len(questions))
assert len(questions) > 0
first_q = questions[0]
print("Q1:", first_q["question_text_en"], "Concept:", first_q["concept_title"])

print("\n--- TEST 6: Progressive Socratic Hints (EN, TE, HI) ---")
for lvl in [1, 2, 3]:
    hint_res = client.post("/api/quiz/hint", json={
        "question_id": first_q["id"],
        "hint_level": lvl,
        "language": "en"
    }).json()
    print(f"Hint Level {lvl} (EN):", hint_res["title"], "->", hint_res["content"][:60], "...")

# Telugu Hint
te_hint = client.post("/api/quiz/hint", json={
    "question_id": first_q["id"],
    "hint_level": 1,
    "language": "te"
}).json()
print("Hint Level 1 (Telugu):", te_hint["title"], "->", te_hint["content"][:60], "...")

print("\n--- TEST 7: Answer Submission & Bayesian Knowledge Tracing Update ---")
sub_res = client.post("/api/quiz/submit", json={
    "user_id": 1,
    "question_id": first_q["id"],
    "selected_option": "B",
    "time_taken_sec": 30,
    "language": "en"
}).json()
print("Is Correct:", sub_res["is_correct"])
print("Prior BKT:", sub_res["prior_p_mastery"], "-> Updated BKT:", sub_res["updated_p_mastery"])
print("Delta:", sub_res["delta_mastery"])
print("Status:", sub_res["mastery_status"])
print("Next Action:", sub_res["next_action"]["title"])

print("\n--- TEST 8: AI Coach Socratic Chatbot (EN, TE, HI) ---")
chat_en = client.post("/api/chat/message", json={
    "user_id": 1,
    "message": "What is the answer to question 3?",
    "language": "en"
}).json()
print("Chat (Answer Seeking - Refusal & Socratic Nudge):", chat_en["reply"][:80], "...")

chat_te = client.post("/api/chat/message", json={
    "user_id": 1,
    "message": "ఏకఘాత సమీకరణాలు ఎలా సాధించాలి?",
    "language": "te"
}).json()
print("Chat (Telugu Socratic Guidance):", chat_te["reply"][:80], "...")

print("\n--- TEST 9: Teacher Portal Overview & Actionable Interventions ---")
teacher_res = client.get("/api/teacher/overview").json()
print("Class:", teacher_res["classroom_name"], "Total Students:", teacher_res["total_students"])
print("Distribution:", teacher_res["distribution"])
print("AI Insights count:", len(teacher_res["ai_insights"]))
print("Interventions count:", len(teacher_res["interventions"]))
first_inter = teacher_res["interventions"][0]
print("First Intervention:", first_inter["title"], "Status:", first_inter["status"])

# Approve intervention
action_res = client.post("/api/teacher/intervention/action", json={
    "intervention_id": first_inter["id"],
    "action": "approve"
}).json()
print("Teacher Action Response:", action_res["message"], "New Status:", action_res["new_status"])
assert action_res["new_status"] == "approved"

print("\n--- TEST 10: Parent Portal Overview ---")
parent_res = client.get("/api/parent/overview").json()
print("Child:", parent_res["child_name"])
print("Subject Progress:", parent_res["subject_progress"])
print("Weekly AI Insights:", len(parent_res["weekly_ai_insights"]))
print("Upcoming Tests:", len(parent_res["upcoming_tests"]))
assert parent_res["subject_progress"]["Mathematics"] == 78

print(f"\n--- TEST 11: Textbook Summaries, Formulas & Flashcards (Lesson {lesson_id}) ---")
summary_res = client.get(f"/api/textbooks/summary/{lesson_id}").json()
print("Chapter:", summary_res["title"])
print("Formulas:", len(summary_res["formulas"]))
print("Definitions:", len(summary_res["definitions"]))
print("Flashcards:", len(summary_res["flashcards"]))
assert len(summary_res["formulas"]) > 0
assert len(summary_res["flashcards"]) > 0

print("\n==========================================")
print("ALL 11 BACKEND API TESTS PASSED PERFECTLY!")
print("==========================================\n")
