package com.pps.ministerio.dto.jefe;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class NovedadDTO {
    private Long idNovedad;
    private String tipo;
    private String descripcion;
    private LocalDateTime fechaHora;
    private Double latitud;
    private Double longitud;
}
