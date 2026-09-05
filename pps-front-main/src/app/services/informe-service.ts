import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MisInformesDTO {
  idInformeDTO: number;
  fechaGeneracion: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface PersonalTurnoInformeDTO {
  idPersonalTurno: number;
  legajo: string;
  nombre: string;
  apellido: string;
  jerarquia: string;
}

export interface NovedadInformeDTO {
  idNovedad: number;
  tipo: string;
  descripcion: string;
  fechaHora: string;
  latitud?: number;
  longitud?: number;
}

export interface InformeDTO {

  fechaInicio: string;
  fechaFin: string;

  unidadRegional: string;

  rolJefe: string;
  jerarquiaJefe: string;
  legajoJefe: string;
  nombreApellidoJefe: string;

  rolChofer?: string;
  jerarquiaChofer?: string;
  legajoChofer?: string;
  nombreApellidoChofer?: string;

  numeroMovil?: string;
  patente?: string;

  personalTurnoList: PersonalTurnoInformeDTO[];

  novedades: NovedadInformeDTO[];

  recorridoGps: PuntoGpsDTO[];
}

export interface PuntoGpsDTO {
  lat: number;
  lng: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class InformeService {

  private apiUrl =
    `${environment.apiUrl}/api/informe`;

  constructor(
    private http: HttpClient
  ) {}

  obtenerVistaPrevia(): Observable<InformeDTO> {

    return this.http.get<InformeDTO>(
      `${this.apiUrl}/vista-previa`
    );
  }

  guardarFinalizar(
    textoInforme: string
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/guardar-finalizar`,
      {
        textoInforme: textoInforme
      }
    );
  }

  obtenerMisInformes(): Observable<MisInformesDTO[]> {
    return this.http.get<MisInformesDTO[]>(
      `${this.apiUrl}/obtener-mis-informes`
    );
  }

  descargarInforme(id: number): Observable<InformeDTO> {
    return this.http.get<InformeDTO>(
      `${this.apiUrl}/descargar/${id}`
    );
  }
}