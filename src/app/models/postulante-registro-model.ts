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

export const POSTULANTE_REGISTRO_STORAGE_KEY = 'somoschamba_postulantes';