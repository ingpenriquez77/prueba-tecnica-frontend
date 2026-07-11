import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuditoriaService } from '../../../core/services/auditoria';

@Component({
  selector: 'app-auditoria-historial',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auditoria-historial.html',
  styleUrls: ['./auditoria-historial.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditoriaHistorialComponent implements OnInit {
  historial: any[] = [];
  cargando: boolean = true;
  usuarioLogueado: string | null = '';

  private auditoriaService = inject(AuditoriaService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.usuarioLogueado = localStorage.getItem('usuario_nickname') || 'Administrador';
    this.cargarHistorial();
  }

  tieneAcceso(seccion: string): boolean {
    const secciones = JSON.parse(localStorage.getItem('secciones_permitidas') || '[]');
    return secciones.includes(seccion);
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.cdr.markForCheck();

    this.auditoriaService.obtenerHistorialCompleto().subscribe({
      next: (respuestas) => {
        let todosLosRegistros: any[] = [];

        // Extraemos la data de cada uno de los 3 endpoints de forma segura
        respuestas.forEach(res => {
          if (res && res.data) {
            todosLosRegistros = todosLosRegistros.concat(res.data);
          } else if (Array.isArray(res)) {
            todosLosRegistros = todosLosRegistros.concat(res);
          }
        });

        // 🕒 Ordenamos cronológicamente: lo más reciente primero
        this.historial = todosLosRegistros.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Error al cargar las bitácoras NoSQL:", err);
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  getBadgeClass(accion: string): string {
    const act = accion?.toLowerCase() || '';
    if (act.includes('crear') || act.includes('store')) return 'badge-create';
    if (act.includes('actualizar') || act.includes('update') || act.includes('editar')) return 'badge-edit';
    if (act.includes('eliminar') || act.includes('destroy') || act.includes('delete')) return 'badge-delete';
    return 'badge-info';
  }

  trackByAuditoriaId(index: number, item: any): string {
    return item.id || item._id || index.toString();
  }

  obtenerModuloLegible(accion: string): string {
    const accionNormalizada = accion?.toUpperCase() || '';

    if (accionNormalizada === 'ACTUALIZAR PRODUCTO') return 'Producto';
    if (accionNormalizada === 'ACTUALIZAR PERFIL') return 'Perfil';
    if (accionNormalizada === 'ACTUALIZAR USUARIO') return 'Usuario';

    if (accionNormalizada === 'ELIMINAR PRODUCTO') return 'Producto';
    if (accionNormalizada === 'ELIMINAR PERFIL') return 'Perfil';
    if (accionNormalizada === 'ELIMINAR USUARIO') return 'Usuario';

    return 'Sistema';
  }

  obtenerDescripcion(accion: string): string {
      const accionNormalizada = accion?.toUpperCase() || '';

      if (accionNormalizada === 'ACTUALIZAR PRODUCTO') return 'Se actalizo el Producto';
      if (accionNormalizada === 'ACTUALIZAR PERFIL') return 'Se actualizo el Perfil';
      if (accionNormalizada === 'ACTUALIZAR USUARIO') return 'Se actualizo el Usuario';

      if (accionNormalizada === 'ELIMINAR PRODUCTO') return 'Se elimino el Producto';
      if (accionNormalizada === 'ELIMINAR PERFIL') return 'Se elimino el Perfil';
      if (accionNormalizada === 'ELIMINAR USUARIO') return 'Se elimino el Usuario';

      return 'Sistema';
    }
}
