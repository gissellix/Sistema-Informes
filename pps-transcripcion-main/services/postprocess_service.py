import re

class PostprocessService:
    def corregir(self, texto):
        texto = texto.strip()

        # 1. LIMPIEZA DE ESPACIOS
        
        texto = re.sub(r"\s+", " ", texto)

        # Eliminar espacios antes de signos
        texto = re.sub(r"\s+([,.!?])", r"\1", texto)

        # Agregar espacio después de signos cuando falta
        texto = re.sub(r"([,.!?])([^\s])", r"\1 \2", texto)


        # 2. NORMALIZACIÓN DEL LEGAJO

        texto = re.sub(
            r"(legajo número)\s+(\d{5})",
            lambda m: (
                f"{m.group(1)} "
                f"{int(m.group(2)):,}".replace(",", ".")
            ),
            texto,
            flags=re.IGNORECASE
        )

        # 13. 118 → 13.118
        texto = re.sub(
            r"(\d+)\.\s+(\d+)",
            r"\1.\2",
            texto
        )

        # 3. MAYÚSCULA INICIAL

        if texto:
            texto = texto[0].upper() + texto[1:]

        return texto