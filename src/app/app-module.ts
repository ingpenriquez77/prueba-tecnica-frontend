import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app';

// Componentes de Autenticación
import { LoginComponent } from './modules/auth/login/login';

// Componentes de Productos
import { ProductoListaComponent } from './modules/productos/producto-lista/producto-lista';
import { ProductoFormComponent } from './modules/productos/producto-form/producto-form';

// Componentes de Perfiles
import { PerfilListaComponent } from './modules/perfiles/perfil-lista/perfil-lista';
import { PerfilFormComponent } from './modules/perfiles/perfil-form/perfil-form';

// Componentes de Usuarios
import { UsuarioListaComponent } from './modules/usuarios/usuario-lista/usuario-lista';
import { UsuarioFormComponent } from './modules/usuarios/usuario-form/usuario-form';
import { MiPerfilFormComponent } from './modules/mi-perfil-form/mi-perfil-form';

import { AuthInterceptor } from './core/interceptors/auth-interceptor';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    AppComponent,
    LoginComponent,
    ProductoListaComponent,
    PerfilListaComponent,
    ProductoFormComponent,
    PerfilFormComponent,
    UsuarioListaComponent,
    UsuarioFormComponent,
    MiPerfilFormComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent] // Mantener el arranque nativo de la SPA
})
export class AppModule { }