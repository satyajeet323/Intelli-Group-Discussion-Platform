"""Tests for audio schema models."""

import pytest
from pydantic import ValidationError
from ml_server.schemas.audio import ProsodyMetrics, TranscriptScoreRequest

def test_prosody_metrics_valid():
    m = ProsodyMetrics(
        duration_sec=10.5,
        speech_rate_wpm=130.0,
        syllable_nuclei_count=25,
        pause_ratio=0.15,
        total_pause_s=1.5,
        fillers=2
    )
    assert m.duration_sec == 10.5
    assert m.fillers == 2

def test_transcript_score_request_validation():
    with pytest.raises(ValidationError):
        TranscriptScoreRequest(transcript="", topic="Tech")
