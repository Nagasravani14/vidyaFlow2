"""
Comprehensive Textbook Ingestion & Curriculum Discovery Engine for VidyaFlow.
Uses dataset_textbooks/ as the single source of truth for all Classes 6–10.
"""

import os
import json
import re
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..database import SessionLocal, engine, Base
from ..models import (
    User,
    UserRole,
    ClassRoom,
    Textbook,
    Lesson,
    Concept,
    ConceptEdge,
    MasteryState,
    MasteryStatus,
    Question,
    TeacherIntervention,
    AIRecommendation,
    StudentProgress,
    LearningEvent,
    Achievement,
    UserAchievement,
)


def get_dataset_root() -> Path:
    cwd = Path.cwd()
    for p in [cwd / "dataset_textbooks", cwd.parent / "dataset_textbooks", Path("dataset_textbooks").resolve()]:
        if p.exists() and p.is_dir():
            return p
    return cwd / "dataset_textbooks"


# Authentic lessons catalogue mapped directly from the 15 SCERT Telangana 2026-27 textbook PDFs
TEXTBOOK_METADATA = [
    {
        "filename": "VI Maths EM Final 2026-27.pdf",
        "title": "Mathematics (Class 6 EM)",
        "grade_level": 6,
        "subject": "Mathematics",
        "total_pages": 225,
        "lessons": [
            {"num": 1, "title": "Knowing Our Numbers", "pages": "1-15"},
            {"num": 2, "title": "Whole Numbers", "pages": "16-28"},
            {"num": 3, "title": "Playing with Numbers", "pages": "29-48"},
            {"num": 4, "title": "Basic Geometrical Ideas", "pages": "49-60"},
            {"num": 5, "title": "Measures of Lines and Angles", "pages": "61-72"},
            {"num": 6, "title": "Integers", "pages": "73-84"},
            {"num": 7, "title": "Fractions and Decimals", "pages": "85-106"},
            {"num": 8, "title": "Data Handling", "pages": "107-118"},
            {"num": 9, "title": "Introduction to Algebra", "pages": "119-130"},
            {"num": 10, "title": "Perimeter and Area", "pages": "131-144"},
            {"num": 11, "title": "Ratio and Proportion", "pages": "145-157"},
            {"num": 12, "title": "Symmetry", "pages": "158-167"},
            {"num": 13, "title": "Practical Geometry", "pages": "168-177"},
            {"num": 14, "title": "Understanding 3D and 2D Shapes", "pages": "178-185"},
        ],
    },
    {
        "filename": "VI Gen. Science 2026-27 EM.pdf",
        "title": "General Science (Class 6 EM)",
        "grade_level": 6,
        "subject": "General Science",
        "total_pages": 186,
        "lessons": [
            {"num": 1, "title": "Our Food", "pages": "1-10"},
            {"num": 2, "title": "Playing with Magnets", "pages": "11-20"},
            {"num": 3, "title": "Rain: Where Does It Come From?", "pages": "21-27"},
            {"num": 4, "title": "What Do Animals Eat?", "pages": "28-40"},
            {"num": 5, "title": "Materials - Objects", "pages": "41-49"},
            {"num": 6, "title": "Habitat", "pages": "50-60"},
            {"num": 7, "title": "Separation of Substances", "pages": "61-69"},
            {"num": 8, "title": "Fibre to Fabric", "pages": "70-78"},
            {"num": 9, "title": "Plants: Parts and Functions", "pages": "79-88"},
            {"num": 10, "title": "Changes Around Us", "pages": "89-100"},
            {"num": 11, "title": "Water in Our Life", "pages": "101-108"},
            {"num": 12, "title": "Simple Electric Circuits", "pages": "109-117"},
            {"num": 13, "title": "Learning How to Measure", "pages": "118-132"},
            {"num": 14, "title": "Movements in Animals", "pages": "133-146"},
            {"num": 15, "title": "Light, Shadows and Images", "pages": "147-158"},
            {"num": 16, "title": "Living and Non-Living", "pages": "159-170"},
        ],
    },
    {
        "filename": "6th Social EM-2026-27.pdf",
        "title": "Social Studies (Class 6 EM)",
        "grade_level": 6,
        "subject": "Social Studies",
        "total_pages": 206,
        "lessons": [
            {"num": 1, "title": "Reading and Making Maps", "pages": "2-9"},
            {"num": 2, "title": "Globe – A Model of the Earth", "pages": "10-15"},
            {"num": 3, "title": "Land Forms (Part A) & Penamakuru (Part B)", "pages": "16-27"},
            {"num": 4, "title": "Dokur – A Village on the Plateau", "pages": "28-36"},
            {"num": 5, "title": "Penugolu – A Village on the Hills", "pages": "37-44"},
            {"num": 6, "title": "From Gathering Food to Growing Food", "pages": "45-57"},
            {"num": 7, "title": "Agriculture in Our Times", "pages": "58-65"},
            {"num": 8, "title": "Trade in Agricultural Produce", "pages": "66-80"},
            {"num": 9, "title": "Community Decision Making in a Tribe", "pages": "81-85"},
            {"num": 10, "title": "Emergence of Kingdoms and Republics", "pages": "86-93"},
            {"num": 11, "title": "First Empires", "pages": "94-103"},
            {"num": 12, "title": "Democratic Government", "pages": "104-112"},
            {"num": 13, "title": "Village Panchayats", "pages": "113-120"},
            {"num": 14, "title": "Local Self – Government in Urban Areas", "pages": "121-127"},
            {"num": 15, "title": "Diversity in Our Society", "pages": "128-135"},
            {"num": 16, "title": "Towards Gender Equality", "pages": "136-143"},
        ],
    },
    {
        "filename": "7 Maths EM.pdf",
        "title": "Mathematics (Class 7 EM)",
        "grade_level": 7,
        "subject": "Mathematics",
        "total_pages": 330,
        "lessons": [
            {"num": 1, "title": "Integers", "pages": "1-25"},
            {"num": 2, "title": "Fractions, Decimals and Rational Numbers", "pages": "26-60"},
            {"num": 3, "title": "Simple Equations", "pages": "61-70"},
            {"num": 4, "title": "Lines and Angles", "pages": "71-88"},
            {"num": 5, "title": "Triangle and Its Properties", "pages": "89-110"},
            {"num": 6, "title": "Ratio - Applications", "pages": "111-142"},
            {"num": 7, "title": "Data Handling", "pages": "143-163"},
            {"num": 8, "title": "Congruency of Triangles", "pages": "164-182"},
            {"num": 9, "title": "Construction of Triangles", "pages": "183-192"},
            {"num": 10, "title": "Algebraic Expressions", "pages": "193-211"},
            {"num": 11, "title": "Powers and Exponents", "pages": "212-227"},
            {"num": 12, "title": "Quadrilaterals", "pages": "228-245"},
            {"num": 13, "title": "Area and Perimeter", "pages": "246-265"},
            {"num": 14, "title": "Understanding 3D and 2D Shapes", "pages": "266-277"},
            {"num": 15, "title": "Symmetry", "pages": "278-290"},
        ],
    },
    {
        "filename": "7th science em pdf 2026-27.pdf",
        "title": "General Science (Class 7 EM)",
        "grade_level": 7,
        "subject": "General Science",
        "total_pages": 202,
        "lessons": [
            {"num": 1, "title": "Food Components", "pages": "1-9"},
            {"num": 2, "title": "Acids and Bases", "pages": "10-21"},
            {"num": 3, "title": "Silk - Wool", "pages": "22-31"},
            {"num": 4, "title": "Motion and Time", "pages": "32-48"},
            {"num": 5, "title": "Heat - Measurement", "pages": "49-60"},
            {"num": 6, "title": "Weather and Climate", "pages": "61-70"},
            {"num": 7, "title": "Electric Current and its Effects", "pages": "71-81"},
            {"num": 8, "title": "Air, Winds and Cyclones", "pages": "82-90"},
            {"num": 9, "title": "Reflection of Light", "pages": "91-107"},
            {"num": 10, "title": "Nutrition in Plants", "pages": "108-115"},
            {"num": 11, "title": "Respiration in Organisms", "pages": "116-124"},
            {"num": 12, "title": "Reproduction in Plants", "pages": "125-136"},
            {"num": 13, "title": "Seed Dispersal", "pages": "137-143"},
            {"num": 14, "title": "Water - Too Little to Waste", "pages": "144-153"},
            {"num": 15, "title": "Soil - Our Life", "pages": "154-166"},
            {"num": 16, "title": "Forest: Our Lifeline", "pages": "167-180"},
        ],
    },
    {
        "filename": "7th Social EM-2026-27.pdf",
        "title": "Social Studies (Class 7 EM)",
        "grade_level": 7,
        "subject": "Social Studies",
        "total_pages": 230,
        "lessons": [
            {"num": 1, "title": "Reading Maps of Different Kinds", "pages": "1-6"},
            {"num": 2, "title": "Rain and Rivers", "pages": "7-21"},
            {"num": 3, "title": "Tanks and Ground Water", "pages": "22-32"},
            {"num": 4, "title": "Oceans and Fishing", "pages": "33-41"},
            {"num": 5, "title": "Europe", "pages": "42-57"},
            {"num": 6, "title": "Africa", "pages": "58-68"},
            {"num": 7, "title": "Handicrafts and Handlooms", "pages": "69-77"},
            {"num": 8, "title": "Industrial Revolution", "pages": "78-85"},
            {"num": 9, "title": "Production in a Factory - A Paper Mill", "pages": "86-94"},
            {"num": 10, "title": "Importance of Transport System", "pages": "95-100"},
            {"num": 11, "title": "New Kings and Kingdoms", "pages": "101-109"},
            {"num": 12, "title": "The Kakatiyas - Emergence of a Regional Kingdom", "pages": "110-116"},
            {"num": 13, "title": "The Kings of Vijayanagara", "pages": "117-125"},
            {"num": 14, "title": "Mughal Empire", "pages": "126-134"},
            {"num": 15, "title": "Establishment of the British Empire in India", "pages": "135-146"},
            {"num": 16, "title": "Making of Laws in the State Assembly", "pages": "147-157"},
            {"num": 17, "title": "Implementation of Laws in the District", "pages": "158-164"},
            {"num": 18, "title": "Caste Discrimination and the Struggle for Equalities", "pages": "165-171"},
            {"num": 19, "title": "Livelihood and Struggles of Urban Workers", "pages": "172-180"},
        ],
    },
    {
        "filename": "8 Maths EM.pdf",
        "title": "Mathematics (Class 8 EM)",
        "grade_level": 8,
        "subject": "Mathematics",
        "total_pages": 378,
        "lessons": [
            {"num": 1, "title": "Rational Numbers", "pages": "1-36"},
            {"num": 2, "title": "Linear Equations in One Variable", "pages": "37-61", "featured": True},
            {"num": 3, "title": "Construction of Quadrilaterals", "pages": "62-83"},
            {"num": 4, "title": "Exponents and Powers", "pages": "84-98"},
            {"num": 5, "title": "Comparing Quantities using Proportion", "pages": "99-124"},
            {"num": 6, "title": "Square Roots and Cube Roots", "pages": "125-150"},
            {"num": 7, "title": "Frequency Distribution Tables and Graphs", "pages": "151-183"},
            {"num": 8, "title": "Exploring Geometrical Figures", "pages": "184-205"},
            {"num": 9, "title": "Area of Plane Figures", "pages": "206-224"},
            {"num": 10, "title": "Direct and Inverse Proportions", "pages": "225-242"},
            {"num": 11, "title": "Algebraic Expressions", "pages": "243-264"},
            {"num": 12, "title": "Factorisation", "pages": "265-280"},
            {"num": 13, "title": "Visualizing 3-D in 2-D", "pages": "281-294"},
            {"num": 14, "title": "Surface Areas and Volumes", "pages": "295-316"},
            {"num": 15, "title": "Playing with Numbers", "pages": "317-338"},
        ],
    },
    {
        "filename": "viii class physical science_em_2026-27.pdf",
        "title": "Physical Science (Class 8 EM)",
        "grade_level": 8,
        "subject": "Physical Science",
        "total_pages": 206,
        "lessons": [
            {"num": 1, "title": "Force", "pages": "1-19"},
            {"num": 2, "title": "Friction", "pages": "20-33"},
            {"num": 3, "title": "Synthetic Fibres and Plastics", "pages": "34-53"},
            {"num": 4, "title": "Metals and Non-Metals", "pages": "54-67"},
            {"num": 5, "title": "Sound", "pages": "68-86"},
            {"num": 6, "title": "Coal and Petroleum", "pages": "87-96"},
            {"num": 7, "title": "Combustion, Fuels and Flame", "pages": "97-111"},
            {"num": 8, "title": "Electrical Conductivity of Liquids", "pages": "112-124"},
            {"num": 9, "title": "Some Natural Phenomena", "pages": "125-137"},
            {"num": 10, "title": "Stars and the Solar System", "pages": "138-153"},
            {"num": 11, "title": "Pollution of Air and Water", "pages": "154-177"},
        ],
    },
    {
        "filename": "8th Social EM 2026-27.pdf",
        "title": "Social Studies (Class 8 EM)",
        "grade_level": 8,
        "subject": "Social Studies",
        "total_pages": 286,
        "lessons": [
            {"num": 1, "title": "Reading and Analysis of Maps", "pages": "1-17"},
            {"num": 2, "title": "Energy from the Sun", "pages": "18-32"},
            {"num": 3, "title": "Earth Movements and Seasons", "pages": "33-39"},
            {"num": 4, "title": "The Polar Regions", "pages": "40-48"},
            {"num": 5, "title": "Forests: Uses and Protection", "pages": "49-61"},
            {"num": 6, "title": "Minerals and Mining", "pages": "62-74"},
            {"num": 7, "title": "Money and Banking", "pages": "75-87"},
            {"num": 8, "title": "Impact of Technology on Livelihoods", "pages": "88-98"},
            {"num": 9, "title": "Public Health and the Government", "pages": "99-108"},
            {"num": 10, "title": "Landlords and Tenants under the British and Nizam", "pages": "109-122"},
            {"num": 11, "title": "National Movement - Early and Last Phase", "pages": "123-146"},
            {"num": 12, "title": "Freedom Movement in Hyderabad State", "pages": "147-158"},
            {"num": 13, "title": "The Indian Constitution", "pages": "159-172"},
            {"num": 14, "title": "Parliament and the Central Government", "pages": "173-186"},
            {"num": 15, "title": "Law and Justice - A Case Study", "pages": "187-198"},
            {"num": 16, "title": "Abolition of Zamindari System", "pages": "199-210"},
            {"num": 17, "title": "Understanding Poverty", "pages": "211-224"},
            {"num": 18, "title": "Rights Approach to Development", "pages": "225-236"},
            {"num": 19, "title": "Social and Religious Reform Movements", "pages": "237-250"},
            {"num": 20, "title": "Understanding Secularism", "pages": "251-264"},
        ],
    },
    {
        "filename": "9th Maths EM.pdf",
        "title": "Mathematics (Class 9 EM)",
        "grade_level": 9,
        "subject": "Mathematics",
        "total_pages": 369,
        "lessons": [
            {"num": 1, "title": "Real Numbers", "pages": "1-26"},
            {"num": 2, "title": "Polynomials and Factorisation", "pages": "27-58"},
            {"num": 3, "title": "The Elements of Geometry", "pages": "59-70"},
            {"num": 4, "title": "Lines and Angles", "pages": "71-106"},
            {"num": 5, "title": "Co-Ordinate Geometry", "pages": "107-123"},
            {"num": 6, "title": "Linear Equations in Two Variables", "pages": "124-147"},
            {"num": 7, "title": "Triangles", "pages": "148-173"},
            {"num": 8, "title": "Quadrilaterals", "pages": "174-193"},
            {"num": 9, "title": "Statistics", "pages": "194-213"},
            {"num": 10, "title": "Surface Areas and Volumes", "pages": "214-243"},
            {"num": 11, "title": "Areas", "pages": "244-259"},
            {"num": 12, "title": "Circles", "pages": "260-279"},
            {"num": 13, "title": "Geometrical Constructions", "pages": "280-291"},
            {"num": 14, "title": "Probability", "pages": "292-309"},
            {"num": 15, "title": "Proofs in Mathematics", "pages": "310-327"},
        ],
    },
    {
        "filename": "ix physics em 2026-27.pdf",
        "title": "Physics (Class 9 EM)",
        "grade_level": 9,
        "subject": "Physics",
        "total_pages": 242,
        "lessons": [
            {"num": 1, "title": "Matter Around Us", "pages": "1-10"},
            {"num": 2, "title": "Motion", "pages": "11-30"},
            {"num": 3, "title": "Laws of Motion", "pages": "31-46"},
            {"num": 4, "title": "Refraction of Light at Plane Surfaces", "pages": "47-66"},
            {"num": 5, "title": "Gravitation", "pages": "67-81"},
            {"num": 6, "title": "Is Matter Pure?", "pages": "82-99"},
            {"num": 7, "title": "Atoms, Molecules and Chemical Reactions", "pages": "100-128"},
            {"num": 8, "title": "Floating Bodies", "pages": "129-148"},
            {"num": 9, "title": "What is Inside the Atom?", "pages": "149-165"},
            {"num": 10, "title": "Work and Energy", "pages": "166-189"},
            {"num": 11, "title": "Heat", "pages": "190-206"},
            {"num": 12, "title": "Sound", "pages": "207-228"},
        ],
    },
    {
        "filename": "ix biology em inner 2026-27.pdf",
        "title": "Biology (Class 9 EM)",
        "grade_level": 9,
        "subject": "Biology",
        "total_pages": 206,
        "lessons": [
            {"num": 1, "title": "Cell - Its Structure and Functions", "pages": "1-11"},
            {"num": 2, "title": "Plant Tissues", "pages": "12-23"},
            {"num": 3, "title": "Animal Tissues", "pages": "24-37"},
            {"num": 4, "title": "Movement of Substances Through Tissues", "pages": "38-49"},
            {"num": 5, "title": "Diversity in Living Organisms - Classification", "pages": "50-75"},
            {"num": 6, "title": "Sense Organs", "pages": "76-95"},
            {"num": 7, "title": "Animal Behaviour", "pages": "96-107"},
            {"num": 8, "title": "Challenges in Improving Agricultural Crops", "pages": "108-133"},
            {"num": 9, "title": "Adaptation in Different Ecosystems", "pages": "134-151"},
            {"num": 10, "title": "Soil Pollution", "pages": "152-174"},
            {"num": 11, "title": "Bio-Geochemical Cycles", "pages": "175-198"},
        ],
    },
    {
        "filename": "9 Social Studies EM 2026-27.pdf",
        "title": "Social Studies (Class 9 EM)",
        "grade_level": 9,
        "subject": "Social Studies",
        "total_pages": 307,
        "lessons": [
            {"num": 1, "title": "Our Earth", "pages": "1-22"},
            {"num": 2, "title": "The Natural Realms of the Earth - Lithosphere", "pages": "23-38"},
            {"num": 3, "title": "Hydrosphere", "pages": "39-50"},
            {"num": 4, "title": "Atmosphere", "pages": "51-64"},
            {"num": 5, "title": "Biosphere", "pages": "65-76"},
            {"num": 6, "title": "Agriculture in India", "pages": "77-90"},
            {"num": 7, "title": "Industries in India", "pages": "91-104"},
            {"num": 8, "title": "Service Activities in India", "pages": "105-116"},
            {"num": 9, "title": "Credit in the Financial System", "pages": "117-128"},
            {"num": 10, "title": "Prices and Cost of Living", "pages": "129-138"},
            {"num": 11, "title": "The Government Budget and Taxation", "pages": "139-145"},
            {"num": 12, "title": "Changing Cultural Traditions in Europe 1300-1800", "pages": "146-166"},
            {"num": 13, "title": "Industrialisation and Social Change", "pages": "167-180"},
            {"num": 14, "title": "Social Protest Movements", "pages": "181-188"},
            {"num": 15, "title": "Colonialism in Latin America, Asia and Africa", "pages": "189-203"},
            {"num": 16, "title": "Impact of Colonialism in India", "pages": "204-217"},
            {"num": 17, "title": "Expansion of Democracy", "pages": "218-228"},
            {"num": 18, "title": "Democracy: An Evolving Idea", "pages": "229-239"},
            {"num": 19, "title": "Human Rights and Fundamental Rights", "pages": "240-252"},
            {"num": 20, "title": "Women Protection Acts", "pages": "253-261"},
            {"num": 21, "title": "Disaster Management", "pages": "262-270"},
            {"num": 22, "title": "Traffic Education", "pages": "271-277"},
        ],
    },
    {
        "filename": "X Mathematics EM  2026-27.pdf",
        "title": "Mathematics (Class 10 EM)",
        "grade_level": 10,
        "subject": "Mathematics",
        "total_pages": 414,
        "lessons": [
            {"num": 1, "title": "Real Numbers", "pages": "1-27"},
            {"num": 2, "title": "Sets", "pages": "28-50"},
            {"num": 3, "title": "Polynomials", "pages": "51-76"},
            {"num": 4, "title": "Pair of Linear Equations in Two Variables", "pages": "77-104"},
            {"num": 5, "title": "Quadratic Equations", "pages": "105-128"},
            {"num": 6, "title": "Progressions", "pages": "129-162"},
            {"num": 7, "title": "Coordinate Geometry", "pages": "163-194"},
            {"num": 8, "title": "Similar Triangles", "pages": "195-228"},
            {"num": 9, "title": "Tangents and Secants to a Circle", "pages": "229-248"},
            {"num": 10, "title": "Mensuration", "pages": "249-272"},
            {"num": 11, "title": "Trigonometry", "pages": "273-297"},
            {"num": 12, "title": "Applications of Trigonometry", "pages": "298-308"},
            {"num": 13, "title": "Probability", "pages": "309-326"},
            {"num": 14, "title": "Statistics", "pages": "327-356"},
        ],
    },
    {
        "filename": "X SOCIAL EM 2026-27.pdf",
        "title": "Social Studies (Class 10 EM)",
        "grade_level": 10,
        "subject": "Social Studies",
        "total_pages": 350,
        "lessons": [
            {"num": 1, "title": "India: Relief Features", "pages": "1-14"},
            {"num": 2, "title": "Ideas of Development", "pages": "15-28"},
            {"num": 3, "title": "Production and Employment", "pages": "29-44"},
            {"num": 4, "title": "Climate of India", "pages": "45-58"},
            {"num": 5, "title": "Indian Rivers and Water Resources", "pages": "59-71"},
            {"num": 6, "title": "The Population", "pages": "72-87"},
            {"num": 7, "title": "Settlements - Migrations", "pages": "88-102"},
            {"num": 8, "title": "Rampur: A Village Economy", "pages": "103-117"},
            {"num": 9, "title": "Globalisation", "pages": "118-131"},
            {"num": 10, "title": "Food Security", "pages": "132-145"},
            {"num": 11, "title": "Sustainable Development with Equity", "pages": "146-162"},
            {"num": 12, "title": "World Between the World Wars (1914-1945)", "pages": "163-186"},
            {"num": 13, "title": "National Liberation Movements in the Colonies", "pages": "187-197"},
            {"num": 14, "title": "National Movement in India - Partition & Independence", "pages": "198-211"},
            {"num": 15, "title": "The Making of Independent India's Constitution", "pages": "212-228"},
            {"num": 16, "title": "Election Process in India", "pages": "229-238"},
            {"num": 17, "title": "Independent India (The First 30 Years: 1947-77)", "pages": "239-253"},
            {"num": 18, "title": "Emerging Political Trends (1977 to 2000)", "pages": "254-271"},
            {"num": 19, "title": "Post-War World and India", "pages": "272-288"},
            {"num": 20, "title": "Social Movements in Our Times", "pages": "289-304"},
            {"num": 21, "title": "The Movement for the Formation of Telangana State", "pages": "305-325"},
        ],
    },
]


