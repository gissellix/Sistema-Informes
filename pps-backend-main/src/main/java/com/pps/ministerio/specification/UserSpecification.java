package com.pps.ministerio.specification;

import com.pps.ministerio.model.Role;
import com.pps.ministerio.model.UserSec;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UserSpecification {
    public static Specification<UserSec> buscarUsuarios(String legajo, Long idRol) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (legajo != null && !legajo.isBlank()) {
                predicates.add(cb.equal(root.get("username"), legajo));
            }

            if (idRol != null) {
                Join<UserSec, Role> rol = root.join("rolesList");
                predicates.add(cb.equal(rol.get("id"), idRol));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
