package com.pps.ministerio.dto.jefe;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChoferMovilDTO {
    private Long idChoferMovil;
    private String legajo;
    private String nombre;
    private String apellido;
    private String jerarquia;
    private String numeroMovil;
    private String patente;
}