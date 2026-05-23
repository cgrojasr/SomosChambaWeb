import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../seguridad/autenticacion/autenticacion.service';

@Component({
  selector: 'app-postulante-panel',
  imports: [RouterLink, DatePipe],
  templateUrl: './postulante-panel.html',
  styleUrl: './postulante-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostulantePanel {
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly router = inject(Router);

  readonly sesion = computed(() => this.autenticacionService.obtenerSesionActual());

  cerrarSesion(): void {
    this.autenticacionService.cerrarSesion();
    void this.router.navigate(['/login']);
  }
}