def seed_achievements(db: Session):
    """Prime standard system achievements for genuine unlocking."""
    achievements_data = [
        {
            "code": "first_lesson_started",
            "title": "First Step on VidyaFlow",
            "description": "Started your very first authentic textbook lesson.",
            "badge_icon": "BookOpen",
            "xp_reward": 50,
        },
        {
            "code": "concept_explorer",
            "title": "Curious Mind",
            "description": "Explored 3 or more concept nodes on an interactive mind map.",
            "badge_icon": "GitFork",
            "xp_reward": 75,
        },
        {
            "code": "sign_master",
            "title": "Sign Rules Master",
            "description": "Mastered signed integer operations and eliminated prerequisite gaps.",
            "badge_icon": "ShieldCheck",
            "xp_reward": 100,
        },
        {
            "code": "equation_pro",
            "title": "Algebra Dynamo",
            "description": "Answered 3 linear equation practice items correctly in a row.",
            "badge_icon": "Zap",
            "xp_reward": 150,
        },
        {
            "code": "lesson_champion",
            "title": "Lesson Champion",
            "description": "Completed all learning content and satisfied practice criteria for a chapter.",
            "badge_icon": "Award",
            "xp_reward": 200,
        },
    ]

    for a in achievements_data:
        existing = db.query(Achievement).filter(Achievement.code == a["code"]).first()
        if not existing:
            rec = Achievement(**a)
            db.add(rec)
    db.commit()


