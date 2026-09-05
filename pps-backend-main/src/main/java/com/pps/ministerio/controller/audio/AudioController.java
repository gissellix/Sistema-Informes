package com.pps.ministerio.controller.audio;

import com.pps.ministerio.dto.TranscripcionResponseDTO;
import com.pps.ministerio.service.audio.AudioService;
import com.pps.ministerio.service.audio.IAudioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/audio")
public class AudioController {

    @Autowired
    private IAudioService iAudioService;

    @Autowired
    private AudioService audioService;

    @PostMapping("/transcribir")
    public ResponseEntity<TranscripcionResponseDTO> transcribir(@RequestParam MultipartFile audio) {
        String texto = iAudioService.transcribir(audio);
        TranscripcionResponseDTO response = new TranscripcionResponseDTO();
        response.setTranscripcion(texto);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/legajo/{legajo}")
    public ResponseEntity<?> buscarPorLegajo(@PathVariable String legajo) {
        return ResponseEntity.ok(audioService.buscarPorLegajo(legajo));
    }
}
