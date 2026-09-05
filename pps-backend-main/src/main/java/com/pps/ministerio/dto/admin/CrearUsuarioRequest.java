package com.pps.ministerio.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CrearUsuarioRequest {
    private String legajo;
    private String password;
    private String rol;
}
//TODOS LOS DTO, MODEL TIENEN SU GETTER, SETTER, CONSTRUCTOR, ETC.. MEDIANTE LOMBOOK
