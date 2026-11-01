export interface FormulaItem {
  name: string;
  formula: string;
  description: string;
  example: string;
}

export interface DefinitionItem {
  term: string;
  definition: string;
  example: string;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

export interface WholeNumbersNotesData {
  chapter_id: string;
  board: string;
  class: number;
  subject: string;
  chapter_number: number;
  title: string;
  summary: {
    meaning: string;
    number_line: string;
    properties_overview: string;
    closure: string;
    commutative: string;
    associative: string;
    distributive: string;
    identities: string;
    examples: string;
  };
  formulas: FormulaItem[];
  definitions: DefinitionItem[];
  flashcards: FlashcardItem[];
}

export const WHOLE_NUMBERS_MOCK_DATA: WholeNumbersNotesData = {
  chapter_id: "class_8_mathematics_ch02_whole_numbers",
  board: "Telangana State Board (SCERT)",
  class: 8,
  subject: "Mathematics",
  chapter_number: 2,
  title: "Whole Numbers",
  summary: {
    meaning:
      "Counting numbers 1, 2, 3, 4, ... are called Natural Numbers (N). When we include 0 (zero) to the collection of natural numbers, we get the set of Whole Numbers (W), denoted as W = {0, 1, 2, 3, 4, ...}. The smallest whole number is 0, and there is no largest whole number as the sequence extends infinitely. Every natural number is a whole number, but 0 is a whole number that is not a natural number.",
    number_line:
      "A number line for whole numbers begins with a fixed point 0 and extends indefinitely to the right with equidistant unit markings: 0, 1, 2, 3, 4, ... On this number line, any number lying to the right of another is greater. Moving right represents addition (e.g., start at 2 and jump 3 steps right to reach 5, so 2 + 3 = 5), while moving left represents subtraction (e.g., start at 6 and jump 2 steps left to reach 4, so 6 - 2 = 4).",
    properties_overview:
      "Studying the mathematical properties of whole numbers under basic arithmetic operations (addition, subtraction, multiplication, and division) provides the foundational cornerstone for arithmetic and algebra.",
    closure:
      "Whole numbers are closed under addition and multiplication. If a and b are any two whole numbers, then their sum (a + b) and product (a × b) are always whole numbers (e.g., 5 + 8 = 13 ∈ W and 4 × 7 = 28 ∈ W). However, whole numbers are NOT closed under subtraction (e.g., 3 - 7 = -4 ∉ W) or division (e.g., 5 ÷ 2 = 2.5 ∉ W).",
    commutative:
      "Addition and multiplication are commutative for whole numbers. You can add or multiply two whole numbers in any order without changing the result: a + b = b + a (e.g., 9 + 4 = 4 + 9 = 13) and a × b = b × a (e.g., 6 × 5 = 5 × 6 = 30). Subtraction and division are NOT commutative (e.g., 8 - 3 ≠ 3 - 8 and 12 ÷ 4 ≠ 4 ÷ 12).",
    associative:
      "Addition and multiplication are associative for whole numbers. When adding or multiplying three or more whole numbers, the grouping does not affect the final outcome: (a + b) + c = a + (b + c) and (a × b) × c = a × (b × c). For example, (3 + 4) + 5 = 7 + 5 = 12 and 3 + (4 + 5) = 3 + 9 = 12.",
    distributive:
      "Multiplication distributes over addition for whole numbers: a × (b + c) = (a × b) + (a × c). This property simplifies mental and manual arithmetic calculations. For example, 12 × 75 can be quickly computed as 12 × (70 + 5) = (12 × 70) + (12 × 5) = 840 + 60 = 900.",
    identities:
      "Zero (0) is the Additive Identity for whole numbers because adding 0 to any whole number leaves it unchanged: a + 0 = 0 + a = a. One (1) is the Multiplicative Identity for whole numbers because multiplying any whole number by 1 leaves it unchanged: a × 1 = 1 × a = a. Furthermore, any whole number multiplied by zero produces zero: a × 0 = 0 × a = 0. Division by zero is undefined.",
    examples:
      "Example 1: Using properties to calculate 196 + 57 + 4. By rearrangement: (196 + 4) + 57 = 200 + 57 = 257. Example 2: Using distributive property for 25 × 102: 25 × (100 + 2) = (25 × 100) + (25 × 2) = 2500 + 50 = 2550.",
  },
  formulas: [
    {
      name: "Commutative Property of Addition",
      formula: "a + b = b + a",
      description: "The sum remains identical regardless of the order of the two addends.",
      example: "7 + 12 = 12 + 7 = 19",
    },
    {
      name: "Commutative Property of Multiplication",
      formula: "a × b = b × a",
      description: "The product remains identical regardless of the order of the two factors.",
      example: "6 × 8 = 8 × 6 = 48",
    },
    {
      name: "Associative Property of Addition",
      formula: "(a + b) + c = a + (b + c)",
      description: "Grouping three whole numbers in different parentheses does not change their sum.",
      example: "(5 + 9) + 4 = 14 + 4 = 18 and 5 + (9 + 4) = 5 + 13 = 18",
    },
    {
      name: "Associative Property of Multiplication",
      formula: "(a × b) × c = a × (b × c)",
      description: "Grouping three whole numbers in different parentheses does not change their product.",
      example: "(2 × 5) × 7 = 10 × 7 = 70 and 2 × (5 × 7) = 2 × 35 = 70",
    },
    {
      name: "Distributive Property of Multiplication over Addition",
      formula: "a × (b + c) = (a × b) + (a × c)",
      description: "Multiplying a whole number by a sum equals the sum of the individual products.",
      example: "4 × (10 + 3) = (4 × 10) + (4 × 3) = 40 + 12 = 52",
    },
    {
      name: "Additive Identity Property",
      formula: "a + 0 = 0 + a = a",
      description: "Adding zero to any whole number yields the original whole number.",
      example: "49 + 0 = 49",
    },
    {
      name: "Multiplicative Identity Property",
      formula: "a × 1 = 1 × a = a",
      description: "Multiplying any whole number by one yields the original whole number.",
      example: "125 × 1 = 125",
    },
    {
      name: "Zero Property of Multiplication",
      formula: "a × 0 = 0 × a = 0",
      description: "Any whole number multiplied by zero produces zero.",
      example: "834 × 0 = 0",
    },
  ],
  definitions: [
    {
      term: "Whole Numbers",
      definition:
        "The collection of numbers comprising all natural counting numbers together with zero: W = {0, 1, 2, 3, ...}. It contains no negative numbers, decimals, or fractions.",
      example: "0, 14, 99, 1050 are whole numbers; -5, 3.14, and 1/2 are not.",
    },
    {
      term: "Natural Numbers",
      definition:
        "The set of positive counting numbers used in everyday life, beginning at 1 and extending indefinitely: N = {1, 2, 3, 4, ...}.",
      example: "1, 2, 3 are natural numbers. 0 is NOT a natural number.",
    },
    {
      term: "Number Line",
      definition:
        "A geometric horizontal straight line on which whole numbers are depicted as evenly spaced points extending infinitely to the right of zero.",
      example: "Points: 0, 1, 2, 3, 4, ... where moving right is addition and moving left is subtraction.",
    },
    {
      term: "Closure Property",
      definition:
        "A mathematical property stating that performing an operation on any two elements of a set always produces another member of that same set.",
      example: "8 + 15 = 23 (whole number). Hence whole numbers are closed under addition.",
    },
    {
      term: "Commutative Property",
      definition:
        "A property stating that the order in which two operands are operated upon does not alter the final outcome of the operation.",
      example: "15 + 20 = 20 + 15 = 35; 4 × 9 = 9 × 4 = 36.",
    },
    {
      term: "Associative Property",
      definition:
        "A property stating that when three or more numbers are operated upon, the way they are grouped in brackets does not alter the result.",
      example: "(2 + 3) + 7 = 5 + 7 = 12 and 2 + (3 + 7) = 2 + 10 = 12.",
    },
    {
      term: "Distributive Property",
      definition:
        "A property that links multiplication and addition: multiplying a number by a sum is equivalent to multiplying each term and then adding.",
      example: "8 × (50 + 2) = (8 × 50) + (8 × 2) = 400 + 16 = 416.",
    },
    {
      term: "Additive Identity",
      definition:
        "The element in a number set which, when added to any number in that set, leaves the number unchanged. For whole numbers, 0 is the additive identity.",
      example: "73 + 0 = 73.",
    },
    {
      term: "Multiplicative Identity",
      definition:
        "The element in a number set which, when multiplied by any number in that set, leaves the number unchanged. For whole numbers, 1 is the multiplicative identity.",
      example: "95 × 1 = 95.",
    },
  ],
  flashcards: [
    {
      id: "fc_01",
      front: "What is the smallest whole number?",
      back: "0 (Zero). While natural numbers start at 1, whole numbers include zero.",
      hint: "Think about the origin point of the number line.",
    },
    {
      id: "fc_02",
      front: "What is the additive identity for whole numbers?",
      back: "0 (Zero), because adding 0 to any whole number preserves its value: a + 0 = a.",
      hint: "What number added to 5 leaves 5 unchanged?",
    },
    {
      id: "fc_03",
      front: "What is the multiplicative identity for whole numbers?",
      back: "1 (One), because multiplying any whole number by 1 preserves its value: a × 1 = a.",
      hint: "What number multiplied by 10 leaves 10 unchanged?",
    },
    {
      id: "fc_04",
      front: "Is addition of whole numbers commutative?",
      back: "Yes. For any two whole numbers a and b, a + b = b + a. Example: 3 + 7 = 7 + 3 = 10.",
      hint: "Does changing the order of addends change the sum?",
    },
    {
      id: "fc_05",
      front: "Is subtraction of whole numbers commutative?",
      back: "No. For example, 7 - 3 = 4, but 3 - 7 = -4 (which is not a whole number).",
      hint: "Test with 5 - 2 vs 2 - 5.",
    },
    {
      id: "fc_06",
      front: "What is the closure property for whole numbers under multiplication?",
      back: "The product of any two whole numbers is always another whole number (a × b ∈ W). Example: 6 × 9 = 54 ∈ W.",
      hint: "Can multiplying two whole numbers ever produce a fraction?",
    },
    {
      id: "fc_07",
      front: "What is the associative property of addition for whole numbers?",
      back: "Grouping does not change the sum: (a + b) + c = a + (b + c). Example: (2 + 3) + 4 = 2 + (3 + 4) = 9.",
      hint: "Think about parentheses grouping.",
    },
    {
      id: "fc_08",
      front: "What is the successor of 99 in whole numbers?",
      back: "100. The successor of any whole number n is n + 1 (99 + 1 = 100).",
      hint: "Add 1 to the given number.",
    },
    {
      id: "fc_09",
      front: "Which whole number has NO predecessor in whole numbers?",
      back: "0 (Zero). Since whole numbers begin at 0, there is no whole number before it.",
      hint: "Which number is at the very beginning of the whole numbers sequence?",
    },
    {
      id: "fc_10",
      front: "What is the result of dividing any whole number by zero (a ÷ 0)?",
      back: "Undefined. Division by zero is not defined in mathematics because repeated subtraction never terminates.",
      hint: "Can you divide an apple into 0 pieces?",
    },
    {
      id: "fc_11",
      front: "State the distributive property of multiplication over addition.",
      back: "a × (b + c) = (a × b) + (a × c). For example, 5 × (20 + 4) = (5 × 20) + (5 × 4) = 100 + 20 = 120.",
      hint: "Multiplying a number into a sum in parentheses.",
    },
    {
      id: "fc_12",
      front: "Are whole numbers closed under division?",
      back: "No. For example, 7 ÷ 2 = 3.5 (or 7/2), which is not a whole number.",
      hint: "Does 3 ÷ 4 result in a whole number?",
    },
  ],
};
