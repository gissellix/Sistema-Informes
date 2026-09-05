package com.pps.ministerio.repository.jefe;

import com.pps.ministerio.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IChoferMovilRepository extends JpaRepository<ChoferMovil, Long> {
    Optional<ChoferMovil> findByTurnoAndPersonal(Turno turno, Personal personal);
    Optional<ChoferMovil> findByTurnoAndMovil(Turno turno, Movil movil);
    Optional<ChoferMovil> findByTurno(Turno turno);
}
