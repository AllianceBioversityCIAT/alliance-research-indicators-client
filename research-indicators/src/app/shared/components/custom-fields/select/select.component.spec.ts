import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectComponent } from './select.component';
import { signal } from '@angular/core';
import { ServiceLocatorService } from '../../../services/service-locator.service';
import { CacheService } from '../../../services/cache/cache.service';
import { UtilsService } from '../../../services/utils.service';
import { AllModalsService } from '../../../services/cache/all-modals.service';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let mockServiceLocator: jest.Mocked<ServiceLocatorService>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockUtilsService: jest.Mocked<UtilsService>;
  let mockAllModalsService: jest.Mocked<AllModalsService>;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      list: jest.fn().mockReturnValue([
        { id: 1, name: 'Option 1' },
        { id: 2, name: 'Option 2' }
      ]),
      isOpenSearch: jest.fn().mockReturnValue(true),
      update: jest.fn()
    };

    mockServiceLocator = {
      getService: jest.fn().mockReturnValue(mockService)
    } as any;

    mockCacheService = {
      currentResultIsLoading: signal(false)
    } as any;

    mockUtilsService = {
      getNestedProperty: jest.fn().mockReturnValue(null),
      setNestedPropertyWithReduce: jest.fn(),
      setNestedPropertyWithReduceSignal: jest.fn()
    } as any;

    mockAllModalsService = {
      // Add any methods that might be used
    } as any;

    await TestBed.configureTestingModule({
      imports: [SelectComponent],
      providers: [
        { provide: ServiceLocatorService, useValue: mockServiceLocator },
        { provide: CacheService, useValue: mockCacheService },
        { provide: UtilsService, useValue: mockUtilsService },
        { provide: AllModalsService, useValue: mockAllModalsService }
      ]
    }).compileComponents();

    component = TestBed.createComponent(SelectComponent).componentInstance;

    // Setup initial component configuration
    component.signal = signal({ testField: null });
    component.optionValue = { body: 'testField', option: 'id' };
    component.serviceName = 'getCountries';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.optionLabel).toBe('');
    expect(component.optionLabel2).toBe('');
    expect(component.optionValue).toEqual({ body: 'testField', option: 'id' });
    expect(component.serviceName).toBe('getCountries');
    expect(component.label).toBe('');
    expect(component.description).toBe('');
    expect(component.placeholder).toBe('');
    expect(component.helperText).toBe('');
    expect(component.disabled).toBe(false);
    expect(component.scrollHeight).toBe('270px');
    expect(component.isRequired).toBe(false);
    expect(component.flagAttributes).toEqual({ isoAlpha2: '', institution_location_name: '' });
    expect(component.hideSelected).toBe(true);
    expect(component.textSpan).toBe('');
  });

  it('should initialize service in ngOnInit', () => {
    component.ngOnInit();
    expect(mockServiceLocator.getService).toHaveBeenCalledWith('getCountries');
    expect(component.service).toBe(mockService);
  });

  it('should handle ngAfterContentInit', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    component.ngAfterContentInit();

    expect(consoleSpy).toHaveBeenCalledWith('SelectComponent - Templates found:', {
      itemTemplate: false,
      selectedItemTemplate: false,
      selectedItemsTemplate: false,
      headerTemplate: false,
      rowsTemplate: false
    });

    consoleSpy.mockRestore();
  });

  it('should handle onFilter for OpenSearch service', () => {
    component.ngOnInit();
    const mockEvent = { filter: 'test search' };

    component.onFilter(mockEvent);

    expect(mockService.update).toHaveBeenCalledWith('test search');
  });

  it('should handle onFilter for non-OpenSearch service', () => {
    mockService.isOpenSearch.mockReturnValue(false);
    component.ngOnInit();
    const mockEvent = { filter: 'test search' };

    component.onFilter(mockEvent);

    expect(mockService.update).not.toHaveBeenCalled();
  });

  it('should handle onFilter when service is null', () => {
    component.service = null;
    const mockEvent = { filter: 'test search' };

    component.onFilter(mockEvent);

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should set value correctly', () => {
    const testValue = 'test-value';

    component.setValue(testValue);

    expect(component.body().value).toBe(testValue);
    expect(mockUtilsService.setNestedPropertyWithReduceSignal).toHaveBeenCalledWith(component.signal, 'testField', testValue);
  });

  it('should handle isInvalid computed property when required and empty', () => {
    component.isRequired = true;
    component.body.set({ value: null });

    expect(component.isInvalid()).toBe(true);
  });

  it('should handle isInvalid computed property when required and has value', () => {
    component.isRequired = true;
    component.body.set({ value: 'some value' });

    expect(component.isInvalid()).toBe(false);
  });

  it('should handle isInvalid computed property when not required', () => {
    component.isRequired = false;
    component.body.set({ value: null });

    expect(component.isInvalid()).toBe(false);
  });

  it('should handle selectedOption computed property when value exists', () => {
    component.ngOnInit();
    component.body.set({ value: 1 });

    const result = component.selectedOption();

    expect(result).toEqual({ id: 1, name: 'Option 1' });
  });

  it('should handle selectedOption computed property when value does not exist', () => {
    component.ngOnInit();
    component.body.set({ value: 999 });

    const result = component.selectedOption();

    expect(result).toBeUndefined();
  });

  it('should handle selectedOption computed property when no value', () => {
    component.ngOnInit();
    component.body.set({ value: null });

    const result = component.selectedOption();

    expect(result).toBeNull();
  });

  it('should handle selectedOption computed property when service is null', () => {
    component.service = null;
    component.body.set({ value: 1 });

    const result = component.selectedOption();

    expect(result).toBeUndefined();
  });

  it('should handle selectedOption computed property when service.list is null', () => {
    component.ngOnInit();
    mockService.list.mockReturnValue(null);
    component.body.set({ value: 1 });

    const result = component.selectedOption();

    expect(result).toBeUndefined();
  });

  it('should handle effect when currentResultIsLoading is true', () => {
    // Trigger the effect by changing currentResultIsLoading
    mockCacheService.currentResultIsLoading.set(true);

    // The effect should not update the body when loading is true
    expect(mockUtilsService.setNestedPropertyWithReduce).not.toHaveBeenCalled();
  });

  it('should handle environment property', () => {
    expect(component.environment).toBeDefined();
  });

  it('should handle body signal updates', () => {
    const testValue = { value: 'new-value' };

    component.body.set(testValue);

    expect(component.body()).toEqual(testValue);
  });

  it('should handle signal updates', () => {
    const testSignal = signal({ newField: 'new-value' });

    component.signal = testSignal;

    expect(component.signal()).toEqual({ newField: 'new-value' });
  });

  it('should handle allModalsService injection', () => {
    expect(component.allModalsService).toBe(mockAllModalsService);
  });

  it('should handle template properties', () => {
    expect(component.itemTemplate).toBeUndefined();
    expect(component.selectedItemTemplate).toBeUndefined();
    expect(component.selectedItemsTemplate).toBeUndefined();
    expect(component.headerTemplate).toBeUndefined();
    expect(component.rowsTemplate).toBeUndefined();
  });

  it('should handle service injection through constructor', () => {
    expect(component['serviceLocator']).toBe(mockServiceLocator);
  });
});
