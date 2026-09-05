import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PersonalDTO {
  legajo: string;
  nombre: string;
  apellido: string;
  jerarquia: string;
}

export interface PersonalTurno {
  idPersonalTurno: number;
  legajo: string;
  nombre: string;
  apellido: string;
  jerarquia: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonalTurnoService {

  private apiUrl = `${environment.apiUrl}/api/personal`;

  constructor(private http: HttpClient) {}

  buscarPersonal(legajo: string): Observable<PersonalDTO> {
    return this.http.get<PersonalDTO>(
      `${this.apiUrl}/buscar/${legajo}`
    );
  }

  agregarPersonal(legajo: string): Observable<PersonalTurno> {
    return this.http.post<PersonalTurno>(
      `${this.apiUrl}/${legajo}`,
      {}
    );
  }

  eliminarPersonal(legajo: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/eliminar/${legajo}`
    );
  }

  obtenerPersonalTurno(): Observable<PersonalTurno[]> {
    return this.http.get<PersonalTurno[]>(
      this.apiUrl
    );
  }
}