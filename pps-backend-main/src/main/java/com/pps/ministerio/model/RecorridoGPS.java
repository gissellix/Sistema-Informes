package com.pps.ministerio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "recorridos_gps")
public class RecorridoGPS {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRecorrido;
    private Double latitud;
    private Double longitud;
    private LocalDateTime fechaHora;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_turno")
    private Turno turno;
}
