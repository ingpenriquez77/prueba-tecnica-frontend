import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Extraemos el token del localStorage de la sesión
    const token = localStorage.getItem('api_token');

    // Si el token existe en el navegador, clonamos la petición y le ponemos las cabeceras Bearer
    if (token) {
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(clonedReq);
    }

    // Si no hay token (como en el login), la petición fluye de forma normal
    return next.handle(req);
  }
}
