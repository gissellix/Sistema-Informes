from fastapi import APIRouter, UploadFile, File

from models.transcripcion_response import TranscripcionResponse
from services.transcripcion_service import TranscripcionService

router = APIRouter()

service = TranscripcionService()

@router.post(
    "/transcripcion",
    response_model=TranscripcionResponse
)
def transcribir(audio: UploadFile = File(...)):
    return service.transcribir(audio)