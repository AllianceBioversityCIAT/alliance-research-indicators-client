import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import ProjectDetailComponent from './project-detail.component';
import { ApiService } from '@services/api.service';
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-project-item', template: '', standalone: false })
class MockProjectItemComponent {
  @Input() project: any;
  @Input() isHeader: boolean = false;
}

@Component({ selector: 'app-project-results-table', template: '', standalone: false })
class MockProjectResultsTableComponent {
  @Input() contractId: any;
}

describe('ProjectComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailComponent, HttpClientTestingModule],
      declarations: [MockProjectItemComponent, MockProjectResultsTableComponent],
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
    })
      .overrideComponent(ProjectDetailComponent, {
        set: {
          imports: [],
          template: `<div class="w-full"><app-project-item [project]="currentProject()" [isHeader]="true"></app-project-item></div><div class="py-[30px] px-[40px] w-full"><div class="header"><span class="title-text">PROJECT RESULTS</span><span class="description-text">View and track your project results.</span></div><app-project-results-table [contractId]="contractId()"></app-project-results-table></div>`
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set contractId and call getProjectDetail on ngOnInit', () => {
    const getProjectDetailSpy = jest.spyOn(component, 'getProjectDetail').mockImplementation(jest.fn());
    component.ngOnInit();
    expect(component.contractId()).toBe('mock-id');
    expect(getProjectDetailSpy).toHaveBeenCalled();
    getProjectDetailSpy.mockRestore();
  });

  it('should set currentProject with indicators and set full_name', async () => {
    const mockResponse = {
      data: {
        indicators: [{ indicator: { name: 'Test' } }]
      }
    };
    jest.spyOn(apiService, 'GET_ResultsCount').mockResolvedValue(mockResponse as any);
    await component.getProjectDetail();
    expect(component.currentProject()).toBe(mockResponse.data);
    expect(component.currentProject()?.indicators?.[0]?.full_name).toBe('Test');
  });

  it('should set currentProject with no indicators', async () => {
    const mockResponse = { data: {} };
    jest.spyOn(apiService, 'GET_ResultsCount').mockResolvedValue(mockResponse as any);
    await component.getProjectDetail();
    expect(component.currentProject()).toBe(mockResponse.data);
  });

  it('should handle null response', async () => {
    jest.spyOn(apiService, 'GET_ResultsCount').mockResolvedValue(null as any);
    await component.getProjectDetail();
    expect(component.currentProject()).toBe(undefined);
  });

  it('should handle empty response', async () => {
    jest.spyOn(apiService, 'GET_ResultsCount').mockResolvedValue({} as any);
    await component.getProjectDetail();
    expect(component.currentProject()).toBe(undefined);
  });
});
