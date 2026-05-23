import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { PostulanteRegistro } from './postulante-registro';
import { PostulanteRegistroService } from './postulante-registro.service';

describe('PostulanteRegistro', () => {
  let component: PostulanteRegistro;
  let fixture: ComponentFixture<PostulanteRegistro>;
  let router: Router;
  let registroService: PostulanteRegistroService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [PostulanteRegistro],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PostulanteRegistro);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    registroService = TestBed.inject(PostulanteRegistroService);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe impedir registro cuando faltan campos obligatorios', () => {
    component.registrar();

    expect(component.formulario.invalid).toBe(true);
    expect(component.mensajeError()).toContain('campos obligatorios');
  });

  it('debe marcar correo invalido', () => {
    component.formulario.patchValue({
      nombre: 'Ana',
      correo: 'correo-invalido',
      contrasena: '12345678',
      distrito: 'Miraflores',
      aceptaTerminos: true
    });

    component.registrar();

    expect(component.formulario.controls.correo.hasError('email')).toBe(true);
    expect(component.mensajeError()).toContain('campos obligatorios');
  });

  it('debe impedir registro con contrasena debil', () => {
    component.formulario.patchValue({
      nombre: 'Ana',
      correo: 'ana@mail.com',
      contrasena: '1234',
      distrito: 'Miraflores',
      aceptaTerminos: true
    });

    component.registrar();

    expect(component.formulario.controls.contrasena.hasError('minlength')).toBe(true);
  });

  it('debe impedir registro sin aceptar terminos', () => {
    component.formulario.patchValue({
      nombre: 'Ana',
      correo: 'ana@mail.com',
      contrasena: '12345678',
      distrito: 'Miraflores',
      aceptaTerminos: false
    });

    component.registrar();

    expect(component.formulario.controls.aceptaTerminos.hasError('required')).toBe(true);
  });

  it('debe impedir registro con correo ya existente', () => {
    registroService.registrar({
      nombre: 'Ana',
      correo: 'ana@mail.com',
      contrasena: '12345678',
      distrito: 'Miraflores',
      aceptaTerminos: true
    });

    component.formulario.patchValue({
      nombre: 'Ana 2',
      correo: 'ana@mail.com',
      contrasena: '12345678',
      distrito: 'San Isidro',
      aceptaTerminos: true
    });

    component.registrar();

    expect(component.formulario.controls.correo.hasError('correoEnUso')).toBe(true);
    expect(component.mensajeError()).toContain('ya está registrado');
  });

  it('debe registrar y redirigir a login', () => {
    vi.useFakeTimers();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.formulario.patchValue({
      nombre: 'Ana',
      correo: 'ana@mail.com',
      contrasena: '12345678',
      distrito: 'Miraflores',
      aceptaTerminos: true
    });

    component.registrar();
    vi.advanceTimersByTime(1500);

    expect(component.mensajeExito()).toContain('Registro exitoso');
    expect(component.enlaceVerificacion()).toContain('token=');
    expect(navigateSpy).toHaveBeenCalledWith(['/postulante/registro-completado'], {
      queryParams: { token: component.tokenVerificacion() }
    });
  });

  it('debe verificar cuenta por token', () => {
    const registro = registroService.registrar({
      nombre: 'Ana',
      correo: 'ana-token@mail.com',
      contrasena: '12345678',
      distrito: 'Miraflores',
      aceptaTerminos: true
    });

    expect(registro.ok).toBe(true);

    const token = (registro.ok ? registro.verificationLink.split('token=')[1] : '').trim();
    const resultadoVerificacion = registroService.verificarCuenta(token);

    expect(resultadoVerificacion).toBe(true);
  });
});
