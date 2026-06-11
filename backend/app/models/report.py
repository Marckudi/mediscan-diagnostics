from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


class AnalysisType(str, Enum):
    RADIOLOGY = "radiology"
    PATHOLOGY = "pathology"
    DERMATOLOGY = "dermatology"
    OPHTHALMOLOGY = "ophthalmology"
    GENERAL = "general"


class Severity(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class Finding(BaseModel):
    description: str
    severity: Severity
    location: str | None = None
    confidence: float = Field(ge=0.0, le=1.0)


class AnalysisReport(BaseModel):
    report_id: str
    analysis_type: AnalysisType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    findings: list[Finding]
    summary: str
    recommendations: list[str]
    differential_diagnosis: list[str] = Field(default_factory=list)
    requires_urgent_attention: bool = False
    disclaimer: str = (
        "Este análisis es generado por IA con fines de apoyo diagnóstico. "
        "No sustituye la evaluación de un profesional médico calificado."
    )


class AnalysisRequest(BaseModel):
    analysis_type: AnalysisType = AnalysisType.GENERAL
    clinical_context: str | None = None
    patient_age: int | None = Field(default=None, ge=0, le=150)
    patient_sex: str | None = None


class AnalysisResponse(BaseModel):
    success: bool
    report: AnalysisReport | None = None
    error: str | None = None
