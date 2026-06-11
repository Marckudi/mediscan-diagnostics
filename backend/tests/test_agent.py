import json
import uuid
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest

from app.models.report import AnalysisRequest, AnalysisType, Severity
from app.services.medical_agent import _parse_agent_response, _build_user_message


SAMPLE_RESPONSE = json.dumps({
    "findings": [
        {
            "description": "Opacidad nodular en lóbulo superior derecho",
            "severity": "moderate",
            "location": "lóbulo superior derecho",
            "confidence": 0.82,
        }
    ],
    "summary": "Se identifica una opacidad nodular en el lóbulo superior derecho que requiere seguimiento.",
    "recommendations": [
        "Correlacionar con clínica del paciente",
        "Considerar TAC de tórax para caracterización",
    ],
    "differential_diagnosis": ["Nódulo pulmonar benigno", "Proceso infeccioso focal"],
    "requires_urgent_attention": False,
})


def test_parse_agent_response_valid():
    report = _parse_agent_response(SAMPLE_RESPONSE, AnalysisType.RADIOLOGY)
    assert report.analysis_type == AnalysisType.RADIOLOGY
    assert len(report.findings) == 1
    assert report.findings[0].severity == Severity.MODERATE
    assert report.findings[0].confidence == pytest.approx(0.82)
    assert "nódulo" in report.summary.lower()
    assert len(report.recommendations) == 2
    assert report.requires_urgent_attention is False


def test_parse_agent_response_embedded_json():
    wrapped = f"Aquí está mi análisis:\n\n```json\n{SAMPLE_RESPONSE}\n```"
    report = _parse_agent_response(wrapped, AnalysisType.GENERAL)
    assert report.findings[0].description == "Opacidad nodular en lóbulo superior derecho"


def test_parse_agent_response_invalid_raises():
    with pytest.raises(ValueError, match="No se encontró JSON válido"):
        _parse_agent_response("Sin JSON aquí", AnalysisType.GENERAL)


def test_parse_agent_response_report_has_id_and_timestamp():
    report = _parse_agent_response(SAMPLE_RESPONSE, AnalysisType.RADIOLOGY)
    assert uuid.UUID(report.report_id)
    assert isinstance(report.timestamp, datetime)


def test_build_user_message_includes_context():
    request = AnalysisRequest(
        analysis_type=AnalysisType.RADIOLOGY,
        clinical_context="Paciente con tos persistente",
        patient_age=45,
        patient_sex="masculino",
    )
    fake_image = b"\xff\xd8\xff\xe0"
    content = _build_user_message(fake_image, "image/jpeg", request)
    assert content[0]["type"] == "image"
    text_block = next(c for c in content if c["type"] == "text")
    assert "radiology" in text_block["text"]
    assert "45" in text_block["text"]
    assert "tos persistente" in text_block["text"]


def test_parse_agent_response_urgent_flag():
    urgent_data = json.loads(SAMPLE_RESPONSE)
    urgent_data["requires_urgent_attention"] = True
    report = _parse_agent_response(json.dumps(urgent_data), AnalysisType.RADIOLOGY)
    assert report.requires_urgent_attention is True
