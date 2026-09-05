package com.pps.ministerio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "chofer_movil")
public class ChoferMovil {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idChoferMovil;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_turno")
    private Turno turno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_movil")
    private Movil movil;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="id_personal")
    private Personal personal;
}
