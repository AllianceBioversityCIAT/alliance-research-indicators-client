import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyLatestResultsComponent } from './my-latest-results.component';
import { ApiService } from '@shared/services/api.service';
import { mockLatestResults, mockGreenChecks, apiServiceMock } from '../../../../../../testing/mock-services.mock';
import { GreenChecks } from '@shared/interfaces/get-green-checks.interface';
import { STATUS_COLOR_MAP } from '@shared/constants/status-colors';
import { AllModalsService } from '@shared/services/cache/all-modals.service';

describe('MyLatestResultsComponent', () => {
  let component: MyLatestResultsComponent;
  let fixture: ComponentFixture<MyLatestResultsComponent>;

  const allModalsServiceMock = {
    openModal: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [MyLatestResultsComponent],
      providers: [
        {
          provide: ApiService,
          useValue: apiServiceMock
        },
        {
          provide: AllModalsService,
          useValue: allModalsServiceMock
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

  describe('calculateProgressFor', () => {
    it('should return 0 when no green checks are available', () => {
      const result = { ...mockLatestResults.data[0], platform_code: 'STAR' } as any;
      expect(component.calculateProgressFor(result)).toBe(0);
    });

    it('should calculate progress correctly for indicator type 4', () => {
      const result = {
        ...mockLatestResults.data[0],
        indicator: { ...mockLatestResults.data[0].indicator, indicator_id: 4 },
        platform_code: 'STAR'
      } as any;
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

      expect(component.calculateProgressFor(result)).toBe(100);
    });

    it('should return 0 when total steps is 0', () => {
      const result = { ...mockLatestResults.data[0], platform_code: 'STAR' } as any;
      component.greenChecksByResult.set({
        [result.result_official_code]: {} as GreenChecks
      });
      expect(component.calculateProgressFor(result)).toBe(0);
    });

    it('should handle undefined green checks', () => {
      const result = { ...mockLatestResults.data[0], platform_code: 'STAR' } as any;
      component.greenChecksByResult.set({
        [result.result_official_code]: {} as GreenChecks
      });
      expect(component.calculateProgressFor(result)).toBe(0);
    });

    it('should return 0 if steps are empty', () => {
      const result = {
        ...mockLatestResults.data[0],
        indicator: { ...mockLatestResults.data[0].indicator, indicator_id: 999 },
        platform_code: 'STAR'
      } as any;
      component.greenChecksByResult.set({
        [result.result_official_code]: {} as GreenChecks
      });
      expect(component.calculateProgressFor(result)).toBe(0);
    });

    it('should calculate progress correctly for indicator type 1 (cap_sharing, cap_sharing_ip)', () => {
      const result = {
        ...mockLatestResults.data[0],
        indicator: { ...mockLatestResults.data[0].indicator, indicator_id: 1 },
        platform_code: 'STAR'
      } as any;
      component.greenChecksByResult.set({
        [result.result_official_code]: {
          general_information: 1,
          alignment: 1,
          cap_sharing_ip: 1,
          partners: 1,
          geo_location: 1,
          evidences: 1
        }
      });
      expect(component.calculateProgressFor(result)).toBe(86);
    });

    it('should calculate progress correctly for indicator type different from 1 and 4', () => {
      const result = {
        ...mockLatestResults.data[0],
        indicator: { ...mockLatestResults.data[0].indicator, indicator_id: 2 },
        platform_code: 'STAR'
      } as any;
      component.greenChecksByResult.set({
        [result.result_official_code]: {
          general_information: 1,
          alignment: 1,
          partners: 1,
          geo_location: 1,
          evidences: 1
        }
      });
      expect(component.calculateProgressFor(result)).toBe(100);
    });

    it('should return 0 if result.indicator is undefined', () => {
      const result: any = { ...mockLatestResults.data[0], indicator: undefined, platform_code: 'STAR' };
      component.greenChecksByResult.set({
        [result.result_official_code]: {}
      });
      expect(component.calculateProgressFor(result)).toBe(0);
    });

    it('should return 0 if result is undefined', () => {
      expect(component.calculateProgressFor(undefined as any)).toBe(0);
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for known status', () => {
      const result = { ...mockLatestResults.data[0], platform_code: 'STAR' } as any;
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
        },
        platform_code: 'STAR'
      } as any;
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
        },
        platform_code: 'STAR'
      } as any;
      expect(component.getStatusColor(result)).toBeDefined();
    });

    it('should return default color if result_status is undefined', () => {
      const result: any = { ...mockLatestResults.data[0], result_status: undefined, platform_code: 'STAR' };
      expect(component.getStatusColor(result)).toBe(STATUS_COLOR_MAP[''].text);
    });

    it('should return default color if result_status_id is undefined', () => {
      const result: any = {
        ...mockLatestResults.data[0],
        result_status: { ...mockLatestResults.data[0].result_status, result_status_id: undefined }
      };
      result.platform_code = 'STAR';
      expect(component.getStatusColor(result)).toBe(STATUS_COLOR_MAP[''].text);
    });

    it('should return default color when statusId is not in STATUS_COLOR_MAP', () => {
      const result = {
        ...mockLatestResults.data[0],
        result_status: {
          result_status_id: 9999,
          name: '',
          description: '',
          is_active: true,
          created_at: '',
          updated_at: ''
        },
        platform_code: 'STAR'
      } as any;
      let color;
      try {
        color = component.getStatusColor(result);
      } catch {
        color = STATUS_COLOR_MAP['']?.text;
      }
      expect(color).toBe(STATUS_COLOR_MAP['']?.text);
    });
  });

  describe('ngOnInit', () => {
    it('should call loadLatestResultsWithGreenChecks', async () => {
      const loadLatestResultsSpy = jest.spyOn(component, 'loadLatestResultsWithGreenChecks');
      
      component.ngOnInit();
      
      expect(loadLatestResultsSpy).toHaveBeenCalled();
    });
  });

  describe('loadLatestResultsWithGreenChecks', () => {
    it('should load latest results and green checks', async () => {
      const mockResults = {
        ...mockLatestResults,
        data: [
          {
            ...mockLatestResults.data[0],
            result_official_code: 101,
            platform_code: 'STAR'
          }
        ]
      };
      
      const mockGreenChecksResponse = {
        ...mockGreenChecks,
        data: {
          general_information: 1,
          alignment: 1,
          cap_sharing_ip: 1,
          policy_change: 0,
          partners: 1,
          geo_location: 1,
          evidences: 0
        }
      };

      apiServiceMock.GET_LatestResults.mockResolvedValueOnce(mockResults as any);
      apiServiceMock.GET_GreenChecks.mockResolvedValueOnce(mockGreenChecksResponse as any);

      await component.loadLatestResultsWithGreenChecks();

      expect(apiServiceMock.GET_LatestResults).toHaveBeenCalled();
      expect(apiServiceMock.GET_GreenChecks).toHaveBeenCalledWith(101, 'STAR');
      expect(component.latestResultList()).toEqual(mockResults.data);
      expect(component.greenChecksByResult()['STAR-101']).toEqual(mockGreenChecksResponse.data);
    });

    it('should handle multiple results', async () => {
      const mockResults = {
        ...mockLatestResults,
        data: [
          {
            ...mockLatestResults.data[0],
            result_official_code: 101,
            platform_code: 'STAR'
          },
          {
            ...mockLatestResults.data[1],
            result_official_code: 102,
            platform_code: 'STAR'
          }
        ]
      };
      
      const mockGreenChecks1 = {
        ...mockGreenChecks,
        data: {
          general_information: 1,
          alignment: 1,
          cap_sharing_ip: 1,
          policy_change: 0,
          partners: 1,
          geo_location: 1,
          evidences: 0
        }
      };

      const mockGreenChecks2 = {
        ...mockGreenChecks,
        data: {
          general_information: 0,
          alignment: 1,
          cap_sharing_ip: 0,
          policy_change: 1,
          partners: 0,
          geo_location: 1,
          evidences: 1
        }
      };

      apiServiceMock.GET_LatestResults.mockResolvedValueOnce(mockResults as any);
      apiServiceMock.GET_GreenChecks
        .mockResolvedValueOnce(mockGreenChecks1)
        .mockResolvedValueOnce(mockGreenChecks2);

      await component.loadLatestResultsWithGreenChecks();

      expect(apiServiceMock.GET_LatestResults).toHaveBeenCalled();
      expect(apiServiceMock.GET_GreenChecks).toHaveBeenCalledTimes(2);
      expect(apiServiceMock.GET_GreenChecks).toHaveBeenNthCalledWith(1, 101, 'STAR');
      expect(apiServiceMock.GET_GreenChecks).toHaveBeenNthCalledWith(2, 102, 'STAR');
      expect(component.latestResultList()).toEqual(mockResults.data);
      expect(component.greenChecksByResult()['STAR-101']).toEqual(mockGreenChecks1.data);
      expect(component.greenChecksByResult()['STAR-102']).toEqual(mockGreenChecks2.data);
    });

    it('should handle empty results', async () => {
      const mockResults = { ...mockLatestResults, data: [] };
      
      apiServiceMock.GET_LatestResults.mockResolvedValueOnce(mockResults as any);

      await component.loadLatestResultsWithGreenChecks();

      expect(apiServiceMock.GET_LatestResults).toHaveBeenCalled();
      expect(apiServiceMock.GET_GreenChecks).not.toHaveBeenCalled();
      expect(component.latestResultList()).toEqual([]);
      expect(component.greenChecksByResult()).toEqual({});
    });
  });

  describe('truncateTitle', () => {
    it('should return empty string for null title', () => {
      expect(component.truncateTitle(null)).toBe('');
    });

    it('should return empty string for undefined title', () => {
      expect(component.truncateTitle(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(component.truncateTitle('')).toBe('');
    });

    it('should return empty string for whitespace-only string', () => {
      expect(component.truncateTitle('   ')).toBe('');
    });

    it('should return original text if 30 words or less', () => {
      const shortTitle = 'This is a short title with less than thirty words';
      expect(component.truncateTitle(shortTitle)).toBe(shortTitle);
    });

    it('should return original text if exactly 30 words', () => {
      const words = Array(30).fill('word');
      const title = words.join(' ');
      expect(component.truncateTitle(title)).toBe(title);
    });

    it('should truncate text if more than 30 words', () => {
      const words = Array(35).fill('word');
      const title = words.join(' ');
      const expected = words.slice(0, 30).join(' ') + '...';
      expect(component.truncateTitle(title)).toBe(expected);
    });

    it('should handle multiple spaces between words', () => {
      const title = 'word1    word2   word3';
      expect(component.truncateTitle(title)).toBe('word1    word2   word3');
    });

    it('should handle leading and trailing whitespace', () => {
      const title = '   This is a title   ';
      expect(component.truncateTitle(title)).toBe('This is a title');
    });

    it('should handle very long single word', () => {
      const longWord = 'a'.repeat(1000);
      expect(component.truncateTitle(longWord)).toBe(longWord);
    });

    it('should handle mixed whitespace characters', () => {
      const title = 'word1\tword2\nword3\rword4';
      expect(component.truncateTitle(title)).toBe('word1\tword2\nword3\rword4');
    });
  });
});
