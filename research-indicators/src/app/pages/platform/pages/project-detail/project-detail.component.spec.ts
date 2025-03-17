import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import ProjectDetailComponent from './project-detail.component';
import { ApiService } from '@services/api.service';

describe('ProjectComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;

  beforeAll(() => {
    // Mock ResizeObserver
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailComponent, HttpClientTestingModule],
      providers: [
        ApiService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: new Map(),
              params: { id: 'mock-id' }
            },
            params: of({ id: 'mock-id' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
