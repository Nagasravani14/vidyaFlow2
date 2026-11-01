"""
VidyaFlow Seed Dataset: Class 8 Mathematics - Linear Algebra / Linear Equations
10 Structured Demonstration Mock Video Learning Resources.
All resources are explicitly marked is_mock = True with demonstration URLs.
"""

import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models import LearningVideo, Lesson

MOCK_VIDEOS_DATA: List[Dict[str, Any]] = [
    {
        "id": 1,
        "order_index": 1,
        "title": "Introduction to Algebra — Understanding the Basics",
        "title_te": "బీజగణితం పరిచయం — ప్రాథమిక అంశాలు",
        "title_hi": "बीजगणित का परिचय — बुनियादी बातें",
        "description": "Learn the foundational language of algebra. Discover how letters and symbols represent unknown numbers, why algebra is vital in everyday mathematics, and how to read basic algebraic statements.",
        "description_te": "బీజగణితం యొక్క పునాది అంశాలు. తెలియని సంఖ్యలను సూచించడానికి అక్షరాలు ఎలా ఉపయోగపడతాయో తెలుసుకోండి.",
        "description_hi": "बीजगणित की बुनियादी भाषा सीखें। जानें कि कैसे अक्षर और प्रतीक अज्ञात संख्याओं का प्रतिनिधित्व करते हैं।",
        "board": "Telangana SCERT",
        "grade_level": 8,
        "subject": "Mathematics",
        "chapter": "Introduction to Algebra / Linear Equations",
        "topic": "Introduction to Algebra",
        "video_url": "https://www.youtube.com/watch?v=MOCK_LINEAR_001",
        "thumbnail_url": "/thumbnails/math_mock_01_intro_algebra.svg",
        "duration": "11:20",
        "language": "English",
        "difficulty": "Beginner",
        "tags": ["algebra", "introduction", "basics", "class8", "scert", "patterns"],
        "resource_type": "youtube",
        "is_mock": True,
        "related_concepts": ["Algebraic Symbols", "History of Algebra", "Real-world Unknowns"],
        "key_takeaways": [
            "Algebra translates word problems and patterns into concise mathematical symbols.",
            "Letters like x, y represent variable quantities that can vary in different problems.",
            "A formula is an algebraic rule connecting two or more quantities."
        ],
    },
    {
        "id": 2,
        "order_index": 2,
        "title": "Variables and Constants Explained",
        "title_te": "చరరాశులు మరియు స్థిరరాశులు వివరణ",
        "title_hi": "चर और अचर की विस्तृत व्याख्या",
        "description": "Clear distinction between variables that change values and constants with fixed numerical values. Includes engaging real-world examples like taxi fares and perimeter formulas.",
        "description_te": "మారే విలువలు (చరరాశులు) మరియు స్థిర విలువలు (స్థిరరాశులు) మధ్య స్పష్టమైన తేడాలు మరియు ఉదాహరణలు.",
        "description_hi": "चर जो मान बदलते हैं और अचर जिनके निश्चित मान होते हैं, के बीच स्पष्ट अंतर और वास्तविक उदाहरण।",
        "board": "Telangana SCERT",
        "grade_level": 8,
        "subject": "Mathematics",
        "chapter": "Introduction to Algebra / Linear Equations",
        "topic": "Variables and Constants",
        "video_url": "https://www.youtube.com/watch?v=MOCK_LINEAR_002",
        "thumbnail_url": "/thumbnails/math_mock_02_variables.svg",
        "duration": "13:45",
        "language": "English",
        "difficulty": "Beginner",
        "tags": ["variables", "constants", "unknowns", "math8", "algebra-basics"],
        "resource_type": "youtube",
        "is_mock": True,
        "related_concepts": ["Variables", "Constants", "Fixed Values"],
        "key_takeaways": [
            "Constant: a symbol with fixed numerical value (e.g. 5, -3, 0.5, π).",
            "Variable: a symbol that can take various numerical values (x, y, z, a, b).",
            "In formula Perimeter = 4s, 4 is a constant and s is a variable."
        ],
    },
    {
        "id": 3,
        "order_index": 3,
        "title": "Algebraic Expressions Made Easy",
        "title_te": "బీజగణిత సమాసాలు సులభంగా అర్థం చేసుకోండి",
        "title_hi": "बीजगणितीय व्यंजक समझना आसान",
        "description": "How variables and constants combine with addition, subtraction, multiplication, and division to form algebraic expressions such as 3x + 5 and 4y - 7.",
        "description_te": "చరరాశులు మరియు స్థిరరాశులు ప్రాథమిక పరిక్రియలతో కలిసి సమాసాలను ఏర్పరచడం.",
        "description_hi": "चर और अचर जोड़, घटाव, गुणा और भाग से मिलकर बीजीय व्यंजक कैसे बनाते हैं।",
        "board": "Telangana SCERT",
        "grade_level": 8,
        "subject": "Mathematics",
        "chapter": "Introduction to Algebra / Linear Equations",
        "topic": "Algebraic Expressions",
        "video_url": "https://www.youtube.com/watch?v=MOCK_LINEAR_003",
        "thumbnail_url": "/thumbnails/math_mock_03_expressions.svg",
        "duration": "14:10",
        "language": "English",
        "difficulty": "Beginner",
        "tags": ["algebraic-expressions", "operations", "monomials", "polynomials"],
        "resource_type": "youtube",
        "is_mock": True,
        "related_concepts": ["Forming Expressions", "Operations with Variables", "Value of Expressions"],
        "key_takeaways": [
            "An expression is formed by combining variables and constants using arithmetic operations (+, -, *, /).",
            "An expression does NOT have an equality sign (=).",
            "Evaluating an expression means substituting specific numbers for each variable."
        ],
    },
    {
        "id": 4,
        "order_index": 4,
        "title": "Understanding Terms and Coefficients",
        "title_te": "పదాలు మరియు గుణకాలు అర్థం చేసుకోవడం",
        "title_hi": "पद और गुणांक को समझना",
        "description": "Deep dive into parts of an expression separated by + and - signs. Learn how to identify numerical coefficients, algebraic factors, and constant terms.",
        "description_te": "సమాసంలోని పదాలు, సంఖ్యా గుణకాలు మరియు బీజీయ కారకాలను గుర్తించడం.",
        "description_hi": "व्यंजक के विभिन्न पद, संख्यात्मक गुणांक और बीजीय गुणनखंडों की पहचान करना।",
        "board": "Telangana SCERT",
        "grade_level": 8,
        "subject": "Mathematics",
        "chapter": "Introduction to Algebra / Linear Equations",
        "topic": "Terms, Coefficients and Factors",
        "video_url": "https://www.youtube.com/watch?v=MOCK_LINEAR_004",
        "thumbnail_url": "/thumbnails/math_mock_04_terms_coeffs.svg",
        "duration": "10:30",
        "language": "English",
        "difficulty": "Intermediate",
        "tags": ["terms", "coefficients", "numerical-factors", "algebraic-factors"],
        "resource_type": "youtube",
        "is_mock": True,
        "related_concepts": ["Terms", "Numerical Coefficients", "Algebraic Factors"],
        "key_takeaways": [
            "In 7xy, 7 is the numerical coefficient and x, y are algebraic factors.",
            "Terms are individual parts separated by + or - signs (e.g., 4x^2 - 3x + 8 has 3 terms).",
            "A term without any variable is called a constant term."
        ],
    },
    {
        "id": 5,
        "order_index": 5,
        "title": "Like and Unlike Terms",
        "title_te": "సరూప మరియు విరూప పదాలు",
        "title_hi": "समान और असमान पद",
        "description": "Master how to group terms having the same algebraic factors and same powers. Essential foundation for adding and subtracting polynomials.",
        "description_te": "ఒకే రకమైన చరరాశులు మరియు సమాన ఘాతాలు కలిగిన సరూప పదాల గుర్తింపు.",
        "description_hi": "समान बीजीय गुणनखंड और समान घात वाले पदों को पहचानना और समूहीकृत करना।",
        "board": "Telangana SCERT",
        "grade_level": 8,
        "subject": "Mathematics",
        "chapter": "Introduction to Algebra / Linear Equations",
        "topic": "Like and Unlike Terms",
        "video_url": "https://www.youtube.com/watch?v=MOCK_LINEAR_005",
        "thumbnail_url": "/thumbnails/math_mock_05_like_unlike.svg",
        "duration": "09:50",
        "language": "English",
        "difficulty": "Intermediate",
        "tags": ["like-terms", "unlike-terms", "powers", "simplification"],
        "resource_type": "youtube",
        "is_mock": True,
        "related_concepts": ["Like Terms", "Unlike Terms", "Powers of Variables"],
        "key_takeaways": [
            "Like terms have the exact same variables raised to the exact same powers (e.g., 3x and 8x).",
            "Unlike terms have different variables or different powers (e.g., 2x and 2y, or 4x and 4x^2).",
            "Only like terms can be combined by addition or subtraction."
        ],
    },
    {
        "id": 6,
        "order_index": 6,
        "title": "Addition of Algebraic Expressions",
        "title_te": "బీజగణిత సమాసాల కూడిక",
        "title_hi": "बीजीय व्यंजकों का जोड़",
        "description": "Learn both the Horizontal method and Column method for adding algebraic expressions. Step-by-step worked examples from Class 8 Telangana SCERT.",
        "description_te": "సమాంతర పద్ధతి మరియు నిలువు వరుస పద్ధతిలో బీజగణిత సమాసాలను కూడటం.",
        "description_hi": "क्षैतिज और स्तम्भ विधि द्वारा बीजीय व्यंजकों को जोड़ने के चरणबद्ध उदाहरण।",
        "board": "Telangana SCERT",
        "grade_level": 8,
        "subject": "Mathematics",
        "chapter": "Introduction to Algebra / Linear Equations",
        "topic": "Addition of Algebraic Expressions",
        "video_url": "https://www.youtube.com/watch?v=MOCK_LINEAR_006",
        "thumbnail_url": "/thumbnails/math_mock_06_addition.svg",
        "duration": "15:15",
        "language": "English",
        "difficulty": "Intermediate",
        "tags": ["addition", "horizontal-method", "column-method", "expressions"],
        "resource_type": "youtube",
        "is_mock": True,
        "related_concepts": ["Combining Like Terms", "Column Addition", "Sign Rules in Addition"],
        "key_takeaways": [
            "In Column Method, arrange expressions one below another with like terms aligned.",
            "Add coefficients of like terms while keeping algebraic variables unchanged.",
            "Always simplify the final expression in descending order of exponents."
        ],
    },
    {
        "id": 7,
        "order_index": 7,
        "title": "Subtraction of Algebraic Expressions",
        "title_te": "బీజగణిత సమాసాల తీసివేత",
        "title_hi": "बीजीय व्यंजकों का घटाव",
        "description": "Master subtraction of polynomials with careful attention to sign reversal. Learn why subtracting an expression is equivalent to adding its additive inverse.",
        "description_te": "గుర్తుల మార్పు మరియు సంకలన విలోమం ద్వారా బీజగణిత సమాసాల తీసివేత ప్రక్రియ.",
        "description_hi": "चिन्ह परिवर्तन और योज्य प्रतिलोम के नियमों के साथ बीजीय व्यंजकों का घटाव।",
        "board": "Telangana SCERT",
        "grade_level": 8,
        "subject": "Mathematics",
        "chapter": "Introduction to Algebra / Linear Equations",
        "topic": "Subtraction of Algebraic Expressions",
        "video_url": "https://www.youtube.com/watch?v=MOCK_LINEAR_007",
        "thumbnail_url": "/thumbnails/math_mock_07_subtraction.svg",
        "duration": "16:05",
        "language": "English",
        "difficulty": "Intermediate",
        "tags": ["subtraction", "sign-change", "column-method", "additive-inverse"],
        "resource_type": "youtube",
        "is_mock": True,
        "related_concepts": ["Additive Inverse", "Sign Changes in Subtraction", "Column Subtraction"],
        "key_takeaways": [
            "Subtracting an expression means adding its additive inverse.",
            "In Column Method, change the sign of each term in the lower expression (+ to -, - to +).",
            "Be extra careful with negative signs inside parentheses: -(3x - 4) = -3x + 4."
        ],
    },
    {
        "id": 8,
        "order_index": 8,
        "title": "Introduction to Linear Equations",
        "title_te": "సరళ సమీకరణాల పరిచయం",
        "title_hi": "रैखिक समीकरणों का परिचय",
        "description": "Understand the equality sign (=) that turns an algebraic expression into an equation. Explore the concept of Left Hand Side (LHS) and Right Hand Side (RHS) balance.",
        "description_te": "సమానత్వ గుర్తు (=), ఎడమ వైపు (LHS) మరియు కుడి వైపు (RHS) త్రాసు సమతుల్యత భావన.",
        "description_hi": "समता चिन्ह (=), बायां पक्ष (LHS) और दायां पक्ष (RHS) तराजू संतुलन की अवधारणा।",
        "board": "Telangana SCERT",
        "grade_level": 8,
        "subject": "Mathematics",
        "chapter": "Introduction to Algebra / Linear Equations",
        "topic": "Introduction to Linear Equations",
        "video_url": "https://www.youtube.com/watch?v=MOCK_LINEAR_008",
        "thumbnail_url": "/thumbnails/math_mock_08_intro_linear.svg",
        "duration": "12:35",
        "language": "English",
        "difficulty": "Beginner",
        "tags": ["linear-equations", "lhs-rhs", "equality", "degree-one", "balance-scale"],
        "resource_type": "youtube",
        "is_mock": True,
        "related_concepts": ["Equation vs Expression", "Degree of Equation", "LHS and RHS Balance"],
        "key_takeaways": [
            "An equation has an equality sign (=) asserting balance between two expressions.",
            "Linear Equation in One Variable: maximum power of variable is 1 (e.g. 2x + 7 = 15).",
            "The value of the variable which satisfies the equation is called its root or solution."
        ],
    },
    {
        "id": 9,
        "order_index": 9,
        "title": "Solving Linear Equations Step by Step",
        "title_te": "సరళ సమీకరణాలను దశలవారీగా సాధించడం",
        "title_hi": "रैखिक समीकरणों को चरण दर चरण हल करना",
        "description": "Techniques for isolating variables: transposition method and performing identical operations on both sides. Solve equations with variables on one and both sides.",
        "description_te": "చరరాశిని వేరు చేసే పద్ధతులు: స్థానాంతర పద్ధతి మరియు రెండు వైపులా సమాన పరిక్రియలు.",
        "description_hi": "पक्षांतरण विधि और दोनों पक्षों पर समान संक्रियाओं द्वारा चर का मान ज्ञात करना।",
        "board": "Telangana SCERT",
        "grade_level": 8,
        "subject": "Mathematics",
        "chapter": "Introduction to Algebra / Linear Equations",
        "topic": "Solving Simple Linear Equations",
        "video_url": "https://www.youtube.com/watch?v=MOCK_LINEAR_009",
        "thumbnail_url": "/thumbnails/math_mock_09_solving_linear.svg",
        "duration": "18:20",
        "language": "English",
        "difficulty": "Advanced",
        "tags": ["solving-equations", "transposition", "balance-method", "variables-both-sides"],
        "resource_type": "youtube",
        "is_mock": True,
        "related_concepts": ["Transposition Method", "Balancing Equations", "Verification of Root"],
        "key_takeaways": [
            "Transposing a term to the opposite side reverses its operation (+ <-> -, * <-> /).",
            "Collect all variable terms on LHS and all constant terms on RHS.",
            "Always verify your answer by substituting the solution back into the original equation."
        ],
    },
    {
        "id": 10,
        "order_index": 10,
        "title": "Real-Life Word Problems Using Linear Equations",
        "title_te": "సరళ సమీకరణాలతో నిజ జీవిత సమస్యలు",
        "title_hi": "रैखिक समीकरणों के व्यावहारिक अनुप्रयोग",
        "description": "Translating practical story problems into mathematical equations. Step-by-step problem solving for age problems, consecutive integers, geometry perimeters, and money problems.",
        "description_te": "నిజ జీవిత సమస్యలను గణిత సమీకరణాలుగా మార్చడం: వయస్సు, వరుస సంఖ్యలు మరియు చుట్టుకొలత లెక్కలు.",
        "description_hi": "व्यावहारिक समस्याओं को बीजीय समीकरणों में बदलना: आयु, क्रमागत संख्याएँ और ज्यामितीय प्रश्न।",
        "board": "Telangana SCERT",
        "grade_level": 8,
        "subject": "Mathematics",
        "chapter": "Introduction to Algebra / Linear Equations",
        "topic": "Word Problems Using Linear Equations",
        "video_url": "https://www.youtube.com/watch?v=MOCK_LINEAR_010",
        "thumbnail_url": "/thumbnails/math_mock_10_word_problems.svg",
        "duration": "21:40",
        "language": "English",
        "difficulty": "Advanced",
        "tags": ["word-problems", "real-life", "age-problems", "perimeter", "numbers"],
        "resource_type": "youtube",
        "is_mock": True,
        "related_concepts": ["Mathematical Modelling", "Defining Unknown x", "Translating Word Clues"],
        "key_takeaways": [
            "Step 1: Identify what is asked and assign variable x.",
            "Step 2: Express all other quantities in terms of x using problem statements.",
            "Step 3: Set up equation LHS = RHS based on the relationship.",
            "Step 4: Solve for x and write final answers with proper units."
        ],
    },
]


