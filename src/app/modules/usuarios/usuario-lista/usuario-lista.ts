import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user';
import { AuthService } from '../../../core/services/auth';
import { Usuario } from '../../../shared/interfaces/usuario.interface';

@Component({
  selector: 'app-usuario-lista',
  standalone: true, // 🚀 ¡ESTA LÍNEA ES LA QUE SOLUCIONA EL ERROR NG6002!
  imports: [CommonModule, RouterModule], // Permite el routerLink y directivas
  templateUrl: './usuario-lista.html',
  styleUrls: ['./usuario-lista.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuarioListaComponent implements OnInit {
  usuarios: Usuario[] = [];
  cargando: boolean = true;
  usuarioLogueado: string | null = '';
  mostrarMenu: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.usuarioLogueado = localStorage.getItem('usuario_nickname');
    this.cargarUsuarios();
  }

  tieneAcceso(seccion: string): boolean {
    const secciones = JSON.parse(localStorage.getItem('secciones_permitidas') || '[]');
    return secciones.includes(seccion);
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.cdr.markForCheck();

    this.userService.obtenerTodos().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.usuarios = response.data;
        }
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  trackByUsuarioId(index: number, usuario: Usuario): string {
    return usuario.id || '';
  }

  eliminarUsuario(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.userService.eliminar(id).subscribe({
        next: () => this.cargarUsuarios(),
        error: () => alert('No se pudo eliminar el usuario.')
      });
    }
  }

  // ⚡ Abre y cierra el menú desplegable
  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.mostrarMenu = !this.mostrarMenu;
    this.cdr.markForCheck();
  }

  irAEditarPerfil(): void {
    // 1. Obtenemos el valor crudo del almacenamiento
    let usuarioId = localStorage.getItem('usuario_id');
    
    if (!usuarioId || usuarioId === 'null' || usuarioId === 'undefined') {
      console.warn("⚠️ 'usuario_id' está corrupto o es null en el localStorage. Aplicando fallback de emergencia.");
      usuarioId = 'mi-perfil'; 
    }

    console.log("🚀 ID definitivo enviado al Router:", usuarioId);
    
    this.mostrarMenu = false;
    
    this.router.navigate(['/mi-perfil/editar/', usuarioId]);
    this.cdr.markForCheck();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  exportarExcel(): void {
    if (this.usuarios.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    const headers = ['ID MongoDB', 'Codigo', 'Usuario', 'Nombre Completo', 'Correo Electronico', 'Telefono'];
    const rows = this.usuarios.map(u => [
      u.id,
      u.codigo_usuario,
      u.usuario,
      u.nombre_completo,
      u.correo_electronico,
      u.telefono
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Usuarios_${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
  }

  exportarPDF(): void {
    if (this.usuarios.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    const tableRows = this.usuarios.map(u => `
      <tr>
        <td style="font-family: monospace; color: #0369a1;">${u.id || ''}</td>
        <td><span style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${u.codigo_usuario}</span></td>
        <td><strong>${u.usuario}</strong></td>
        <td>${u.nombre_completo}</td>
        <td>${u.correo_electronico}</td>
        <td>${u.telefono}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Usuarios</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #334155; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 20px; }
            h1 { margin: 0; color: #1e293b; font-size: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            th { background-color: #f8fafc; color: #64748b; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>👥 Catálogo de Usuarios Registrados</h1>
            <span>Fecha: ${new Date().toLocaleDateString()}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID MongoDB</th>
                <th>Código</th>
                <th>Usuario</th>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th>Teléfono</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  }
}
