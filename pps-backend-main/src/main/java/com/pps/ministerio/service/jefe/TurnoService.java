package com.pps.ministerio.service.jefe;

import com.pps.ministerio.model.EstadoTurno;
import com.pps.ministerio.model.RecorridoGPS;
import com.pps.ministerio.model.Turno;
import com.pps.ministerio.model.UserSec;
import com.pps.ministerio.repository.directivo.IRecorridoGPSRepository;
import com.pps.ministerio.repository.jefe.ITurnoRepository;
import com.pps.ministerio.repository.admin.IUserRepository;
import com.pps.ministerio.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TurnoService implements ITurnoService{

    @Autowired
    private ITurnoRepository iTurnoRepository;

    @Autowired
    private IUserRepository iUserRepository;

    @Autowired
    private AuthService authService;

    @Override
    public Turno iniciarTurno() {

        //Obtenemos el usuario autenticado que se encuntra en el ConextHolder
        UserSec userSec = authService.obtenerUsuarioAutenticado();

        //Verificamos que no tenga un turno activo
        Optional<Turno> turnoActivo = iTurnoRepository.findByUserSecAndEstado(userSec, EstadoTurno.ACTIVO);
        if (turnoActivo.isPresent()){
            throw  new RuntimeException("El usuario ya posee un turno activo");
        }

        Turno turno = new Turno();
        //En caso de no tener un turno activo se guarda la fecha y hora del inicio
        //y cambia el estado a ACTIVO
        turno.setFechaInicio(LocalDateTime.now());
        turno.setEstado(EstadoTurno.ACTIVO);

        //Asociamos el usuario al turno y viceversa para mantenerlo sincronizados
        turno.setUserSec(userSec);
        userSec.getTurnoList().add(turno);

        return iTurnoRepository.save(turno);
    }

    @Override
    public Turno obtenerTurnoActivo() {
        UserSec userSec = authService.obtenerUsuarioAutenticado();
        return iTurnoRepository
                .findByUserSecAndEstado(userSec, EstadoTurno.ACTIVO)
                .orElseThrow(() -> new RuntimeException("No existe un turno activo"));
    }
}
