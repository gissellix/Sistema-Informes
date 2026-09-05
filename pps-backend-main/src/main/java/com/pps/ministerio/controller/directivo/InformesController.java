package com.pps.ministerio.controller.directivo;

import com.pps.ministerio.dto.InformeDTO;
import com.pps.ministerio.dto.directivo.BusquedaInformesDTO;
import com.pps.ministerio.service.directivo.IInformesService;
import com.pps.ministerio.service.directivo.InformesServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/informes")
public class InformesController {
    @Autowired
    private InformesServices informesServices;

    @GetMapping("/obtener-informes")
    @PreAuthorize("hasRole('DIRECTIVO')")
    public ResponseEntity<List<BusquedaInformesDTO>> obtenerInformes(@RequestParam (required = false) LocalDate fechaDesde,
                                                                     @RequestParam (required = false) LocalDate fechaHasta,
                                                                     @RequestParam (required = false) String unidadRegional,
                                                                     @RequestParam (required = false) String legajoJefe){
        return ResponseEntity.ok(informesServices.busquedaInformes(fechaDesde, fechaHasta, unidadRegional,legajoJefe));
    }

    @GetMapping("/ver-detalle/{idInforme}")
    @PreAuthorize("hasRole('DIRECTIVO')")
    public ResponseEntity<InformeDTO> verDetalle(@PathVariable Long idInforme){
        return ResponseEntity.ok(informesServices.obtenerInforme(idInforme));
    }

    @GetMapping("/descargar/{idInforme}")
    @PreAuthorize("hasRole('DIRECTIVO')")
    public ResponseEntity<InformeDTO> descargarInforme(@PathVariable Long idInforme){
        return ResponseEntity.ok(informesServices.obtenerInforme(idInforme));
    }
}
