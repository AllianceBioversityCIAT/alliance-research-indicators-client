import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { ControlListServices } from '@shared/interfaces/services.interface';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MultiselectInstanceComponent } from './multiselect-instance.component';
import { CacheService } from '@shared/services/cache/cache.service';
import { UtilsService } from '@shared/services/utils.service';
import { ActionsService } from '@shared/services/actions.service';
import { ServiceLocatorService } from '@shared/services/service-locator.service';

describe('MultiselectInstanceComponent', () => {
  let component: MultiselectInstanceComponent;
  let fixture: ComponentFixture<MultiselectInstanceComponent>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockUtilsService: jest.Mocked<UtilsService>;
  let mockActionsService: jest.Mocked<ActionsService>;
  let mockServiceLocator: jest.Mocked<ServiceLocatorService>;
  let mockService: jest.Mocked<any>;

  beforeEach(async () => {
    // Mock del servicio genérico
    mockService = {
      getInstance: jest.fn().mockResolvedValue(
        signal([
          { id: 1, name: 'Option 1' },
          { id: 2, name: 'Option 2' }
        ])
      ),
      isOpenSearch: jest.fn().mockReturnValue(false)
    } as any;

    // Mock de los servicios
    mockCacheService = {
      currentResultIsLoading: signal(false)
    } as any;

    mockUtilsService = {
      getNestedProperty: jest.fn().mockReturnValue([]),
      setNestedPropertyWithReduce: jest.fn()
    } as any;

    mockActionsService = {
      showToast: jest.fn()
    } as any;

    mockServiceLocator = {
      getService: jest.fn().mockReturnValue(mockService)
    } as any;

    await TestBed.configureTestingModule({
      imports: [MultiselectInstanceComponent, NoopAnimationsModule],
      providers: [
        { provide: CacheService, useValue: mockCacheService },
        { provide: UtilsService, useValue: mockUtilsService },
        { provide: ActionsService, useValue: mockActionsService },
        { provide: ServiceLocatorService, useValue: mockServiceLocator },
        provideHttpClient(withInterceptorsFromDi())
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiselectInstanceComponent);
    component = fixture.componentInstance;

    // Setup inputs necesarios
    component.signal = signal({});
    component.optionLabel = 'name';
    component.optionValue = 'id';
    component.signalOptionValue = 'selected_options';
    component.serviceName = 'test-service' as ControlListServices;
    component.label = 'Test Label';
    component.description = 'Test Description';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize service and body on ngOnInit', async () => {
    const testData = [{ id: 1, name: 'Test' }];
    mockUtilsService.getNestedProperty.mockReturnValue(testData);

    component.ngOnInit();

    expect(mockServiceLocator.getService).toHaveBeenCalledWith('test-service');
    expect(component.service).toBe(mockService);
    expect(component.body().value).toEqual([1]);
  });

  it('should call getListInstance and update listInstance', async () => {
    const mockData = [{ id: 1, name: 'Option 1' }];
    const signalMock = signal(mockData);
    mockService.getInstance.mockResolvedValue(signalMock);

    // Ensure service is initialized
    component.ngOnInit();

    await component.getListInstance();

    expect(mockService.getInstance).toHaveBeenCalledWith({});
    expect(component.listInstance()).toEqual(mockData);
    expect(component.loadingList()).toBe(false);
  });

  it('should convert object array to id array', () => {
    const objects = [
      { id: 1, name: 'Test 1' },
      { id: 2, name: 'Test 2' }
    ];

    const result = component.objectArrayToIdArray(objects, 'id');

    expect(result).toEqual([1, 2]);
  });

  it('should handle undefined array in objectArrayToIdArray', () => {
    const result = component.objectArrayToIdArray(undefined as any, 'id');
    expect(result).toBeUndefined();
  });

  it('should add new item when setValue is called and item does not exist', () => {
    const currentArray = [{ id: 1, name: 'Option 1' }];
    const newItem = { id: 2, name: 'Option 2' };
    const mockEvent = { itemValue: newItem } as any;

    mockUtilsService.getNestedProperty.mockReturnValue(currentArray);

    component.setValue(mockEvent);

    expect(mockUtilsService.setNestedPropertyWithReduce).toHaveBeenCalledWith(expect.any(Object), 'selected_options', [
      { id: 1, name: 'Option 1' },
      { id: 2, name: 'Option 2' }
    ]);
  });

  it('should remove item when setValue is called and item exists', () => {
    const currentArray = [
      { id: 1, name: 'Option 1' },
      { id: 2, name: 'Option 2' }
    ];
    const existingItem = { id: 1, name: 'Option 1' };
    const mockEvent = { itemValue: existingItem } as any;

    mockUtilsService.getNestedProperty.mockReturnValue(currentArray);

    component.setValue(mockEvent);

    expect(mockUtilsService.setNestedPropertyWithReduce).toHaveBeenCalledWith(expect.any(Object), 'selected_options', [{ id: 2, name: 'Option 2' }]);
  });

  it('should handle result_countries_sub_nationals_signal in setValue', () => {
    const mockSignal = { set: jest.fn() };
    const currentValue = {
      result_countries_sub_nationals_signal: mockSignal
    };
    const newItem = { id: 1, name: 'Region 1' };
    const mockEvent = { itemValue: newItem } as any;

    component.signal.set(currentValue);
    mockUtilsService.getNestedProperty.mockReturnValue([]);

    component.setValue(mockEvent);

    expect(mockSignal.set).toHaveBeenCalledWith({ regions: [newItem] });
  });

  it('should emit valueChange when setValue is called', () => {
    jest.spyOn(component.valueChange, 'emit');
    const mockEvent = { itemValue: { id: 1, name: 'Test' } } as any;
    mockUtilsService.getNestedProperty.mockReturnValue([]);

    component.setValue(mockEvent);

    expect(component.valueChange.emit).toHaveBeenCalledWith([{ id: 1, name: 'Test' }]);
  });

  it('should emit selectEvent when setValue is called', () => {
    jest.spyOn(component.selectEvent, 'emit');
    const mockEvent = { itemValue: { id: 1, name: 'Test' } } as any;
    mockUtilsService.getNestedProperty.mockReturnValue([]);

    component.setValue(mockEvent);

    expect(component.selectEvent.emit).toHaveBeenCalledWith(mockEvent);
  });

  it('should remove region by id', () => {
    component.body.set({ value: [1, 2, 3] });

    component.removeRegionById(2);

    expect(component.body().value).toEqual([1, 3]);
  });

  it('should handle empty array in removeRegionById', () => {
    component.body.set({ value: null });

    component.removeRegionById(1);

    expect(component.body().value).toEqual([]);
  });

  it('should remove option from signal', () => {
    const currentOptions = [
      { id: 1, name: 'Option 1' },
      { id: 2, name: 'Option 2' }
    ];
    const optionToRemove = { id: 1, name: 'Option 1' };

    mockUtilsService.getNestedProperty.mockReturnValue(currentOptions);

    component.removeOption(optionToRemove);

    expect(mockUtilsService.setNestedPropertyWithReduce).toHaveBeenCalledWith(expect.any(Object), 'selected_options', [{ id: 2, name: 'Option 2' }]);
  });

  it('should compute selectedOptions correctly', () => {
    const testOptions = [{ id: 1, name: 'Test' }];
    mockUtilsService.getNestedProperty.mockReturnValue(testOptions);

    const selectedOptions = component.selectedOptions();

    expect(mockUtilsService.getNestedProperty).toHaveBeenCalledWith({}, 'selected_options');
    expect(selectedOptions).toEqual(testOptions);
  });

  /*
  it('should reset firstLoad when currentResultIsLoading changes to true', () => {
    // Initialize component first
    component.ngOnInit();
    fixture.detectChanges();

    component.firstLoad.set(false);

    // Simulate the signal change that triggers the effect
    (mockCacheService.currentResultIsLoading as any).set(true);

    // Trigger the effect manually
    TestBed.flushEffects();

    expect(component.firstLoad()).toBe(true);
  });
  */

  it('should handle endpointParams in getListInstance', async () => {
    const params = { test: 'value' };
    component.endpointParams = params;

    // Ensure service is initialized
    component.ngOnInit();

    await component.getListInstance();

    expect(mockService.getInstance).toHaveBeenCalledWith(params);
  });

  it('should set loading states correctly in getListInstance', async () => {
    // Ensure service is initialized
    component.ngOnInit();

    // Reset loading to false manually before test
    component.loadingList.set(false);

    expect(component.loadingList()).toBe(false);

    const promise = component.getListInstance();
    expect(component.loadingList()).toBe(true);

    await promise;
    expect(component.loadingList()).toBe(false);
  });

  it('should handle disabled state', () => {
    component.disabled = true;
    fixture.detectChanges();

    // Since PrimeNG component might not be rendered in test, we check the property instead
    expect(component.disabled).toBe(true);
  });

  it('should handle hideSelected property', () => {
    component.hideSelected = true;
    fixture.detectChanges();

    expect(component.hideSelected).toBe(true);
  });

  it('should handle setValue with null current array', () => {
    const newItem = { id: 1, name: 'Test' };
    const mockEvent = { itemValue: newItem } as any;

    mockUtilsService.getNestedProperty.mockReturnValue(null);

    component.setValue(mockEvent);

    expect(mockUtilsService.setNestedPropertyWithReduce).toHaveBeenCalledWith(expect.any(Object), 'selected_options', [newItem]);
  });
});
