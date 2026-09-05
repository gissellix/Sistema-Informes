from pydantic import BaseModel

class TranscripcionResponse(BaseModel):
    transcripcion: str