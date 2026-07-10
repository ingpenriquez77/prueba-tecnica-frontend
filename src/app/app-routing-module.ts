import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './modules/auth/login/login';
import { RecuperarComponent } from './modules/recuperar/recuperar';
import { ProductoListaComponent } from './modules/productos/producto-lista/producto-lista';
import { ProductoFormComponent } from './modules/productos/producto-form/producto-form';
import { PerfilListaComponent } from './modules/perfiles/perfil-lista/perfil-lista';
import { PerfilFormComponent } from './modules/perfiles/perfil-form/perfil-form';
import { UsuarioListaComponent } from './modules/usuarios/usuario-lista/usuario-lista';
import { UsuarioFormComponent } from './modules/usuarios/usuario-form/usuario-form';
import { AuditoriaHistorialComponent } from './modules/auditoria/auditoria-historial/auditoria-historial';

import { AuthGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'recuperar', component: RecuperarComponent },

  // Módulo de Productos
  { path: 'productos', component: ProductoListaComponent, canActivate: [AuthGuard, roleGuard], data: { modulo: 'productos' } },
  { path: 'productos/nuevo', component: ProductoFormComponent, canActivate: [AuthGuard, roleGuard], data: { modulo: 'productos' } },
  { path: 'productos/editar/:id', component: ProductoFormComponent, canActivate: [AuthGuard, roleGuard], data: { modulo: 'productos' } },

  // Módulo de Perfiles
  { path: 'perfiles', component: PerfilListaComponent, canActivate: [AuthGuard, roleGuard], data: { modulo: 'perfiles' } },
  { path: 'perfiles/nuevo', component: PerfilFormComponent, canActivate: [AuthGuard, roleGuard], data: { modulo: 'perfiles' } },
  { path: 'perfiles/editar/:id', component: PerfilFormComponent, canActivate: [AuthGuard, roleGuard], data: { modulo: 'perfiles' } },

  // Módulo de Usuarios
  { path: 'usuarios', component: UsuarioListaComponent, canActivate: [AuthGuard, roleGuard], data: { modulo: 'usuarios' } },
  { path: 'usuarios/nuevo', component: UsuarioFormComponent, canActivate: [AuthGuard, roleGuard], data: { modulo: 'usuarios' } },
  { path: 'usuarios/editar/:id', component: UsuarioFormComponent, canActivate: [AuthGuard, roleGuard], data: { modulo: 'usuarios' } },

  // Módulo de Auditoría
  { path: 'auditoria', component: AuditoriaHistorialComponent, canActivate: [AuthGuard, roleGuard], data: { modulo: 'auditoria' } },

  { path: '', redirectTo: '/productos', pathMatch: 'full' },
  { path: '**', redirectTo: '/productos' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
