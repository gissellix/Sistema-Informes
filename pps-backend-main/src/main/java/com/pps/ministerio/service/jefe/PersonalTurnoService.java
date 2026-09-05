package com.pps.ministerio.service.jefe;

import com.pps.ministerio.dto.jefe.PersonalTurnoDTO;
import com.pps.ministerio.model.*;
import com.pps.ministerio.repository.IPersonalRepository;
import com.pps.ministerio.repository.jefe.IChoferMovilRepository;
import com.pps.ministerio.repository.jefe.IPersonalTurnoRepository;
import com.pps.ministerio.repository.admin.IUserRepository;
import com.pps.ministerio.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
public class PersonalTurnoService implements IPersonalTurnoService{

    @Autowired
    private IUserRepository iUserRepository;

    @Autowired
    private IPersonalRepository iPersonalRepository;

    @Autowired
    private IPersonalTurnoRepository iPersonalTurnoRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private IChoferMovilRepository iChoferMovilRepository;

    @Override
    public PersonalTurnoDTO asignarPersonal(String legajo) {
        Turno turno = authService.obtenerTurnoActivo();
        Personal personal = iPersonalRepository.findByLegajo(legajo).orElseThrow(() ->
                        new RuntimeException("No existe personal con ese legajo"));

        if (iPersonalTurnoRepository.findByTurnoAndPersonal(turno, personal).isPresent()) {
            throw new RuntimeException("El personal ya fue agregado");
        }

        if (turno.getUserSec().getUsername().equals(legajo)) {
            throw new RuntimeException("No se puede agregar a sí mismo");
        }

        if (iChoferMovilRepository.findByTurnoAndPersonal(turno, personal).isPresent()) {
            throw new RuntimeException("El personal ya está asignado como chofer");
        }

        PersonalTurno personalTurno = new PersonalTurno();

        personalTurno.setPersonal(personal);
        personalTurno.setTurno(turno);

        turno.getPersonalTurnoList().add(personalTurno);
        personal.getPersonalTurnoList().add(personalTurno);
        // Guardamos en la BD
        PersonalTurno guardado = iPersonalTurnoRepository.save(personalTurno);

        // Convertimos la entidad a DTO
        PersonalTurnoDTO dto = new PersonalTurnoDTO();
        dto.setIdPersonalTurno(guardado.getIdPersonalTurno());
        dto.setLegajo(personal.getLegajo());
        dto.setNombre(personal.getNombre());
        dto.setApellido(personal.getApellido());
        dto.setJerarquia(personal.getJerarquia());

        return dto;
    }

    @Override
    public PersonalTurnoDTO buscarPersonal(String legajo) {
        Personal personal = iPersonalRepository.findByLegajo(legajo).orElseThrow(() ->
                        new RuntimeException("No existe personal con ese legajo"));

        PersonalTurnoDTO dto = new PersonalTurnoDTO();
        dto.setLegajo(personal.getLegajo());
        dto.setNombre(personal.getNombre());
        dto.setApellido(personal.getApellido());
        dto.setJerarquia(personal.getJerarquia());

        return dto;
    }

    @Override
    public void eliminarPersonalTurno(String legajo) {
        Turno turno = authService.obtenerTurnoActivo();
        Personal personal = iPersonalRepository.findByLegajo(legajo).orElseThrow(() ->
                        new RuntimeException("No existe personal con legajo: " + legajo));
        PersonalTurno personalTurno = iPersonalTurnoRepository.findByTurnoAndPersonal(turno, personal).orElseThrow(() ->
                                new RuntimeException("El personal con legajo " + legajo +
                                                " no pertenece al turno activo"));
        iPersonalTurnoRepository.delete(personalTurno);
    }

    @Override
    public List<PersonalTurnoDTO> obtenerPersonalTurno() {
        Turno turno = authService.obtenerTurnoActivo();
        List<PersonalTurno> lista = iPersonalTurnoRepository.findAllByTurno(turno);

        return lista.stream().map(personalTurno -> {
            Personal personal = personalTurno.getPersonal();
            PersonalTurnoDTO dto = new PersonalTurnoDTO();
            dto.setIdPersonalTurno(personalTurno.getIdPersonalTurno());

            dto.setLegajo(personal.getLegajo());
            dto.setNombre(personal.getNombre());
            dto.setApellido(personal.getApellido());
            dto.setJerarquia(personal.getJerarquia());
            return dto;
        }).toList();
    }
}
