"""Tests for scoring and feedback logic."""

from ml_server.services.scoring_service import calculate_overall_score, generate_feedback, _filler_penalty

def test_filler_penalty():
    assert _filler_penalty(0) == 0.0
    assert _filler_penalty(2) == 0.0
    assert _filler_penalty(3) == 0.5
    assert _filler_penalty(6) == 1.0
    assert _filler_penalty(12) == 1.5

def test_calculate_overall_score():
    score = calculate_overall_score(fluency=8.0, relevance=8.0, confidence=8.0, filler_words=0)
    assert 7.9 <= score <= 8.1

def test_generate_feedback():
    fb = generate_feedback(fluency=9.0, relevance=9.0, confidence=9.0, filler_words=0, turns=5, overall_score=9.0)
    assert "Excellent performance" in fb
    assert "zero filler words" in fb
