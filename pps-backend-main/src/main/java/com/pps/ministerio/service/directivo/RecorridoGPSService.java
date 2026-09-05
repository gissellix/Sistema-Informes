package com.pps.ministerio.service.directivo;

import com.pps.ministerio.dto.directivo.RecorridoGPSRequestDTO;
import com.pps.ministerio.model.RecorridoGPS;
import com.pps.ministerio.model.Turno;
import com.pps.ministerio.repository.directivo.IRecorridoGPSRepository;
import com.pps.ministerio.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class RecorridoGPSService implements IRecorridoGPSService{

    @Autowired
    private IRecorridoGPSRepository recorridoGPSRepository;

    @Autowired
    private AuthService authService;

    @Override
    public void guardarPunto(RecorridoGPSRequestDTO dto) {
        Turno turno = authService.obtenerTurnoActivo();
        RecorridoGPS recorrido = new RecorridoGPS();
        recorrido.setLatitud(dto.getLatitud());
        recorrido.setLongitud(dto.getLongitud());
        recorrido.setFechaHora(LocalDateTime.now());
        recorrido.setTurno(turno);

        recorridoGPSRepository.save(recorrido);
    }
}
