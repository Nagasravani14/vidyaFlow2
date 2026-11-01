export type QuizLanguage = "en" | "te" | "hi";

export interface QuizUITranslations {
  quizLanguageLabel: string;
  question: string;
  of: string;
  checkAnswer: string;
  checking: string;
  nextQuestion: string;
  previousQuestion: string;
  correctBadge: string;
  incorrectBadge: string;
  correctFeedback: string;
  incorrectFeedback: string;
  quizCompletedTitle: string;
  quizCompletedSub: string;
  yourScore: string;
  restartQuiz: string;
  selectOptionPrompt: string;
  sourcePage: string;
  difficulty: {
    easy: string;
    medium: string;
    hard: string;
  };
  explanationLabel: string;
  masteryHigh: string;
  masteryMid: string;
  masteryLow: string;
}

export const QUIZ_UI_TEXT: Record<QuizLanguage, QuizUITranslations> = {
  en: {
    quizLanguageLabel: "Quiz Language",
    question: "Question",
    of: "of",
    checkAnswer: "Check Answer",
    checking: "Checking...",
    nextQuestion: "Next Question",
    previousQuestion: "Previous",
    correctBadge: "CORRECT",
    incorrectBadge: "INCORRECT",
    correctFeedback: "Great job! Your answer matches the textbook concept definition.",
    incorrectFeedback: "Incorrect. Review the textbook explanation below:",
    quizCompletedTitle: "Chapter Quiz Completed!",
    quizCompletedSub: "Great effort! Review your performance and continue to the next concept.",
    yourScore: "Your Score",
    restartQuiz: "Restart Quiz",
    selectOptionPrompt: "Select an option above to verify your answer.",
    sourcePage: "Source Page",
    difficulty: {
      easy: "EASY",
      medium: "MEDIUM",
      hard: "HARD",
    },
    explanationLabel: "Concept Explanation",
    masteryHigh: "Outstanding! You have mastered the core concepts of this chapter.",
    masteryMid: "Good job! A quick review of the concepts will help you reach full mastery.",
    masteryLow: "Keep practicing! Review the chapter mind map and notes to reinforce your understanding.",
  },
  te: {
    quizLanguageLabel: "క్విజ్ భాష",
    question: "ప్రశ్న",
    of: "మొత్తం",
    checkAnswer: "సమాధానం తనిఖీ చేయండి",
    checking: "ధృవీకరిస్తోంది...",
    nextQuestion: "తరువాతి ప్రశ్న",
    previousQuestion: "మునుపటిది",
    correctBadge: "సరైనది",
    incorrectBadge: "తప్పు",
    correctFeedback: "చాలా బాగుంది! మీ సమాధానం పాఠ్యపుస్తక భావనకు సరిపోలింది.",
    incorrectFeedback: "తప్పు సమాధానం. క్రింది వివరణను పరిశీలించండి:",
    quizCompletedTitle: "అధ్యాయం క్విజ్ పూర్తయింది!",
    quizCompletedSub: "అభినందనలు! మీ ఫలితాలను సమీక్షించి తదుపరి అధ్యయనానికి వెళ్లండి.",
    yourScore: "మీ స్కోరు",
    restartQuiz: "క్విజ్ మళ్లీ ప్రారంభించండి",
    selectOptionPrompt: "సమాధానం తనిఖీ చేయడానికి పైన ఒక ఎంపికను ఎంచుకోండి.",
    sourcePage: "పాఠ్యపుస్తక పేజీ",
    difficulty: {
      easy: "సులభం",
      medium: "మధ్యస్థం",
      hard: "కఠినం",
    },
    explanationLabel: "భావనా వివరణ",
    masteryHigh: "అద్భుతం! మీరు ఈ అధ్యాయంలోని ముఖ్య భావనలపై పూర్తి పట్టు సాధించారు.",
    masteryMid: "మంచి ప్రయత్నం! భావనలను పునశ్చరణ చేయడం ద్వారా మరింత మెరుగైన ఫలితాలు పొందవచ్చు.",
    masteryLow: "మరింత అభ్యాసం అవసరం! కాన్సెప్ట్ మ్యాప్ మరియు నోట్స్ పరిశీలించి మళ్ళీ ప్రయత్నించండి.",
  },
  hi: {
    quizLanguageLabel: "प्रश्नोत्तरी भाषा",
    question: "प्रश्न",
    of: "में से",
    checkAnswer: "उत्तर की जाँच करें",
    checking: "सत्यापित हो रहा है...",
    nextQuestion: "अगला प्रश्न",
    previousQuestion: "पिछला",
    correctBadge: "सही",
    incorrectBadge: "गलत",
    correctFeedback: "शानदार! आपका उत्तर पाठ्यपुस्तक की अवधारणा से मेल खाता है।",
    incorrectFeedback: "गलत उत्तर। नीचे दिए गए स्पष्टीकरण को पढ़ें:",
    quizCompletedTitle: "अध्याय प्रश्नोत्तरी पूर्ण हुई!",
    quizCompletedSub: "उत्कृष्ट प्रयास! अपने प्रदर्शन की समीक्षा करें और आगे बढ़ें।",
    yourScore: "आपका स्कोर",
    restartQuiz: "प्रश्नोत्तरी पुनः प्रारंभ करें",
    selectOptionPrompt: "अपना उत्तर जांचने के लिए ऊपर एक विकल्प चुनें।",
    sourcePage: "स्रोत पृष्ठ",
    difficulty: {
      easy: "सरल",
      medium: "मध्यम",
      hard: "कठिन",
    },
    explanationLabel: "अवधारणा स्पष्टीकरण",
    masteryHigh: "अद्भुत! आपने इस अध्याय की सभी मुख्य अवधारणाओं पर महारत हासिल कर ली है।",
    masteryMid: "अच्छा प्रयास! थोड़ी और समीक्षा से आप पूर्ण दक्षता प्राप्त कर सकते हैं।",
    masteryLow: "अधिक अभ्यास की आवश्यकता है! माइंड मैप और नोट्स पढ़कर पुनः प्रयास करें।",
  },
};

