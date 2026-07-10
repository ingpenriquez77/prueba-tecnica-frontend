import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    //  Verificamos si existe el token en LocalStorage
    if (this.authService.isLoggedIn()) {
      return true; // Acceso permitido
    }

    // Si no está logueado, lo redirigimos al login y bloqueamos la navegación
    this.router.navigate(['/login']);
    return false;
  }
}
