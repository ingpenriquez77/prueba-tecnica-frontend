import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'; // 🚀 Importado ChangeDetectorRef y Strategy
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './producto-form.html',
  styleUrls: ['./producto-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductoFormComponent implements OnInit {
  producto: any = {
    nombre_producto: '',
    marca: '',
    precio: null
  };

  esEdicion: boolean = false;
  productoId: string | null = null;
  errorMensaje: string | null = null;
  cargando: boolean = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef // Inyectado para forzar renderizados controlados
  ) {}

  ngOnInit(): void {
    this.productoId = this.route.snapshot.paramMap.get('id');
    if (this.productoId) {
      this.esEdicion = true;
      this.cargarDetalleProducto(this.productoId);
    }
  }

  cargarDetalleProducto(id: string): void {
    this.productService.obtenerPorId(id).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.producto = response.data;
          // Fuerza el pintado de datos de MongoDB en el formulario de inmediato
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.errorMensaje = 'No se pudo recuperar la información del producto.';
        this.cdr.markForCheck();
      }
    });
  }

  guardar(): void {
    this.cargando = true;
    this.errorMensaje = null;
    this.cdr.markForCheck(); // Desactiva visualmente el botón de inmediato cambiando el estado a cargando

    if (this.esEdicion) {
      this.productService.actualizar(this.productoId!, this.producto).subscribe({
        next: () => {
          // Redirección inmediata y limpia sin congelar la pestaña
          this.router.navigate(['/productos']).then(() => {
            alert('Producto actualizado con éxito. Movimiento registrado en bitácora.');
          });
        },
        error: (err) => {
          this.cargando = false;
          this.errorMensaje = err.error?.message || 'Error al actualizar el producto.';
          this.cdr.markForCheck(); 
        }
      });
    } else {
      this.productService.crear(this.producto).subscribe({
        next: () => {
          this.router.navigate(['/productos']).then(() => {
            alert('Producto creado con éxito. Movimiento registrado en bitácora.');
          });
        },
        error: (err) => {
          this.cargando = false;
          this.errorMensaje = err.error?.message || 'Error al guardar el producto.';
          this.cdr.markForCheck();
        }
      });
    }
  }
}