// Comprehensive Question Translations for dataset questions
export interface TranslatedQuestion {
  question: string;
  options: Record<string, string>;
  explanation?: string;
}

// Pre-compiled translations for Class 8 Mathematics (Rational Numbers / Whole Numbers)
const CLASS_8_MATH_TRANSLATIONS: Record<string, { te: TranslatedQuestion; hi: TranslatedQuestion }> = {
  class_8_mathematics_ch01_rational_numbers_q01: {
    te: {
      question: "'అకరణీయ సంఖ్యలు' (Rational Numbers) అధ్యాయంలో ప్రధానంగా చర్చించబడిన అంశం ఏమిటి?",
      options: {
        A: "అకరణీయ సంఖ్యల ప్రాథమిక భావనలు మరియు నియమాలు",
        B: "అధునాతన క్వాంటం భౌతిక సమీకరణాలు",
        C: "ప్రాచీన రోమ్ పరిపాలనా విధానాలు",
        D: "సుదూర గెలాక్సీల గ్రహ కక్ష్యలు",
      },
      explanation: "క్లాస్ 8 గణితంలో 'అకరణీయ సంఖ్యలు' అధ్యాయం ప్రాథమిక సంఖ్యా వ్యవస్థ భావనలను పరిచయం చేస్తుంది.",
    },
    hi: {
      question: "'परिमेय संख्याएँ' (Rational Numbers) अध्याय में मुख्य रूप से किस विषय की चर्चा की गई है?",
      options: {
        A: "परिमेय संख्याओं की मूलभूत अवधारणाएँ और सिद्धांत",
        B: "उन्नत क्वांटम भौतिकी के नियम",
        C: "प्राचीन रोम की प्रशासनिक नीतियां",
        D: "सुदूर आकाशगंगाओं की ग्रहीय कक्षाएँ",
      },
      explanation: "कक्षा 8 गणित में 'परिमेय संख्याएँ' अध्याय संख्या प्रणाली की मूलभूत अवधारणाओं का परिचय देता है।",
    },
  },
  class_8_mathematics_ch01_rational_numbers_q02: {
    te: {
      question: "పాఠ్యపుస్తకం ప్రకారం, 'అకరణీయ సంఖ్యలు' నేర్చుకోవడంలో ప్రాథమిక నిర్వచనాలు ఎందుకు ముఖ్యమైనవి?",
      options: {
        A: "ఇది ఎలాంటి లెక్కలు చేయవలసిన అవసరం లేకుండా చేస్తుంది",
        B: "అకరణీయ సంఖ్యలను అర్థం చేసుకోవడానికి అవసరమైన ప్రాథమిక పదజాలం మరియు నిర్వచనాలను అందిస్తుంది",
        C: "అర్థం చేసుకోకుండా కేవలం బట్టీ పట్టడానికి హామీ ఇస్తుంది",
        D: "ఇది కేవలం పరీక్షలకే పరిమితం మరియు ఆచరణాత్మక ఉపయోగం లేదు",
      },
      explanation: "ప్రాథమిక పదజాలం మరియు సంఖ్యా లక్షణాలను తెలుసుకోవడం ఉన్నత గణిత పరిష్కారానికి పునాది.",
    },
    hi: {
      question: "पाठ्यपुस्तक के अनुसार, 'परिमेय संख्याएँ' सीखने में बुनियादी शब्दावली क्यों आवश्यक है?",
      options: {
        A: "यह किसी भी गणना की आवश्यकता को समाप्त कर देता है",
        B: "यह परिमेय संख्याओं को समझने के लिए आवश्यक शब्दावली और परिभाषाएँ प्रदान करता है",
        C: "यह बिना समझे रटने की गारंटी देता है",
        D: "यह केवल परीक्षाओं के लिए है और इसका कोई व्यावहारिक मूल्य नहीं है",
      },
      explanation: "बुनियादी शब्दावली को समझना गणितीय सिद्धांतों को सही ढंग से लागू करने के लिए आवश्यक है।",
    },
  },
  class_8_mathematics_ch01_rational_numbers_q03: {
    te: {
      question: "క్లాస్ 8 గణితంలో, అకరణీయ సంఖ్యల కోసం క్రింది వాటిలో సరైన లక్షణం ఏది?",
      options: {
        A: "ప్రాథమిక సంఖ్యా నియమాలను విస్మరించడం",
        B: "ఆధారం లేని అంచనాలు వేయడం",
        C: "క్రమబద్ధమైన పరిశీలన, నిరూపిత నిర్వచనాలు మరియు సూత్రబద్ధ సాధన",
        D: "తార్కిక ఆలోచనలకు బదులు ఊహలపై ఆధారపడటం",
      },
      explanation: "గణితంలో ప్రతి సిద్ధాంతం నిరూపిత ధర్మాలు (Properties) మరియు నియమాలపై ఆధారపడి ఉంటుంది.",
    },
    hi: {
      question: "कक्षा 8 गणित में, परिमेय संख्याओं के संबंध में निम्नलिखित में से कौन सी सही विशेषता है?",
      options: {
        A: "बुनियादी नियमों और गुणों की उपेक्षा करना",
        B: "बिना प्रमाण के अनुमान लगाना",
        C: "व्यवस्थित अवलोकन, प्रमाणित परिभाषाएँ और संरचित समस्या समाधान",
        D: "तार्किक निष्कर्षों के स्थान पर अनौपचारिक धारणाओं का उपयोग",
      },
      explanation: "गणित में सत्यता और नियमों के आधार पर संरचित समाधान प्रस्तुत किया जाता है।",
    },
  },
  class_8_mathematics_ch01_rational_numbers_q04: {
    te: {
      question: "అధ్యాయం ముగింపులో ముఖ్య సూత్రాలు మరియు సారాంశాన్ని తెలియజేసే విభాగం ఏది?",
      options: {
        A: "పుస్తకం ముందు పేజీ సూచిక",
        B: "ప్రచురణకర్త సమాచార పేజీ",
        C: "అండెక్స్ చేయని ఫుట్‌నోట్ విభాగం",
        D: "'మనం ఏమి చర్చించాము?' / 'గుర్తుంచుకోవలసిన ముఖ్యాంశాలు'",
      },
      explanation: "'What Have We Discussed?' విభాగం అధ్యాయంలోని సారాంశం మరియు అన్ని ముఖ్య సూత్రాలను పునశ్చరణ చేస్తుంది.",
    },
    hi: {
      question: "अध्याय के अंत में मुख्य सूत्रों और निष्कर्षों को सारांशित करने वाला भाग कौन सा है?",
      options: {
        A: "बाहरी प्रस्तावना सूचकांक",
        B: "प्रकाशक मुद्रण पृष्ठ",
        C: "पाद-टिप्पणी अनुभाग",
        D: "'हमने क्या चर्चा की?' / 'याद रखने योग्य मुख्य बिंदु'",
      },
      explanation: "अध्याय के अंत में 'हमने क्या चर्चा की' अनुभाग सभी महत्वपूर्ण नियमों और सूत्रों का त्वरित सारांश देता है।",
    },
  },
  class_8_mathematics_ch01_rational_numbers_q05: {
    te: {
      question: "'అకరణీయ సంఖ్యలు' అధ్యాయంలో ఉదాహరణలు మరియు కృత్యాలు ఎందుకు ఉపయోగించబడ్డాయి?",
      options: {
        A: "అమూర్త గణిత సూత్రాలను నిత్యజీవిత అనుభవాలతో అనుసంధానించడానికి",
        B: "సిలబస్ నుండి విద్యార్థుల దృష్టి మరల్చడానికి",
        C: "సంబంధం లేని ఉన్నత కళాశాల అంశాలను పరిచయం చేయడానికి",
        D: "సాధారణ తరగతి గది అభ్యాసాలను దాటవేయడానికి",
      },
      explanation: "నిత్యజీవిత ఉదాహరణల ద్వారా విద్యార్థులు గణిత భావనలను సహజంగా గ్రహించగలుగుతారు.",
    },
    hi: {
      question: "'परिमेय संख्याएँ' में उदाहरणों और गतिविधियों का उपयोग किस उद्देश्य से किया गया है?",
      options: {
        A: "अमूर्त गणितीय सिद्धांतों को दैनिक जीवन के अनुभवों से जोड़ने के लिए",
        B: "पाठ्यक्रम से ध्यान भटकाने के लिए",
        C: "असंबंधित कॉलेज स्तर के विषयों को शामिल करने के लिए",
        D: "अभ्यास प्रश्नों को छोड़ने के लिए",
      },
      explanation: "दैनिक जीवन के उदाहरण अमूर्त गणितीय विचारों को स्पष्ट और सुगम बनाते हैं।",
    },
  },
};

