package com.pps.ministerio.controller.jefe;

import com.pps.ministerio.model.Movil;
import com.pps.ministerio.service.jefe.IMovilService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/movil")
public class MovilController {

    @Autowired
    private IMovilService iMovilService;

    @PostMapping
    public ResponseEntity<Movil> crearMovil(@RequestBody Movil movil){
        return ResponseEntity.ok(iMovilService.save(movil));
    } //este controller de movil era solo para crear dos moviles para tenerlo en la bd, pero en realidad ellos tienen
    //la tabla de movil
}
