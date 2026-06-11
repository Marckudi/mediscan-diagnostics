from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.models.report import AnalysisRequest, AnalysisResponse, AnalysisType
from app.services.medical_agent import analyze_medical_image

router = APIRouter(prefix="/analysis", tags=["analysis"])


def _validate_image(file: UploadFile, settings) -> None:
    if file.content_type not in settings.allowed_image_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Tipo de imagen no soportado: {file.content_type}. "
                   f"Tipos permitidos: {', '.join(settings.allowed_image_types)}",
        )


@router.post("/", response_model=AnalysisResponse)
async def analyze_image(
    file: UploadFile = File(..., description="Imagen médica a analizar"),
    analysis_type: AnalysisType = Form(AnalysisType.GENERAL),
    clinical_context: str | None = Form(None),
    patient_age: int | None = Form(None),
    patient_sex: str | None = Form(None),
) -> AnalysisResponse:
    settings = get_settings()
    _validate_image(file, settings)

    image_data = await file.read()
    size_mb = len(image_data) / (1024 * 1024)
    if size_mb > settings.max_image_size_mb:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Imagen demasiado grande ({size_mb:.1f} MB). Máximo permitido: {settings.max_image_size_mb} MB",
        )

    request = AnalysisRequest(
        analysis_type=analysis_type,
        clinical_context=clinical_context,
        patient_age=patient_age,
        patient_sex=patient_sex,
    )

    try:
        report = analyze_medical_image(image_data, file.content_type, request)
        return AnalysisResponse(success=True, report=report)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error durante el análisis: {str(exc)}",
        ) from exc


@router.get("/health")
async def health_check() -> dict:
    settings = get_settings()
    return {
        "status": "ok",
        "model": settings.claude_model,
        "app": settings.app_name,
        "version": settings.app_version,
    }
