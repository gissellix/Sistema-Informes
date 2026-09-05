package com.pps.ministerio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "moviles")
public class Movil {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMovil;
    private String numeroMovil;
    private String patente;

    @OneToMany(mappedBy = "movil", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ChoferMovil> choferMovilList = new ArrayList<>();
}
