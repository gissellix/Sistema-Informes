package com.pps.ministerio.repository.jefe;

import com.pps.ministerio.model.Novedad;
import com.pps.ministerio.model.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface INovedadRepository extends JpaRepository<Novedad, Long> {
    List<Novedad> findByTurno(Turno turno);
}
