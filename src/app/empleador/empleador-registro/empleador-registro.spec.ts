import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadorRegistro } from './empleador-registro';

describe('EmpleadorRegistro', () => {
  let component: EmpleadorRegistro;
  let fixture: ComponentFixture<EmpleadorRegistro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpleadorRegistro],
    }).compileComponents();

    fixture = TestBed.createComponent(EmpleadorRegistro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
