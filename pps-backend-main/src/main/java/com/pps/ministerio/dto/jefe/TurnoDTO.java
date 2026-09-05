package com.pps.ministerio.dto.jefe;

import com.pps.ministerio.model.EstadoTurno;
import com.pps.ministerio.model.Turno;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TurnoDTO {
    private Long idTurno;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private EstadoTurno estado;

    public TurnoDTO(Turno turno) {
        this.idTurno = turno.getIdTurno();
        this.fechaInicio = turno.getFechaInicio();
        this.fechaFin = turno.getFechaFin();
        this.estado = turno.getEstado();
    }
}
