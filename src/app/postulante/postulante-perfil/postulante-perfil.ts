import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {
  POSTULANTE_PERFIL_STORAGE_KEY,
  PostulanteDocumentoModel,
  PostulantePerfilModel,
} from '../../models/postulante-perfil-model';

const DISTRITOS_PERMITIDOS = [
  'Miraflores',
  'San Isidro',
  'Surco',
  'La Molina',
  'San Borja',
  'Jesús María',
  'Pueblo Libre',
  'Magdalena',
  'Lince',
  'Barranco',
];

const HABILIDADES_DISPONIBLES = [
  'Limpieza',
  'Atención al cliente',
  'Ofimática',
  'Ventas',
  'Cocina básica',
  'Reposición de productos',
];

const DOCUMENT_TYPES_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
const DOCUMENT_EXT_PERMITIDAS = ['.pdf', '.jpg', '.jpeg', '.png'];
const DOCUMENT_MAX_SIZE_BYTES = 5 * 1024 * 1024;

type PerfilFormValue = {
  fullName: string;
  district: string;
  birthDate: string;
  experience: string;
};

@Component({
  selector: 'app-postulante-perfil',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './postulante-perfil.html',
  styleUrl: './postulante-perfil.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostulantePerfil {
  private readonly formBuilder = inject(FormBuilder);

  readonly distritosPermitidos = DISTRITOS_PERMITIDOS;
  readonly habilidadesDisponibles = HABILIDADES_DISPONIBLES;

  readonly formulario = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    district: ['', [Validators.required]],
    birthDate: ['', [Validators.required]],
    experience: [''],
  });

  readonly enviado = signal(false);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);
  readonly perfilGuardado = signal<PostulantePerfilModel | null>(null);
  readonly habilidadesSeleccionadas = signal<string[]>([]);
  readonly documentos = signal<PostulanteDocumentoModel[]>([]);

  readonly mostrarErrores = computed(() => this.enviado() || this.formulario.touched);

  constructor() {
    this.cargarPerfilGuardado();
  }

  estaHabilidadSeleccionada(habilidad: string): boolean {
    return this.habilidadesSeleccionadas().includes(habilidad);
  }

  alternarHabilidad(habilidad: string): void {
    const actual = this.habilidadesSeleccionadas();

    if (actual.includes(habilidad)) {
      this.habilidadesSeleccionadas.set(actual.filter((item) => item !== habilidad));
      return;
    }

    this.habilidadesSeleccionadas.set([...actual, habilidad]);
  }

  onDocumentoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const files = input?.files;

    if (!files || files.length === 0) {
      return;
    }

    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    const siguientesDocumentos = [...this.documentos()];

    Array.from(files).forEach((file) => {
      const validacion = this.validarDocumento(file);

      if (!validacion.ok) {
        this.mensajeError.set(validacion.motivo);
        return;
      }

      siguientesDocumentos.push({
        name: file.name,
        type: file.type || this.obtenerExtension(file.name),
        size: file.size,
      });
    });

    this.documentos.set(siguientesDocumentos);

    if (input) {
      input.value = '';
    }
  }

  eliminarDocumento(name: string): void {
    this.documentos.set(this.documentos().filter((documento) => documento.name !== name));
  }

  guardarPerfil(): void {
    this.enviado.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensajeError.set('Debes completar todos los campos obligatorios.');
      return;
    }

    if (!this.validarDistrito(this.formulario.controls.district.value)) {
      this.formulario.controls.district.setErrors({ distritoInvalido: true });
      this.mensajeError.set('El distrito no es válido. Selecciona un distrito permitido.');
      return;
    }

    if (!this.validarFecha(this.formulario.controls.birthDate.value)) {
      this.formulario.controls.birthDate.setErrors({ fechaInvalida: true });
      this.mensajeError.set('La fecha de nacimiento no es válida. Usa el formato DD/MM/AAAA.');
      return;
    }

    if (this.habilidadesSeleccionadas().length === 0) {
      this.mensajeError.set('Debes seleccionar al menos una habilidad básica.');
      return;
    }

    const profile: PostulantePerfilModel = {
      ...this.obtenerValorFormularioLimpio(),
      skills: this.habilidadesSeleccionadas(),
      documents: this.documentos(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(POSTULANTE_PERFIL_STORAGE_KEY, JSON.stringify(profile));
    this.perfilGuardado.set(profile);
    this.mensajeExito.set('Perfil actualizado correctamente.');
  }

  private cargarPerfilGuardado(): void {
    const raw = localStorage.getItem(POSTULANTE_PERFIL_STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const profile = JSON.parse(raw) as PostulantePerfilModel;

      this.formulario.patchValue({
        fullName: profile.fullName,
        district: profile.district,
        birthDate: profile.birthDate,
        experience: profile.experience,
      });

      this.habilidadesSeleccionadas.set(profile.skills ?? []);
      this.documentos.set(profile.documents ?? []);
      this.perfilGuardado.set(profile);
    } catch {
      localStorage.removeItem(POSTULANTE_PERFIL_STORAGE_KEY);
    }
  }

  private obtenerValorFormularioLimpio(): PerfilFormValue {
    const value = this.formulario.getRawValue();

    return {
      fullName: value.fullName.trim(),
      district: value.district.trim(),
      birthDate: value.birthDate.trim(),
      experience: value.experience.trim(),
    };
  }

  private validarDistrito(district: string): boolean {
    return this.distritosPermitidos.includes(district.trim());
  }

  private validarFecha(value: string): boolean {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());

    if (!match) {
      return false;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return false;
    }

    return date <= new Date();
  }

  private validarDocumento(file: File): { ok: true } | { ok: false; motivo: string } {
    const extension = this.obtenerExtension(file.name);

    if (!DOCUMENT_TYPES_PERMITIDOS.includes(file.type) && !DOCUMENT_EXT_PERMITIDAS.includes(extension)) {
      return {
        ok: false,
        motivo: 'Archivo no permitido. Solo se aceptan PDF, JPG o PNG.',
      };
    }

    if (file.size > DOCUMENT_MAX_SIZE_BYTES) {
      return {
        ok: false,
        motivo: 'Archivo demasiado grande. El tamaño máximo permitido es 5MB.',
      };
    }

    return { ok: true };
  }

  private obtenerExtension(name: string): string {
    const index = name.lastIndexOf('.');
    return index >= 0 ? name.slice(index).toLowerCase() : '';
  }
}
