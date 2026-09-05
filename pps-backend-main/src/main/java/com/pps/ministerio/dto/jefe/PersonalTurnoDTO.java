package com.pps.ministerio.dto.jefe;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PersonalTurnoDTO {
    private Long idPersonalTurno;
    private String legajo;
    private String nombre;
    private String apellido;
    private String jerarquia;
}
