export interface PostulanteRegistroModel {
  id?: number;
  nombre: string;
  correo: string;
  contrasena: string;
  distrito: string;
  aceptaTerminos: boolean;
  verificado: boolean;
  fechaRegistro: string;
  tokenVerificacion?: string;
}