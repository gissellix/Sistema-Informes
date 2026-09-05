package com.pps.ministerio.dto.directivo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RecorridoGPSRequestDTO {
    private Double latitud;
    private Double longitud;
}
