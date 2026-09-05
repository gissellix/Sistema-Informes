package com.pps.ministerio.service.directivo;

import com.pps.ministerio.dto.InformeDTO;
import com.pps.ministerio.dto.directivo.BusquedaInformesDTO;
import com.pps.ministerio.dto.directivo.PuntosGpsDTO;
import com.pps.ministerio.dto.jefe.NovedadDTO;
import com.pps.ministerio.dto.jefe.PersonalTurnoDTO;
import com.pps.ministerio.model.*;
import com.pps.ministerio.repository.IPersonalRepository;
import com.pps.ministerio.repository.directivo.IRecorridoGPSRepository;
import com.pps.ministerio.repository.jefe.IChoferMovilRepository;
import com.pps.ministerio.repository.jefe.IInformeRepository;
import com.pps.ministerio.repository.jefe.INovedadRepository;
import com.pps.ministerio.repository.jefe.IPersonalTurnoRepository;
import com.pps.ministerio.specification.InformeSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class InformesServices implements IInformesService {

    @Autowired
    private IInformeRepository informeRepository;

    @Autowired
    private IPersonalRepository iPersonalRepository;

    @Autowired
    private IChoferMovilRepository iChoferMovilRepository;

    @Autowired
    private IPersonalTurnoRepository iPersonalTurnoRepository;

    @Autowired
    private INovedadRepository iNovedadRepository;

    @Autowired
    private IRecorridoGPSRepository iRecorridoGPSRepository;

    @Override
    public List<BusquedaInformesDTO> busquedaInformes(LocalDate fechaDesde, LocalDate fechaHasta,
                                                      String unidadRegional,String legajoJefe) {

        List<Informe> informesList = informeRepository.findAll(
                InformeSpecification.buscarInformes(
                        fechaDesde == null ? null : fechaDesde.atStartOfDay(),
                        fechaHasta == null ? null : fechaHasta.atTime(23,59,59),
                        unidadRegional,
                        legajoJefe));

        List<BusquedaInformesDTO> busquedaInformesDTOList = new ArrayList<>();
        for (Informe informe : informesList){
            Personal jefe = informe.getTurno().getUserSec().getPersonal();
            BusquedaInformesDTO dto = new BusquedaInformesDTO();
            dto.setIdInforme(informe.getIdInforme());
            dto.setFechaGeneracion(informe.getFechaGeneracion());
            dto.setNombreApellido(jefe.getNombre() + " " + jefe.getApellido());
            dto.setLegajo(jefe.getLegajo());
            busquedaInformesDTOList.add(dto);
        }
        return busquedaInformesDTOList;
    }

    @Override
    public InformeDTO construirInformeDTO(Informe informe) {
        Turno turno = informe.getTurno();
        InformeDTO informeDTO = new InformeDTO();
        Personal personal = iPersonalRepository
                .findByLegajo(turno.getUserSec().getUsername())
                .orElseThrow();

        informeDTO.setIdInforme(informe.getIdInforme());
        informeDTO.setFechaInicio(turno.getFechaInicio());
        informeDTO.setFechaFin(turno.getFechaFin());
        informeDTO.setUnidadRegional(personal.getUnidad_regional_nombre());
        informeDTO.setRolJefe("Comisario de servicio");
        informeDTO.setJerarquiaJefe(personal.getJerarquia());
        informeDTO.setLegajoJefe(personal.getLegajo());
        informeDTO.setNombreApellidoJefe(personal.getNombre() + " " + personal.getApellido());

        Optional<ChoferMovil> choferMovilOptional = iChoferMovilRepository.findByTurno(turno);

        if (choferMovilOptional.isPresent()) {
            ChoferMovil choferMovil = choferMovilOptional.get();
            Personal chofer = choferMovil.getPersonal();
            informeDTO.setRolChofer("Chofer");
            informeDTO.setJerarquiaChofer(chofer.getJerarquia());
            informeDTO.setLegajoChofer(chofer.getLegajo());
            informeDTO.setNombreApellidoChofer(chofer.getNombre() + " " + chofer.getApellido());
            informeDTO.setNumeroMovil(choferMovil.getMovil().getNumeroMovil());
            informeDTO.setPatente(choferMovil.getMovil().getPatente());
        }

        List<PersonalTurnoDTO> personalTurnoDTOList =
                turno.getPersonalTurnoList()
                        .stream()
                        .map(pt -> {
                            PersonalTurnoDTO dto = new PersonalTurnoDTO();
                            dto.setIdPersonalTurno(pt.getIdPersonalTurno());
                            dto.setLegajo(pt.getPersonal().getLegajo());
                            dto.setNombre(pt.getPersonal().getNombre());
                            dto.setApellido(pt.getPersonal().getApellido());
                            dto.setJerarquia(pt.getPersonal().getJerarquia());
                            return dto;
                        }).toList();

        informeDTO.setPersonalTurnoList(personalTurnoDTOList);

        List<Novedad> novedades = iNovedadRepository.findByTurno(turno);

        List<NovedadDTO> novedadesDTO = novedades.stream().map(n -> {
                            NovedadDTO dto = new NovedadDTO();
                            dto.setIdNovedad(n.getIdNovedad());
                            dto.setTipo(n.getTipo());
                            dto.setDescripcion(n.getDescripcion());
                            dto.setFechaHora(n.getFechaHora());
                            dto.setLatitud(n.getLatitud());
                            dto.setLongitud(n.getLongitud());
                            return dto;
        }).toList();

        informeDTO.setNovedades(novedadesDTO);
        List<RecorridoGPS> recorridoGPSList = iRecorridoGPSRepository.findByTurno(turno);
        List<PuntosGpsDTO> recorridoGpsDTO = recorridoGPSList.stream().map(r -> {
                            PuntosGpsDTO dto = new PuntosGpsDTO();
                            dto.setLat(r.getLatitud());
                            dto.setLng(r.getLongitud());
                            dto.setTimestamp(r.getFechaHora());
                            return dto;
                        }).toList();

        informeDTO.setRecorridoGps(recorridoGpsDTO);
        return informeDTO;
    }

    @Override
    public InformeDTO obtenerInforme(Long idInforme) {
        Informe informe = informeRepository.findById(idInforme)
                .orElseThrow(() -> new RuntimeException("El informe no existe"));
        return construirInformeDTO(informe);
    }
}