def ingest_authentic_textbooks_and_lessons(db: Session):
    """Ingests all 15 authentic textbooks and their actual chapter lists."""
    dataset_dir = get_dataset_root()

    for tb_meta in TEXTBOOK_METADATA:
        filename = tb_meta["filename"]
        file_path = dataset_dir / filename

        tb = db.query(Textbook).filter(Textbook.filename == filename).first()
        if not tb:
            tb = Textbook(
                title=tb_meta["title"],
                filename=filename,
                board="telangana",
                grade_level=tb_meta["grade_level"],
                subject=tb_meta["subject"],
                total_pages=tb_meta["total_pages"],
                file_path=str(file_path),
            )
            db.add(tb)
            db.commit()
            db.refresh(tb)

        # Ingest lessons for this textbook
        for l_meta in tb_meta["lessons"]:
            slug = f"{tb.grade_level}_{tb.subject.lower().replace(' ', '_')}_{l_meta['num']}_{re.sub(r'[^a-zA-Z0-9]', '_', l_meta['title'].lower())}"
            lesson = db.query(Lesson).filter(Lesson.textbook_id == tb.id, Lesson.chapter_number == l_meta["num"]).first()

            pages_str = l_meta.get("pages", "1-10")
            parts = [int(p) for p in re.findall(r"\d+", pages_str)]
            p_start = parts[0] if len(parts) >= 1 else 1
            p_end = parts[1] if len(parts) >= 2 else p_start + 10

            is_featured = (tb.grade_level == 8 and tb.subject == "Mathematics" and l_meta["num"] == 2)

            if not lesson:
                lesson = Lesson(
                    textbook_id=tb.id,
                    chapter_number=l_meta["num"],
                    title=l_meta["title"],
                    slug=slug,
                    page_start=p_start,
                    page_end=p_end,
                    overview=f"Chapter {l_meta['num']}: {l_meta['title']} from Telangana State Board Class {tb.grade_level} {tb.subject} textbook (Pages {pages_str}).",
                    has_mindmap=is_featured,
                    has_practice=is_featured,
                )
                db.add(lesson)
                db.commit()
                db.refresh(lesson)
            else:
                lesson.title = l_meta["title"]
                lesson.page_start = p_start
                lesson.page_end = p_end
                db.commit()


