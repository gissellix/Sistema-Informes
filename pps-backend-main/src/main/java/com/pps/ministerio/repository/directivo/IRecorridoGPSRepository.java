package com.pps.ministerio.repository.directivo;

import com.pps.ministerio.model.RecorridoGPS;
import com.pps.ministerio.model.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IRecorridoGPSRepository extends JpaRepository<RecorridoGPS, Long> {
    List<RecorridoGPS> findByTurno(Turno turno);
}
