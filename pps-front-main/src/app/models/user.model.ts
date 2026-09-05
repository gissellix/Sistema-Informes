export interface User {
  legajo: string;
  nombre: string;
  rol: 'ROLE_DIRECTIVO' | 'ROLE_JEFE_POLICIAL' | 'ROLE_ADMINISTRATIVO';
  unidadRegional?: string;
  activo?: boolean;
  bloqueado?: boolean;
  contrasena?: string;
}