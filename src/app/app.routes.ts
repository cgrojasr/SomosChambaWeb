import { Routes } from '@angular/router';
import { PostulanteRegistro } from './postulante/postulante-registro/postulante-registro';
import { EmpleadorRegistro } from './empleador/empleador-registro/empleador-registro';
import { Home } from './home/home';
import { Autenticacion } from './seguridad/autenticacion/autenticacion';
import { EmpleadorPublicacionListado } from './empleador/empleador-publicacion-listado/empleador-publicacion-listado';
import { EmpleadorPublicacionEmpleo } from './empleador/empleador-publicacion-empleo/empleador-publicacion-empleo';
import { PostulantePerfil } from './postulante/postulante-perfil/postulante-perfil';

export const routes: Routes = [
    {
        path: '',
        component: Home,
        title: 'Bienvenido a SomosChambaWeb'
    },
    {
        path: 'postulante/registro',
        component: PostulanteRegistro,
        title: 'Registro de Postulante'
    },
    {
        path: 'postulante/perfil',
        component: PostulantePerfil,
        title: 'Perfil de Postulante'
    },
    {
        path: 'empleador/registro',
        component: EmpleadorRegistro,
        title: 'Registro de Empleador'
    },
    {
        path: 'empleador/publicacion-listado',
        component: EmpleadorPublicacionListado,
        title: 'Listado de Publicaciones'
    },
    {
        path: 'empleador/publicacion-empleo/:id',
        component: EmpleadorPublicacionEmpleo,
        title: 'Editar Publicación de Empleo'
    },
    {
        path: 'login',
        component: Autenticacion,
        title: 'Inicio de sesión'
    }
];
