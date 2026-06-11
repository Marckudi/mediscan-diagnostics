import uuid
import base64
import json
import re
from datetime import datetime

import anthropic

from app.core.config import get_settings
from app.models.report import (
    AnalysisReport,
    AnalysisRequest,
    AnalysisType,
    Finding,
    Severity,
)

SYSTEM_PROMPT = """Eres un agente de análisis médico especializado en interpretación de imágenes diagnósticas.
Tu función es analizar imágenes médicas y proporcionar hallazgos estructurados.

Responde SIEMPRE con un JSON válido con esta estructura exacta:
{
  "findings": [
    {
      "description": "descripción del hallazgo",
      "severity": "low|moderate|high|critical",
      "location": "ubicación anatómica o null",
      "confidence": 0.0-1.0
    }
  ],
  "summary": "resumen clínico conciso",
  "recommendations": ["recomendación 1", "recomendación 2"],
  "differential_diagnosis": ["diagnóstico 1", "diagnóstico 2"],
  "requires_urgent_attention": true|false
}

Sé preciso, objetivo y basa tus observaciones únicamente en lo que es visible en la imagen.
Cuando haya incertidumbre, indícalo en el nivel de confianza."""


def _build_user_message(
    image_data: bytes,
    media_type: str,
    request: AnalysisRequest,
) -> list[dict]:
    b64_image = base64.standard_b64encode(image_data).decode("utf-8")

    context_parts = [f"Tipo de análisis solicitado: {request.analysis_type.value}"]
    if request.clinical_context:
        context_parts.append(f"Contexto clínico: {request.clinical_context}")
    if request.patient_age is not None:
        context_parts.append(f"Edad del paciente: {request.patient_age} años")
    if request.patient_sex:
        context_parts.append(f"Sexo del paciente: {request.patient_sex}")

    return [
        {
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": media_type,
                "data": b64_image,
            },
        },
        {
            "type": "text",
            "text": "\n".join(context_parts) + "\n\nAnaliza esta imagen médica y responde con el JSON estructurado.",
        },
    ]


def _parse_agent_response(raw_text: str, analysis_type: AnalysisType) -> AnalysisReport:
    json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
    if not json_match:
        raise ValueError("No se encontró JSON válido en la respuesta del agente")

    data = json.loads(json_match.group())

    findings = [
        Finding(
            description=f["description"],
            severity=Severity(f["severity"]),
            location=f.get("location"),
            confidence=float(f["confidence"]),
        )
        for f in data.get("findings", [])
    ]

    return AnalysisReport(
        report_id=str(uuid.uuid4()),
        analysis_type=analysis_type,
        timestamp=datetime.utcnow(),
        findings=findings,
        summary=data.get("summary", ""),
        recommendations=data.get("recommendations", []),
        differential_diagnosis=data.get("differential_diagnosis", []),
        requires_urgent_attention=data.get("requires_urgent_attention", False),
    )


def analyze_medical_image(
    image_data: bytes,
    media_type: str,
    request: AnalysisRequest,
) -> AnalysisReport:
    settings = get_settings()
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    message = client.messages.create(
        model=settings.claude_model,
        max_tokens=settings.max_tokens,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": _build_user_message(image_data, media_type, request),
            }
        ],
    )

    raw_text = message.content[0].text
    return _parse_agent_response(raw_text, request.analysis_type)
