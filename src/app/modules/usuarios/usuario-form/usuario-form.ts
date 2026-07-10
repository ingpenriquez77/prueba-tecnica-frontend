import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user';
import { ProfileService } from '../../../core/services/profile';
import { Usuario } from '../../../shared/interfaces/usuario.interface';
import { Perfil } from '../../../shared/interfaces/perfil.interface';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './usuario-form.html',
  styleUrls: ['./usuario-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuarioFormComponent implements OnInit {
  usuario: Usuario = {
    codigo_usuario: '',
    usuario: '',
    nombre_completo: '',
    correo_electronico: '',
    password: '',
    telefono: '',
    foto_perfil: '',
    perfil_ids: []
  };

  perfilesDisponibles: Perfil[] = [];
  esEdicion: boolean = false;
  usuarioId: string | null = null;
  cargando: boolean = false;
  errorMensaje: string | null = null;

  // 📸 Variable temporal para almacenar el archivo binario real de la imagen
  archivoImagen: File | null = null;

  constructor(
    private userService: UserService,
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPerfiles();
    this.usuarioId = this.route.snapshot.paramMap.get('id');
    if (this.usuarioId) {
      this.esEdicion = true;
      this.cargarUsuario(this.usuarioId);
    }
  }

  cargarPerfiles(): void {
    this.profileService.obtenerTodos().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.perfilesDisponibles = res.data;
        }
        this.cdr.markForCheck();
      }
    });
  }

  cargarUsuario(id: string): void {
    this.userService.obtenerPorId(id).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.usuario = res.data;
          if (!this.usuario.perfil_ids) {
            this.usuario.perfil_ids = [];
          }
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.errorMensaje = 'No se pudo obtener el usuario de MongoDB.';
        this.cdr.markForCheck();
      }
    });
  }

  onFotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.archivoImagen = input.files[0]; // 🚀 Guardamos el archivo binario real para Laravel

      // Renderizar miniatura local en el recuadro chico
      const reader = new FileReader();
      reader.onload = () => {
        this.usuario.foto_perfil = reader.result as string;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(this.archivoImagen);
    }
  }

  onPerfilSelect(perfilId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.usuario.perfil_ids.includes(perfilId)) {
        this.usuario.perfil_ids.push(perfilId);
      }
    } else {
      this.usuario.perfil_ids = this.usuario.perfil_ids.filter(id => id !== perfilId);
    }
  }

  tienePerfil(perfilId: string): boolean {
    return this.usuario.perfil_ids ? this.usuario.perfil_ids.includes(perfilId) : false;
  }

  guardar(): void {
    this.cargando = true;
    this.errorMensaje = null;
    this.cdr.markForCheck();

    // 🚀 Construimos el payload como FormData dinámico
    const formData = new FormData();
    formData.append('codigo_usuario', this.usuario.codigo_usuario);
    formData.append('usuario', this.usuario.usuario);
    formData.append('nombre_completo', this.usuario.nombre_completo);
    formData.append('correo_electronico', this.usuario.correo_electronico);
    formData.append('telefono', this.usuario.telefono);

    // 🔑 CONTRASEÑA INTELIGENTE: Solo viaja si el usuario escribió algo (Nuevo u Opcional en Edición)
    if (this.usuario.password && this.usuario.password.trim() !== '') {
      formData.append('password', this.usuario.password);
    }

    // 🚀 IDs de Perfiles emulando un array nativo
    if (this.usuario.perfil_ids && this.usuario.perfil_ids.length > 0) {
      this.usuario.perfil_ids.forEach(id => {
        formData.append('perfil_ids[]', id);
      });
    } else {
      formData.append('perfil_ids[]', '');
    }

    // 📸 Adjuntamos el archivo de la foto solo si el usuario seleccionó uno nuevo
    if (this.archivoImagen) {
      formData.append('foto_perfil', this.archivoImagen, this.archivoImagen.name);
    }

    if (this.esEdicion) {
      formData.append('_method', 'PUT');

      this.userService.actualizar(this.usuarioId!, formData).subscribe({
        next: () => this.router.navigate(['/usuarios']).then(() => alert('Usuario actualizado con éxito.')),
        error: (err) => {
          this.cargando = false;
          console.error("ERROR AL ACTUALIZAR:", err);
          this.mapearErrorBackend(err);
          this.cdr.markForCheck();
        }
      });
    } else {
      this.userService.crear(formData).subscribe({
        next: () => this.router.navigate(['/usuarios']).then(() => alert('Usuario guardado con éxito.')),
        error: (err) => {
          this.cargando = false;
          console.error("RESPUESTA COMPLETA DEL ERROR DE LARAVEL:", err);
          this.mapearErrorBackend(err);
          this.cdr.markForCheck();
        }
      });
    }
  }

  private mapearErrorBackend(err: any): void {
    if (err.error && err.error.errors) {
      const validationErrors = Object.values(err.error.errors).flat();
      this.errorMensaje = validationErrors.join(' | ');
    } else if (err.error && err.error.message) {
      this.errorMensaje = err.error.message;
    } else {
      this.errorMensaje = `Error del Servidor (Status ${err.status}): ${err.statusText}`;
    }
  }
}
