import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule 
  ], 
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credenciales = { correo_electronico: '', password: '' };
  errorMensaje: string | null = null;
  cargando: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.credenciales.correo_electronico || !this.credenciales.password) {
      this.errorMensaje = 'Por favor, llena todos los campos.';
      return;
    }
    this.cargando = true;
    this.errorMensaje = null;

    this.authService.login(this.credenciales).subscribe({
      next: (response: any) => {
        this.cargando = false;

        console.log("👉 RESPUESTA REAL DETECTADA:", response);

        if (response && response.success) {
        const usuario = response.usuario;
        const token = response.token;

        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('token_acceso', token);
          localStorage.setItem('access_token', token);
          localStorage.setItem('api_token', token);
        }

        if (usuario?.usuario) {
          localStorage.setItem('usuario_nickname', usuario.usuario);
        }

        // 🔑 MAPEO DIRECTO DE REGLAS DE ACCESO NO SQL
        // Captura el arreglo limpio enviado por el controlador y lo inyecta al localStorage
        const secciones = response.secciones_permitidas || [];
        localStorage.setItem('secciones_permitidas', JSON.stringify(secciones));
      }

      this.router.navigate(['/productos']);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMensaje = err.error?.message || 'Error al iniciar sesión.';
      }
    });
  }
}