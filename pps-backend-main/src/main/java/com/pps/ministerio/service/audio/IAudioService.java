package com.pps.ministerio.service.audio;

import org.springframework.web.multipart.MultipartFile;

public interface IAudioService{


    String transcribir(MultipartFile audio);


}
