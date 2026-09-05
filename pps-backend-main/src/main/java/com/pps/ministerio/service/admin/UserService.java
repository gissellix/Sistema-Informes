package com.pps.ministerio.service.admin;

import com.pps.ministerio.dto.UsuarioDTO;
import com.pps.ministerio.dto.admin.CrearUsuarioRequest;
import com.pps.ministerio.dto.admin.ModificarUsuarioDTO;
import com.pps.ministerio.dto.admin.PersonalDTO;
import com.pps.ministerio.dto.admin.RestablecerContrasenaDTO;
import com.pps.ministerio.model.Personal;
import com.pps.ministerio.model.Role;
import com.pps.ministerio.model.UserSec;
import com.pps.ministerio.repository.IPersonalRepository;
import com.pps.ministerio.repository.admin.IRoleRepository;
import com.pps.ministerio.repository.admin.IUserRepository;
import com.pps.ministerio.specification.UserSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserService implements IUserService{

    @Autowired
    private IUserRepository iUserRepository;

    @Autowired
    private IPersonalRepository iPersonalRepository;

    @Autowired
    private IRoleService iRoleService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<UserSec> findAll() {
        return iUserRepository.findAll();
    }

    @Override
    public Optional<UserSec> findById(Long id) {
        return iUserRepository.findById(id);
    }

    @Override
    public PersonalDTO traerUnPersonal(String legajo) {
        Personal personal = iPersonalRepository.findByLegajo(legajo)
                .orElseThrow(() -> new RuntimeException("El personal con ese legajo no existe"));

        PersonalDTO personalDTO = new PersonalDTO();
        personalDTO.setIdPersonal(personal.getId());
        personalDTO.setLegajo(personal.getLegajo());
        personalDTO.setNombreApellido(
                personal.getNombre() + " " + personal.getApellido()
        );
        personalDTO.setJerarquia(personal.getJerarquia());
        personalDTO.setUnidadRegional(personal.getUnidad_regional_nombre());

        return personalDTO;
    }

    @Override
    public UserSec save(UserSec userSec) {
        Personal personal = iPersonalRepository.findByLegajo(userSec.getUsername())
                .orElseThrow(() -> new RuntimeException("El personal con ese legajo no existe"));

        if (personal.getUserSec() != null){
            throw new RuntimeException("El personal ya tiene una cuenta");
        }
        userSec.setPersonal(personal);
        personal.setUserSec(userSec);

        userSec.setEnabled(true);
        userSec.setAccountNotExpired(true);
        userSec.setAccountNotLocked(true);
        userSec.setCredentialNotExpired(true);
        userSec.setIntentosFallidos(0);

        return iUserRepository.save(userSec);
    }

    @Override
    public UsuarioDTO crearUsuario(CrearUsuarioRequest request) {
        // Buscar el personal por legajo
        Personal personal = iPersonalRepository.findByLegajo(request.getLegajo())
                .orElseThrow(() -> new RuntimeException("El personal con ese legajo no existe"));

        // Verificar que no tenga una cuenta
        if (personal.getUserSec() != null) {
            throw new RuntimeException("El personal ya tiene una cuenta de usuario");
        }

        // Buscar el rol
        Role role = iRoleService.findByRole(request.getRol())
                .orElseThrow(() -> new RuntimeException("NO SE ENCONTRO EL ROL: [" + request.getRol() + "]"));

        // Crear UserSec
        UserSec userSec = new UserSec();
        userSec.setUsername(personal.getLegajo());

        // Encriptar contraseña
        userSec.setPassword(
                encriptPassword(request.getPassword())
        );

        // Asignar rol
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        userSec.setRolesList(roles);

        // Relacionar Personal y UserSec
        userSec.setPersonal(personal);
        personal.setUserSec(userSec);

        // Configurar estado de la cuenta
        userSec.setEnabled(true);
        userSec.setAccountNotExpired(true);
        userSec.setAccountNotLocked(true);
        userSec.setCredentialNotExpired(true);
        userSec.setIntentosFallidos(0);

        // Guardar en BD
        UserSec guardado = iUserRepository.save(userSec);

        // Crear DTO de respuesta
        UsuarioDTO dto = new UsuarioDTO();

        dto.setIdUsuario(guardado.getId());
        dto.setLegajo(guardado.getUsername());
        dto.setNombre(personal.getNombre() + " " + personal.getApellido());
        dto.setRol(role.getRole());
        dto.setUnidadRegional(personal.getUnidad_regional_nombre());
        dto.setActivo(guardado.isEnabled());
        dto.setBloqueado(!guardado.isAccountNotLocked());

        return dto;
    }

    @Override
    public void deleteById(Long id) {
        iUserRepository.deleteById(id);
    }

    @Override
    public UserSec restablecerContrasena(Long idUsuario, RestablecerContrasenaDTO dto) {
        UserSec userSec = iUserRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        userSec.setPassword(encriptPassword(dto.getNuevaContrasena()));
        return iUserRepository.save(userSec);
    }

    @Override
    public String encriptPassword(String password) {
        return passwordEncoder.encode(password);
    }

    @Override
    public List<UsuarioDTO> buscarUsuarios(String legajo, Long idRol) {
        List<UserSec> usuarios = iUserRepository.findAll(
                UserSpecification.buscarUsuarios(legajo, idRol));

        List<UsuarioDTO> lista = new ArrayList<>();

        for (UserSec usuario : usuarios) {
            UsuarioDTO dto = new UsuarioDTO();
            dto.setIdUsuario(usuario.getId());
            dto.setLegajo(usuario.getUsername());
            dto.setNombre(usuario.getPersonal().getNombre() + " " +
                    usuario.getPersonal().getApellido());
            Role rol = usuario.getRolesList().iterator().next();
            dto.setRol(rol.getRole());
            dto.setUnidadRegional(usuario.getPersonal().getUnidad_regional_nombre());
            dto.setActivo(usuario.isEnabled());
            dto.setBloqueado(!usuario.isAccountNotLocked());
            lista.add(dto);
        }

        return lista;
    }

    @Override
    public List<PersonalDTO> obtenerUsuariosBloqueados() {
        List<UserSec> usuarios = iUserRepository.findByAccountNotLockedFalse();

        List<PersonalDTO> lista = new ArrayList<>();

        for (UserSec usuario : usuarios) {
            PersonalDTO dto = new PersonalDTO();
            dto.setIdPersonal(usuario.getId());
            Personal personal = usuario.getPersonal();
            dto.setNombreApellido(personal.getNombre() + " " + personal.getApellido());
            dto.setRol(usuario.getRolesList().iterator().next().getRole());
            lista.add(dto);
        }
        return lista;
    }

    @Override
    public void desbloquearUsuario(Long idUsuario) {
        UserSec user = iUserRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        user.setAccountNotLocked(true);
        user.setIntentosFallidos(0);
        iUserRepository.save(user);
    }

    @Override
    public UsuarioDTO cambiarEstadoUsuario(String legajo, boolean habilitado) {
        UserSec user = iUserRepository
                .findUserEntityByUsername(legajo)
                .orElseThrow(() -> new RuntimeException("No existe un usuario con el legajo: " + legajo));

        user.setEnabled(habilitado);
        UserSec guardado = iUserRepository.save(user);
        Personal personal = guardado.getPersonal();
        Role role = guardado.getRolesList().iterator().next();

        UsuarioDTO dto = new UsuarioDTO();

        dto.setIdUsuario(guardado.getId());
        dto.setLegajo(guardado.getUsername());
        dto.setNombre(personal.getNombre() + " " + personal.getApellido());
        dto.setRol(role.getRole());
        dto.setUnidadRegional(personal.getUnidad_regional_nombre());
        dto.setActivo(guardado.isEnabled());
        dto.setBloqueado(!guardado.isAccountNotLocked());

        return dto;
    }

    @Override
    public UsuarioDTO cambiarRolUsuario(Long idUsuario, String rol) {
        UserSec userSec = iUserRepository
                .findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Role role = iRoleService
                .findByRole(rol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + rol));

        userSec.getRolesList().clear();
        userSec.getRolesList().add(role);

        UserSec guardado = iUserRepository.save(userSec);
        Personal personal = guardado.getPersonal();
        UsuarioDTO dto = new UsuarioDTO();

        dto.setIdUsuario(guardado.getId());
        dto.setLegajo(guardado.getUsername());
        dto.setNombre(personal.getNombre() + " " + personal.getApellido());
        dto.setRol(role.getRole());
        dto.setUnidadRegional(personal.getUnidad_regional_nombre());
        dto.setActivo(guardado.isEnabled());
        dto.setBloqueado(!guardado.isAccountNotLocked());

        return dto;
    }
}
