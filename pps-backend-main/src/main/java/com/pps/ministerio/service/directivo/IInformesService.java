package com.pps.ministerio.service.directivo;

import com.pps.ministerio.dto.InformeDTO;
import com.pps.ministerio.dto.directivo.BusquedaInformesDTO;
import com.pps.ministerio.model.Informe;
import com.pps.ministerio.model.Turno;

import java.time.LocalDate;
import java.util.List;

public interface IInformesService {

    List<BusquedaInformesDTO> busquedaInformes(LocalDate fechaDesde, LocalDate fechaHasta,
                                               String unidadRegional,String legajoJefe);

    InformeDTO construirInformeDTO(Informe informe);

    InformeDTO obtenerInforme(Long idInforme);

}
