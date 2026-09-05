import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NovedadDTO {
  idNovedad?: number;
  tipo: string;
  descripcion: string;
  fechaHora?: string;
  latitud?: number;
  longitud?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NovedadService {

  private apiUrl = `${environment.apiUrl}/api/novedades`;

  constructor(private http: HttpClient) {}

  registrarNovedad(novedad: NovedadDTO): Observable<NovedadDTO> {
    return this.http.post<NovedadDTO>(
      this.apiUrl,
      novedad
    );
  }

  obtenerNovedades(): Observable<NovedadDTO[]> {
    return this.http.get<NovedadDTO[]>(
      this.apiUrl
    );
  }

  eliminarNovedad(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}