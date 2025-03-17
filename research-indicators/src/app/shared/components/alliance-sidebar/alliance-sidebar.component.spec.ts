import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllianceSidebarComponent } from './alliance-sidebar.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('AllianceSidebarComponent', () => {
  let component: AllianceSidebarComponent;
  let fixture: ComponentFixture<AllianceSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllianceSidebarComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() },
            params: of({}) // Mock de parámetros de ruta
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AllianceSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
