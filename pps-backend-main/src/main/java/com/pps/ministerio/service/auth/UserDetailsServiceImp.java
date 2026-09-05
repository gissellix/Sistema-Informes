package com.pps.ministerio.service.auth;

import com.pps.ministerio.dto.auth.AuthLoginRequestDTO;
import com.pps.ministerio.dto.auth.AuthResponseDTO;
import com.pps.ministerio.dto.UserResponseDTO;
import com.pps.ministerio.model.Personal;
import com.pps.ministerio.model.UserSec;
import com.pps.ministerio.repository.IPersonalRepository;
import com.pps.ministerio.repository.admin.IUserRepository;
import com.pps.ministerio.utils.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.DisabledException;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserDetailsServiceImp implements UserDetailsService {

    @Autowired
    private IUserRepository iUserRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private IPersonalRepository iPersonalRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserSec userSec = iUserRepository.findUserEntityByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario " + username + " no se encontro"));

        List<SimpleGrantedAuthority> authorityList = new ArrayList<>();

        userSec.getRolesList()
                .forEach(role -> authorityList.add(new SimpleGrantedAuthority(role.getRole())));

        userSec.getRolesList().forEach(role -> authorityList.add(new SimpleGrantedAuthority(role.getRole())));

        return new User(
                userSec.getUsername(),
                userSec.getPassword(),
                userSec.isEnabled(),
                userSec.isAccountNotExpired(),
                userSec.isCredentialNotExpired(),
                userSec.isAccountNotLocked(),
                authorityList);
    }

    public AuthResponseDTO loginUser(@Valid AuthLoginRequestDTO authLoginRequestDTO){
        String username = authLoginRequestDTO.username();
        String password = authLoginRequestDTO.password();

        Authentication authentication = this.authenticate(username, password);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String accesToken = jwtUtils.createToken(authentication);


        String rol = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No se encontró el rol"));

        Personal personal = iPersonalRepository.findByLegajo(username)
                .orElseThrow();

        UserResponseDTO user = new UserResponseDTO(
                personal.getLegajo(),
                personal.getNombre() + " " + personal.getApellido(),
                rol
        );

        AuthResponseDTO authResponseDTO = new AuthResponseDTO(accesToken, user);
        return authResponseDTO;
    }

    public Authentication authenticate(String username, String password) {
        UserSec user = iUserRepository.findUserEntityByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Usuario o contraseña incorrectos"));
        UserDetails userDetails = this.loadUserByUsername(username);

        // Verificar si la cuenta está habilitada
        if (!userDetails.isEnabled()) {
            throw new DisabledException("La cuenta está inhabilitada");
        }
        // Verificar si la cuenta está bloqueada
        if (!userDetails.isAccountNonLocked()) {
            throw new LockedException("La cuenta está bloqueada");
        }
        // Verificar contraseña
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            int intentos = user.getIntentosFallidos() + 1;
            user.setIntentosFallidos(intentos);
            if (intentos >= 3) {
                user.setAccountNotLocked(false);
            }
            iUserRepository.save(user);
            throw new BadCredentialsException(
                    "Usuario o contraseña incorrectos");
        }
        // Login correcto
        user.setIntentosFallidos(0);
        user.setAccountNotLocked(true);
        iUserRepository.save(user);
        return new UsernamePasswordAuthenticationToken(
                username,
                userDetails.getPassword(),
                userDetails.getAuthorities());
    }
}
