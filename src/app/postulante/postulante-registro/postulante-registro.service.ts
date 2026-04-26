import { Injectable } from '@angular/core';
import { PostulanteRegistroModel } from '../../models/postulante-registro-model';

interface RegistroExitoso {
  ok: true;
  verificationLink: string;
}

interface RegistroFallido {
  ok: false;
  error: 'correo-en-uso';
}

type RegistroResultado = RegistroExitoso | RegistroFallido;

@Injectable({ providedIn: 'root' })
export class PostulanteRegistroService {
  private readonly storageKey = 'somoschamba_postulantes';

  registrar(
    payload: Pick<PostulanteRegistroModel, 'nombre' | 'correo' | 'contrasena' | 'distrito' | 'aceptaTerminos'>
  ): RegistroResultado {
    const registros = this.obtenerRegistros();
    const correoNormalizado = payload.correo.trim().toLowerCase();

    if (registros.some((registro) => registro.correo.trim().toLowerCase() === correoNormalizado)) {
      return {
        ok: false,
        error: 'correo-en-uso'
      };
    }

    const tokenVerificacion = this.generarTokenVerificacion();
    const nuevoRegistro: PostulanteRegistroModel = {
      id: Date.now(),
      nombre: payload.nombre.trim(),
      correo: correoNormalizado,
      contrasena: payload.contrasena,
      distrito: payload.distrito.trim(),
      aceptaTerminos: payload.aceptaTerminos,
      verificado: false,
      fechaRegistro: new Date().toISOString(),
      tokenVerificacion
    };

    registros.push(nuevoRegistro);
    this.guardarRegistros(registros);

    return {
      ok: true,
      verificationLink: `/postulante/registro?token=${tokenVerificacion}`
    };
  }

  verificarCuenta(token: string): boolean {
    const registros = this.obtenerRegistros();
    const indice = registros.findIndex((registro) => registro.tokenVerificacion === token);

    if (indice === -1) {
      return false;
    }

    registros[indice] = {
      ...registros[indice],
      verificado: true,
      tokenVerificacion: undefined
    };

    this.guardarRegistros(registros);
    return true;
  }

  private obtenerRegistros(): PostulanteRegistroModel[] {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as PostulanteRegistroModel[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private guardarRegistros(registros: PostulanteRegistroModel[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(registros));
  }

  private generarTokenVerificacion(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
