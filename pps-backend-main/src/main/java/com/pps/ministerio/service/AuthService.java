package com.pps.ministerio.service;

import com.pps.ministerio.model.EstadoTurno;
import com.pps.ministerio.model.Turno;
import com.pps.ministerio.model.UserSec;
import com.pps.ministerio.repository.jefe.ITurnoRepository;
import com.pps.ministerio.repository.admin.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private IUserRepository iUserRepository;

    @Autowired
    private ITurnoRepository iTurnoRepository;

    public UserSec obtenerUsuarioAutenticado(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        return iUserRepository.findUserEntityByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public Turno obtenerTurnoActivo(){
        UserSec userSec = obtenerUsuarioAutenticado();
        return iTurnoRepository.findByUserSecAndEstado(userSec, EstadoTurno.ACTIVO)
                .orElseThrow(() -> new RuntimeException("No existe un turno activo"));
    }
}
