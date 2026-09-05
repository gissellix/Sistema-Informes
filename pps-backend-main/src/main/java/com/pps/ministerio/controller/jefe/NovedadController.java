package com.pps.ministerio.controller.jefe;

import com.pps.ministerio.dto.jefe.NovedadDTO;
import com.pps.ministerio.service.jefe.INovedadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/novedades")
public class NovedadController {

    @Autowired
    private INovedadService iNovedadService;

    @PostMapping
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<NovedadDTO> registrar(@RequestBody NovedadDTO dto) {
        return ResponseEntity.ok(iNovedadService.registrarNovedad(dto));
    }

    @GetMapping
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<List<NovedadDTO>> obtenerNovedades() {
        return ResponseEntity.ok(iNovedadService.obtenerNovedadesTurno());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        iNovedadService.eliminarNovedad(id);
        return ResponseEntity.noContent().build();
    }
}
