package com.pps.ministerio.dto.audio;

import jakarta.annotation.security.DenyAll;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PersonalValidacionDTO {
    private String legajo;
    private String nombre;
    private String apellido;
    private String jerarquia;
    private boolean existeEnBD;
}
