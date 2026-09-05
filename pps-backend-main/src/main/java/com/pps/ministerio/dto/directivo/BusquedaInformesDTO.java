package com.pps.ministerio.dto.directivo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BusquedaInformesDTO {
    private Long idInforme;
    private LocalDateTime fechaGeneracion;
    private String nombreApellido;
    private String legajo;
}
