package com.pps.ministerio.service.jefe;

import com.pps.ministerio.model.Movil;
import com.pps.ministerio.repository.jefe.IMovilRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MovilService implements IMovilService {

    @Autowired
    private IMovilRepository iMovilRepository;

    @Override
    public Movil save(Movil movil) {
        return iMovilRepository.save(movil);
    }
}
