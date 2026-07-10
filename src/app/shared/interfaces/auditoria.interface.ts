export interface Auditoria {
  id: string;
  usuario: string;
  modulo: string;
  accion: string;
  ip_origen?: string;
  created_at: string;
}
