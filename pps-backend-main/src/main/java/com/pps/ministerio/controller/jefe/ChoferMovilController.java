package com.pps.ministerio.controller.jefe;

import com.pps.ministerio.dto.jefe.ChoferMovilDTO;
import com.pps.ministerio.model.ChoferMovil;
import com.pps.ministerio.service.jefe.IChoferMovilService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chofer-movil")
public class ChoferMovilController {

    @Autowired
    private IChoferMovilService iChoferMovilService;

    @GetMapping("/buscar/{legajo}")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ChoferMovilDTO traerPersonal(@PathVariable String legajo){
        return iChoferMovilService.buscarPersonal(legajo);
    }

    @PostMapping("/asignar")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<ChoferMovilDTO> asignarChoferMovil(@RequestParam String legajo,
                                                             @RequestParam(required = false) String numeroMovil,
                                                             @RequestParam(required = false) String patente) {
        return ResponseEntity.ok(iChoferMovilService.asignarChoferMovil(legajo, numeroMovil, patente));
    }

    @DeleteMapping("/eliminar")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public void eliminarChoferMovil(){
        iChoferMovilService.eliminarChoferMovil();
    }

    @GetMapping("/turno")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<ChoferMovilDTO> obtenerChoferMovil() {
        return ResponseEntity.ok(iChoferMovilService.obtenerChoferMovil());
    }
}
