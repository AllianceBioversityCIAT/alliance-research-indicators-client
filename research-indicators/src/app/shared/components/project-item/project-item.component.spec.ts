import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { ProjectItemComponent } from './project-item.component';
import { ResultsCenterService } from '@pages/platform/pages/results-center/results-center.service';

describe('ProjectItemComponent', () => {
  let component: ProjectItemComponent;
  let fixture: ComponentFixture<ProjectItemComponent>;

  beforeEach(async () => {
    const mockResultsCenterService = {
      tableFilters: signal({
        levers: [],
        statusCodes: [],
        years: [],
        contracts: [],
        indicators: []
      })
    } as Partial<ResultsCenterService>;

    await TestBed.configureTestingModule({
      imports: [ProjectItemComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() },
            params: of({}) // Mock route parameters if needed
          }
        },
        {
          provide: ResultsCenterService,
          useValue: mockResultsCenterService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
