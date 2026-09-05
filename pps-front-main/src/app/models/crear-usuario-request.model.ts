export interface CrearUsuarioRequest {
  legajo: string;
  password: string;
  rol: 'ROLE_DIRECTIVO' | 'ROLE_JEFE_POLICIAL';
}