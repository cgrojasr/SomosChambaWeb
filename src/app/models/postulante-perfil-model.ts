export interface PostulanteDocumentoModel {
  name: string;
  type: string;
  size: number;
}

export interface PostulantePerfilModel {
  fullName: string;
  district: string;
  birthDate: string;
  skills: string[];
  experience: string;
  documents: PostulanteDocumentoModel[];
  updatedAt: string;
}

export const POSTULANTE_PERFIL_STORAGE_KEY = 'somos-chamba.postulante.perfil';