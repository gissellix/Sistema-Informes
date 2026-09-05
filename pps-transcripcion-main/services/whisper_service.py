import whisper

class WhisperService:
    def __init__(self):
        print("Cargando modelo Whisper...")
        self.model = whisper.load_model("small")
        print("Modelo cargado correctamente.")

    def transcribir(self, ruta_audio):

        resultado = self.model.transcribe(
            ruta_audio,
            language="es",
            initial_prompt=(
                "Informe policial en español argentino. "
                "Personal policial, sargento, sargento primero, "
                "cabo, cabo primero, agente, oficial inspector, "
                "oficial ayudante, comisario de servicio, "
                "legajo, móvil, recorrido preventivo, "
                "jurisdicción, actuaciones sumariales, "
                "novedades, incidente policial, "
                "supervisión del control, avenida Belgrano, "
                "zona de la terminal. "
                "Prestar especial atención a las negaciones "
                "como 'no se encontraron', 'no se registraron' "
                "y 'no se produjeron'."
            )
        )

        return resultado["text"]