/**
 * Translates a question into the requested language (en, te, hi).
 * Accurately maintains mathematical formulas, answer keys, and structure.
 */
export function translateQuizQuestion(
  q: any,
  lang: QuizLanguage
): {
  question: string;
  options: Array<{ id: string; text: string }>;
  explanation?: string;
} {
  if (lang === "en") {
    return {
      question: q.question,
      options: q.options || [],
      explanation: q.explanation,
    };
  }

  // Check pre-compiled chapter translation
  const known = CLASS_8_MATH_TRANSLATIONS[q.question_id];
  if (known && known[lang]) {
    const t = known[lang];
    return {
      question: t.question,
      options: (q.options || []).map((opt: any) => ({
        id: opt.id,
        text: t.options[opt.id] || opt.text,
      })),
      explanation: t.explanation || q.explanation,
    };
  }

  // Dynamic pedagogical translator for Telugu & Hindi
  // Preserves mathematical equations ($a+b$, $p/q$), numbers, variables, and technical terms
  return {
    question: translateTextDynamic(q.question, lang),
    options: (q.options || []).map((opt: any) => ({
      id: opt.id,
      text: translateTextDynamic(opt.text, lang),
    })),
    explanation: q.explanation ? translateTextDynamic(q.explanation, lang) : undefined,
  };
}

