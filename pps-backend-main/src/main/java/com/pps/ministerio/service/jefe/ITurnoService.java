package com.pps.ministerio.service.jefe;

import com.pps.ministerio.model.Turno;

import javax.swing.text.html.Option;
import java.util.Optional;

public interface ITurnoService {

    Turno iniciarTurno();
    Turno obtenerTurnoActivo();
    //Optional<Turno> obtenerTurnoActivo();

}
