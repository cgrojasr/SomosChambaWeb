import { Component } from '@angular/core';
import { PublicacionItemModel } from '../../models/publicacion-item-model';
import { CommonModule } from '@angular/common';
import { EmpleadorPublicacionListadoItem } from "../empleador-publicacion-listado-item/empleador-publicacion-listado-item";

@Component({
  selector: 'app-empleador-publicacion-listado',
  imports: [
    CommonModule,
    EmpleadorPublicacionListadoItem
],
  templateUrl: './empleador-publicacion-listado.html',
  styleUrl: './empleador-publicacion-listado.css',
})
export class EmpleadorPublicacionListado {
  //Generar un listado de publicaciones de empleo dummy para mostrar en la plantilla
  publicaciones: PublicacionItemModel[] = [
    { id: 1, titulo: 'Desarrollador Frontend' },
    { id: 2, titulo: 'Analista de Datos' },
    { id: 3, titulo: 'Gerente de Proyectos' },
    { id: 4, titulo: 'Especialista en Marketing Digital' },
    { id: 5, titulo: 'Diseñador UX/UI' }
  ];

  mostrarMensaje(mensaje: string): void {
    alert(mensaje);
  }
}
