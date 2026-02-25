import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StatusDropdownComponent } from './status-dropdown.component';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { GetNextStep } from '@shared/interfaces/get-next-step.interface';
import { MainResponse } from '@shared/interfaces/responses.interface';

describe('StatusDropdownComponent', () => {
  let component: StatusDropdownComponent;
  let fixture: ComponentFixture<StatusDropdownComponent>;
  let mockApiService: jest.Mocked<ApiService>;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    mockApiService = {
      GET_NextStep: jest.fn()
    } as unknown as jest.Mocked<ApiService>;

    mockCacheService = {
      getCurrentNumericResultId: jest.fn().mockReturnValue(123),
      getCurrentPlatformCode: jest.fn().mockReturnValue('STAR'),
      currentMetadata: jest.fn().mockReturnValue({ status_id: 4 })
    } as unknown as jest.Mocked<CacheService>;

    await TestBed.configureTestingModule({
      imports: [StatusDropdownComponent, HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: CacheService, useValue: mockCacheService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.statusId).toBe(0);
    expect(component.statusName).toBe('');
    expect(component.isOpen()).toBe(false);
  });

  describe('getAvailableStatuses', () => {
    it('should return empty array when statusId is 0', async () => {
      component.statusId = 0;
      await component.loadNextSteps();
      expect(component.getAvailableStatuses()).toEqual([]);
    });

    it('should return empty array when resultCode is not available', async () => {
      component.statusId = 4;
      mockCacheService.getCurrentNumericResultId.mockReturnValue(0);
      await component.loadNextSteps();
      expect(component.getAvailableStatuses()).toEqual([]);
    });

    it('should return next and special statuses for Draft (4)', async () => {
      component.statusId = 4;
      const mockResponse: MainResponse<GetNextStep> = {
        successfulRequest: true,
        data: {
          sequence: [
            { id: 4, name: 'Draft' },
            { id: 12, name: 'Science Edition' }
          ],
          special_transitions: {
            4: [
              { id: 11, name: 'Postpone', direction: 'previous', icon: 'postpone' },
              { id: 15, name: 'Do not approve', direction: 'previous', icon: 'reject' }
            ]
          }
        }
      };
      mockApiService.GET_NextStep.mockResolvedValue(mockResponse);
      await component.loadNextSteps();
      const statuses = component.getAvailableStatuses();
      expect(statuses.length).toBeGreaterThan(0);
    });

    it('should return previous and next status for Science Edition (12)', async () => {
      component.statusId = 12;
      const mockResponse: MainResponse<GetNextStep> = {
        successfulRequest: true,
        data: {
          sequence: [
            { id: 4, name: 'Draft' },
            { id: 12, name: 'Science Edition' },
            { id: 13, name: 'KM Curation' }
          ]
        }
      };
      mockApiService.GET_NextStep.mockResolvedValue(mockResponse);
      await component.loadNextSteps();
      const statuses = component.getAvailableStatuses();
      expect(statuses.length).toBeGreaterThan(0);
    });

    it('should return previous and next status for KM Curation (13)', async () => {
      component.statusId = 13;
      const mockResponse: MainResponse<GetNextStep> = {
        successfulRequest: true,
        data: {
          sequence: [
            { id: 12, name: 'Science Edition' },
            { id: 13, name: 'KM Curation' },
            { id: 14, name: 'Published' }
          ]
        }
      };
      mockApiService.GET_NextStep.mockResolvedValue(mockResponse);
      await component.loadNextSteps();
      const statuses = component.getAvailableStatuses();
      expect(statuses.length).toBeGreaterThan(0);
    });

    it('should return previous status for Published (14)', async () => {
      component.statusId = 14;
      const mockResponse: MainResponse<GetNextStep> = {
        successfulRequest: true,
        data: {
          sequence: [
            { id: 13, name: 'KM Curation' },
            { id: 14, name: 'Published' }
          ]
        }
      };
      mockApiService.GET_NextStep.mockResolvedValue(mockResponse);
      await component.loadNextSteps();
      const statuses = component.getAvailableStatuses();
      expect(statuses.length).toBeGreaterThan(0);
    });

    it('should handle array response format', async () => {
      component.statusId = 4;
      const mockResponse: MainResponse<GetNextStep> = {
        successfulRequest: true,
        data: [
          { id: 12, name: 'Science Edition', direction: 'next' },
          { id: 11, name: 'Postpone', direction: 'previous', icon: 'postpone' }
        ] as any
      };
      mockApiService.GET_NextStep.mockResolvedValue(mockResponse);
      await component.loadNextSteps();
      const statuses = component.getAvailableStatuses();
      expect(statuses.length).toBe(2);
      expect(statuses[0].id).toBe(12);
      expect(statuses[1].id).toBe(11);
    });

    it('should handle available_statuses response format', async () => {
      component.statusId = 4;
      const mockResponse: MainResponse<GetNextStep> = {
        successfulRequest: true,
        data: {
          available_statuses: [
            { id: 12, name: 'Science Edition', direction: 'next' }
          ]
        }
      };
      mockApiService.GET_NextStep.mockResolvedValue(mockResponse);
      await component.loadNextSteps();
      const statuses = component.getAvailableStatuses();
      expect(statuses.length).toBe(1);
      expect(statuses[0].id).toBe(12);
    });
  });

  describe('toggleDropdown', () => {
    it('should toggle isOpen from false to true', () => {
      component.isOpen.set(false);
      const event = new Event('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

      component.toggleDropdown(event);

      expect(component.isOpen()).toBe(true);
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should toggle isOpen from true to false', () => {
      component.isOpen.set(true);
      const event = new Event('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

      component.toggleDropdown(event);

      expect(component.isOpen()).toBe(false);
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('selectStatus', () => {
    it('should emit statusChange event and close dropdown', () => {
      component.isOpen.set(true);
      const event = new Event('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');
      const emitSpy = jest.spyOn(component.statusChange, 'emit');

      component.selectStatus(13, event);

      expect(emitSpy).toHaveBeenCalledWith(13);
      expect(component.isOpen()).toBe(false);
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should emit correct statusId', () => {
      component.isOpen.set(true);
      const event = new Event('click');
      const emitSpy = jest.spyOn(component.statusChange, 'emit');

      component.selectStatus(12, event);

      expect(emitSpy).toHaveBeenCalledWith(12);
    });
  });

  describe('onDocumentClick', () => {
    it('should close dropdown when clicking outside', () => {
      component.isOpen.set(true);
      const event = new MouseEvent('click');
      const target = document.createElement('div');
      jest.spyOn(event, 'target', 'get').mockReturnValue(target);
      jest.spyOn(target, 'closest').mockReturnValue(null);

      component.onDocumentClick(event);

      expect(component.isOpen()).toBe(false);
    });

    it('should not close dropdown when clicking inside container', () => {
      component.isOpen.set(true);
      const event = new MouseEvent('click');
      const target = document.createElement('div');
      const container = document.createElement('div');
      container.className = 'status-dropdown-container';
      jest.spyOn(event, 'target', 'get').mockReturnValue(target);
      jest.spyOn(target, 'closest').mockReturnValue(container);

      component.onDocumentClick(event);

      expect(component.isOpen()).toBe(true);
    });

    it('should handle null target gracefully', () => {
      component.isOpen.set(true);
      const event = new MouseEvent('click');
      jest.spyOn(event, 'target', 'get').mockReturnValue(null);

      component.onDocumentClick(event);

      expect(component.isOpen()).toBe(false);
    });
  });

  describe('component inputs', () => {
    it('should accept statusId input', () => {
      component.statusId = 12;
      fixture.detectChanges();
      expect(component.statusId).toBe(12);
    });

    it('should accept statusName input', () => {
      component.statusName = 'Science Edition';
      fixture.detectChanges();
      expect(component.statusName).toBe('Science Edition');
    });
  });

  describe('ngOnChanges', () => {
    it('should call loadNextSteps when statusId changes and is not first change', async () => {
      const loadSpy = jest.spyOn(component, 'loadNextSteps');
      mockApiService.GET_NextStep.mockResolvedValue({ successfulRequest: true, data: { sequence: [] } });
      component.ngOnChanges({
        statusId: {
          firstChange: false,
          previousValue: 4,
          currentValue: 12,
          isFirstChange: () => false
        }
      } as any);
      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('loadNextSteps branches', () => {
    it('should handle response.data.data array format', async () => {
      component.statusId = 4;
      const mockResponse: MainResponse<GetNextStep> = {
        successfulRequest: true,
        data: {
          data: [
            { id: 12, result_status_id: 12, name: 'Science Edition', direction: 'next' },
            { id: 11, result_status_id: 11, name: 'Postpone', direction: 'previous', icon: 'postpone' }
          ]
        } as any
      };
      mockApiService.GET_NextStep.mockResolvedValue(mockResponse);
      await component.loadNextSteps();
      expect(component.availableStatuses().length).toBe(2);
    });

    it('should use buildOptionsFromResponse when data has sequence only', async () => {
      component.statusId = 12;
      const mockResponse: MainResponse<GetNextStep> = {
        successfulRequest: true,
        data: {
          sequence: [
            { id: 4, name: 'Draft' },
            { id: 12, name: 'Science Edition' },
            { id: 13, name: 'KM Curation' }
          ]
        }
      };
      mockApiService.GET_NextStep.mockResolvedValue(mockResponse);
      await component.loadNextSteps();
      const statuses = component.getAvailableStatuses();
      expect(statuses.length).toBeGreaterThan(0);
    });

    it('should set empty array and log on GET_NextStep error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      component.statusId = 4;
      mockApiService.GET_NextStep.mockRejectedValue(new Error('Network error'));

      await component.loadNextSteps();

      expect(component.availableStatuses()).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

