import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}`;
  private http = inject(HttpClient);

  constructor() {}

  // Mantenemos el endpoint de Login para la autenticación básica
  login(credenciales: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credenciales);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // 🚀 LA REVERSIÓN: Habilitamos Acceso Total Total
  tieneAcceso(modulo: string): boolean {
    // Ya no revisamos localStorage ni MongoDB.
    // Simplemente decimos "SÍ" a cualquier sección que se pregunte.
    return true;
  }

  logout(): void {
    localStorage.clear();
  }

  recuperarPassword(correo: string): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}/recuperar-password`, { correo_electronico: correo });
    }

  obtenerPerfilActivo(): Observable<any> {
  // Le pega al endpoint propio y separado de tu backend para el perfil
  return this.http.get<any>(`${this.baseUrl}/perfil`); 
    // Nota: Si tu ruta de Laravel es diferente (ej: /api/auth/me o /api/mi-perfil), cámbiala aquí.
  }

  actualizarPerfilActivo(id: string, data: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/${id}`, data); 
  }
}
