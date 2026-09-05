import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface Turno {
  idTurno: number;
  fechaInicio: string;
  fechaFin: string | null;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class TurnoService {

  private apiUrl = `${environment.apiUrl}/api/turno`;

  constructor(private http: HttpClient) {}

  iniciarTurno(): Observable<Turno> {
    return this.http.post<Turno>(
      `${this.apiUrl}/iniciar`,
      {}
    );
  }

  obtenerTurnoActivo(): Observable<Turno> {
    return this.http.get<Turno>(
      `${this.apiUrl}/activo`
    );
  }
}