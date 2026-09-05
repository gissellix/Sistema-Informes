package com.pps.ministerio.repository.jefe;

import com.pps.ministerio.model.Movil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IMovilRepository extends JpaRepository<Movil, Long> {
    Optional<Movil> findByNumeroMovil(String numeroMovil);
    Optional<Movil> findByPatente(String patente);
}
