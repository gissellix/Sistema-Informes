package com.pps.ministerio.controller.jefe;

import com.pps.ministerio.dto.jefe.TurnoDTO;
import com.pps.ministerio.model.Turno;
import com.pps.ministerio.service.jefe.ITurnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/turno")
public class TurnoController {
    @Autowired
    private ITurnoService iTurnoService;

    @PostMapping("/iniciar")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<TurnoDTO> iniciarTurno(){
        Turno turno = iTurnoService.iniciarTurno();
        return ResponseEntity.ok(new TurnoDTO(turno));
    }

    @GetMapping("/activo")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<TurnoDTO> obtenerTurnoActivo() {
        Turno turno = iTurnoService.obtenerTurnoActivo();
        return ResponseEntity.ok(new TurnoDTO(turno));
    }
}
