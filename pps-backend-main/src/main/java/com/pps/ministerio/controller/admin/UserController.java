package com.pps.ministerio.controller.admin;

import com.pps.ministerio.dto.UsuarioDTO;
import com.pps.ministerio.dto.admin.CrearUsuarioRequest;
import com.pps.ministerio.dto.admin.ModificarUsuarioDTO;
import com.pps.ministerio.dto.admin.PersonalDTO;
import com.pps.ministerio.dto.admin.RestablecerContrasenaDTO;
import com.pps.ministerio.model.Personal;
import com.pps.ministerio.model.Role;
import com.pps.ministerio.model.UserSec;
import com.pps.ministerio.repository.IPersonalRepository;
import com.pps.ministerio.service.admin.IRoleService;
import com.pps.ministerio.service.admin.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/user")
//@PreAuthorize("hasRole('ADMINISTRATIVO')")
public class UserController {

    @Autowired
    private IUserService iUserSecService;

    @Autowired
    private IRoleService iRoleService;

    @Autowired
    private IPersonalRepository iPersonalRepository;

    @PostMapping
    public ResponseEntity<UsuarioDTO> crearUsuario(@RequestBody CrearUsuarioRequest request) {
        return ResponseEntity.ok(iUserSecService.crearUsuario(request));
    }

    @GetMapping("/traer-personal/{legajo}")
    public ResponseEntity<PersonalDTO> traerPersonal(@PathVariable String legajo) {
        return ResponseEntity.ok(iUserSecService.traerUnPersonal(legajo));
    }

    @GetMapping("/obtener-usuarios")
    public ResponseEntity<List<UsuarioDTO>> obtenerUsuarios(@RequestParam(required = false) String legajo,
                                                            @RequestParam(required = false) Long idRol) {
        return ResponseEntity.ok(iUserSecService.buscarUsuarios(legajo, idRol));
    }

    @GetMapping("/bloqueados")
    public ResponseEntity<List<PersonalDTO>> obtenerUsuariosBloqueados() {
        return ResponseEntity.ok(iUserSecService.obtenerUsuariosBloqueados());
    }

    @PutMapping("/restablecer-contrasena/{idUsuario}")
    public ResponseEntity<String> restablecerContrasena(@PathVariable Long idUsuario,
                                                        @RequestBody RestablecerContrasenaDTO dto) {
        iUserSecService.restablecerContrasena(idUsuario, dto);
        return ResponseEntity.ok("Contraseña restablecida correctamente");
    }

    @PutMapping("/desbloquear/{idUsuario}")
    public ResponseEntity<String> desbloquearUsuario(@PathVariable Long idUsuario) {
        iUserSecService.desbloquearUsuario(idUsuario);
        return ResponseEntity.ok("Usuario desbloqueado correctamente");
    }

    @PutMapping("/estado/{legajo}")
    public ResponseEntity<UsuarioDTO> cambiarEstadoUsuario(@PathVariable String legajo,
                                                           @RequestParam boolean habilitado) {
        return ResponseEntity.ok(iUserSecService.cambiarEstadoUsuario(legajo, habilitado));
    }

    @PutMapping("/rol/{idUsuario}")
    public ResponseEntity<UsuarioDTO> cambiarRolUsuario(@PathVariable Long idUsuario,
                                                        @RequestParam String rol) {
        return ResponseEntity.ok(iUserSecService.cambiarRolUsuario(idUsuario, rol));
    }
}
