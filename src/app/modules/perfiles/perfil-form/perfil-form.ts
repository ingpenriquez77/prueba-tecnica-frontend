import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile'; // Ajusta la ruta de tus servicios

@Component({
  selector: 'app-perfil-form', 
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil-form.html', 
  styleUrls: ['./perfil-form.css'],   
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerfilFormComponent implements OnInit {
  perfil: any = {
    codigo_perfil: '',
    nombre_perfil: '',
    secciones_permitidas: [] 
  };

  // Listado estático de módulos que coinciden exactamente con tus slugs del Sidebar e interfaz
  modulosDisponibles = [
    { id: 'productos', nombre: '📦 Productos e Inventario' },
    { id: 'perfiles', nombre: '🔑 Perfiles y Roles' },
    { id: 'usuarios', nombre: '👥 Gestión de Usuarios' },
    { id: 'auditoria', nombre: '🛡️ Bitácora de Auditoría' }
  ];

  esEdicion = false;
  cargando = false;
  errorMensaje: string | null = null;

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.cargarPerfil(id);
    }
  }

  cargarPerfil(id: string): void {
    this.profileService.obtenerPorId(id).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.perfil = res.data;
          if (!this.perfil.secciones_permitidas) {
            this.perfil.secciones_permitidas = [];
          }
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.errorMensaje = 'Error al recuperar los datos del rol desde MongoDB.';
        this.cdr.markForCheck();
      }
    });
  }

  marcarCheckbox(moduloId: string): boolean {
    return this.perfil.secciones_permitidas ? this.perfil.secciones_permitidas.includes(moduloId) : false;
  }

  onCheckboxChange(moduloId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.perfil.secciones_permitidas.includes(moduloId)) {
        this.perfil.secciones_permitidas.push(moduloId);
      }
    } else {
      this.perfil.secciones_permitidas = this.perfil.secciones_permitidas.filter((id: string) => id !== moduloId);
    }
    // 🚀 Informa a la estrategia OnPush para refrescar la validez del botón al instante
    this.cdr.markForCheck(); 
  }

  /**
   * 🛠️ VALIDACIÓN MÍNIMA DE SECCIONES
   * Retorna true únicamente si el arreglo NoSQL posee al menos una opción asignada
   */
  validarSecciones(): boolean {
    return this.perfil.secciones_permitidas && this.perfil.secciones_permitidas.length >= 1;
  }

  guardar(): void {
    if (!this.validarSecciones()) {
      this.errorMensaje = 'Operación denegada. Debes seleccionar obligatoriamente al menos una sección.';
      this.cdr.markForCheck();
      return;
    }

    this.cargando = true;
    this.errorMensaje = null;
    this.cdr.markForCheck();

    const peticion = this.esEdicion
      ? this.profileService.actualizar(this.perfil.id, this.perfil)
      : this.profileService.crear(this.perfil);

    peticion.subscribe({
      next: (res: any) => {
        this.cargando = false;
        if (res.success) {
          this.router.navigate(['/perfiles']).then(() => alert('Perfil procesado correctamente.'));
        } else {
          this.errorMensaje = res.message || 'Ocurrió un inconveniente al guardar.';
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        this.cargando = false;
        if (err.error && err.error.errors) {
          this.errorMensaje = Object.values(err.error.errors).flat().join(' | ');
        } else {
          this.errorMensaje = err.error?.message || 'Error de conexión con el servidor.';
        }
        this.cdr.markForCheck();
      }
    });
  }
}