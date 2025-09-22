import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ResultsTableComponent } from './results-table.component';
import { ApiService } from '@services/api.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { apiServiceMock } from 'src/app/testing/mock-services.mock';
import { ProjectResultsTableService } from '../../../pages/platform/pages/project-detail/pages/project-results-table/project-results-table.service';

describe('ResultsTableComponent', () => {
  let component: ResultsTableComponent;
  let fixture: ComponentFixture<ResultsTableComponent>;

  beforeEach(async () => {
    const mockProjectResultsTableService = {
      resultList: signal([]),
      loading: signal(false),
      contractId: '',
      getData: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ResultsTableComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceMock },
        { provide: ProjectResultsTableService, useValue: mockProjectResultsTableService },
        provideHttpClient(withInterceptorsFromDi())
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear the table and reset search value', () => {
    const tableMock = { clear: jest.fn() } as any;
    component.searchValue = 'test';
    component.clear(tableMock);
    expect(tableMock.clear).toHaveBeenCalled();
    expect(component.searchValue).toBe('');
  });

  it('should return correct severity for status', () => {
    expect(component.getSeverity('unqualified')).toBe('danger');
    expect(component.getSeverity('qualified')).toBe('success');
    expect(component.getSeverity('new')).toBe('info');
    expect(component.getSeverity('negotiation')).toBe('warning');
    expect(component.getSeverity('renewal')).toBeNull();
    expect(component.getSeverity('unknown')).toBeNull();
  });

  it('should set loading to false after ngOnInit timer', () => {
    jest.useFakeTimers();

    // initial true
    expect(component.loading()).toBe(true);

    component.ngOnInit();

    // before timer fires remains true
    expect(component.loading()).toBe(true);

    jest.advanceTimersByTime(1000);

    // trigger change detection after timer
    fixture.detectChanges();

    expect(component.loading()).toBe(false);

    jest.useRealTimers();
  });
});
