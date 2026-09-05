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
@Table(name = "personal")
public class Personal {

    @Id
    private Long id;
    private String legajo;
    private String nombre;
    private String apellido;
    private String jerarquia;
    private String unidad_regional_nombre;

    @OneToMany(mappedBy = "personal", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<PersonalTurno> personalTurnoList = new ArrayList<>();

    @OneToMany(mappedBy = "personal", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ChoferMovil> choferMovilList = new ArrayList<>();

    @OneToOne(mappedBy = "personal", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private UserSec userSec;
}
