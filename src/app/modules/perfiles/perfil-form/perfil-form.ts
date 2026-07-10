import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile';
import { Perfil } from '../../../shared/interfaces/perfil.interface';

@Component({
  selector: 'app-perfil-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil-form.html',
  styleUrls: ['./perfil-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerfilFormComponent implements OnInit {
  perfil: Perfil = {
    codigo_perfil: '',
    nombre_perfil: '',
    secciones_permitidas: []
  };

  esEdicion: boolean = false;
  perfilId: string | null = null;
  cargando: boolean = false;
  errorMensaje: string | null = null;

  // 🛡️ Listado de módulos de tu sistema NoSQL
  modulosDisponibles = [
    { id: 'productos', nombre: '📦 Catálogo de Productos' },
    { id: 'perfiles', nombre: '🔑 Perfiles y Roles' },
    { id: 'usuarios', nombre: '👥 Gestión de Usuarios' },
    { id: 'auditoria', nombre: '🛡️ Bitácora de Auditoría' }
  ];

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 🔍 Detectamos si hay un ID en la ruta (/perfiles/editar/:id)
    this.perfilId = this.route.snapshot.paramMap.get('id');
    if (this.perfilId) {
      this.esEdicion = true;
      this.cargarPerfil(this.perfilId);
    }
  }

  cargarPerfil(id: string): void {
    this.profileService.obtenerPorId(id).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.perfil = response.data;
          if (!this.perfil.secciones_permitidas) {
            this.perfil.secciones_permitidas = [];
          }
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.errorMensaje = 'No se pudo obtener el perfil de MongoDB.';
        this.cdr.markForCheck();
      }
    });
  }

  // 🔄 Agrega o quita elementos del arreglo NoSQL según los clicks de los checkboxes
  onCheckboxChange(moduloId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.perfil.secciones_permitidas.includes(moduloId)) {
        this.perfil.secciones_permitidas.push(moduloId);
      }
    } else {
      this.perfil.secciones_permitidas = this.perfil.secciones_permitidas.filter(m => m !== moduloId);
    }
  }

  marcarCheckbox(moduloId: string): boolean {
    return this.perfil.secciones_permitidas ? this.perfil.secciones_permitidas.includes(moduloId) : false;
  }

  guardar(): void {
    this.cargando = true;
    this.cdr.markForCheck();

    if (this.esEdicion) {
      // Modo Edición: Actualiza usando PUT
      this.profileService.actualizar(this.perfilId!, this.perfil).subscribe({
        next: () => {
          this.router.navigate(['/perfiles']).then(() => alert('Perfil actualizado correctamente en MongoDB.'));
        },
        error: () => {
          this.cargando = false;
          this.errorMensaje = 'Error al actualizar el perfil.';
          this.cdr.markForCheck();
        }
      });
    } else {
      // Modo Creación: Registra usando POST
      this.profileService.crear(this.perfil).subscribe({
        next: () => {
          this.router.navigate(['/perfiles']).then(() => alert('Nuevo perfil guardado con éxito.'));
        },
        error: () => {
          this.cargando = false;
          this.errorMensaje = 'Error al crear el perfil.';
          this.cdr.markForCheck();
        }
      });
    }
  }
}
