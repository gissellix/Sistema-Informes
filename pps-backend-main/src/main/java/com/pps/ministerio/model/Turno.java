package com.pps.ministerio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "turnos")
public class Turno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTurno;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private EstadoTurno estado;


    @OneToMany(mappedBy = "turno", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<RecorridoGPS> recorridosGPS;

    @OneToMany(mappedBy = "turno", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Novedad> novedadList = new ArrayList<>();

    @OneToOne(mappedBy = "turno", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Informe informe;

    @OneToMany(mappedBy = "turno", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<PersonalTurno> personalTurnoList = new ArrayList<>();

    @OneToMany(mappedBy = "turno", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ChoferMovil> choferMovilList = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user")
    private UserSec userSec;
}
