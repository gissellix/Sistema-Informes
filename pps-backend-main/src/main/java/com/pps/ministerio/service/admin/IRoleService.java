package com.pps.ministerio.service.admin;

import com.pps.ministerio.model.Role;

import java.util.List;
import java.util.Optional;

public interface IRoleService {
    List<Role> findAll();
    Optional<Role> findById(Long id);
    Role save(Role role);
    void deleteById(Long id);
    Role update(Role role);
    Optional<Role> findByRole(String role);
}
