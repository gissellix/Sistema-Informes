package com.pps.ministerio.service.jefe;

import com.pps.ministerio.dto.jefe.ChoferMovilDTO;
import com.pps.ministerio.model.ChoferMovil;

public interface IChoferMovilService {

    ChoferMovilDTO buscarPersonal(String legajo);

    ChoferMovilDTO asignarChoferMovil(String legajo, String numeroMovil, String patente);

    void eliminarChoferMovil();

    ChoferMovilDTO obtenerChoferMovil();

}
