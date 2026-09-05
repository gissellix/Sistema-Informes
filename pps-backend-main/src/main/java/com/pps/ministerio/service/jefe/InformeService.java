package com.pps.ministerio.service.jefe;

import com.pps.ministerio.dto.InformeDTO;
import com.pps.ministerio.dto.directivo.PuntosGpsDTO;
import com.pps.ministerio.dto.jefe.MisInformesDTO;
import com.pps.ministerio.dto.jefe.NovedadDTO;
import com.pps.ministerio.dto.jefe.PersonalTurnoDTO;
import com.pps.ministerio.model.*;
import com.pps.ministerio.repository.*;
import com.pps.ministerio.repository.jefe.*;
import com.pps.ministerio.repository.directivo.IRecorridoGPSRepository;
import com.pps.ministerio.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class InformeService implements IInformeService{

    @Autowired
    private AuthService authService;

    @Autowired
    private IPersonalRepository iPersonalRepository;

    @Autowired
    private IChoferMovilRepository iChoferMovilRepository;

    @Autowired
    private IPersonalTurnoRepository iPersonalTurnoRepository;

    @Autowired
    private IInformeRepository iInformeRepository;

    @Autowired
    private ITurnoRepository iTurnoRepository;

    @Autowired
    private INovedadRepository iNovedadRepository;

    @Autowired
    private IRecorridoGPSRepository iRecorridoGPSRepository;

    @Override
    public InformeDTO construirInformeDTO(Turno turno) {
        InformeDTO informeDTO = new InformeDTO();

        Personal personal = iPersonalRepository.findByLegajo(turno.getUserSec().getUsername())
                .orElseThrow(() -> new RuntimeException("No se encontró el personal del turno"));

        informeDTO.setFechaInicio(turno.getFechaInicio());
        informeDTO.setFechaFin(turno.getFechaFin());
        informeDTO.setUnidadRegional(personal.getUnidad_regional_nombre());
        informeDTO.setRolJefe("Comisario de servicio");
        informeDTO.setJerarquiaJefe(personal.getJerarquia());
        informeDTO.setLegajoJefe(personal.getLegajo());
        informeDTO.setNombreApellidoJefe(personal.getNombre() + " " + personal.getApellido());

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

        Optional<ChoferMovil> choferMovilOptional =
                iChoferMovilRepository.findByTurno(turno);

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

        List<Novedad> novedades = iNovedadRepository.findByTurno(turno);

        List<NovedadDTO> novedadesDTO = novedades.stream().map(n -> {NovedadDTO dto = new NovedadDTO();
                            dto.setIdNovedad(n.getIdNovedad());
                            dto.setTipo(n.getTipo());
                            dto.setDescripcion(n.getDescripcion());
                            dto.setFechaHora(n.getFechaHora());
                            dto.setLatitud(n.getLatitud());
                            dto.setLongitud(n.getLongitud());
                            return dto;}).toList();
        informeDTO.setNovedades(novedadesDTO);

        List<RecorridoGPS> recorridos = iRecorridoGPSRepository.findByTurno(turno);
        List<PuntosGpsDTO> recorridosDTO = recorridos.stream().map(r -> {
            PuntosGpsDTO dto = new PuntosGpsDTO();
            dto.setLat(r.getLatitud());
            dto.setLng(r.getLongitud());
            dto.setTimestamp(r.getFechaHora());
            return dto;
        }).toList();
        informeDTO.setRecorridoGps(recorridosDTO);

        return informeDTO;
    }

    public InformeDTO obtenerVistaPrevia(){
        Turno turno = authService.obtenerTurnoActivo();
        return construirInformeDTO(turno);
    }

    @Override
    public void guardarFinalizar(String textoInforme) {
        Turno turno = authService.obtenerTurnoActivo();
        Informe informe = new Informe();
        informe.setFechaGeneracion(LocalDateTime.now());
        informe.setTurno(turno);
        informe.setTextoInforme(textoInforme);
        iInformeRepository.save(informe);
        turno.setEstado(EstadoTurno.FINALIZADO);
        turno.setFechaFin(LocalDateTime.now());
        iTurnoRepository.save(turno);
    }

    @Override
    public List<MisInformesDTO> obtenerMisInformes() {
        UserSec userSec = authService.obtenerUsuarioAutenticado();

        List<Informe> informeList = iInformeRepository.findByTurnoUserSec(userSec);

        List<MisInformesDTO> misInformesDTOList = new ArrayList<>();

        for (Informe informe: informeList){
            MisInformesDTO misInformesDTO = new MisInformesDTO();
            misInformesDTO.setIdInformeDTO(informe.getIdInforme());
            misInformesDTO.setFechaGeneracion(informe.getFechaGeneracion());
            misInformesDTO.setFechaInicio(informe.getTurno().getFechaInicio());
            misInformesDTO.setFechaFin(informe.getTurno().getFechaFin());

            misInformesDTOList.add(misInformesDTO);
        }
        return misInformesDTOList;
    }

    @Override
    public InformeDTO descargarInforme(Long id) {
        UserSec userSec = authService.obtenerUsuarioAutenticado();

        Informe informe = iInformeRepository.findByIdInformeAndTurnoUserSec(id, userSec)
                .orElseThrow(() -> new RuntimeException("El informe no existe"));

        return construirInformeDTO(informe.getTurno());
    }
}

