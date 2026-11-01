"""
LLM Assistant for VidyaFlow.
Handles progressive Socratic hints, multilingual explanations (EN, TE, HI),
and conversational tutoring.
IMPORTANT: LLM is strictly assistive and NEVER calculates or alters raw mastery scores!
"""

import os
import json
from typing import Dict, Any, Optional

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


def get_progressive_hint(
    question_text: str,
    hint_level: int,
    concept_title: str,
    language: str = "en",
    hint_level_1_fallback: Optional[str] = None,
    hint_level_2_fallback: Optional[str] = None,
    hint_level_3_fallback: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Returns Socratic, progressive guidance.
    Level 1: Conceptual Nudge
    Level 2: Step Breakdown
    Level 3: Key Formula / Rule
    """
    lang = language.lower()
    
    if hint_level == 1:
        if lang == "te":
            content = (
                f"సూచన స్థాయి 1 (ఆలోచనా ప్రేరణ): ఈ సమస్య '{concept_title}' భావనపై ఆధారపడి ఉంది. "
                "ముందుగా చలరాశి (variable) మరియు స్థిరరాశులు (constants) ఏవో గుర్తించండి. "
                "సమీకరణంలో ఇరువైపులా ఒకే రకమైన మార్పు చేస్తే సమానత్వం మారదు!"
            )
        elif lang == "hi":
            content = (
                f"संकेत स्तर 1 (अवधारणा मार्गदर्शन): यह प्रश्न '{concept_title}' पर आधारित है। "
                "पहले चर (variable) और अचर (constants) को पहचानें। "
                "समीकरण के दोनों पक्षों में समान संक्रिया करने पर समानता बनी रहती है!"
            )
        else:
            content = hint_level_1_fallback or (
                f"Hint Level 1 (Conceptual Nudge): Think about the core principle of '{concept_title}'. "
                "Identify what is unknown (variable) versus what is fixed (constants). "
                "Whatever balance operation you do to one side, you must do to the other!"
            )

        return {
            "level": 1,
            "title": "Level 1: Conceptual Nudge" if lang == "en" else ("స్థాయి 1: ఆలోచనా ప్రేరణ" if lang == "te" else "स्तर 1: वैचारिक संकेत"),
            "content": content,
            "can_request_next": True,
        }

    elif hint_level == 2:
        if lang == "te":
            content = (
                f"సూచన స్థాయి 2 (దశల వివరణ): '{concept_title}' సాధించడానికి: "
                "1. చలరాశులను ఒక వైపునకు, సంఖ్యలను మరో వైపునకు తీసుకురండి (ట్రాన్స్‌పోజిషన్). "
                "2. సంకలన చిహ్నం (+) అటు వెళ్తే వ్యవకలనం (-) అవుతుంది, గుణకారం (×) భాగహారం (÷) అవుతుంది."
            )
        elif lang == "hi":
            content = (
                f"संकेत स्तर 2 (चरण-दर-चरण): '{concept_title}' हल करने के लिए: "
                "1. चर पदों को एक पक्ष में और अचर पदों को दूसरे पक्ष में ले जाएँ (पक्षान्तरण)। "
                "2. चिन्हों का ध्यान रखें: धनात्मक (+) पक्ष बदलने पर ऋणात्मक (-) बन जाता है।"
            )
        else:
            content = hint_level_2_fallback or (
                f"Hint Level 2 (Step Breakdown): To isolate the variable in '{concept_title}': "
                "1. Group all variable terms on the Left Hand Side (LHS) and all constant numbers on the Right Hand Side (RHS). "
                "2. Remember: Transposition flips signs (+ becomes -, and multiplication becomes division)."
            )

        return {
            "level": 2,
            "title": "Level 2: Step Breakdown" if lang == "en" else ("స్థాయి 2: దశల వివరణ" if lang == "te" else "स्तर 2: चरण-दर-चरण"),
            "content": content,
            "can_request_next": True,
        }

    else:
        # Level 3: Formula / Deep Rule
        if lang == "te":
            content = (
                f"సూచన స్థాయి 3 (కీలక సూత్రం & నియమం): ax + b = c రూపంలో ఉంటే: "
                "ముందుగా 'b' ని అటు పంపండి: ax = c - b. "
                "ఆపై 'a' తో భాగించండి: x = (c - b) / a. ఇప్పుడు మీ ఎంపికలను సరిచూసుకోండి!"
            )
        elif lang == "hi":
            content = (
                f"संकेत स्तर 3 (सूत्र और नियम): यदि समीकरण ax + b = c के रूप में है: "
                "पहले 'b' को घटाएं: ax = c - b. "
                "फिर दोनों पक्षों को 'a' से विभाजित करें: x = (c - b) / a. अब विकल्पों में से सही उत्तर चुनें!"
            )
        else:
            content = hint_level_3_fallback or (
                f"Hint Level 3 (Key Rule & Formula): For an equation ax + b = c: "
                "First isolate the term with the variable: ax = c - b. "
                "Then divide both sides by coefficient 'a': x = (c - b) / a. "
                "Apply this exact pattern to find the correct value!"
            )

        return {
            "level": 3,
            "title": "Level 3: Key Formula & Rule" if lang == "en" else ("స్థాయి 3: కీలక సూత్రం" if lang == "te" else "स्तर 3: मुख्य नियम"),
            "content": content,
            "can_request_next": False,
        }


def generate_chat_response(
    user_query: str,
    concept_context: Optional[str] = None,
    language: str = "en",
    conversation_history: list = None,
) -> Dict[str, Any]:
    """
    Socratic AI Coach Chatbot responses in English, Telugu, and Hindi.
    Encourages problem-solving without prematurely leaking test answers.
    """
    lang = language.lower()
    q = user_query.strip()
    
    # Check for direct answer seeking
    answer_seeking_keywords = ["answer", "what is the answer", "tell me answer", "correct option", "solve for me", "సమాధానం", "జవాబు", "उत्तर बताओ"]
    is_seeking_answer = any(kw in q.lower() for kw in answer_seeking_keywords)

    if is_seeking_answer:
        if lang == "te":
            reply = (
                "నేను మీకు నేరుగా సమాధానం చెప్పను! కానీ మీరు స్వయంగా ఎలా సాధించవచ్చో నేర్పిస్తాను. 💡\n\n"
                "ముందుగా చెప్పండి: ఈ లెక్కలో మీరు ఏ పదాన్ని తొలుత ఇరువైపులా తీసివేయాలి లేదా కూడాలి అనుకుంటున్నారు? "
                "మీరు ప్రయత్నించిన మొదటి దశను నాకు తెలపండి!"
            )
        elif lang == "hi":
            reply = (
                "मैं सीधे उत्तर नहीं दे सकता! लेकिन मैं आपको सही विधि सिखा सकता हूँ ताकि आप स्वयं हल कर सकें। 💡\n\n"
                "बताइए: इस समीकरण में आप सबसे पहले किस पद का पक्षान्तरण करेंगे? "
                "अपना पहला प्रयास साझा करें!"
            )
        else:
            reply = (
                "I am your AI Coach, and I don't give away the direct answer before you try! 💡\n\n"
                "Instead, let's solve it together: What is your first step to isolate the variable? "
                "Tell me what term you'd move first, and I will verify your logic!"
            )
        return {"reply": reply, "language": lang, "type": "socratic_prompt"}

    # Topic-specific contextual advice
    if "linear equation" in q.lower() or "సమీకరణం" in q or "समीकरण" in q:
        if lang == "te":
            reply = (
                "ఏకఘాత సమీకరణాలు (Linear Equations) అనేవి ఒక త్రాసు లాంటివి! ⚖️\n"
                "• ఒక వైపు మీరు ఏమి చేసినా, రెండవ వైపు కూడా అదే చేయాలి.\n"
                "• చలరాశులు (x, y) ఒకవైపు, సంఖ్యలను మరొకవైపు సమకూర్చడం మొదటి సూత్రం.\n"
                "మీరు ప్రస్తుతం ఏ సమస్య సాధిస్తున్నారో టైప్ చేయండి, కలిసి స్టెప్-బై-స్టెప్ చూద్దాం!"
            )
        elif lang == "hi":
            reply = (
                "रैखिक समीकरण (Linear Equations) एक तराजू की तरह होते हैं! ⚖️\n"
                "• जो संक्रिया आप बाईं ओर करते हैं, वही दाईं ओर भी करनी होगी।\n"
                "• सबसे पहले सभी 'x' वाले पदों को एक तरफ और संख्याओं को दूसरी तरफ लाएँ।\n"
                "आप किस सवाल में कठिनाई महसूस कर रहे हैं? मुझे बताइए, हम साथ में समझेंगे!"
            )
        else:
            reply = (
                "A linear equation is like a balanced weighing scale! ⚖️\n\n"
                "• Golden Rule: Whatever operation you apply to the Left Hand Side (LHS), you must apply identically to the Right Hand Side (RHS).\n"
                "• Goal: Get the unknown letter alone on one side (e.g. `x = ...`).\n\n"
                "Share the specific equation you are looking at, and we will break it down step by step!"
            )
        return {"reply": reply, "language": lang, "type": "explanation"}

    # Generic Socratic response
    if lang == "te":
        reply = (
            f"మీ ప్రశ్న: '{q}' చాలా మంచిది! 🌟\n"
            "ఈ అంశాన్ని అర్థం చేసుకోవడానికి, ముందుగా ప్రాథమిక నియమాలను గుర్తుతెచ్చుకుందాం. "
            "మీరు ఇప్పటికే ఏ భాగాన్ని అర్థం చేసుకున్నారో లేదా ఎక్కడ సందేహం వచ్చిందో వివరిస్తారా?"
        )
    elif lang == "hi":
        reply = (
            f"आपका सवाल: '{q}' बहुत महत्वपूर्ण है! 🌟\n"
            "इसे समझने के लिए आइए मूल अवधारणा पर ध्यान दें। "
            "क्या आप बता सकते हैं कि इस प्रश्न में आपको कौन सा चरण सबसे कठिन लग रहा है?"
        )
    else:
        reply = (
            f"Great question about '{q}'! 🌟\n\n"
            "To build solid intuition: Break the problem into 3 parts:\n"
            "1. Given information & what is unknown.\n"
            "2. The mathematical relationship connecting them.\n"
            "3. The inverse operations needed to solve it.\n\n"
            "Which of these 3 parts would you like me to guide you on first?"
        )

    return {"reply": reply, "language": lang, "type": "guidance"}
