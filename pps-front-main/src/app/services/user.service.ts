import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Usuario } from '../models/usuario.model';
import { PersonalDTO } from '../models/personal.dto';
import { CrearUsuarioRequest } from '../models/crear-usuario-request.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {}

  // OBTENER USUARIOS
  getAllUsers(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(
      `${environment.apiUrl}/api/user/obtener-usuarios`
    );
  }

  // BUSCAR PERSONAL A CREAR
  buscarPersonal(legajo: string): Observable<PersonalDTO> {
    return this.http.get<PersonalDTO>(
      `${environment.apiUrl}/api/user/traer-personal/${legajo}`
    );
  }

  // CREAR NUEVO USUARIO
  crearUsuario(request: CrearUsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(
      `${environment.apiUrl}/api/user`,
      request
    );
  }

  // CAMBIAR ESTADO
  cambiarEstadoUsuario(
    legajo: string,
    habilitado: boolean
  ): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${environment.apiUrl}/api/user/estado/${legajo}?habilitado=${habilitado}`,
      {}
    );
  }

  // RESTABLECER CONTRASEÑA
  restablecerContrasena(
    idUsuario: number,
    nuevaContrasena: string
  ): Observable<string> {
    return this.http.put(
      `${environment.apiUrl}/api/user/restablecer-contrasena/${idUsuario}`,
      {
        nuevaContrasena: nuevaContrasena
      },
      {
        responseType: 'text'
      }
    );
  }

  // CAMBIAR ROL
  cambiarRolUsuario(
    idUsuario: number,
    rol: string
  ): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${environment.apiUrl}/api/user/rol/${idUsuario}?rol=${rol}`,
      {}
    );
  }

  desbloquearUsuario(idUsuario: number): Observable<string> {
    return this.http.put(
      `${environment.apiUrl}/api/user/desbloquear/${idUsuario}`,
      {},
      { responseType: 'text' }
    );
  }
}