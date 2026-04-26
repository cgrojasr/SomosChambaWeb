import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadorPublicacionListado } from './empleador-publicacion-listado';

describe('EmpleadorPublicacionListado', () => {
  let component: EmpleadorPublicacionListado;
  let fixture: ComponentFixture<EmpleadorPublicacionListado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpleadorPublicacionListado],
    }).compileComponents();

    fixture = TestBed.createComponent(EmpleadorPublicacionListado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
