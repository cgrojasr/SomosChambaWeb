import { Injectable } from '@angular/core';
import { POSTULANTE_REGISTRO_STORAGE_KEY, PostulanteRegistroModel } from '../../models/postulante-registro-model';

const AUTENTICACION_SESION_STORAGE_KEY = 'somoschamba.autenticacion.sesion';
const AUTENTICACION_INTENTOS_STORAGE_KEY = 'somoschamba.autenticacion.intentos';
const AUTENTICACION_RECUPERACION_STORAGE_KEY = 'somoschamba.autenticacion.recuperacion';
const MAX_INTENTOS_FALLIDOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;

export interface SesionPostulanteModel {
  correo: string;
  nombre: string;
  distrito: string;
  inicioSesion: string;
}

interface EstadoIntentosModel {
  failedAttempts: number;
  blockedUntil?: string;
}

interface RecuperacionModel {
  codigo: string;
  correo: string;
  createdAt: string;
  expiresAt: string;
}

export type LoginResultado =
  | { ok: true; session: SesionPostulanteModel }
  | { ok: false; reason: 'invalid-credentials'; remainingAttempts: number }
  | { ok: false; reason: 'unverified-account'; verificationLink: string }
  | { ok: false; reason: 'locked'; blockedUntil: string; remainingMs: number };

export type ReenvioVerificacionResultado =
  | { ok: true; verificationLink: string }
  | { ok: false; reason: 'account-not-found' | 'already-verified' };

export type RecuperacionResultado =
  | { ok: true; recoveryCode: string; recoveryLink: string }
  | { ok: false; reason: 'account-not-found' };

