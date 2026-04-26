import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadorPublicacionEmpleo } from './empleador-publicacion-empleo';

describe('EmpleadorPublicacionEmpleo', () => {
  let component: EmpleadorPublicacionEmpleo;
  let fixture: ComponentFixture<EmpleadorPublicacionEmpleo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpleadorPublicacionEmpleo],
    }).compileComponents();

    fixture = TestBed.createComponent(EmpleadorPublicacionEmpleo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
