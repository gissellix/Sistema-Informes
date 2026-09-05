package com.pps.ministerio.service.admin;

import com.pps.ministerio.dto.UsuarioDTO;
import com.pps.ministerio.dto.admin.CrearUsuarioRequest;
import com.pps.ministerio.dto.admin.ModificarUsuarioDTO;
import com.pps.ministerio.dto.admin.PersonalDTO;
import com.pps.ministerio.dto.admin.RestablecerContrasenaDTO;
import com.pps.ministerio.model.UserSec;

import java.util.List;
import java.util.Optional;

public interface IUserService {
    List<UserSec> findAll();
    Optional<UserSec> findById(Long id);
    PersonalDTO traerUnPersonal(String legajo);
    UserSec save(UserSec userSec);
    UsuarioDTO crearUsuario(CrearUsuarioRequest request);
    void deleteById(Long id);
    //UserSec modificarUsuario(Long idUsuario, ModificarUsuarioDTO modificarUsuarioDTO);
    //prueba
    //void restablecerContrasena(Long idUsuario, RestablecerContrasenaDTO restablecerContrasenaDTO);
    UserSec restablecerContrasena(Long idUsuario, RestablecerContrasenaDTO restablecerContrasenaDTO);
    public String encriptPassword(String password);
    List<UsuarioDTO> buscarUsuarios(String legajo, Long idRol);
    List<PersonalDTO> obtenerUsuariosBloqueados();
    void desbloquearUsuario(Long idUsuario);
    UsuarioDTO cambiarEstadoUsuario(String legajo, boolean habilitado);
    UsuarioDTO cambiarRolUsuario(Long idUsuario, String rol);
}
