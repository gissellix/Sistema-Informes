package com.pps.ministerio.specification;

import com.pps.ministerio.model.Informe;
import com.pps.ministerio.model.Personal;
import com.pps.ministerio.model.Turno;
import com.pps.ministerio.model.UserSec;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


public class InformeSpecification {
    public static Specification<Informe> buscarInformes(LocalDateTime fechaDesde,
                                                        LocalDateTime fechaHasta,
                                                        String unidadRegional,
                                                        String legajo) {
        return (root, query, cb) -> {
            Join<Informe, Turno> turno = root.join("turno");
            Join<Turno, UserSec> user = turno.join("userSec");
            Join<UserSec, Personal> personal = user.join("personal");

            List<Predicate> predicates = new ArrayList<>();

            if (legajo != null && !legajo.isBlank()) {
                predicates.add(cb.equal(personal.get("legajo"), legajo));
            }

            if (unidadRegional != null && !unidadRegional.isBlank()) {
                predicates.add(cb.equal(personal.get("unidad_regional_nombre"), unidadRegional));
            }

            if (fechaDesde != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fechaGeneracion"), fechaDesde));
            }

            if (fechaHasta != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("fechaGeneracion"), fechaHasta));
            }

            query.orderBy(cb.desc(root.get("fechaGeneracion")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
