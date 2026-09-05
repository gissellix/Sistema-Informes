package com.pps.ministerio.service.jefe;

import com.pps.ministerio.dto.jefe.PersonalTurnoDTO;
import com.pps.ministerio.model.PersonalTurno;

import java.util.List;

public interface IPersonalTurnoService {

    PersonalTurnoDTO asignarPersonal(String legajo);
    void eliminarPersonalTurno(String legajo);
    PersonalTurnoDTO buscarPersonal(String legajo);
    List<PersonalTurnoDTO> obtenerPersonalTurno();

}
