package com.pps.ministerio.repository.jefe;

import com.pps.ministerio.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IPersonalTurnoRepository extends JpaRepository<PersonalTurno, Long> {
    Optional<PersonalTurno> findByTurnoAndPersonal(Turno turno, Personal personal);
    List<PersonalTurno> findAllByTurno(Turno turno);
}
