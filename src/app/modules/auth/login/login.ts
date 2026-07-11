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

        console.log("RESPUESTA REAL DETECTADA:", response);

        if (response && response.success) {
          const usuario = response.usuario;
          const token = response.token;

          if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('token_acceso', token);
            localStorage.setItem('access_token', token);
            localStorage.setItem('api_token', token);
          }

          if (usuario) {
            localStorage.setItem('usuario_id', usuario.id || '');
            localStorage.setItem('usuario_nickname', usuario.usuario || '');
            localStorage.setItem('usuario_nombre_completo', usuario.nombre_completo || '');
            localStorage.setItem('usuario_correo', usuario.correo_electronico || '');
            localStorage.setItem('usuario_telefono', usuario.telefono || '');
            localStorage.setItem('usuario_codigo', usuario.codigo_usuario || '');
            localStorage.setItem('usuario_foto', usuario.foto_perfil || '');
            if (usuario.perfil_ids) {
              localStorage.setItem('usuario_perfiles', JSON.stringify(usuario.perfil_ids));
            }
          }

          // Mapeo de accesos de secciones
          const secciones = response.secciones_permitidas || [];

          if (!secciones.includes('mi-perfil')) {
            secciones.push('mi-perfil');
          }
          
          localStorage.setItem('secciones_permitidas', JSON.stringify(secciones));
          
          // Redirección al panel principal una sola vez tras guardar todo
          this.router.navigate(['/productos']);
        } else {
          this.errorMensaje = response.message || 'Credenciales incorrectas.';
        }
      },
      error: (err) => {
        this.cargando = false;
        this.errorMensaje = err.error?.message || 'Error al iniciar sesión.';
      }
    });
  }
}