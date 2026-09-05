package com.pps.ministerio.service.admin;

import com.pps.ministerio.model.Role;
import com.pps.ministerio.repository.admin.IRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService implements IRoleService{
    @Autowired
    private IRoleRepository iRoleRepository;

    @Override
    public List<Role> findAll() {
        return iRoleRepository.findAll();
    }

    @Override
    public Optional<Role> findById(Long id) {
        return iRoleRepository.findById(id);
    }

    @Override
    public Role save(Role role) {
        return iRoleRepository.save(role);
    }

    @Override
    public void deleteById(Long id) {
        iRoleRepository.deleteById(id);
    }

    @Override
    public Role update(Role role) {
        return iRoleRepository.save(role);
    }

    @Override
    public Optional<Role> findByRole(String role) {
        return iRoleRepository.findByRole(role);
    }
}
