import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Check if user is authenticated
  if (!authService.isAuthenticated()) {
    // Redirect to login if not authenticated
    router.navigate(['/login']);
    return false;
  }

  // 2. Check for role-based access control
  const expectedRole = route.data['role'] as 'ROLE_DIRECTIVO' | 'ROLE_JEFE_POLICIAL' | 'ROLE_ADMINISTRADOR' | undefined;
  if (expectedRole) {
    const user = authService.getCurrentUser();
    
    if (user && user.rol === expectedRole) {
      return true;
    }

    // Role mismatch: redirect user to their corresponding authorized dashboard
    if (user?.rol === 'ROLE_DIRECTIVO') {
      router.navigate(['/dashboard-directivo']);
    } else if (user?.rol === 'ROLE_JEFE_POLICIAL') {
      router.navigate(['/dashboard-jefe']);
    } else if (user?.rol === 'ROLE_ADMINISTRATIVO') {
      router.navigate(['/dashboard-admin']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  // If authenticated and no specific role is required, allow access
  return true;
};
