import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataOverviewComponent } from './data-overview.component';
import { ChartModule } from 'primeng/chart';
import { STATUS_COLOR_MAP } from '@shared/constants/status-colors';
import { apiServiceMock, mockResultsStatus, mockIndicatorsResults, cacheServiceMock, httpClientMock } from 'src/app/testing/mock-services.mock';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { HttpClient } from '@angular/common/http';

describe('DataOverviewComponent', () => {
  let component: DataOverviewComponent;
  let fixture: ComponentFixture<DataOverviewComponent>;
  let mockApiService: any;

  beforeEach(async () => {
    mockApiService = { ...apiServiceMock };
    mockApiService.GET_ResultsStatus = jest.fn().mockResolvedValue(mockResultsStatus);
    mockApiService.GET_IndicatorsResultsAmount = jest.fn().mockResolvedValue(mockIndicatorsResults);

    await TestBed.configureTestingModule({
      imports: [DataOverviewComponent, ChartModule],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: HttpClient, useValue: httpClientMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DataOverviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.results).toBe(true);
    expect(component.showChart()).toBe(false);
    expect(component.showIndicatorList()).toBe(false);
    expect(component.indicatorList()).toEqual([]);
    expect(component.chartLegend()).toEqual([]);
  });

  it('should call getData and getIndicatorData on init', async () => {
    component.ngOnInit();
    expect(mockApiService.GET_ResultsStatus).toHaveBeenCalled();
    expect(mockApiService.GET_IndicatorsResultsAmount).toHaveBeenCalled();
  });

  it('should update showChart when results are available', async () => {
    await component.getData();
    expect(component.showChart()).toBe(true);
  });

  it('should update showIndicatorList when indicators have results', async () => {
    await component.getIndicatorData();
    expect(component.showIndicatorList()).toBe(true);
  });

  it('should not show chart when no results are available', async () => {
    mockApiService.GET_ResultsStatus = jest.fn().mockResolvedValue({
      data: [
        { name: 'Status 1', amount_results: 0, result_status_id: 1 },
        { name: 'Status 2', amount_results: 0, result_status_id: 2 }
      ]
    });

    await component.getData();
    expect(component.showChart()).toBe(false);
  });

  it('should not show indicator list when no indicators have results', async () => {
    mockApiService.GET_IndicatorsResultsAmount = jest.fn().mockResolvedValue({
      data: [
        {
          indicator_id: 1,
          name: 'Indicator 1',
          amount_results: 0,
          icon_src: 'science'
        }
      ]
    });

    await component.getIndicatorData();
    expect(component.showIndicatorList()).toBe(false);
  });

  it('should generate correct chart data', async () => {
    await component.getData();

    expect(component.data).toBeDefined();
    expect(component.data.labels).toEqual(['Status 1', 'Status 2']);
    expect(component.data.datasets[0].data).toEqual([5, 3]);
    expect(component.data.datasets[0].backgroundColor).toHaveLength(2);
  });

  it('should generate correct chart legend', async () => {
    await component.getData();

    const legend = component.chartLegend();
    expect(legend).toHaveLength(2);
    expect(legend[0]).toEqual({
      color: STATUS_COLOR_MAP['1']?.text || STATUS_COLOR_MAP[''].border,
      label: 'Status 1',
      value: 5
    });
  });

  it('should handle API errors gracefully', async () => {
    mockApiService.GET_ResultsStatus = jest.fn().mockRejectedValue(new Error('API Error'));
    mockApiService.GET_IndicatorsResultsAmount = jest.fn().mockRejectedValue(new Error('API Error'));

    await expect(component.getData()).rejects.toThrow('API Error');
    await expect(component.getIndicatorData()).rejects.toThrow('API Error');
  });

  it('should set correct chart options', async () => {
    await component.getData();

    expect(component.options).toBeDefined();
    expect(component.options.cutout).toBe('40%');
    expect(component.options.responsive).toBe(true);
    expect(component.options.plugins.legend.display).toBe(false);
    expect(component.options.plugins.datalabels.display).toBe(false);
  });

  it('should use fallback color when statusKey is not in STATUS_COLOR_MAP', async () => {
    mockApiService.GET_ResultsStatus = jest.fn().mockResolvedValue({
      data: [{ name: 'Status X', amount_results: 2, result_status_id: 999 }]
    });
    await component.getData();
    expect(component.data.datasets[0].backgroundColor[0]).toBe(STATUS_COLOR_MAP[''].border);
    expect(component.chartLegend()[0].color).toBe(STATUS_COLOR_MAP[''].border);
  });
});
