import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadorPublicacionListadoItem } from './empleador-publicacion-listado-item';

describe('EmpleadorPublicacionListadoItem', () => {
  let component: EmpleadorPublicacionListadoItem;
  let fixture: ComponentFixture<EmpleadorPublicacionListadoItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpleadorPublicacionListadoItem],
    }).compileComponents();

    fixture = TestBed.createComponent(EmpleadorPublicacionListadoItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
