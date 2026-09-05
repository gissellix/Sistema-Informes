import os

from services.preprocess_service import PreprocessService
from services.whisper_service import WhisperService
from services.postprocess_service import PostprocessService

class TranscripcionService:
    def __init__(self):
        self.preprocess = PreprocessService()
        self.whisper = WhisperService()
        self.postprocess = PostprocessService()

    def transcribir(self, audio):
        ruta_original, ruta_procesado = self.preprocess.procesar(audio)
        try:
            texto = self.whisper.transcribir(ruta_procesado)
            texto = self.postprocess.corregir(texto)
            return {
                "transcripcion": texto,
            }

        finally:
            if os.path.exists(ruta_original):
                os.remove(ruta_original)
            if os.path.exists(ruta_procesado):
                os.remove(ruta_procesado)