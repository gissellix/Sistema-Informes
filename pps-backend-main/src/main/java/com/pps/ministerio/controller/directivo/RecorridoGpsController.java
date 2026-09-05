package com.pps.ministerio.controller.directivo;

import com.pps.ministerio.dto.directivo.RecorridoGPSRequestDTO;
import com.pps.ministerio.service.directivo.RecorridoGPSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recorrido-gps")
public class RecorridoGpsController {

    @Autowired
    private RecorridoGPSService recorridoGPSService;

    @PostMapping
    @PreAuthorize("hasRole('JEFE_POLICIAL')")
    public ResponseEntity<Void> guardarPunto(@RequestBody RecorridoGPSRequestDTO dto) {
        recorridoGPSService.guardarPunto(dto);
        return ResponseEntity.ok().build();
    }
}
