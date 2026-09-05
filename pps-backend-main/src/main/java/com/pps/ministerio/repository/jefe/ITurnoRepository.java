package com.pps.ministerio.repository.jefe;

import com.pps.ministerio.model.EstadoTurno;
import com.pps.ministerio.model.Turno;
import com.pps.ministerio.model.UserSec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ITurnoRepository extends JpaRepository<Turno, Long> {
    Optional<Turno> findByUserSecAndEstado(UserSec userSec, EstadoTurno estadoTurno);
}
