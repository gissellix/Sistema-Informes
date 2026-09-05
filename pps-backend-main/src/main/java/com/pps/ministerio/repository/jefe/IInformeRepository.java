package com.pps.ministerio.repository.jefe;

import com.pps.ministerio.model.Informe;
import com.pps.ministerio.model.UserSec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IInformeRepository extends JpaRepository<Informe, Long>, JpaSpecificationExecutor {
    List<Informe> findByTurnoUserSec(UserSec userSec);
    Optional<Informe> findByIdInformeAndTurnoUserSec(Long idInforme, UserSec userSec);
}
