import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PostulantePanel } from './postulante-panel';

describe('PostulantePanel', () => {
  let component: PostulantePanel;
  let fixture: ComponentFixture<PostulantePanel>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [PostulantePanel],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PostulantePanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});