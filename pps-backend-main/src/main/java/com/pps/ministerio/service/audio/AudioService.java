package com.pps.ministerio.service.audio;

import com.pps.ministerio.dto.audio.PersonalValidacionDTO;
import com.pps.ministerio.repository.IPersonalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import com.pps.ministerio.dto.TranscripcionResponseDTO;
import com.pps.ministerio.utils.MultipartInputStreamFileResource;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;


@Service
public class AudioService implements IAudioService{

    private final RestClient restClient;

    @Autowired
    private IPersonalRepository personaRepository;

    public AudioService(RestClient.Builder builder) {
        this.restClient = builder
                .baseUrl("http://localhost:8000")
                .build();
    }

    @Override
    public String transcribir(MultipartFile audio) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add(
                    "audio",
                    new MultipartInputStreamFileResource(
                            audio.getInputStream(),
                            audio.getOriginalFilename()));
            TranscripcionResponseDTO response =
                    restClient.post()
                            .uri("/transcripcion")
                            .contentType(MediaType.MULTIPART_FORM_DATA)
                            .body(body)
                            .retrieve()
                            .body(TranscripcionResponseDTO.class);

            if (response == null) {
                throw new RuntimeException("Python no devolvió ninguna respuesta.");
            }
            return response.getTranscripcion();
        } catch (Exception e) {
            throw new RuntimeException("Error al comunicarse con el servicio de transcripción.", e);
        }
    }

    public Optional<PersonalValidacionDTO> buscarPorLegajo(String legajo) {
        return personaRepository.findByLegajo(legajo)
                .map(persona -> new PersonalValidacionDTO(
                        persona.getLegajo(),
                        persona.getNombre(),
                        persona.getApellido(),
                        persona.getJerarquia(),
                        true));
    }
}
