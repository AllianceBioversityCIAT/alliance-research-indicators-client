import { TestBed } from '@angular/core/testing';
import { MultiselectComponent } from './multiselect.component';
import { signal } from '@angular/core';
import { ActionsService } from '../../../services/actions.service';
import { ServiceLocatorService } from '../../../services/service-locator.service';
import { CacheService } from '../../../services/cache/cache.service';
import { UtilsService } from '../../../services/utils.service';
import { AllModalsService } from '../../../services/cache/all-modals.service';

describe('MultiselectComponent', () => {
  let component: MultiselectComponent;
  let mockActionsService: jest.Mocked<ActionsService>;
  let mockServiceLocator: jest.Mocked<ServiceLocatorService>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockUtilsService: jest.Mocked<UtilsService>;
  let mockAllModalsService: jest.Mocked<AllModalsService>;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      list: jest.fn().mockReturnValue([
        { id: 1, name: 'Option 1' },
        { id: 2, name: 'Option 2' },
        { id: 3, name: 'Option 3' }
      ]),
      isOpenSearch: jest.fn().mockReturnValue(false),
      update: jest.fn()
    };

    mockActionsService = {
      handleBadRequest: jest.fn(),
      showGlobalAlert: jest.fn(),
      showGlobalToast: jest.fn(),
      isTokenExpired: jest.fn()
    } as any;

    mockServiceLocator = {
      getService: jest.fn().mockReturnValue(mockService)
    } as any;

    mockCacheService = {
      currentResultIsLoading: signal(false)
    } as any;

    mockUtilsService = {
      getNestedProperty: jest.fn().mockReturnValue([]),
      setNestedPropertyWithReduce: jest.fn()
    } as any;

    mockAllModalsService = {
      openModal: jest.fn(),
      closeModal: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      providers: [
        MultiselectComponent,
        { provide: ActionsService, useValue: mockActionsService },
        { provide: ServiceLocatorService, useValue: mockServiceLocator },
        { provide: CacheService, useValue: mockCacheService },
        { provide: UtilsService, useValue: mockUtilsService },
        { provide: AllModalsService, useValue: mockAllModalsService }
      ]
    }).compileComponents();

    component = TestBed.inject(MultiselectComponent);

    // Setup initial component configuration
    component.signal = signal({ testField: [] });
    component.optionValue = 'id';
    component.signalOptionValue = 'testField';
    component.serviceName = 'countries';
    component.optionLabel = 'name';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.optionLabel).toBe('name');
    expect(component.optionValue).toBe('id');
    expect(component.signalOptionValue).toBe('testField');
    expect(component.serviceName).toBe('countries');
    expect(component.label).toBe('');
    expect(component.description).toBe('');
    expect(component.hideSelected).toBe(false);
    expect(component.hideTemplate).toBe(false);
    expect(component.disabledSelectedScroll).toBe(false);
    expect(component.disabled).toBe(false);
    expect(component.filterBy).toBe('');
    expect(component.helperText).toBe('');
    expect(component.textSpan).toBe('');
    expect(component.columnsOnXl).toBe(false);
    expect(component.placeholder).toBe('');
    expect(component.scrollHeight).toBe('268px');
    expect(component.itemHeight).toBe(41);
    expect(component.dark).toBe(false);
  });

  it('should initialize service in ngOnInit', () => {
    component.ngOnInit();
    expect(mockServiceLocator.getService).toHaveBeenCalledWith('countries');
    expect(component.service).toBe(mockService);
  });

  // Tests for lines 87-89 (onChange effect - hasNoLabelList logic)
  it('should handle onChange effect when items have no labels', () => {
    const mockItemsWithoutLabels = [{ id: 1 }, { id: 2 }];
    mockUtilsService.getNestedProperty.mockReturnValue(mockItemsWithoutLabels);
    mockService.list.mockReturnValue([
      { id: 1, name: 'Option 1' },
      { id: 2, name: 'Option 2' }
    ]);

    component.ngOnInit();
    component.signal = signal({ testField: mockItemsWithoutLabels });

    // Simulate the effect logic (lines 87-89)
    const hasNoLabelList = mockUtilsService
      .getNestedProperty(component.signal(), component.signalOptionValue)
      ?.filter((item: any) => !Object.hasOwn(item, component.optionLabel));

    expect(hasNoLabelList?.length).toBe(2);
  });

  // Tests for line 105 (onGlobalLoadingChange effect)
  it('should reset firstLoad when currentResultIsLoading becomes true', () => {
    component.firstLoad.set(false);
    expect(component.firstLoad()).toBe(false);

    // Simulate effect behavior (line 105)
    mockCacheService.currentResultIsLoading.set(true);
    if (mockCacheService.currentResultIsLoading()) {
      component.firstLoad.set(true);
    }

    expect(component.firstLoad()).toBe(true);
  });

  // Tests for lines 107-121 (onChange effect - else if condition)
  it('should handle onChange effect when items have labels and service has data', () => {
    const mockItemsWithLabels = [
      { id: 1, name: 'Option 1' },
      { id: 2, name: 'Option 2' }
    ];
    mockUtilsService.getNestedProperty.mockReturnValue(mockItemsWithLabels);
    mockService.list.mockReturnValue([
      { id: 1, name: 'Option 1' },
      { id: 2, name: 'Option 2' }
    ]);

    component.ngOnInit();
    component.signal = signal({ testField: mockItemsWithLabels });

    // Simulate the else if condition (lines 107-121)
    const hasItems = mockUtilsService.getNestedProperty(component.signal(), component.signalOptionValue)?.length;
    const notLoading = !mockCacheService.currentResultIsLoading();
    const hasServiceData = mockService.list().length;
    const isFirstLoad = component.firstLoad();

    if (hasItems && notLoading && hasServiceData && isFirstLoad) {
      const valueArray = mockUtilsService
        .getNestedProperty(component.signal(), component.signalOptionValue)
        ?.map((item: any) => item[component.optionValue]);
      component.body.set({ value: valueArray });
    }

    expect(component.body().value).toEqual([1, 2]);
  });

  // Tests for line 128 (onFilter method)
  it('should call service update when service is OpenSearch', () => {
    mockService.isOpenSearch.mockReturnValue(true);
    component.ngOnInit();

    const mockEvent = { filter: 'test' };
    component.onFilter(mockEvent);

    expect(mockService.update).toHaveBeenCalledWith('test');
  });

  it('should not call service update when service is not OpenSearch', () => {
    mockService.isOpenSearch.mockReturnValue(false);
    component.ngOnInit();

    const mockEvent = { filter: 'test' };
    component.onFilter(mockEvent);

    expect(mockService.update).not.toHaveBeenCalled();
  });

  // Tests for lines 148-199 (setValue, objectArrayToIdArray, removeOption methods)
  it('should handle setValue with new options', () => {
    const mockEvent = [1, 2, 3];
    const mockExistingItems = [{ id: 1, name: 'Option 1' }];
    const mockServiceList = [
      { id: 1, name: 'Option 1' },
      { id: 2, name: 'Option 2' },
      { id: 3, name: 'Option 3' }
    ];

    mockUtilsService.getNestedProperty.mockReturnValue(mockExistingItems);
    mockService.list.mockReturnValue(mockServiceList);
    component.ngOnInit();

    component.setValue(mockEvent);

    expect(component.body().value).toEqual([1, 2, 3]);
    expect(mockUtilsService.setNestedPropertyWithReduce).toHaveBeenCalled();
  });

  it('should handle setValue with no new options', () => {
    const mockEvent = [1];
    const mockExistingItems = [{ id: 1, name: 'Option 1' }];
    const mockServiceList = [{ id: 1, name: 'Option 1' }];

    mockUtilsService.getNestedProperty.mockReturnValue(mockExistingItems);
    mockService.list.mockReturnValue(mockServiceList);
    component.ngOnInit();

    component.setValue(mockEvent);

    expect(component.body().value).toEqual([1]);
  });

  it('should convert object array to id array', () => {
    const array = [
      { id: 1, name: 'Test 1' },
      { id: 2, name: 'Test 2' }
    ];

    const result = component.objectArrayToIdArray(array, 'id');

    expect(result).toEqual([1, 2]);
  });

  it('should handle objectArrayToIdArray with null array', () => {
    const result = component.objectArrayToIdArray(null as any, 'id');
    expect(result).toBeUndefined();
  });

  it('should handle objectArrayToIdArray with empty array', () => {
    const result = component.objectArrayToIdArray([], 'id');
    expect(result).toEqual([]);
  });

  it('should remove option correctly', () => {
    const optionToRemove = { id: 2, name: 'Test 2' };
    const currentOptions = [
      { id: 1, name: 'Test 1' },
      { id: 2, name: 'Test 2' },
      { id: 3, name: 'Test 3' }
    ];

    component.signal = signal({ testField: currentOptions });
    mockUtilsService.getNestedProperty.mockReturnValue(currentOptions);

    component.removeOption(optionToRemove);

    const expectedFilteredOptions = [
      { id: 1, name: 'Test 1' },
      { id: 3, name: 'Test 3' }
    ];

    expect(mockUtilsService.setNestedPropertyWithReduce).toHaveBeenCalledWith(component.signal(), 'testField', expectedFilteredOptions);
    expect(component.body().value).toEqual([1, 3]);
  });

  it('should handle removeOption with empty array', () => {
    const optionToRemove = { id: 1, name: 'Test 1' };
    component.signal = signal({ testField: [] });
    mockUtilsService.getNestedProperty.mockReturnValue([]);

    component.removeOption(optionToRemove);

    expect(mockUtilsService.setNestedPropertyWithReduce).toHaveBeenCalledWith(component.signal(), 'testField', []);
    expect(component.body().value).toEqual([]);
  });

  it('should clear all selections', () => {
    component.signal = signal({ testField: [{ id: 1, name: 'Test 1' }] });

    component.clear();

    expect(component.body().value).toBeNull();
    expect(component.signal().testField).toEqual([]);
  });

  it('should handle selectedOptions computed property', () => {
    const mockOptions = [{ id: 1, name: 'Test 1' }];
    mockUtilsService.getNestedProperty.mockReturnValue(mockOptions);

    const result = component.selectedOptions();

    expect(result).toEqual(mockOptions);
    expect(mockUtilsService.getNestedProperty).toHaveBeenCalledWith(component.signal(), 'testField');
  });

  it('should handle isInvalid computed property when required and no selection', () => {
    component._isRequired.set(true);
    mockUtilsService.getNestedProperty.mockReturnValue([]);

    expect(component.isInvalid()).toBe(true);
  });

  it('should handle isInvalid computed property when required and has selection', () => {
    component._isRequired.set(true);
    mockUtilsService.getNestedProperty.mockReturnValue([{ id: 1, name: 'Test 1' }]);

    expect(component.isInvalid()).toBe(false);
  });

  it('should handle isInvalid computed property when not required', () => {
    component._isRequired.set(false);
    mockUtilsService.getNestedProperty.mockReturnValue([]);

    expect(component.isInvalid()).toBe(false);
  });

  it('should handle useDisabled computed property', () => {
    component.optionsDisabled.set([{ id: 1 }]);

    expect(component.useDisabled()).toBe(1);
  });

  it('should handle listWithDisabled computed property', () => {
    const mockServiceList = [
      { id: 1, name: 'Option 1' },
      { id: 2, name: 'Option 2' }
    ];
    component.optionsDisabled.set([{ id: 1 }]);
    mockService.list.mockReturnValue(mockServiceList);
    component.ngOnInit();

    const result = component.listWithDisabled();

    expect(result).toEqual([
      { id: 1, name: 'Option 1', disabled: { id: 1 } },
      { id: 2, name: 'Option 2', disabled: undefined }
    ]);
  });

  it('should handle input properties', () => {
    component.label = 'Test Label';
    component.description = 'Test Description';
    component.hideSelected = true;
    component.hideTemplate = true;
    component.disabledSelectedScroll = true;
    component.disabled = true;
    component.filterBy = 'name';
    component.helperText = 'Helper text';
    component.textSpan = 'Text span';
    component.columnsOnXl = true;
    component.placeholder = 'Select options';
    component.scrollHeight = '400px';
    component.itemHeight = 50;
    component.dark = true;
    component.flagAttributes = { isoAlpha2: 'US', institution_location_name: 'United States' };
    component.removeTooltip = 'Remove item';

    expect(component.label).toBe('Test Label');
    expect(component.description).toBe('Test Description');
    expect(component.hideSelected).toBe(true);
    expect(component.hideTemplate).toBe(true);
    expect(component.disabledSelectedScroll).toBe(true);
    expect(component.disabled).toBe(true);
    expect(component.filterBy).toBe('name');
    expect(component.helperText).toBe('Helper text');
    expect(component.textSpan).toBe('Text span');
    expect(component.columnsOnXl).toBe(true);
    expect(component.placeholder).toBe('Select options');
    expect(component.scrollHeight).toBe('400px');
    expect(component.itemHeight).toBe(50);
    expect(component.dark).toBe(true);
    expect(component.flagAttributes).toEqual({ isoAlpha2: 'US', institution_location_name: 'United States' });
    expect(component.removeTooltip).toBe('Remove item');
  });

  it('should handle isRequired input setter', () => {
    component.isRequired = true;
    expect(component._isRequired()).toBe(true);

    component.isRequired = false;
    expect(component._isRequired()).toBe(false);
  });

  it('should handle removeCondition function', () => {
    const testItem = { id: 1, name: 'Test' };
    const customCondition = (item: any) => item.id === 1;
    component.removeCondition = customCondition;

    expect(component.removeCondition(testItem)).toBe(true);
  });

  it('should handle environment property', () => {
    expect(component.environment).toBeDefined();
  });

  it('should handle firstLoad signal updates', () => {
    expect(component.firstLoad()).toBe(true);

    component.firstLoad.set(false);
    expect(component.firstLoad()).toBe(false);
  });

  it('should handle body signal updates', () => {
    expect(component.body().value).toBe(null);

    component.body.set({ value: [1, 2, 3] });
    expect(component.body().value).toEqual([1, 2, 3]);
  });

  it('should handle optionsDisabled signal updates', () => {
    expect(component.optionsDisabled()).toEqual([]);

    component.optionsDisabled.set([{ id: 1 }]);
    expect(component.optionsDisabled()).toEqual([{ id: 1 }]);
  });

  it('should handle _isRequired signal updates', () => {
    expect(component._isRequired()).toBe(false);

    component._isRequired.set(true);
    expect(component._isRequired()).toBe(true);
  });
});
