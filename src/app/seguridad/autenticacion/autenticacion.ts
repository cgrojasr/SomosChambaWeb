import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AutenticacionService,
  LoginResultado,
} from './autenticacion.service';

@Component({
  selector: 'app-autenticacion',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './autenticacion.html',
  styleUrl: './autenticacion.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Autenticacion {
  private readonly formBuilder = inject(FormBuilder);
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly router = inject(Router);

  readonly formulario = this.formBuilder.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly formularioRecuperacion = this.formBuilder.nonNullable.group({
    correoRecuperacion: ['', [Validators.required, Validators.email]],
  });

  readonly enviado = signal(false);
  readonly enviadoRecuperacion = signal(false);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeVerificacion = signal<string | null>(null);
  readonly enlaceVerificacion = signal<string | null>(null);
  readonly codigoRecuperacion = signal<string | null>(null);
  readonly modo = signal<'login' | 'recuperacion'>('login');
  readonly bloqueoHasta = signal<string | null>(null);
  readonly correoPendienteVerificacion = signal<string | null>(null);

  readonly mostrarErrores = computed(() => this.enviado() || this.formulario.touched);
  readonly mostrarErroresRecuperacion = computed(() => this.enviadoRecuperacion() || this.formularioRecuperacion.touched);
  readonly tokenVerificacion = computed(() => {
    const enlace = this.enlaceVerificacion();
    return enlace ? enlace.split('token=')[1] ?? null : null;
  });

  iniciarSesion(): void {
    this.enviado.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    this.mensajeVerificacion.set(null);
    this.enlaceVerificacion.set(null);
    this.codigoRecuperacion.set(null);
    this.correoPendienteVerificacion.set(null);
    this.bloqueoHasta.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensajeError.set('Debes completar correctamente los campos obligatorios.');
      return;
    }

    const resultado = this.autenticacionService.iniciarSesion(
      this.formulario.controls.correo.value,
      this.formulario.controls.contrasena.value
    );

    if (!resultado.ok) {
      this.procesarErrorLogin(resultado);
      return;
    }

    this.mensajeExito.set(`Bienvenido, ${resultado.session.nombre}. Redirigiendo a tu panel principal.`);
    void this.router.navigate(['/postulante/panel']);
  }

  reenviaVerificacion(): void {
    const correo = this.correoPendienteVerificacion() ?? this.formulario.controls.correo.value;
    const resultado = this.autenticacionService.reenviarVerificacion(correo);

    if (!resultado.ok) {
      this.mensajeError.set(
        resultado.reason === 'already-verified'
          ? 'La cuenta ya fue verificada.'
          : 'No encontramos una cuenta para reenviar la verificación.'
      );
      return;
    }

    this.enlaceVerificacion.set(resultado.verificationLink);
    this.mensajeVerificacion.set('Te reenviamos el enlace de verificación. Revisa tu correo registrado.');
  }

  solicitarRecuperacion(): void {
    this.enviadoRecuperacion.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    this.codigoRecuperacion.set(null);

    if (this.formularioRecuperacion.invalid) {
      this.formularioRecuperacion.markAllAsTouched();
      this.mensajeError.set('Ingresa un correo válido para recuperar tu contraseña.');
      return;
    }

    const resultado = this.autenticacionService.solicitarRecuperacionContrasena(
      this.formularioRecuperacion.controls.correoRecuperacion.value
    );

    if (!resultado.ok) {
      this.mensajeError.set('No encontramos una cuenta registrada con ese correo.');
      return;
    }

    this.codigoRecuperacion.set(resultado.recoveryCode);
    this.mensajeExito.set(
      `Se envió un código de recuperación al correo registrado. Código demo: ${resultado.recoveryCode}`
    );
  }

  cambiarModo(modo: 'login' | 'recuperacion'): void {
    this.modo.set(modo);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
  }

  private procesarErrorLogin(resultado: Exclude<LoginResultado, { ok: true }>): void {
    switch (resultado.reason) {
      case 'invalid-credentials':
        this.mensajeError.set('Las credenciales no son válidas. Verifica tu correo y contraseña.');
        return;
      case 'unverified-account':
        this.correoPendienteVerificacion.set(this.formulario.controls.correo.value);
        this.enlaceVerificacion.set(resultado.verificationLink);
        this.mensajeVerificacion.set(
          'Tu cuenta no está verificada. Debes verificar tu correo para continuar.'
        );
        return;
      case 'locked':
        this.bloqueoHasta.set(resultado.blockedUntil);
        this.mensajeError.set(
          `Has superado el número permitido de intentos. Intenta nuevamente en ${this.formatearDuracion(resultado.remainingMs)}.`
        );
        return;
    }
  }

  private formatearDuracion(milisegundos: number): string {
    const totalSegundos = Math.max(0, Math.ceil(milisegundos / 1000));
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;

    if (minutos === 0) {
      return `${segundos} segundos`;
    }

    return segundos > 0 ? `${minutos} minutos y ${segundos} segundos` : `${minutos} minutos`;
  }
}
