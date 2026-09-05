package com.pps.ministerio.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioDTO {
    private Long idUsuario;
    private String legajo;
    private String nombre;
    private String rol;
    private String unidadRegional;
    private Boolean activo;
    private Boolean bloqueado;
}

