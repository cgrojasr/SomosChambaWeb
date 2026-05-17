import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostulanteRegistroService } from './postulante-registro.service';

@Component({
  selector: 'app-postulante-registro',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './postulante-registro.html',
  styleUrl: './postulante-registro.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostulanteRegistro implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly registroService = inject(PostulanteRegistroService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formulario = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
    distrito: ['', [Validators.required]],
    aceptaTerminos: [false, [Validators.requiredTrue]]
  });

  readonly enviado = signal(false);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);
  readonly enlaceVerificacion = signal<string | null>(null);
  readonly estadoVerificacion = signal<'ok' | 'error' | null>(null);
  readonly mensajeVerificacion = signal<string | null>(null);

  readonly mostrarErrores = computed(() => this.enviado() || this.formulario.touched);
  readonly tokenVerificacion = computed(() => {
    const enlace = this.enlaceVerificacion();
    return enlace ? enlace.split('token=')[1] ?? null : null;
  });

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      return;
    }

    const cuentaVerificada = this.registroService.verificarCuenta(token);
    this.estadoVerificacion.set(cuentaVerificada ? 'ok' : 'error');
    this.mensajeVerificacion.set(
      cuentaVerificada
        ? 'Tu cuenta fue verificada correctamente. Ya puedes iniciar sesión.'
        : 'El enlace de verificación no es válido o ya fue utilizado.'
    );
  }

  registrar(): void {
    this.enviado.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    this.enlaceVerificacion.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensajeError.set('Debes completar correctamente todos los campos obligatorios.');
      return;
    }

    const resultado = this.registroService.registrar(this.formulario.getRawValue());

    if (!resultado.ok) {
      console.error('Error en registro:', resultado.error);
      this.formulario.controls.correo.setErrors({ correoEnUso: true });
      this.mensajeError.set('El correo ingresado ya está registrado. Usa un correo diferente.');
      return;
    }

    this.mensajeExito.set('Registro exitoso. Te redirigiremos al inicio de sesión.');
    this.enlaceVerificacion.set(resultado.verificationLink);

    setTimeout(() => {
      void this.router.navigate(['/login'], { queryParams: { registered: '1' } });
    }, 1500);
  }
}