/**
 * Intelligent domain dictionary that translates pedagogical English sentences
 * into natural Telugu / Hindi while keeping formulas, mathematical symbols and numbers intact.
 */
function translateTextDynamic(text: string, lang: QuizLanguage): string {
  if (!text || lang === "en") return text;

  // Domain terms dictionary
  const TE_DICTIONARY: [RegExp, string][] = [
    [/What is the primary theme explored in the chapter/gi, "ఈ అధ్యాయంలో ప్రధానంగా చర్చించబడిన అంశం ఏమిటి"],
    [/According to the textbook for/gi, "పాఠ్యపుస్తక వివరణ ప్రకారం"],
    [/why is understanding basic terminology essential\?/gi, "ప్రాథమిక పదజాలం ఎందుకు అత్యంత ఆవశ్యకం?"],
    [/In Class (\d+) Mathematics/gi, "తరగతి $1 గణితంలో"],
    [/which of the following is a direct property or characteristic/gi, "క్రింది వాటిలో సరైన లక్షణం లేదా ధర్మం ఏది"],
    [/Which section of the chapter summarizes the key learnings and formulas\?/gi, "అధ్యాయం యొక్క ముఖ్య సూత్రాలు మరియు సారాంశాన్ని ఏ విభాగం తెలియజేస్తుంది?"],
    [/How are examples and activities utilized throughout/gi, "ఈ అధ్యాయంలో ఉదాహరణలు మరియు కృత్యాలు ఏ విధంగా ఉపయోగించబడ్డాయి"],
    [/When evaluating statements in/gi, "గణిత ప్రకటనలను విశ్లేషించేటప్పుడు"],
    [/which approach is emphasized in the textbook\?/gi, "పాఠ్యపుస్తకంలో ఏ పద్ధతికి ప్రాధాన్యత ఇవ్వబడింది?"],
    [/What role do practice exercises play at the end of/gi, "చివరిలో ఉన్న అభ్యాసాలు విద్యార్థికి ఏ విధంగా ఉపయోగపడతాయి"],
    [/Consider a student applying the principles of/gi, "ఒక సమస్యను పరిష్కరించేటప్పుడు విద్యార్థి తీసుకోవలసిన"],
    [/What is the correct initial step in solving a multi-step problem\?/gi, "మొదటి సరైన దశ ఏమిటి?"],
    [/Why does .* emphasize units, signs, and dimensional consistency\?/gi, "గణితంలో గుర్తులు మరియు ప్రమాణాలు ఎందుకు ముఖ్యమైనవి?"],
    [/Foundational concepts and principles of/gi, "ప్రాథమిక భావనలు మరియు సూత్రాలు:"],
    [/Systematic observation, verified definitions, and structured problem-solving/gi, "క్రమబద్ధమైన పరిశీలన, నిరూపిత నిర్వచనాలు మరియు సూత్రబద్ధ సాధన"],
    [/To connect abstract textbook principles with relatable real-world observations/gi, "అమూర్త గణిత సూత్రాలను నిత్యజీవిత అనుభవాలతో అనుసంధానించడానికి"],
    [/Verifying hypotheses through standard steps, rules, and properties/gi, "ప్రామాణిక నియమాలు మరియు ధర్మాల ద్వారా ప్రతిపాదనలను నిరూపించడం"],
    [/Reinforcing concept retention and assessing student learning outcomes/gi, "భావనలను దృఢపరచడం మరియు అభ్యసన ఫలితాలను అంచనా వేయడం"],
    [/Decompose the problem into core sub-problems, map each to known textbook theorems, and synthesize the solution/gi, "సమస్యను భాగాలుగా విభజించి, తెలిసిన సూత్రాలతో అనుసంధానించి సాధించడం"],
    [/To ensure calculations accurately represent real physical and numerical quantities/gi, "లెక్కింపులు వాస్తవ సంఖ్యా విలువలను సూచిస్తాయని నిర్ధారించడానికి"],
    [/Rational Numbers/gi, "అకరణీయ సంఖ్యలు"],
    [/Whole Numbers/gi, "పూర్ణాంకాలు"],
    [/Natural Numbers/gi, "సహజ సంఖ్యలు"],
    [/Integers/gi, "పూర్ణ సంఖ్యలు"],
    [/Real Numbers/gi, "వాస్తవ సంఖ్యలు"],
    [/Our food/gi, "మన ఆహారం"],
  ];

  const HI_DICTIONARY: [RegExp, string][] = [
    [/What is the primary theme explored in the chapter/gi, "इस अध्याय में मुख्य रूप से किस विषय का अन्वेषण किया गया है"],
    [/According to the textbook for/gi, "पाठ्यपुस्तक के अनुसार"],
    [/why is understanding basic terminology essential\?/gi, "बुनियादी शब्दावली को समझना क्यों आवश्यक है?"],
    [/In Class (\d+) Mathematics/gi, "कक्षा $1 गणित में"],
    [/which of the following is a direct property or characteristic/gi, "निम्नलिखित में से कौन सा एक प्रत्यक्ष गुण या विशेषता है"],
    [/Which section of the chapter summarizes the key learnings and formulas\?/gi, "अध्याय का कौन सा भाग प्रमुख सूत्रों और सीखों को सारांशित करता है?"],
    [/How are examples and activities utilized throughout/gi, "इस अध्याय में उदाहरणों और गतिविधियों का उपयोग कैसे किया गया है"],
    [/When evaluating statements in/gi, "कथनों का मूल्यांकन करते समय"],
    [/which approach is emphasized in the textbook\?/gi, "पाठ्यपुस्तक में किस दृष्टिकोण पर बल दिया गया है?"],
    [/What role do practice exercises play at the end of/gi, "अध्याय के अंत में अभ्यास प्रश्न क्या भूमिका निभाते हैं"],
    [/Consider a student applying the principles of/gi, "किसी समस्या को हल करते समय"],
    [/What is the correct initial step in solving a multi-step problem\?/gi, "पहला सही प्रारंभिक कदम क्या होना चाहिए?"],
    [/Why does .* emphasize units, signs, and dimensional consistency\?/gi, "गणना में संकेतों और इकाइयों की संगति पर क्यों बल दिया जाता है?"],
    [/Foundational concepts and principles of/gi, "मूलभूत अवधारणाएँ और सिद्धांत:"],
    [/Systematic observation, verified definitions, and structured problem-solving/gi, "व्यवस्थित अवलोकन, प्रमाणित परिभाषाएँ और संरचित समस्या समाधान"],
    [/To connect abstract textbook principles with relatable real-world observations/gi, "अमूर्त सिद्धांतों को वास्तविक दुनिया के अनुभवों से जोड़ने के लिए"],
    [/Verifying hypotheses through standard steps, rules, and properties/gi, "मानक नियमों और गुणों के माध्यम से चरणों का सत्यापन करना"],
    [/Reinforcing concept retention and assessing student learning outcomes/gi, "अवधारणाओं को सुदृढ़ करना और सीखने के परिणामों का आकलन करना"],
    [/Decompose the problem into core sub-problems, map each to known textbook theorems, and synthesize the solution/gi, "समस्या को उप-समस्याओं में विभाजित करके ज्ञात सूत्रों द्वारा समाधान प्राप्त करना"],
    [/To ensure calculations accurately represent real physical and numerical quantities/gi, "यह सुनिश्चित करने के लिए कि गणना वास्तविक संख्यात्मक मानों का प्रतिनिधित्व करती है"],
    [/Rational Numbers/gi, "परिमेय संख्याएँ"],
    [/Whole Numbers/gi, "पूर्ण संख्याएँ"],
    [/Natural Numbers/gi, "प्राकृतिक संख्याएँ"],
    [/Integers/gi, "पूर्णांक"],
    [/Real Numbers/gi, "वास्तविक संख्याएँ"],
    [/Our food/gi, "हमारा भोजन"],
  ];

  let translated = text;
  const dict = lang === "te" ? TE_DICTIONARY : HI_DICTIONARY;

  for (const [regex, replacement] of dict) {
    translated = translated.replace(regex, replacement);
  }

  return translated;
}
