package com.pps.ministerio.controller.jefe;

import com.pps.ministerio.dto.jefe.PersonalTurnoDTO;
import com.pps.ministerio.model.PersonalTurno;
import com.pps.ministerio.service.jefe.IPersonalTurnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personal")
public class PersonalTurnoController {

    @Autowired
    private IPersonalTurnoService iPersonalTurnoService;

    @PostMapping("/{legajo}")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<PersonalTurnoDTO> asignarPersonal(@PathVariable String legajo) {
        return ResponseEntity.ok(iPersonalTurnoService.asignarPersonal(legajo));
    }

    @DeleteMapping("/eliminar/{legajo}")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<Void> eliminarPersonalTurno(@PathVariable String legajo) {
        iPersonalTurnoService.eliminarPersonalTurno(legajo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar/{legajo}")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<PersonalTurnoDTO> buscarPersonal(@PathVariable String legajo) {
        return ResponseEntity.ok(iPersonalTurnoService.buscarPersonal(legajo));
    }

    @GetMapping
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<List<PersonalTurnoDTO>> obtenerPersonalTurno() {
        return ResponseEntity.ok(iPersonalTurnoService.obtenerPersonalTurno());
    }
}
