package com.pps.ministerio.service.directivo;

import com.pps.ministerio.dto.directivo.RecorridoGPSRequestDTO;
import com.pps.ministerio.model.RecorridoGPS;
import com.pps.ministerio.model.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


public interface IRecorridoGPSService {
    void guardarPunto(RecorridoGPSRequestDTO dto);
}
