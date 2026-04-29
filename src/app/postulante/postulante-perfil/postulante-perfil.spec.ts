import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostulantePerfil } from './postulante-perfil';
import { POSTULANTE_PERFIL_STORAGE_KEY } from '../../models/postulante-perfil-model';

describe('PostulantePerfil', () => {
  let component: PostulantePerfil;
  let fixture: ComponentFixture<PostulantePerfil>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [PostulantePerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(PostulantePerfil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe impedir guardar cuando faltan campos obligatorios', () => {
    component.guardarPerfil();

    expect(component.formulario.invalid).toBe(true);
    expect(component.mensajeError()).toContain('campos obligatorios');
  });

  it('debe impedir guardar con fecha invalida', () => {
    component.formulario.patchValue({
      fullName: 'Ana Torres',
      district: 'Miraflores',
      birthDate: '99/15/2030',
      experience: 'Atencion al cliente'
    });
    component.alternarHabilidad('Ofimática');

    component.guardarPerfil();

    expect(component.formulario.controls.birthDate.hasError('fechaInvalida')).toBe(true);
    expect(component.mensajeError()).toContain('fecha de nacimiento no es válida');
  });

  it('debe impedir guardar con distrito invalido', () => {
    component.formulario.patchValue({
      fullName: 'Ana Torres',
      district: 'Distrito Inventado',
      birthDate: '12/07/1998',
      experience: 'Atencion al cliente'
    });
    component.alternarHabilidad('Limpieza');

    component.guardarPerfil();

    expect(component.formulario.controls.district.hasError('distritoInvalido')).toBe(true);
    expect(component.mensajeError()).toContain('distrito no es válido');
  });

  it('debe guardar habilidades y mostrar perfil actualizado', () => {
    component.formulario.patchValue({
      fullName: 'Ana Torres',
      district: 'Miraflores',
      birthDate: '12/07/1998',
      experience: '2 años de experiencia en atención al cliente'
    });
    component.alternarHabilidad('Limpieza');
    component.alternarHabilidad('Atención al cliente');

    component.guardarPerfil();

    const raw = localStorage.getItem(POSTULANTE_PERFIL_STORAGE_KEY);
    expect(raw).not.toBeNull();

    const perfil = JSON.parse(raw ?? '{}') as { skills: string[]; fullName: string };

    expect(perfil.fullName).toBe('Ana Torres');
    expect(perfil.skills).toEqual(['Limpieza', 'Atención al cliente']);
    expect(component.perfilGuardado()?.skills).toEqual(['Limpieza', 'Atención al cliente']);
    expect(component.mensajeExito()).toContain('Perfil actualizado correctamente');
  });

  it('debe cargar perfil guardado al reiniciar el componente', async () => {
    const persisted = {
      fullName: 'Ana Persistida',
      district: 'Surco',
      birthDate: '05/02/1995',
      skills: ['Ofimática'],
      experience: 'Experiencia administrativa',
      documents: [],
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(POSTULANTE_PERFIL_STORAGE_KEY, JSON.stringify(persisted));

    const newFixture = TestBed.createComponent(PostulantePerfil);
    const newComponent = newFixture.componentInstance;
    await newFixture.whenStable();

    expect(newComponent.formulario.controls.fullName.value).toBe('Ana Persistida');
    expect(newComponent.perfilGuardado()?.district).toBe('Surco');
    expect(newComponent.habilidadesSeleccionadas()).toEqual(['Ofimática']);
  });

  it('debe rechazar documento no permitido', () => {
    const badFile = new File(['contenido'], 'script.exe', { type: 'application/x-msdownload' });
    const event = {
      target: {
        files: [badFile],
        value: 'x'
      }
    } as unknown as Event;

    component.onDocumentoSeleccionado(event);

    expect(component.documentos().length).toBe(0);
    expect(component.mensajeError()).toContain('Archivo no permitido');
  });
});
