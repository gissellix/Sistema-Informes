package com.pps.ministerio.service.jefe;

import com.pps.ministerio.dto.jefe.ChoferMovilDTO;
import com.pps.ministerio.model.*;
import com.pps.ministerio.repository.jefe.IChoferMovilRepository;
import com.pps.ministerio.repository.jefe.IMovilRepository;
import com.pps.ministerio.repository.IPersonalRepository;
import com.pps.ministerio.repository.jefe.IPersonalTurnoRepository;
import com.pps.ministerio.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ChoferMovilService implements IChoferMovilService{

    @Autowired
    private IChoferMovilRepository iChoferMovilRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private IPersonalRepository iPersonalRepository;

    @Autowired
    private IMovilRepository iMovilRepository;

    @Autowired
    private IPersonalTurnoRepository iPersonalTurnoRepository;

    @Override
    public ChoferMovilDTO buscarPersonal(String legajo) {

        Turno turno = authService.obtenerTurnoActivo();

        Personal personal = iPersonalRepository
                .findByLegajo(legajo)
                .orElseThrow(() -> new RuntimeException("No existe personal con ese legajo"));

        Optional<PersonalTurno> personalTurno = iPersonalTurnoRepository.findByTurnoAndPersonal(turno, personal);

        if (turno.getUserSec().getUsername().equals(legajo)) {
            throw new RuntimeException("No puede asignarse a si mismo");
        } else if (personalTurno.isPresent()) {
            throw new RuntimeException("El personal ya fue asignado como personal de turno");
        }

        // Verificamos también si ya es el chofer del turno
        if (iChoferMovilRepository.findByTurnoAndPersonal(turno, personal).isPresent()) {
            throw new RuntimeException("El personal ya está asignado como chofer");
        }

        ChoferMovilDTO choferDTO = new ChoferMovilDTO();
        choferDTO.setLegajo(personal.getLegajo());
        choferDTO.setNombre(personal.getNombre());
        choferDTO.setApellido(personal.getApellido());
        choferDTO.setJerarquia(personal.getJerarquia());

        return choferDTO;
    }

    @Override
    public ChoferMovilDTO asignarChoferMovil(String legajo, String numeroMovil, String patente) {

        Turno turno = authService.obtenerTurnoActivo();
        Personal personal = iPersonalRepository.findByLegajo(legajo).orElseThrow(() ->
                        new RuntimeException("No existe personal con ese legajo"));
        if (iChoferMovilRepository.findByTurnoAndPersonal(turno, personal).isPresent()) {
            throw new RuntimeException("El chofer ya fue agregado");
        }
        Movil movil;
        if (numeroMovil != null && !numeroMovil.isBlank()) {
            movil = iMovilRepository.findByNumeroMovil(numeroMovil).orElseThrow(() ->
                            new RuntimeException("No existe un movil con ese numero"));

        } else if (patente != null && !patente.isBlank()) {
            movil = iMovilRepository.findByPatente(patente).orElseThrow(() ->
                    new RuntimeException("No existe un movil con esa patente"));
        } else {
            throw new RuntimeException(
                    "Debe ingresar el numero del movil o la patente");
        }
        if (iChoferMovilRepository.findByTurnoAndMovil(turno, movil).isPresent()) {
            throw new RuntimeException("El móvil ya tiene un chofer asignado.");
        }
        if (iChoferMovilRepository.findByTurno(turno).isPresent()) {
            throw new RuntimeException("Ya existe un chofer y un móvil asignados a este turno.");
        }

        if (turno.getUserSec().getUsername().equals(legajo)) {
            throw new RuntimeException("No puede asignarse a sí mismo");
        }

        if (iPersonalTurnoRepository.findByTurnoAndPersonal(turno, personal).isPresent()) {
            throw new RuntimeException("El personal ya fue asignado como personal de turno");
        }

        ChoferMovil choferMovil = new ChoferMovil();
        choferMovil.setPersonal(personal);
        choferMovil.setMovil(movil);
        choferMovil.setTurno(turno);

        ChoferMovil guardado = iChoferMovilRepository.save(choferMovil);

        // Crear DTO para devolver a Angular
        ChoferMovilDTO dto = new ChoferMovilDTO();
        dto.setIdChoferMovil(guardado.getIdChoferMovil());
        dto.setLegajo(personal.getLegajo());
        dto.setNombre(personal.getNombre());
        dto.setApellido(personal.getApellido());
        dto.setJerarquia(personal.getJerarquia());
        dto.setNumeroMovil(movil.getNumeroMovil());
        dto.setPatente(movil.getPatente());

        return dto;
    }

    @Override
    public void eliminarChoferMovil() {
        Turno turno = authService.obtenerTurnoActivo();
        ChoferMovil choferMovil = iChoferMovilRepository.findByTurno(turno).
                orElseThrow(() -> new RuntimeException("No existe una asignación"));
        iChoferMovilRepository.delete(choferMovil);
    }

    @Override
    public ChoferMovilDTO obtenerChoferMovil() {

        Turno turno = authService.obtenerTurnoActivo();

        ChoferMovil choferMovil = iChoferMovilRepository
                .findByTurno(turno)
                .orElseThrow(() -> new RuntimeException("No hay chofer y móvil asignados al turno"));

        Personal personal = choferMovil.getPersonal();
        Movil movil = choferMovil.getMovil();

        ChoferMovilDTO dto = new ChoferMovilDTO();
        dto.setIdChoferMovil(choferMovil.getIdChoferMovil());
        dto.setLegajo(personal.getLegajo());
        dto.setNombre(personal.getNombre());
        dto.setApellido(personal.getApellido());
        dto.setJerarquia(personal.getJerarquia());
        dto.setNumeroMovil(movil.getNumeroMovil());
        dto.setPatente(movil.getPatente());

        return dto;
    }
}
