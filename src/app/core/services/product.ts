import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto } from '../../shared/interfaces/producto.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  obtenerPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  crear(producto: Partial<Producto>): Observable<any> {
    return this.http.post<any>(this.baseUrl, producto);
  }

  actualizar(id: string, producto: Partial<Producto>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, producto);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
