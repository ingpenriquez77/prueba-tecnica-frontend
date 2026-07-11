import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../core/services/profile';
import { AuthService } from '../../../core/services/auth';
import { Perfil } from '../../../shared/interfaces/perfil.interface';

@Component({
  selector: 'app-perfil-lista',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil-lista.html',
  styleUrls: ['./perfil-lista.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerfilListaComponent implements OnInit {
  perfiles: Perfil[] = [];
  cargando: boolean = true;
  usuarioLogueado: string | null = '';
  mostrarMenu: boolean = false;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.usuarioLogueado = localStorage.getItem('usuario_nickname');
    this.cargarPerfiles();
  }

  tieneAcceso(seccion: string): boolean {
    const secciones = JSON.parse(localStorage.getItem('secciones_permitidas') || '[]');
    return secciones.includes(seccion);
  }
  
  cargarPerfiles(): void {
    this.cargando = true;
    this.cdr.markForCheck();

    this.profileService.obtenerTodos().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.perfiles = response.data;
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

  /**
   * OPTIMIZACIÓN MAESTRA: Rastrera cada fila por su ID único de MongoDB
   * Evita lag visual al recargar el listado NoSQL
   */
  trackByPerfilId(index: number, perfil: Perfil): string {
    return perfil.id || '';
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

  eliminarPerfil(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este perfil? Esto afectará a los usuarios vinculados.')) {
      this.profileService.eliminar(id).subscribe({
        next: () => this.cargarPerfiles(),
        error: () => alert('No se pudo eliminar el perfil.')
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // 📊 EXPORTAR PERFILES A EXCEL (CSV)
    exportarExcel(): void {
      if (this.perfiles.length === 0) {
        alert('No hay datos para exportar.');
        return;
      }

      const headers = ['ID MongoDB', 'Codigo Perfil', 'Nombre del Rol', 'Modulos Permitidos'];

      const rows = this.perfiles.map(p => [
        p.id,
        p.codigo_perfil,
        p.nombre_perfil,
        p.secciones_permitidas ? p.secciones_permitidas.join(' - ') : 'Ninguno'
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.setAttribute("href", url);
      link.setAttribute("download", `Reporte_Perfiles_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // 📕 EXPORTAR PERFILES A PDF LIMPITO
    exportarPDF(): void {
      if (this.perfiles.length === 0) {
        alert('No hay datos para exportar.');
        return;
      }

      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (!printWindow) {
        alert('Por favor, permite las ventanas emergentes para descargar el PDF.');
        return;
      }

      const tableRows = this.perfiles.map(p => `
        <tr>
          <td style="font-family: monospace; color: #0369a1;">${p.id || ''}</td>
          <td><span style="background-color: #f0fdf4; color: #166534; padding: 3px 6px; border-radius: 4px; font-family: monospace; font-weight: bold;">${p.codigo_perfil}</span></td>
          <td><strong>${p.nombre_perfil}</strong></td>
          <td>${p.secciones_permitidas && p.secciones_permitidas.length > 0 ? p.secciones_permitidas.join(', ') : 'Ninguno'}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Reporte de Perfiles y Roles</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; color: #334155; padding: 20px; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 20px; }
              h1 { margin: 0; color: #1e293b; font-size: 24px; }
              .date { color: #64748b; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
              th { background-color: #f8fafc; color: #64748b; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🔑 Reporte de Perfiles y Roles de Usuario</h1>
              <span class="date">Fecha de Emisión: ${new Date().toLocaleDateString()}</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID MongoDB</th>
                  <th>Código</th>
                  <th>Nombre del Rol</th>
                  <th>Módulos Permitidos</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
}
