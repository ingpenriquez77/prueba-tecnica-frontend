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

  // Listar todos los productos
  obtenerTodos(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  // 🔍 Mostrar detalle de un solo producto por ID de BD
  obtenerPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // Guardar nuevo producto
  crear(producto: Partial<Producto>): Observable<any> {
    return this.http.post<any>(this.baseUrl, producto);
  }

  // Actualizar producto (Usando POST plano si tu ruta de Laravel es POST para evitar fallos de datos)
  actualizar(id: string, producto: Partial<Producto>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, producto);
  }

  // Eliminar producto permanentemente
  eliminar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
