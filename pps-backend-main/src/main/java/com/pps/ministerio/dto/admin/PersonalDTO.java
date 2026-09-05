package com.pps.ministerio.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PersonalDTO {
    private Long idPersonal;
    private String legajo;
    private String nombreApellido;
    private String jerarquia;
    private String unidadRegional;
    private String rol;
    private Boolean habilitado;
}
