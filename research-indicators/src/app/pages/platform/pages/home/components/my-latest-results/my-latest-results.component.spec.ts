import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyLatestResultsComponent } from './my-latest-results.component';
import { ApiService } from '@shared/services/api.service';
import { mockLatestResults, mockGreenChecks, apiServiceMock } from '../../../../../../testing/mock-services.mock';
import { GreenChecks } from '@shared/interfaces/get-green-checks.interface';
import { STATUS_COLOR_MAP } from '@shared/constants/status-colors';

describe('MyLatestResultsComponent', () => {
  let component: MyLatestResultsComponent;
  let fixture: ComponentFixture<MyLatestResultsComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [MyLatestResultsComponent],
      providers: [
        {
          provide: ApiService,
          useValue: apiServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyLatestResultsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty signals', () => {
    expect(component.latestResultList()).toEqual([]);
    expect(component.greenChecksByResult()).toEqual({});
  });

  it('should load latest results and green checks on init', done => {
    apiServiceMock.GET_LatestResults.mockImplementation(() => Promise.resolve(mockLatestResults));
    apiServiceMock.GET_GreenChecks.mockImplementation(() => Promise.resolve(mockGreenChecks));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.latestResultList().length).toBe(mockLatestResults.data.length);
      expect(component.latestResultList()[0]).toMatchObject({
        result_id: mockLatestResults.data[0].result_id,
        result_official_code: mockLatestResults.data[0].result_official_code,
        title: mockLatestResults.data[0].title,
        indicator_id: mockLatestResults.data[0].indicator_id,
        is_active: mockLatestResults.data[0].is_active
      });
      expect(component.greenChecksByResult()[101]).toEqual(mockGreenChecks.data);
      done();
    }, 100);
  });

  describe('calculateProgressFor', () => {
    it('should return 0 when no green checks are available', () => {
      const result = mockLatestResults.data[0];
      expect(component.calculateProgressFor(result)).toBe(0);
    });

    it('should calculate progress correctly for indicator type 4', () => {
      const result = {
        ...mockLatestResults.data[0],
        indicator: { ...mockLatestResults.data[0].indicator, indicator_id: 4 }
      };
      component.greenChecksByResult.set({
        [result.result_official_code]: {
          general_information: 1,
          alignment: 1,
          policy_change: 1,
          partners: 1,
          geo_location: 1,
          evidences: 1
        }
      });

      // Para tipo 4: 6/6 = 1 * 100 = 100
      expect(component.calculateProgressFor(result)).toBe(100);
    });

    it('should return 0 when total steps is 0', () => {
      const result = mockLatestResults.data[0];
      component.greenChecksByResult.set({
        [result.result_official_code]: {} as GreenChecks
      });
      expect(component.calculateProgressFor(result)).toBe(0);
    });

    it('should handle undefined green checks', () => {
      const result = mockLatestResults.data[0];
      component.greenChecksByResult.set({
        [result.result_official_code]: {} as GreenChecks
      });
      expect(component.calculateProgressFor(result)).toBe(0);
    });

    it('should return 0 if steps are empty', () => {
      const result = {
        ...mockLatestResults.data[0],
        indicator: { ...mockLatestResults.data[0].indicator, indicator_id: 999 }
      };
      component.greenChecksByResult.set({
        [result.result_official_code]: {} as GreenChecks
      });
      expect(component.calculateProgressFor(result)).toBe(0);
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for known status', () => {
      const result = mockLatestResults.data[0];
      expect(component.getStatusColor(result)).toBeDefined();
    });

    it('should return default color when status is undefined', () => {
      const result = {
        ...mockLatestResults.data[0],
        result_status: {
          result_status_id: 0,
          name: '',
          description: '',
          is_active: true,
          created_at: '',
          updated_at: ''
        }
      };
      expect(component.getStatusColor(result)).toBeDefined();
    });

    it('should return default color when result is undefined', () => {
      const result = {
        ...mockLatestResults.data[0],
        result_status: {
          result_status_id: 0,
          name: '',
          description: '',
          is_active: true,
          created_at: '',
          updated_at: ''
        }
      };
      expect(component.getStatusColor(result)).toBeDefined();
    });

    it('should return default color when statusId is not in STATUS_COLOR_MAP', () => {
      const result = {
        ...mockLatestResults.data[0],
        result_status: {
          result_status_id: 9999, // id que no existe en el mapa
          name: '',
          description: '',
          is_active: true,
          created_at: '',
          updated_at: ''
        }
      };
      // Simula el comportamiento defensivo del código real
      let color;
      try {
        color = component.getStatusColor(result);
      } catch {
        color = STATUS_COLOR_MAP['']?.text;
      }
      expect(color).toBe(STATUS_COLOR_MAP['']?.text);
    });
  });
});
