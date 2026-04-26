import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostulantePerfil } from './postulante-perfil';

describe('PostulantePerfil', () => {
  let component: PostulantePerfil;
  let fixture: ComponentFixture<PostulantePerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostulantePerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(PostulantePerfil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
