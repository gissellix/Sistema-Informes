import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard-directivo',
    loadComponent: () => import('./components/dashboard-directivo/dashboard-directivo.component').then(m => m.DashboardDirectivoComponent),
    canActivate: [authGuard],
    data: { role: 'ROLE_DIRECTIVO' }
  },
  {
    path: 'dashboard-jefe',
    loadComponent: () => import('./components/dashboard-jefe/dashboard-jefe.component').then(m => m.DashboardJefeComponent),
    canActivate: [authGuard],
    data: { role: 'ROLE_JEFE_POLICIAL' }
  },
  {
    path: 'dashboard-admin',
    loadComponent: () => import('./components/dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent),
    canActivate: [authGuard],
    data: { role: 'ROLE_ADMINISTRATIVO' }
  },
  {
    path: 'guardia-activa',
    loadComponent: () => import('./components/guardia-activa/guardia-activa.component').then(m => m.GuardiaActivaComponent),
    canActivate: [authGuard],
    data: { role: 'ROLE_JEFE_POLICIAL' }
  },
  {
    path: 'registrar-datos',
    loadComponent: () => import('./components/registrar-datos/registrar-datos.component').then(m => m.RegistrarDatosComponent),
    canActivate: [authGuard],
    data: { role: 'ROLE_JEFE_POLICIAL' }
  },
  {
    path: 'registrar-novedades',
    loadComponent: () => import('./components/registrar-novedades/registrar-novedades.component').then(m => m.RegistrarNovedadesComponent),
    canActivate: [authGuard],
    data: { role: 'ROLE_JEFE_POLICIAL' }
  },
  {
    path: 'vista-previa-informe',
    loadComponent: () => import('./components/vista-previa-informe/vista-previa-informe.component').then(m => m.VistaPreviaInformeComponent),
    canActivate: [authGuard],
    data: { role: 'ROLE_JEFE_POLICIAL' }
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
