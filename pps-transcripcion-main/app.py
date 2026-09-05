from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controllers.transcripcion_controller import router

app = FastAPI(
    title="Servicio de Transcripción",
    description="API para transcribir audios",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)