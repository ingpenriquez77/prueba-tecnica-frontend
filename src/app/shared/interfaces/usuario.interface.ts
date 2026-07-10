export interface Usuario {
  id?: string;
  codigo_usuario: string;
  usuario: string;
  nombre_completo: string;
  correo_electronico: string;
  password?: string;
  telefono: string;
  foto_perfil?: string;
  perfil_ids: string[];
}
