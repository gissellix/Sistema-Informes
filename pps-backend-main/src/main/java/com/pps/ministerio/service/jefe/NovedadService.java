package com.pps.ministerio.service.jefe;

import com.pps.ministerio.dto.jefe.NovedadDTO;
import com.pps.ministerio.model.Novedad;
import com.pps.ministerio.model.Turno;
import com.pps.ministerio.repository.jefe.INovedadRepository;
import com.pps.ministerio.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NovedadService implements INovedadService{

    @Autowired
    private INovedadRepository iNovedadRepository;

    @Autowired
    private AuthService authService;


    @Override
    public NovedadDTO registrarNovedad(NovedadDTO dto) {

        Turno turno = authService.obtenerTurnoActivo();

        Novedad novedad = new Novedad();
        novedad.setTipo(dto.getTipo());
        novedad.setDescripcion(dto.getDescripcion());
        novedad.setLatitud(dto.getLatitud());
        novedad.setLongitud(dto.getLongitud());
        novedad.setFechaHora(LocalDateTime.now());
        novedad.setTurno(turno);

        Novedad guardada = iNovedadRepository.save(novedad);

        NovedadDTO respuesta = new NovedadDTO();
        respuesta.setIdNovedad(guardada.getIdNovedad());
        respuesta.setTipo(guardada.getTipo());
        respuesta.setDescripcion(guardada.getDescripcion());
        respuesta.setFechaHora(guardada.getFechaHora());
        respuesta.setLatitud(guardada.getLatitud());
        respuesta.setLongitud(guardada.getLongitud());

        return respuesta;
    }

    @Override
    public List<NovedadDTO> obtenerNovedadesTurno() {

        Turno turno = authService.obtenerTurnoActivo();

        return iNovedadRepository.findByTurno(turno)
                .stream()
                .map(novedad -> {
                    NovedadDTO dto = new NovedadDTO();
                    dto.setIdNovedad(novedad.getIdNovedad());
                    dto.setTipo(novedad.getTipo());
                    dto.setDescripcion(novedad.getDescripcion());
                    dto.setFechaHora(novedad.getFechaHora());
                    dto.setLatitud(novedad.getLatitud());
                    dto.setLongitud(novedad.getLongitud());
                    return dto;

                }).toList();
    }

    @Override
    public void eliminarNovedad(Long id) {
        Turno turno = authService.obtenerTurnoActivo();
        Novedad novedad = iNovedadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe la novedad"));

        if (!novedad.getTurno().getIdTurno().equals(turno.getIdTurno())) {
            throw new RuntimeException("La novedad no pertenece al turno activo");
        }
        iNovedadRepository.delete(novedad);
    }
}
