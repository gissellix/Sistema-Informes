import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChoferMovilDTO {
  idChoferMovil?: number;
  legajo: string;
  nombre: string;
  apellido: string;
  jerarquia: string;
  numeroMovil?: string;
  patente?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChoferMovilService {

  private apiUrl = `${environment.apiUrl}/api/chofer-movil`;

  constructor(private http: HttpClient) {}

  buscarChofer(legajo: string): Observable<ChoferMovilDTO> {
    return this.http.get<ChoferMovilDTO>(
      `${this.apiUrl}/buscar/${legajo}`
    );
  }

  asignarChofer(
    legajo: string,
    numeroMovil?: string,
    patente?: string
  ): Observable<any> {

    let params: any = {
      legajo: legajo
    };

    if (numeroMovil && numeroMovil.trim() !== '') {
      params.numeroMovil = numeroMovil.trim();
    }

    if (patente && patente.trim() !== '') {
      params.patente = patente.trim();
    }

    return this.http.post<any>(
      `${this.apiUrl}/asignar`,
      null,
      { params }
    );
  }

  eliminarChoferMovil(): Observable<void> {
    return this.http.delete<void>(
        `${this.apiUrl}/eliminar`
    );
  }

  obtenerChoferMovil(): Observable<ChoferMovilDTO> {
    return this.http.get<ChoferMovilDTO>(
      `${this.apiUrl}/turno`
    );
  }
}