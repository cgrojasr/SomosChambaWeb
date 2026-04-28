import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-empleador-publicacion-empleo',
  imports: [],
  templateUrl: './empleador-publicacion-empleo.html',
  styleUrl: './empleador-publicacion-empleo.css',
})
export class EmpleadorPublicacionEmpleo {
  private readonly route = inject(ActivatedRoute);
//   private readonly destroyRef = inject(DestroyRef);

  readonly publicacionId = signal<number | null>(null);

  ngOnInit(): void {
    this.route.params
    //   .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params: Params) => {
        const id = Number(params['id']);
        this.publicacionId.set(Number.isNaN(id) ? null : id);
      });
  }
}
