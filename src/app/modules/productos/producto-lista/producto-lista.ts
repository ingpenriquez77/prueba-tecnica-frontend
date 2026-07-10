import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product';
import { AuthService } from '../../../core/services/auth';
import { Producto } from '../../../shared/interfaces/producto.interface';

@Component({
  selector: 'app-producto-lista',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './producto-lista.html',
  styleUrls: ['./producto-lista.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductoListaComponent implements OnInit {
  productos: Producto[] = [];
  cargando: boolean = true;
  usuarioLogueado: string | null = '';

  constructor(
    private productService: ProductService,
    public authService: AuthService, // 🚀 CAMBIADO A PUBLIC para usarlo en el HTML
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.usuarioLogueado = localStorage.getItem('usuario_nickname');
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.cdr.markForCheck();

    this.productService.obtenerTodos().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.productos = response.data;
        }
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  trackByProductoId(index: number, producto: Producto): string {
    return producto.id;
  }

  eliminarProducto(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productService.eliminar(id).subscribe({
        next: () => this.cargarProductos(),
        error: () => alert('No se pudo eliminar.')
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  exportarExcel(): void {
    if (this.productos.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    const headers = ['ID', 'Codigo', 'Nombre', 'Marca', 'Precio'];
    const rows = this.productos.map(p => [p.id, p.codigo_producto, p.nombre_producto, p.marca, p.precio]);
    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Productos_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportarPDF(): void {
    if (this.productos.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Por favor, permite las ventanas emergentes para descargar el PDF.');
      return;
    }
    const tableRows = this.productos.map(p => `
      <tr>
        <td style="font-family: monospace; color: #0369a1;">${p.id}</td>
        <td><strong>${p.codigo_producto}</strong></td>
        <td>${p.nombre_producto}</td>
        <td>${p.marca}</td>
        <td>$${Number(p.precio).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Productos</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #334155; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 20px; }
            h1 { margin: 0; color: #1e293b; font-size: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            th { background-color: #f8fafc; color: #64748b; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📦 Catálogo de Productos Registrados</h1>
            <span>Fecha: ${new Date().toLocaleDateString()}</span>
          </div>
          <table>
            <thead><tr><th>ID MongoDB</th><th>Código</th><th>Nombre</th><th>Marca</th><th>Precio</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  }
}
