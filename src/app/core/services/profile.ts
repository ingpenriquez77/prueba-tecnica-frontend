import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = `${environment.apiUrl}/perfiles`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  obtenerPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  crear(perfil: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, perfil);
  }

  actualizar(id: string, perfil: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, perfil);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
