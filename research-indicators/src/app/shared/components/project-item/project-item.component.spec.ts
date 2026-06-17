import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { ProjectItemComponent } from './project-item.component';
import { ProjectUtilsService } from '@shared/services/project-utils.service';
import { ResultsCenterService } from '@pages/platform/pages/results-center/results-center.service';

describe('ProjectItemComponent', () => {
  let component: ProjectItemComponent;
  let fixture: ComponentFixture<ProjectItemComponent>;
  let projectUtilsService: ProjectUtilsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectItemComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() },
            params: of({})
          }
        },
        {
          provide: ResultsCenterService,
          useValue: {
            tableFilters: signal({
              levers: [],
              statusCodes: [],
              years: [],
              contracts: [],
              indicators: []
            })
          }
        },
        ProjectUtilsService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectItemComponent);
    component = fixture.componentInstance;
    projectUtilsService = TestBed.inject(ProjectUtilsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getStatusDisplay', () => {
    const project = { status_id: 1, status_name: 'Active' };
    component.project = project;
    const spy = jest.spyOn(projectUtilsService, 'getStatusDisplay');
    component.getStatusDisplay();
    expect(spy).toHaveBeenCalledWith(project);
  });

  it('should hide general info and indicators when configured', () => {
    component.showGeneralInfo = false;
    component.showIndicators = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-project-general-info')).toBeNull();
    expect(compiled.querySelector('app-project-indicator-filters')).toBeNull();
  });
});
