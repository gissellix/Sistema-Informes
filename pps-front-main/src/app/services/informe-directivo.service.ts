import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BusquedaInformeDTO {
  idInforme: number;
  fechaGeneracion: string;
  nombreApellido: string;
  legajo: string;
}

export interface PersonalTurnoDTO {
  idPersonalTurno: number;
  legajo: string;
  nombre: string;
  apellido: string;
  jerarquia: string;
}

export interface NovedadDTO {
  idNovedad: number;
  tipo: string;
  descripcion: string;
  fechaHora: string;
  latitud?: number;
  longitud?: number;
}

export interface InformeDTO {
  idInforme: number;

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

  personalTurnoList: PersonalTurnoDTO[];

  novedades: NovedadDTO[];

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
export class InformeDirectivoService {

  private apiUrl = `${environment.apiUrl}/api/informes`;

  constructor(private http: HttpClient) {}

  obtenerInformes(
    fechaDesde?: string,
    fechaHasta?: string,
    unidadRegional?: string,
    legajoJefe?: string
  ): Observable<BusquedaInformeDTO[]> {

    let params = new HttpParams();

    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde);
    }

    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta);
    }

    if (unidadRegional) {
      params = params.set('unidadRegional', unidadRegional);
    }

    if (legajoJefe) {
      params = params.set('legajoJefe', legajoJefe);
    }

    return this.http.get<BusquedaInformeDTO[]>(
      `${this.apiUrl}/obtener-informes`,
      { params }
    );
  }

  obtenerDetalle(idInforme: number): Observable<InformeDTO> {
    return this.http.get<InformeDTO>(
      `${this.apiUrl}/ver-detalle/${idInforme}`
    );
  }

  descargarInforme(idInforme: number): Observable<InformeDTO> {
    return this.http.get<InformeDTO>(
      `${this.apiUrl}/descargar/${idInforme}`
    );
  }
}