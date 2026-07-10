import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const moduloRequerido = route.data['modulo'] as string;

  if (moduloRequerido && authService.tieneAcceso(moduloRequerido)) {
    return true;
  }

  alert('No tienes permisos asignados en tu rol para acceder a esta sección.');

  return router.createUrlTree(['/login']);
};
