package com.pps.ministerio.service.jefe;

import com.pps.ministerio.dto.InformeDTO;
import com.pps.ministerio.dto.jefe.MisInformesDTO;
import com.pps.ministerio.model.Turno;

import java.util.List;

public interface IInformeService {

    InformeDTO construirInformeDTO(Turno turno);

    InformeDTO obtenerVistaPrevia();

    void guardarFinalizar(String textoInforme);

    List<MisInformesDTO> obtenerMisInformes();

    InformeDTO descargarInforme(Long id);

}
