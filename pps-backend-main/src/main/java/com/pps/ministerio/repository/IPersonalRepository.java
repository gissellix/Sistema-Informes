package com.pps.ministerio.repository;

import com.pps.ministerio.model.Personal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IPersonalRepository extends JpaRepository<Personal, Long> {
    Optional<Personal> findByLegajo(String legajo);
}