def seed_mock_linear_videos(db: Session):
    """
    Seeds the 10 demonstration mock video resources for Class 8 Mathematics Linear Algebra.
    Idempotent: updates or creates without creating duplicates.
    """
    # Lookup actual chapter 98 (Linear Equations in One Variable)
    ch98 = db.query(Lesson).filter(Lesson.id == 98).first()
    ch_id = ch98.id if ch98 else None

    for item in MOCK_VIDEOS_DATA:
        existing = db.query(LearningVideo).filter(LearningVideo.id == item["id"]).first()
        if not existing:
            # check by url
            existing = db.query(LearningVideo).filter(LearningVideo.video_url == item["video_url"]).first()

        tags_str = json.dumps(item.get("tags", []))
        concepts_str = json.dumps(item.get("related_concepts", []))
        takeaways_str = json.dumps(item.get("key_takeaways", []))

        if existing:
            existing.title = item["title"]
            existing.title_te = item["title_te"]
            existing.title_hi = item["title_hi"]
            existing.description = item["description"]
            existing.description_te = item["description_te"]
            existing.description_hi = item["description_hi"]
            existing.board = item["board"]
            existing.grade_level = item["grade_level"]
            existing.subject = item["subject"]
            existing.chapter = item["chapter"]
            existing.chapter_id = ch_id
            existing.topic = item["topic"]
            existing.video_url = item["video_url"]
            existing.thumbnail_url = item["thumbnail_url"]
            existing.duration = item["duration"]
            existing.language = item["language"]
            existing.difficulty = item["difficulty"]
            existing.tags_json = tags_str
            existing.resource_type = item["resource_type"]
            existing.is_mock = item["is_mock"]
            existing.related_concepts_json = concepts_str
            existing.key_takeaways_json = takeaways_str
            existing.order_index = item["order_index"]
        else:
            new_video = LearningVideo(
                id=item["id"],
                title=item["title"],
                title_te=item["title_te"],
                title_hi=item["title_hi"],
                description=item["description"],
                description_te=item["description_te"],
                description_hi=item["description_hi"],
                board=item["board"],
                grade_level=item["grade_level"],
                subject=item["subject"],
                chapter=item["chapter"],
                chapter_id=ch_id,
                topic=item["topic"],
                video_url=item["video_url"],
                thumbnail_url=item["thumbnail_url"],
                duration=item["duration"],
                language=item["language"],
                difficulty=item["difficulty"],
                tags_json=tags_str,
                resource_type=item["resource_type"],
                is_mock=item["is_mock"],
                related_concepts_json=concepts_str,
                key_takeaways_json=takeaways_str,
                order_index=item["order_index"],
            )
            db.add(new_video)

    db.commit()
    print(f"[VidyaFlow Video Seeder] Primed {len(MOCK_VIDEOS_DATA)} mock YouTube learning video resources.")
