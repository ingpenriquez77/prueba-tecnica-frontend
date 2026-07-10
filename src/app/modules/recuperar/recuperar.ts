import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// 🚀 RUTA CORREGIDA: Subimos dos niveles en vez de tres para encontrar el core
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  // 🛡️ Si el archivo HTML está en la misma carpeta, lo dejamos relativo.
  // Asegúrate de que el archivo se llame exactamente 'recuperar.html' (todo en minúsculas)
  templateUrl: './recuperar.html',
  styleUrls: ['./recuperar.css']
})
export class RecuperarComponent {
  correo: string = '';
  mensajeExito: string | null = null;
  errorMensaje: string | null = null;
  cargando: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRecuperar(): void {
    if (!this.correo) {
      this.errorMensaje = 'Por favor, introduce tu correo electrónico.';
      return;
    }

    this.cargando = true;
    this.errorMensaje = null;
    this.mensajeExito = null;

    this.authService.recuperarPassword(this.correo).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res && res.success) {
          this.mensajeExito = res.message;
          setTimeout(() => this.router.navigate(['/login']), 4000);
        }
      },
      error: (err) => {
        this.cargando = false;
        this.errorMensaje = err.error?.message || 'Ocurrió un error al procesar la solicitud.';
      }
    });
  }
}