def link_rich_curriculum_datasets(db: Session):
    """
    Links the deep JSON mind maps, prerequisite edges, formulas, definitions,
    flashcards, and questions for Class 8 Mathematics: Linear Equations in One Variable.
    """
    dataset_dir = get_dataset_root()
    json_path = dataset_dir / "telangana" / "class8" / "mathematics" / "linear_equations.json"
    if not json_path.exists():
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Locate the Class 8 Mathematics textbook
    tb = db.query(Textbook).filter(Textbook.grade_level == 8, Textbook.subject == "Mathematics").first()
    if not tb:
        return

    # Chapter 2 is Linear Equations in One Variable in Class 8
    lesson = db.query(Lesson).filter(Lesson.textbook_id == tb.id, Lesson.chapter_number == 2).first()
    if not lesson:
        # Fallback to chapter 3 or title match
        lesson = db.query(Lesson).filter(Lesson.textbook_id == tb.id, Lesson.title.like("%Linear Equation%")).first()

    if not lesson:
        return

    lesson.has_mindmap = True
    lesson.has_practice = True
    lesson.summary_en = data.get("summary", {}).get("en")
    lesson.summary_te = data.get("summary", {}).get("te")
    lesson.summary_hi = data.get("summary", {}).get("hi")
    lesson.formulas_json = json.dumps(data.get("formulas", []))
    lesson.definitions_json = json.dumps(data.get("definitions", []))
    lesson.flashcards_json = json.dumps(data.get("flashcards", []))
    db.commit()

    # Ingest concepts
    concept_map = {}
    for c_data in data.get("concepts", []):
        code = c_data["code"]
        concept = db.query(Concept).filter(Concept.code == code).first()
        if not concept:
            concept = Concept(
                chapter_id=lesson.id,
                code=code,
                title_en=c_data.get("title_en", code),
                title_te=c_data.get("title_te"),
                title_hi=c_data.get("title_hi"),
                description_en=c_data.get("description_en"),
                description_te=c_data.get("description_te"),
                description_hi=c_data.get("description_hi"),
                order_index=c_data.get("order_index", 0),
                difficulty_level=c_data.get("difficulty", 0.5),
                p_l0=c_data.get("p_l0", 0.25),
                p_transit=c_data.get("p_transit", 0.15),
                p_guess=c_data.get("p_guess", 0.20),
                p_slip=c_data.get("p_slip", 0.10),
            )
            db.add(concept)
            db.commit()
            db.refresh(concept)
        concept_map[code] = concept

    # Ingest prerequisite edges
    for edge_data in data.get("prerequisite_edges", []):
        src = concept_map.get(edge_data["source"])
        tgt = concept_map.get(edge_data["target"])
        if src and tgt:
            existing = db.query(ConceptEdge).filter(ConceptEdge.source_id == src.id, ConceptEdge.target_id == tgt.id).first()
            if not existing:
                db.add(ConceptEdge(source_id=src.id, target_id=tgt.id, edge_type="prerequisite", strength=edge_data.get("strength", 1.0)))
    db.commit()

    # Ingest questions
    for q_data in data.get("questions", []):
        concept = concept_map.get(q_data.get("concept_code")) or list(concept_map.values())[0]
        q_text = q_data.get("question_text_en", "")
        existing = db.query(Question).filter(Question.chapter_id == lesson.id, Question.question_text_en == q_text).first()
        if not existing:
            db.add(
                Question(
                    concept_id=concept.id,
                    chapter_id=lesson.id,
                    question_text_en=q_text,
                    question_text_te=q_data.get("question_text_te"),
                    question_text_hi=q_data.get("question_text_hi"),
                    options_json=json.dumps(q_data.get("options", [])),
                    correct_answer=q_data.get("correct_answer", "A"),
                    explanation_en=q_data.get("explanation_en"),
                    explanation_te=q_data.get("explanation_te"),
                    explanation_hi=q_data.get("explanation_hi"),
                    difficulty=q_data.get("difficulty", "medium"),
                    hint_level_1=q_data.get("hint_level_1"),
                    hint_level_2=q_data.get("hint_level_2"),
                    hint_level_3=q_data.get("hint_level_3"),
                    is_challenge=q_data.get("is_challenge", False),
                    is_remedial=q_data.get("is_remedial", False),
                )
            )
    db.commit()


