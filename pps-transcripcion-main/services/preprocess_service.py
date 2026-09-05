import os
import tempfile
import subprocess

class PreprocessService:
    def procesar(self, audio):

        # 1. GUARDAR AUDIO ORIGINAL

        extension = ".webm"

        if audio.filename:
            extension = os.path.splitext(audio.filename)[1] or ".webm"

        with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=extension
        ) as temp_original:
            temp_original.write(audio.file.read())
            ruta_original = temp_original.name

        # 2. CREAR ARCHIVO WAV PROCESADO

        temp_procesado = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".wav"
        )

        ruta_procesado = temp_procesado.name
        temp_procesado.close()

        try:
            # 3. PROCESAMIENTO CON FFMPEG

            comando = [
                "ffmpeg",
                "-y",

                # Audio de entrada
                "-i", ruta_original,

                # Mono
                "-ac", "1",

                # Frecuencia recomendada para Whisper
                "-ar", "16000",

                # Procesamiento del audio
                "-af",
                "highpass=f=80,"
                "lowpass=f=8000,"
                "loudnorm",

                # Formato WAV PCM
                "-c:a", "pcm_s16le",

                ruta_procesado
            ]

            subprocess.run(
                comando,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

            return ruta_original, ruta_procesado

        except Exception:
            if os.path.exists(ruta_original):
                os.remove(ruta_original)

            if os.path.exists(ruta_procesado):
                os.remove(ruta_procesado)

            raise