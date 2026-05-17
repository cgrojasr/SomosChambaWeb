import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-postulante-registro-completado',
  imports: [RouterLink],
  templateUrl: './postulante-registro-completado.html',
  styleUrl: './postulante-registro-completado.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostulanteRegistroCompletado {
  private readonly route = inject(ActivatedRoute);

  readonly tokenVerificacion = computed(() => this.route.snapshot.queryParamMap.get('token'));
}
