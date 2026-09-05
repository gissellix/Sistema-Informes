package com.pps.ministerio.dto;

import com.pps.ministerio.dto.directivo.PuntosGpsDTO;
import com.pps.ministerio.dto.jefe.NovedadDTO;
import com.pps.ministerio.dto.jefe.PersonalTurnoDTO;
import com.pps.ministerio.model.PersonalTurno;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InformeDTO {

    private Long idInforme;

    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String unidadRegional;

    private String rolJefe;
    private String jerarquiaJefe;
    private String legajoJefe;
    private String nombreApellidoJefe;

    private String rolChofer;
    private String jerarquiaChofer;
    private String legajoChofer;
    private String nombreApellidoChofer;

    private List<PersonalTurnoDTO> personalTurnoList;
    private String numeroMovil;
    private String patente;

    private List<NovedadDTO> novedades;

    private List<PuntosGpsDTO> recorridoGps;
}