@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  iniciarSesion(correo: string, contrasena: string): LoginResultado {
    const correoNormalizado = this.normalizarCorreo(correo);

    const bloqueoActual = this.obtenerBloqueo(correoNormalizado);
    if (bloqueoActual) {
      return bloqueoActual;
    }

    const cuenta = this.obtenerCuentaPorCorreo(correoNormalizado);

    if (!cuenta || cuenta.contrasena !== contrasena) {
      const estadoIntentos = this.registrarIntentoFallido(correoNormalizado);

      if (estadoIntentos.blockedUntil) {
        return {
          ok: false,
          reason: 'locked',
          blockedUntil: estadoIntentos.blockedUntil,
          remainingMs: estadoIntentos.remainingMs ?? BLOQUEO_MS,
        };
      }

      return {
        ok: false,
        reason: 'invalid-credentials',
        remainingAttempts: estadoIntentos.remainingAttempts,
      };
    }

    this.limpiarIntentos(correoNormalizado);

    if (!cuenta.verificado) {
      return {
        ok: false,
        reason: 'unverified-account',
        verificationLink: this.generarEnlaceVerificacion(cuenta),
      };
    }

    const session: SesionPostulanteModel = {
      correo: cuenta.correo,
      nombre: cuenta.nombre,
      distrito: cuenta.distrito,
      inicioSesion: new Date().toISOString(),
    };

    localStorage.setItem(AUTENTICACION_SESION_STORAGE_KEY, JSON.stringify(session));

    return {
      ok: true,
      session,
    };
  }

  reenviarVerificacion(correo: string): ReenvioVerificacionResultado {
    const correoNormalizado = this.normalizarCorreo(correo);
    const registros = this.obtenerRegistros();
    const indice = registros.findIndex((registro) => registro.correo === correoNormalizado);

    if (indice === -1) {
      return { ok: false, reason: 'account-not-found' };
    }

    const cuenta = registros[indice];

    if (cuenta.verificado) {
      return { ok: false, reason: 'already-verified' };
    }

    const tokenVerificacion = this.generarToken();
    registros[indice] = {
      ...cuenta,
      tokenVerificacion,
    };
    this.guardarRegistros(registros);

    return {
      ok: true,
      verificationLink: `/postulante/registro?token=${tokenVerificacion}`,
    };
  }

  solicitarRecuperacionContrasena(correo: string): RecuperacionResultado {
    const correoNormalizado = this.normalizarCorreo(correo);
    const cuenta = this.obtenerCuentaPorCorreo(correoNormalizado);

    if (!cuenta) {
      return { ok: false, reason: 'account-not-found' };
    }

    const codigo = this.generarToken();
    const recuperaciones = this.obtenerRecuperaciones();
    recuperaciones[correoNormalizado] = {
      codigo,
      correo: correoNormalizado,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
    this.guardarRecuperaciones(recuperaciones);

    return {
      ok: true,
      recoveryCode: codigo,
      recoveryLink: `/login?reset=${codigo}`,
    };
  }

  obtenerSesionActual(): SesionPostulanteModel | null {
    const raw = localStorage.getItem(AUTENTICACION_SESION_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as SesionPostulanteModel;
    } catch {
      localStorage.removeItem(AUTENTICACION_SESION_STORAGE_KEY);
      return null;
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem(AUTENTICACION_SESION_STORAGE_KEY);
  }

  private obtenerCuentaPorCorreo(correo: string): PostulanteRegistroModel | null {
    return this.obtenerRegistros().find((registro) => registro.correo === correo) ?? null;
  }

  private obtenerRegistros(): PostulanteRegistroModel[] {
    const raw = localStorage.getItem(POSTULANTE_REGISTRO_STORAGE_KEY);

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
    localStorage.setItem(POSTULANTE_REGISTRO_STORAGE_KEY, JSON.stringify(registros));
  }

  private obtenerBloqueo(correo: string): LoginResultado | null {
    const estados = this.obtenerEstadosIntentos();
    const estado = estados[correo];

    if (!estado || !estado.blockedUntil) {
      return null;
    }

    const blockedUntilMs = new Date(estado.blockedUntil).getTime();

    if (Number.isNaN(blockedUntilMs) || blockedUntilMs <= Date.now()) {
      delete estados[correo];
      this.guardarEstadosIntentos(estados);
      return null;
    }

    return {
      ok: false,
      reason: 'locked',
      blockedUntil: estado.blockedUntil,
      remainingMs: blockedUntilMs - Date.now(),
    };
  }

  private registrarIntentoFallido(correo: string): { remainingAttempts: number; blockedUntil?: string; remainingMs?: number } {
    const estados = this.obtenerEstadosIntentos();
    const estadoActual = estados[correo] ?? { failedAttempts: 0 };
    const failedAttempts = estadoActual.failedAttempts + 1;

    if (failedAttempts >= MAX_INTENTOS_FALLIDOS) {
      const blockedUntil = new Date(Date.now() + BLOQUEO_MS).toISOString();

      estados[correo] = {
        failedAttempts: 0,
        blockedUntil,
      };
      this.guardarEstadosIntentos(estados);

      return {
        remainingAttempts: 0,
        blockedUntil,
        remainingMs: BLOQUEO_MS,
      };
    }

    estados[correo] = {
      failedAttempts,
    };
    this.guardarEstadosIntentos(estados);

    return {
      remainingAttempts: MAX_INTENTOS_FALLIDOS - failedAttempts,
    };
  }

  private limpiarIntentos(correo: string): void {
    const estados = this.obtenerEstadosIntentos();

    if (!estados[correo]) {
      return;
    }

    delete estados[correo];
    this.guardarEstadosIntentos(estados);
  }

  private obtenerEstadosIntentos(): Record<string, EstadoIntentosModel> {
    const raw = localStorage.getItem(AUTENTICACION_INTENTOS_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, EstadoIntentosModel>;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private guardarEstadosIntentos(estados: Record<string, EstadoIntentosModel>): void {
    localStorage.setItem(AUTENTICACION_INTENTOS_STORAGE_KEY, JSON.stringify(estados));
  }

  private obtenerRecuperaciones(): Record<string, RecuperacionModel> {
    const raw = localStorage.getItem(AUTENTICACION_RECUPERACION_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, RecuperacionModel>;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private guardarRecuperaciones(recuperaciones: Record<string, RecuperacionModel>): void {
    localStorage.setItem(AUTENTICACION_RECUPERACION_STORAGE_KEY, JSON.stringify(recuperaciones));
  }

  private normalizarCorreo(correo: string): string {
    return correo.trim().toLowerCase();
  }

  private generarToken(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private generarEnlaceVerificacion(cuenta: PostulanteRegistroModel): string {
    const tokenVerificacion = cuenta.tokenVerificacion ?? this.generarToken();
    return `/postulante/registro?token=${tokenVerificacion}`;
  }
}