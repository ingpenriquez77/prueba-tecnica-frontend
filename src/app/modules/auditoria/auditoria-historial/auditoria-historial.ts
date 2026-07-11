import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuditoriaService } from '../../../core/services/auditoria';
import { AuthService } from '../../../core/services/auth';

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
  mostrarMenu: boolean = false;

  private auditoriaService = inject(AuditoriaService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private authService = inject(AuthService); 

  ngOnInit(): void {
    this.usuarioLogueado = localStorage.getItem('usuario_nickname') || 'Administrador';
    this.cargarHistorial();
  }

  // 🎯 CORREGIDO: Renombrado exactamente a tieneAcceso para corregir el error del compilador
  tieneAcceso(seccion: string): boolean {
    const rawSecciones = localStorage.getItem('secciones_permitidas');
    if (!rawSecciones) return false;

    try {
      const secciones = JSON.parse(rawSecciones);
      return Array.isArray(secciones) && secciones.includes(seccion);
    } catch (e) {
      return false; 
    }
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

  // ⚡ Abre y cierra el menú desplegable superior del Navbar
  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.mostrarMenu = !this.mostrarMenu;
    this.cdr.markForCheck();
  }

  // ⚡ Cierra el menú automáticamente si el usuario hace clic fuera de él
  @HostListener('document:click')
  clickAfuera(): void {
    if (this.mostrarMenu) {
      this.mostrarMenu = false;
      this.cdr.markForCheck();
    }
  }

  // ⚡ Redirige al formulario protegido pasando el ID activo extraído del login
  irAEditarPerfil(): void {
    let usuarioId = localStorage.getItem('usuario_id');
    
    // 🎯 LIMPIEZA TOTAL: Valida y limpia strings corruptas del almacenamiento local
    if (!usuarioId || usuarioId === 'null' || usuarioId === 'undefined') {
      console.warn("⚠️ 'usuario_id' está corrupto o es null en el localStorage. Aplicando fallback de emergencia.");
      usuarioId = 'mi-perfil'; 
    }

    console.log("🚀 ID definitivo enviado al Router desde Auditoría:", usuarioId);
    
    this.mostrarMenu = false;
    
    // 🎯 RUTA SIN DIAGONAL FINAL
    this.router.navigate(['/mi-perfil/editar', usuarioId]);
    this.cdr.markForCheck();
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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

    if (accionNormalizada === 'ACTUALIZAR PRODUCTO') return 'Se actualizó el Producto';
    if (accionNormalizada === 'ACTUALIZAR PERFIL') return 'Se actualizó el Perfil';
    if (accionNormalizada === 'ACTUALIZAR USUARIO') return 'Se actualizó el Usuario';

    if (accionNormalizada === 'ELIMINAR PRODUCTO') return 'Se eliminó el Producto';
    if (accionNormalizada === 'ELIMINAR PERFIL') return 'Se eliminó el Perfil';
    if (accionNormalizada === 'ELIMINAR USUARIO') return 'Se eliminó el Usuario';

    return 'Sistema';
  }
}