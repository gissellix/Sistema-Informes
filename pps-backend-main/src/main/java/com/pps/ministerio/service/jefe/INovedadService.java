package com.pps.ministerio.service.jefe;

import com.pps.ministerio.dto.jefe.NovedadDTO;

import java.util.List;

public interface INovedadService {
    NovedadDTO registrarNovedad(NovedadDTO dto);

    List<NovedadDTO> obtenerNovedadesTurno();

    void eliminarNovedad(Long id);
}
