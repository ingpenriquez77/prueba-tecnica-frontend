import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private baseUrl = `${environment.apiUrl}/auditoria`;
  private http = inject(HttpClient);

  obtenerHistorialCompleto(): Observable<any[]> {
    return forkJoin([
      this.http.get<any>(`${this.baseUrl}/productos`),
      this.http.get<any>(`${this.baseUrl}/perfiles`),
      this.http.get<any>(`${this.baseUrl}/usuarios`)
    ]);
  }
}
