package com.pps.ministerio.controller.jefe;

import com.pps.ministerio.dto.InformeDTO;
import com.pps.ministerio.dto.jefe.FinalizarInformeDTO;
import com.pps.ministerio.dto.jefe.MisInformesDTO;
import com.pps.ministerio.service.directivo.IInformesService;
import com.pps.ministerio.service.jefe.InformeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/informe")
public class InformeController {
    @Autowired
    private InformeService informeService;

    @GetMapping("/vista-previa")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<InformeDTO> obtenerVistaPrevia(){
        return ResponseEntity.ok(informeService.obtenerVistaPrevia());
    }

    @PostMapping("/guardar-finalizar")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<Void> guardarFinalizar(@RequestBody FinalizarInformeDTO dto) {
        informeService.guardarFinalizar(dto.getTextoInforme());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/obtener-mis-informes")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<List<MisInformesDTO>> obtenerMisInformes(){
        return ResponseEntity.ok(informeService.obtenerMisInformes());
    }

    @GetMapping("/descargar/{id}")
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<InformeDTO> descargarInforme(@PathVariable Long id){
        return ResponseEntity.ok(informeService.descargarInforme(id));
    }
}
