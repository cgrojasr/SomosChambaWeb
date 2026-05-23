import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { Autenticacion } from './autenticacion';
import { POSTULANTE_REGISTRO_STORAGE_KEY } from '../../models/postulante-registro-model';
import { AutenticacionService } from './autenticacion.service';

describe('Autenticacion', () => {
  let component: Autenticacion;
  let fixture: ComponentFixture<Autenticacion>;
  let router: Router;
  let autenticacionService: AutenticacionService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Autenticacion],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Autenticacion);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    autenticacionService = TestBed.inject(AutenticacionService);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe impedir iniciar sesion sin campos obligatorios', () => {
    component.iniciarSesion();

    expect(component.formulario.invalid).toBe(true);
    expect(component.mensajeError()).toContain('campos obligatorios');
  });

  it('debe mostrar error con correo invalido', () => {
    component.formulario.patchValue({
      correo: 'correo-invalido',
      contrasena: '12345678',
    });

    component.iniciarSesion();

    expect(component.formulario.controls.correo.hasError('email')).toBe(true);
    expect(component.mensajeError()).toContain('campos obligatorios');
  });

  it('debe permitir iniciar sesion con credenciales validas', () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    localStorage.setItem(
      POSTULANTE_REGISTRO_STORAGE_KEY,
      JSON.stringify([
        {
          nombre: 'Ana Torres',
          correo: 'ana@mail.com',
          contrasena: '12345678',
          distrito: 'Miraflores',
          aceptaTerminos: true,
          verificado: true,
          fechaRegistro: new Date().toISOString(),
        },
      ])
    );

    component.formulario.patchValue({
      correo: 'ana@mail.com',
      contrasena: '12345678',
    });

    component.iniciarSesion();

    expect(component.mensajeExito()).toContain('Bienvenido');
    expect(router.navigate).toHaveBeenCalledWith(['/postulante/panel']);
    expect(autenticacionService.obtenerSesionActual()?.correo).toBe('ana@mail.com');
  });

  it('debe rechazar credenciales incorrectas', () => {
    localStorage.setItem(
      POSTULANTE_REGISTRO_STORAGE_KEY,
      JSON.stringify([
        {
          nombre: 'Ana Torres',
          correo: 'ana@mail.com',
          contrasena: '12345678',
          distrito: 'Miraflores',
          aceptaTerminos: true,
          verificado: true,
          fechaRegistro: new Date().toISOString(),
        },
      ])
    );

    component.formulario.patchValue({
      correo: 'ana@mail.com',
      contrasena: 'incorrecta',
    });

    component.iniciarSesion();

    expect(component.mensajeError()).toContain('credenciales no son válidas');
  });

  it('debe avisar cuando la cuenta no esta verificada', () => {
    localStorage.setItem(
      POSTULANTE_REGISTRO_STORAGE_KEY,
      JSON.stringify([
        {
          nombre: 'Ana Torres',
          correo: 'ana@mail.com',
          contrasena: '12345678',
          distrito: 'Miraflores',
          aceptaTerminos: true,
          verificado: false,
          fechaRegistro: new Date().toISOString(),
          tokenVerificacion: 'token-1',
        },
      ])
    );

    component.formulario.patchValue({
      correo: 'ana@mail.com',
      contrasena: '12345678',
    });

    component.iniciarSesion();

    expect(component.mensajeVerificacion()).toContain('no está verificada');
    expect(component.enlaceVerificacion()).toContain('/postulante/registro?token=');
  });

  it('debe reenviar enlace de verificacion', () => {
    localStorage.setItem(
      POSTULANTE_REGISTRO_STORAGE_KEY,
      JSON.stringify([
        {
          nombre: 'Ana Torres',
          correo: 'ana@mail.com',
          contrasena: '12345678',
          distrito: 'Miraflores',
          aceptaTerminos: true,
          verificado: false,
          fechaRegistro: new Date().toISOString(),
          tokenVerificacion: 'token-1',
        },
      ])
    );

    component.formulario.patchValue({
      correo: 'ana@mail.com',
      contrasena: '12345678',
    });
    component.iniciarSesion();
    component.reenviaVerificacion();

    expect(component.enlaceVerificacion()).toContain('/postulante/registro?token=');
  });

  it('debe solicitar recuperacion de contraseña', () => {
    localStorage.setItem(
      POSTULANTE_REGISTRO_STORAGE_KEY,
      JSON.stringify([
        {
          nombre: 'Ana Torres',
          correo: 'ana@mail.com',
          contrasena: '12345678',
          distrito: 'Miraflores',
          aceptaTerminos: true,
          verificado: true,
          fechaRegistro: new Date().toISOString(),
        },
      ])
    );

    component.cambiarModo('recuperacion');
    component.formularioRecuperacion.patchValue({ correoRecuperacion: 'ana@mail.com' });
    component.solicitarRecuperacion();

    expect(component.codigoRecuperacion()).toBeTruthy();
    expect(component.mensajeExito()).toContain('código de recuperación');
  });

  it('debe bloquear temporalmente tras varios intentos fallidos', () => {
    localStorage.setItem(
      POSTULANTE_REGISTRO_STORAGE_KEY,
      JSON.stringify([
        {
          nombre: 'Ana Torres',
          correo: 'ana@mail.com',
          contrasena: '12345678',
          distrito: 'Miraflores',
          aceptaTerminos: true,
          verificado: true,
          fechaRegistro: new Date().toISOString(),
        },
      ])
    );

    component.formulario.patchValue({ correo: 'ana@mail.com', contrasena: 'incorrecta' });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      component.iniciarSesion();
    }

    expect(component.mensajeError()).toContain('Has superado el número permitido de intentos');
    expect(component.bloqueoHasta()).not.toBeNull();
  });
});