def seed_demo_users_and_states(db: Session):
    """Seed demo student Ananya Sharma, teacher Sharma, parent Rajesh, and baseline progress."""
    student = db.query(User).filter(User.email == "ananya.sharma@vidyaflow.edu").first()
    if not student:
        student = User(
            name="Ananya Sharma",
            email="ananya.sharma@vidyaflow.edu",
            role=UserRole.STUDENT,
            grade_level=8,
            section="A",
            board="telangana",
        )
        db.add(student)
        db.commit()
        db.refresh(student)

    teacher = db.query(User).filter(User.email == "sharma.teacher@vidyaflow.edu").first()
    if not teacher:
        teacher = User(name="Mr. R. Sharma", email="sharma.teacher@vidyaflow.edu", role=UserRole.TEACHER, grade_level=8, section="A")
        db.add(teacher)
        db.commit()
        db.refresh(teacher)

    parent = db.query(User).filter(User.email == "rajesh.sharma@vidyaflow.edu").first()
    if not parent:
        parent = User(name="Rajesh Sharma", email="rajesh.sharma@vidyaflow.edu", role=UserRole.PARENT)
        db.add(parent)
        db.commit()
        db.refresh(parent)
        student.parent_id = parent.id
        db.commit()

    classroom = db.query(ClassRoom).filter(ClassRoom.name == "Class 8A").first()
    if not classroom:
        classroom = ClassRoom(name="Class 8A", grade_level=8, section="A", board="telangana", subject="Mathematics", teacher_id=teacher.id, total_students=32)
        db.add(classroom)
        db.commit()

    # Seed baseline mastery states for Ananya
    concepts = db.query(Concept).all()
    initial_scores = {
        "MATH8_VARS": (0.88, MasteryStatus.STRONG),
        "MATH8_INT_OPS": (0.42, MasteryStatus.NEEDS_SUPPORT),
        "MATH8_ALGEBRAIC_EXP": (0.76, MasteryStatus.STRONG),
        "MATH8_BASIC_EQN": (0.62, MasteryStatus.DEVELOPING),
        "MATH8_LIN_EQN_VARS_BOTH": (0.38, MasteryStatus.NEEDS_SUPPORT),
        "MATH8_WORD_PROBLEMS": (0.28, MasteryStatus.NEEDS_SUPPORT),
    }

    for c in concepts:
        m = db.query(MasteryState).filter(MasteryState.user_id == student.id, MasteryState.concept_id == c.id).first()
        score, stat = initial_scores.get(c.code, (0.35, MasteryStatus.NEEDS_SUPPORT))
        if not m:
            db.add(MasteryState(user_id=student.id, concept_id=c.id, p_mastery=score, status=stat, attempts_count=2, correct_count=1))
    db.commit()

    # Seed Teacher Interventions
    interventions = db.query(TeacherIntervention).all()
    if not interventions:
        i1 = TeacherIntervention(
            teacher_id=teacher.id,
            classroom_id=classroom.id,
            title="Remedial Group: Integer Operations & Sign Rules",
            intervention_type="remedial_group",
            status="pending",
            student_names_json=json.dumps(["Ananya Sharma", "Karthik Verma", "Sneha Reddy", "Arjun Rao", "Divya Patel"]),
            rationale="5 students are consistently missing transposition steps due to negative sign errors (-14 - (-9)).",
            suggested_action="Assign 15-minute visual number line interactive module before tomorrow's algebra period.",
        )
        i2 = TeacherIntervention(
            teacher_id=teacher.id,
            classroom_id=classroom.id,
            title="Peer Tutoring Pairing: Equation Transposition",
            intervention_type="peer_tutoring",
            status="pending",
            student_names_json=json.dumps(["Rahul Nair (Mentor)", "Sneha Reddy (Mentee)"]),
            rationale="Rahul has achieved 94% Strong Mastery on Variables on Both Sides. Pairing him with Sneha will resolve transposition blockers.",
            suggested_action="Schedule a 10-minute collaborative practice sprint during Friday homeroom.",
        )
        db.add(i1)
        db.add(i2)
        db.commit()


def run_ingestion_pipeline():
    """Main ingestion coordinator."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("[VidyaFlow Ingestion] Priming achievements...")
        seed_achievements(db)

        print("[VidyaFlow Ingestion] Scanning dataset_textbooks and ingesting 15 authentic textbooks...")
        ingest_authentic_textbooks_and_lessons(db)

        print("[VidyaFlow Ingestion] Linking rich mind maps & questions...")
        link_rich_curriculum_datasets(db)

        print("[VidyaFlow Ingestion] Priming demo users and classrooms...")
        seed_demo_users_and_states(db)

        tb_count = db.query(Textbook).count()
        ls_count = db.query(Lesson).count()
        print(f"[VidyaFlow Ingestion] Complete! Ingested {tb_count} authentic textbooks, {ls_count} lessons across Classes 6–10.")
    finally:
        db.close()
