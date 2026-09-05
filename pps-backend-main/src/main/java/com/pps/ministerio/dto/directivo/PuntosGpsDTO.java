package com.pps.ministerio.dto.directivo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PuntosGpsDTO {
    private Double lat;
    private Double lng;
    private LocalDateTime timestamp;
}
