"""Tests for PDF Inventory Scanner and Classification."""
from pathlib import Path
from vidyaflow_generator.core.inventory_scanner import InventoryScanner


def test_classify_class_and_subject():
    scanner = InventoryScanner()

    # Test class detection
    assert scanner._detect_class(Path("VI Maths EM Final 2026-27.pdf"), "") == 6
    assert scanner._detect_class(Path("7 Maths EM.pdf"), "") == 7
    assert scanner._detect_class(Path("8 Maths EM.pdf"), "") == 8
    assert scanner._detect_class(Path("ix physics em 2026-27.pdf"), "") == 9
    assert scanner._detect_class(Path("X Mathematics EM  2026-27.pdf"), "") == 10

    # Test subject detection
    assert scanner._detect_subject(Path("VI Maths EM Final 2026-27.pdf"), "") == "Mathematics"
    assert scanner._detect_subject(Path("ix physics em 2026-27.pdf"), "") == "Physical Science"
    assert scanner._detect_subject(Path("ix biology em inner 2026-27.pdf"), "") == "Biological Science"
    assert scanner._detect_subject(Path("6th Social EM-2026-27.pdf"), "") == "Social Studies"
    assert scanner._detect_subject(Path("VI Gen. Science 2026-27 EM.pdf"), "") == "General Science"


def test_scan_directory_discovers_textbooks():
    scanner = InventoryScanner()
    inv = scanner.scan_directory(".")
    assert inv.total_textbooks >= 15
    assert inv.total_pages > 3000

    # Verify duplicate detection found the identical physical science files
    duplicates = [tb for tb in inv.textbooks if tb.is_duplicate]
    assert len(duplicates) >= 1
    assert any("viii class physical science" in d.filename for d in duplicates)
