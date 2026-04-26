import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PublicacionItemModel } from '../../models/publicacion-item-model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empleador-publicacion-listado-item',
  templateUrl: './empleador-publicacion-listado-item.html',
  styleUrl: './empleador-publicacion-listado-item.css',
})
export class EmpleadorPublicacionListadoItem {
  @Input() publicacion: PublicacionItemModel = { id: 0, titulo: '' };
  @Output() mensajeEventEmitter = new EventEmitter<string>();

  constructor(
      private router: Router
  ) {}

  Ver_Detalles(): void {
    // Aquí puedes implementar la lógica para mostrar los detalles de la publicación
    this.router.navigate([`/empleador/publicacion-empleo/${this.publicacion.id}`]);
  }

  Mostrar_Mensaje(titulo: string): void {
    this.mensajeEventEmitter.emit(`Publicación: ${titulo}`);
  }
}
