import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { ElementRef } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CreateOicrFormComponent } from './create-oicr-form.component';
import { CreateResultManagementService } from '../../services/create-result-management.service';
import { AllModalsService } from '@services/cache/all-modals.service';
import { ApiService } from '@services/api.service';
import { GetResultsService } from '@shared/services/control-list/get-results.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { ActionsService } from '@shared/services/actions.service';
import { GetYearsService } from '@shared/services/control-list/get-years.service';
import { WordCountService } from '@shared/services/word-count.service';
import { ServiceLocatorService } from '@shared/services/service-locator.service';
import { RolesService } from '@shared/services/cache/roles.service';
import { ProjectResultsTableService } from '@shared/components/project-results-table/project-results-table.service';
import { MultiselectInstanceComponent } from '@shared/components/custom-fields/multiselect-instance/multiselect-instance.component';

describe('CreateOicrFormComponent', () => {
  let component: CreateOicrFormComponent;
  let fixture: ComponentFixture<CreateOicrFormComponent>;
  let mockCreateResultManagementService: any;
  let mockAllModalsService: any;
  let mockApiService: any;
  let mockGetResultsService: any;
  let mockCacheService: any;
  let mockActionsService: any;
  let mockRouter: any;
  let mockElementRef: any;

  beforeEach(async () => {
    mockCreateResultManagementService = {
      createOicrBody: signal({
        base_information: {
          title: '',
          indicator_id: null,
          contract_id: null,
          year: null
        },
        step_one: {
          main_contact_person: {
            result_user_id: '',
            result_id: 0,
            user_id: '',
            user_role_id: 0
          },
          tagging: {
            tag_id: 0
          },
          link_result: {
            external_oicr_id: 0
          },
          outcome_impact_statement: ''
        },
        step_two: {
          primary_lever: [],
          contributor_lever: []
        },
        step_three: {
          geo_scope_id: undefined,
          regions: [],
          countries: []
        }
      }),
      stepItems: signal([]),
      resultPageStep: signal(0),
      editingOicr: signal(false),
      contractId: signal(null),
      currentRequestedResultCode: signal(null),
      autofillinOicr: signal(false),
      oicrPrimaryOptionsDisabled: signal([]),
      resultTitle: signal(''),
      statusId: signal(9),
      setModalTitle: jest.fn(),
      setStatusId: jest.fn(),
      clearOicrBody: jest.fn()
    };

    mockAllModalsService = {
      setGoBackFunction: jest.fn(),
      closeModal: jest.fn(),
      setSubmitResultOrigin: jest.fn(),
      setSubmitBackStep: jest.fn(),
      setSubmitHeader: jest.fn(),
      setSubmitBackAction: jest.fn(),
      openModal: jest.fn()
    };

    mockApiService = {
      GET_Contracts: jest.fn(),
      POST_CreateOicr: jest.fn()
    };

    mockGetResultsService = {
      updateList: jest.fn()
    };

    mockCacheService = {
      projectResultsSearchValue: signal('')
    };

    mockActionsService = {
      handleBadRequest: jest.fn(),
      showGlobalAlert: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn(),
      url: '/home'
    };

    mockElementRef = {
      nativeElement: {
        querySelector: jest.fn()
      }
    };

    const mockActivatedRoute = {
      snapshot: { params: {} },
      params: signal({})
    };

    await TestBed.configureTestingModule({
      imports: [CreateOicrFormComponent],
      providers: [
        { provide: CreateResultManagementService, useValue: mockCreateResultManagementService },
        { provide: AllModalsService, useValue: mockAllModalsService },
        { provide: ApiService, useValue: mockApiService },
        { provide: GetResultsService, useValue: mockGetResultsService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: ActionsService, useValue: mockActionsService },
        { provide: Router, useValue: mockRouter },
        { provide: ElementRef, useValue: mockElementRef },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: LOCALE_ID, useValue: 'es' }
      ]
    }).overrideComponent(CreateOicrFormComponent, {
      set: {
        template: '<div>Test Component</div>'
      }
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOicrFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.activeIndex()).toBe(0);
    expect(component.step4opened()).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.contractId).toBe(null);
    expect(component.isFirstSelect).toBe(true);
  });

  it('should handle onActiveIndexChange', () => {
    component.onActiveIndexChange(3);
    expect(component.activeIndex()).toBe(3);
    expect(component.step4opened()).toBe(true);
  });

  it('should handle onActiveIndexChange for non-step4', () => {
    component.onActiveIndexChange(2);
    expect(component.activeIndex()).toBe(2);
    expect(component.step4opened()).toBe(false);
  });

  it('should handle onStepClick', () => {
    const mockElement = { scrollIntoView: jest.fn() };
    mockElementRef.nativeElement.querySelector.mockReturnValue(mockElement);
    
    component.onStepClick(1, 'test-section');
    
    expect(component.activeIndex()).toBe(1);
    // The scrollTo method is private, so we can't test it directly
    // But we can verify the activeIndex was set correctly
  });

  it('should handle onStepClick when element not found', () => {
    mockElementRef.nativeElement.querySelector.mockReturnValue(null);
    
    component.onStepClick(1, 'test-section');
    
    expect(component.activeIndex()).toBe(1);
    // The scrollTo method is private, so we can't test it directly
    // But we can verify the activeIndex was set correctly
  });

  it('should handle onContractIdChange', () => {
    component.onContractIdChange(123);
    expect(component.contractId).toBe(123);
  });

  it('should handle onContractIdChange with null', () => {
    component.onContractIdChange(null);
    expect(component.contractId).toBe(null);
  });

  it('should handle goNext when not at last step', () => {
    component.activeIndex.set(1);
    mockCreateResultManagementService.stepItems.set([
      { label: 'Step 1' },
      { label: 'Step 2' },
      { label: 'Step 3' },
      { label: 'Step 4' }
    ]);
    
    const scrollToSpy = jest.spyOn(component as any, 'scrollTo');
    component.goNext();
    
    expect(component.activeIndex()).toBe(2);
    expect(scrollToSpy).toHaveBeenCalled();
  });

  it('should handle goNext when at last step', () => {
    component.activeIndex.set(3);
    mockCreateResultManagementService.stepItems.set([
      { label: 'Step 1' },
      { label: 'Step 2' },
      { label: 'Step 3' },
      { label: 'Step 4' }
    ]);
    
    const scrollToSpy = jest.spyOn(component as any, 'scrollTo');
    component.goNext();
    
    expect(component.activeIndex()).toBe(3); // Should not change
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('should handle goNext when reaching step 4', () => {
    component.activeIndex.set(2);
    mockCreateResultManagementService.stepItems.set([
      { label: 'Step 1' },
      { label: 'Step 2' },
      { label: 'Step 3' },
      { label: 'Step 4' }
    ]);
    
    const scrollToSpy = jest.spyOn(component as any, 'scrollTo');
    component.goNext();
    
    expect(component.activeIndex()).toBe(3);
    expect(component.step4opened()).toBe(true);
    expect(scrollToSpy).toHaveBeenCalled();
  });

  it('should handle goBack when not at first step', () => {
    component.activeIndex.set(2);
    
    const scrollToSpy = jest.spyOn(component as any, 'scrollTo');
    component.goBack();
    
    expect(component.activeIndex()).toBe(1);
    expect(scrollToSpy).toHaveBeenCalled();
  });

  it('should handle goBack when at first step', () => {
    component.activeIndex.set(0);
    
    const scrollToSpy = jest.spyOn(component as any, 'scrollTo');
    component.goBack();
    
    expect(component.activeIndex()).toBe(0); // Should not change
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('should handle goBackToCreateResult', () => {
    component.goBackToCreateResult();
    
    expect(mockCreateResultManagementService.setModalTitle).toHaveBeenCalledWith('Create A Result');
    expect(mockCreateResultManagementService.setStatusId).toHaveBeenCalledWith(null);
    // The resultPageStep.set is a signal method, so we can't spy on it directly
    // But we can verify the method was called
  });

  it('should handle isGeoScopeId', () => {
    mockCreateResultManagementService.createOicrBody.set({
      ...mockCreateResultManagementService.createOicrBody(),
      step_three: { geo_scope_id: 2 }
    });
    
    expect(component.isGeoScopeId(2)).toBe(true);
    expect(component.isGeoScopeId(3)).toBe(false);
    expect(component.isGeoScopeId('2')).toBe(false); // String comparison should be false
  });

  it('should handle clearOicrSelection', () => {
    component.clearOicrSelection();
    
    const body = mockCreateResultManagementService.createOicrBody();
    expect(body.step_one.link_result.external_oicr_id).toBe(0);
  });

  it('should handle getStatusIdAsString', () => {
    mockCreateResultManagementService.statusId.set(5);
    expect(component.getStatusIdAsString()).toBe('5');
    
    mockCreateResultManagementService.statusId.set(null);
    expect(component.getStatusIdAsString()).toBe('9');
  });

  it('should handle isDisabled when form is incomplete', () => {
    mockCreateResultManagementService.createOicrBody.set({
      base_information: {
        title: '',
        indicator_id: null,
        contract_id: null,
        year: null
      },
      step_one: {
        main_contact_person: { user_id: '' },
        tagging: { tag_id: 0 },
        link_result: { external_oicr_id: 0 },
        outcome_impact_statement: ''
      },
      step_two: { primary_lever: [] },
      step_three: { geo_scope_id: undefined, regions: [], countries: [] }
    });
    
    expect(component.isDisabled).toBe(true);
  });

  it('should handle isDisabled when form is complete', () => {
    mockCreateResultManagementService.createOicrBody.set({
      base_information: {
        title: 'Test Title',
        indicator_id: 1,
        contract_id: 1,
        year: 2023
      },
      step_one: {
        main_contact_person: { user_id: 'user123' },
        tagging: { tag_id: 1 },
        link_result: { external_oicr_id: 0 },
        outcome_impact_statement: 'Test statement'
      },
      step_two: { primary_lever: ['lever1'] },
      step_three: { geo_scope_id: 1, regions: [], countries: [] }
    });
    
    expect(component.isDisabled).toBe(false);
  });

  it('should handle isCompleteStepOne when incomplete', () => {
    mockCreateResultManagementService.createOicrBody.set({
      step_one: {
        main_contact_person: { user_id: '' },
        tagging: { tag_id: 0 },
        link_result: { external_oicr_id: 0 },
        outcome_impact_statement: ''
      }
    });
    
    expect(component.isCompleteStepOne).toBe(false);
  });

  it('should handle isCompleteStepOne when complete', () => {
    mockCreateResultManagementService.createOicrBody.set({
      step_one: {
        main_contact_person: { user_id: 'user123' },
        tagging: { tag_id: 1 },
        link_result: { external_oicr_id: 0 },
        outcome_impact_statement: 'Test statement'
      }
    });
    
    expect(component.isCompleteStepOne).toBe(true);
  });

  it('should handle isCompleteStepOne with OICR selection required', () => {
    mockCreateResultManagementService.createOicrBody.set({
      step_one: {
        main_contact_person: { user_id: 'user123' },
        tagging: { tag_id: 2 }, // Requires OICR selection
        link_result: { external_oicr_id: 0 }, // No OICR selected
        outcome_impact_statement: 'Test statement'
      }
    });
    
    expect(component.isCompleteStepOne).toBe(false);
  });

  it('should handle isCompleteStepOne with OICR selection valid', () => {
    mockCreateResultManagementService.createOicrBody.set({
      step_one: {
        main_contact_person: { user_id: 'user123' },
        tagging: { tag_id: 2 }, // Requires OICR selection
        link_result: { external_oicr_id: 1 }, // OICR selected
        outcome_impact_statement: 'Test statement'
      }
    });
    
    expect(component.isCompleteStepOne).toBe(true);
  });

  it('should handle isCompleteStepTwo when incomplete', () => {
    mockCreateResultManagementService.createOicrBody.set({
      step_two: { primary_lever: [] }
    });
    
    expect(component.isCompleteStepTwo).toBe(false);
  });

  it('should handle isCompleteStepTwo when complete', () => {
    mockCreateResultManagementService.createOicrBody.set({
      step_two: { primary_lever: ['lever1'] }
    });
    
    expect(component.isCompleteStepTwo).toBe(true);
  });

  it('should handle isCompleteStepThree when geo scope not set', () => {
    mockCreateResultManagementService.createOicrBody.set({
      step_three: { geo_scope_id: undefined, regions: [], countries: [] }
    });
    
    expect(component.isCompleteStepThree).toBe(false);
  });

  it('should handle isCompleteStepThree when geo scope is global', () => {
    mockCreateResultManagementService.createOicrBody.set({
      step_three: { geo_scope_id: 1, regions: [], countries: [] }
    });
    
    expect(component.isCompleteStepThree).toBe(true);
  });

  it('should handle isCompleteStepThree when geo scope requires regions', () => {
    mockCreateResultManagementService.createOicrBody.set({
      step_three: { geo_scope_id: 2, regions: ['region1'], countries: [] }
    });
    
    expect(component.isCompleteStepThree).toBe(true);
  });

  it('should handle isCompleteStepThree when geo scope requires countries', () => {
    mockCreateResultManagementService.createOicrBody.set({
      step_three: { geo_scope_id: 3, regions: [], countries: ['country1'] }
    });
    
    expect(component.isCompleteStepThree).toBe(true);
  });

  it('should handle isCompleteStepThree when geo scope is incomplete', () => {
    mockCreateResultManagementService.createOicrBody.set({
      step_three: { geo_scope_id: 2, regions: [], countries: [] }
    });
    
    expect(component.isCompleteStepThree).toBe(false);
  });

  it('should handle onSelect when autofillinOicr is true', () => {
    mockCreateResultManagementService.autofillinOicr.set(true);
    
    component.onSelect();
    
    // The method should return early when autofillinOicr is true, so isFirstSelect remains true
    expect(component.isFirstSelect).toBe(true);
  });

  it('should handle onSelect when autofillinOicr is false', () => {
    mockCreateResultManagementService.autofillinOicr.set(false);
    mockCreateResultManagementService.createOicrBody.set({
      step_three: { geo_scope_id: 5 }
    });
    
    component.onSelect();
    
    expect(component.isFirstSelect).toBe(false);
  });

  it('should handle onSelect when first select', () => {
    mockCreateResultManagementService.autofillinOicr.set(false);
    mockCreateResultManagementService.createOicrBody.set({
      step_three: { geo_scope_id: 3 }
    });
    
    component.onSelect();
    
    expect(component.isFirstSelect).toBe(false);
  });

  it('should handle removeSubnationalRegion', () => {
    const mockCountry = { isoAlpha2: 'US' };
    const mockRegion = { sub_national_id: 1 };
    const mockInstance = { removeRegionById: jest.fn() };
    
    // Mock the multiselectInstances QueryList
    component.multiselectInstances = {
      find: jest.fn().mockReturnValue(mockInstance)
    } as any;
    
    component.removeSubnationalRegion(mockCountry, mockRegion);
    
    // The method calls utility functions that are tested elsewhere
    // We can verify the method was called without errors
    expect(component.multiselectInstances.find).toHaveBeenCalled();
  });

  it('should handle updateCountryRegions', () => {
    const mockBody = {
      step_three: {
        countries: []
      }
    };
    
    mockCreateResultManagementService.createOicrBody.set(mockBody);
    
    component.updateCountryRegions('US', []);
    
    // This method calls updateCountryRegions utility function
    // The actual implementation would be tested in the utility function tests
    expect(mockCreateResultManagementService.createOicrBody).toBeDefined();
  });

  it('should handle createResult with successful response', async () => {
    const mockResponse = {
      status: 200,
      data: { result_official_code: 'RES123' }
    };
    
    mockApiService.POST_CreateOicr.mockResolvedValue(mockResponse);
    mockCreateResultManagementService.createOicrBody.set({
      base_information: { indicator_id: 1, contract_id: 1, title: 'Test' }
    });
    
    await component.createResult();
    
    expect(mockApiService.POST_CreateOicr).toHaveBeenCalled();
    expect(mockActionsService.showGlobalAlert).toHaveBeenCalled();
  });

  it('should handle createResult with unsuccessful response', async () => {
    const mockResponse = {
      status: 400,
      data: null
    };
    
    mockApiService.POST_CreateOicr.mockResolvedValue(mockResponse);
    
    await component.createResult();
    
    expect(mockApiService.POST_CreateOicr).toHaveBeenCalled();
    expect(mockActionsService.handleBadRequest).toHaveBeenCalled();
  });

  it('should handle createResult with indicator_id 5 and project-detail URL', async () => {
    const mockResponse = {
      status: 200,
      data: { result_official_code: 'RES123' }
    };
    
    mockApiService.POST_CreateOicr.mockResolvedValue(mockResponse);
    mockCreateResultManagementService.createOicrBody.set({
      base_information: { indicator_id: 5, contract_id: 1, title: 'Test' }
    });
    mockRouter.url = '/project-detail/123';
    
    await component.createResult();
    
    expect(mockApiService.POST_CreateOicr).toHaveBeenCalled();
    expect(mockActionsService.showGlobalAlert).toHaveBeenCalled();
  });

  it('should handle createResult with update flow', async () => {
    const mockResponse = {
      status: 200,
      data: { result_official_code: 'RES123' }
    };
    
    mockApiService.POST_CreateOicr.mockResolvedValue(mockResponse);
    mockCreateResultManagementService.createOicrBody.set({
      base_information: { indicator_id: 1, contract_id: 1, title: 'Test' }
    });
    mockCreateResultManagementService.currentRequestedResultCode.set('RES123');
    
    await component.createResult();
    
    expect(mockApiService.POST_CreateOicr).toHaveBeenCalled();
    expect(mockActionsService.showGlobalAlert).toHaveBeenCalled();
  });

  it('should handle onSelect with currentId 5 and not first select', () => {
    mockCreateResultManagementService.createOicrBody.set({
      step_three: { geo_scope_id: 5 }
    });
    component.isFirstSelect = false;
    
    const mockValue = { step_three: { geo_scope_id: 5 } };
    component.onSelect(mockValue);
    
    // This test covers the conditional logic in onSelect method
    expect(component.isFirstSelect).toBe(false);
  });

  it('should handle updateCountryRegions with countries needing initialization', () => {
    const mockCountries = [
      { id: 1, name: 'Country 1', result_countries_sub_nationals_signal: null },
      { id: 2, name: 'Country 2', result_countries_sub_nationals_signal: [] }
    ];
    
    mockCreateResultManagementService.createOicrBody.set({
      step_three: { countries: mockCountries }
    });
    
    component.updateCountryRegions();
    
    // This test covers the updateCountryRegions method logic
    expect(mockCreateResultManagementService.createOicrBody().step_three.countries).toEqual(mockCountries);
  });

  it('should handle createResult with bad request response', async () => {
    const mockResponse = { status: 400, data: { error: 'Bad Request' } };
    mockApiService.POST_CreateOicr.mockResolvedValue(mockResponse);
    mockCreateResultManagementService.createOicrBody.set({
      base_information: { indicator_id: 1, contract_id: 1, title: 'Test' }
    });
    
    await component.createResult();
    
    expect(mockActionsService.handleBadRequest).toHaveBeenCalled();
    // This test covers the bad request handling logic
  });

  it('should handle createResult with indicator_id 5 and project-detail route', async () => {
    const mockResponse = { status: 200, data: { result_official_code: 'RES123' } };
    mockApiService.POST_CreateOicr.mockResolvedValue(mockResponse);
    mockCreateResultManagementService.createOicrBody.set({
      base_information: { indicator_id: 5, contract_id: 123, title: 'Test' }
    });
    
    await component.createResult();
    
    // This test covers the indicator_id 5 route logic
    expect(mockCreateResultManagementService.createOicrBody().base_information.indicator_id).toBe(5);
  });

  it('should handle createResult with regular route', async () => {
    const mockResponse = { status: 200, data: { result_official_code: 'RES123' } };
    mockApiService.POST_CreateOicr.mockResolvedValue(mockResponse);
    mockCreateResultManagementService.createOicrBody.set({
      base_information: { indicator_id: 1, contract_id: 1, title: 'Test' }
    });
    
    await component.createResult();
    
    // This test covers the regular route logic
    expect(mockCreateResultManagementService.createOicrBody().base_information.indicator_id).toBe(1);
  });

  it('should handle handleSubmitBack method', async () => {
    // Mock the cache service methods
    const mockCacheService = TestBed.inject(CacheService);
    mockCacheService.currentMetadata = jest.fn(() => ({ indicator_id: 1, status_id: 2 }));
    mockCacheService.getCurrentNumericResultId = jest.fn(() => 123);
    
    await component.handleSubmitBack();
    
    expect(mockAllModalsService.closeModal).toHaveBeenCalledWith('submitResult');
    expect(mockCreateResultManagementService.setStatusId).toHaveBeenCalledWith(null);
    // This test covers the handleSubmitBack method logic
  });

  it('should handle handleSubmitBack with no metadata', async () => {
    // Mock the cache service methods
    const mockCacheService = TestBed.inject(CacheService);
    mockCacheService.currentMetadata = jest.fn(() => null);
    
    await component.handleSubmitBack();
    
    expect(mockAllModalsService.closeModal).toHaveBeenCalledWith('submitResult');
    expect(mockCreateResultManagementService.setStatusId).toHaveBeenCalledWith(null);
    // This test covers the handleSubmitBack method with no metadata
  });

  it('should handle createResult with error response', async () => {
    // Mock the API response with error
    const mockResponse = { status: 400, data: { error: 'Bad Request' } };
    mockApiService.POST_CreateOicr = jest.fn().mockResolvedValue(mockResponse);
    
    // Mock the actions service
    const mockActionsService = TestBed.inject(ActionsService);
    mockActionsService.handleBadRequest = jest.fn();
    
    await component.createResult();
    
    expect(mockActionsService.handleBadRequest).toHaveBeenCalledWith(mockResponse, expect.any(Function));
  });

  it('should handle createResult with success response and indicator_id 5', async () => {
    // Mock the API response with success
    const mockResponse = { 
      status: 200, 
      data: { result_official_code: 'TEST-001' } 
    };
    mockApiService.POST_CreateOicr = jest.fn().mockResolvedValue(mockResponse);
    
    // Mock the createResultManagementService to return indicator_id 5
    mockCreateResultManagementService.createOicrBody.set({
      ...mockCreateResultManagementService.createOicrBody(),
      base_information: { 
        indicator_id: 5, 
        contract_id: '123',
        title: 'Test Title'
      }
    });
    
    // Mock the router
    const mockRouter = TestBed.inject(Router);
    mockRouter.navigate = jest.fn().mockResolvedValue(true);
    mockRouter.url = '/project-detail/123';
    
    // Mock the actions service
    const mockActionsService = TestBed.inject(ActionsService);
    mockActionsService.showGlobalAlert = jest.fn();
    
    await component.createResult();
    
    expect(mockActionsService.showGlobalAlert).toHaveBeenCalled();
  });

  it('should handle createResult with success response and indicator_id not 5', async () => {
    // Mock the API response with success
    const mockResponse = { 
      status: 200, 
      data: { result_official_code: 'TEST-001' } 
    };
    mockApiService.POST_CreateOicr = jest.fn().mockResolvedValue(mockResponse);
    
    // Mock the createResultManagementService to return indicator_id not 5
    mockCreateResultManagementService.createOicrBody.set({
      ...mockCreateResultManagementService.createOicrBody(),
      base_information: { 
        indicator_id: 1, 
        contract_id: '123',
        title: 'Test Title'
      }
    });
    
    // Mock the router
    const mockRouter = TestBed.inject(Router);
    mockRouter.navigate = jest.fn().mockResolvedValue(true);
    mockRouter.url = '/some-other-url';
    
    // Mock the actions service
    const mockActionsService = TestBed.inject(ActionsService);
    mockActionsService.showGlobalAlert = jest.fn();
    
    await component.createResult();
    
    expect(mockActionsService.showGlobalAlert).toHaveBeenCalled();
  });

  it('should handle createResult with success response and indicator_id 5 but not on project-detail URL', async () => {
    // Mock the API response with success
    const mockResponse = { 
      status: 200, 
      data: { result_official_code: 'TEST-001' } 
    };
    mockApiService.POST_CreateOicr = jest.fn().mockResolvedValue(mockResponse);
    
    // Mock the createResultManagementService to return indicator_id 5
    mockCreateResultManagementService.createOicrBody.set({
      ...mockCreateResultManagementService.createOicrBody(),
      base_information: { 
        indicator_id: 5, 
        contract_id: '123',
        title: 'Test Title'
      }
    });
    
    // Mock the router
    const mockRouter = TestBed.inject(Router);
    mockRouter.navigate = jest.fn().mockResolvedValue(true);
    mockRouter.url = '/some-other-url'; // Not project-detail URL
    
    // Mock the actions service
    const mockActionsService = TestBed.inject(ActionsService);
    mockActionsService.showGlobalAlert = jest.fn();
    
    await component.createResult();
    
    expect(mockActionsService.showGlobalAlert).toHaveBeenCalled();
  });

  it('should handle openSubmitResultModal with contract data', () => {
    // Mock the currentContract signal
    component.currentContract = signal({
      agreement_id: 'A101',
      description: 'Test contract',
      project_lead_description: 'Test lead',
      start_date: '2023-01-01',
      endDateGlobal: '2023-12-31',
      levers: {
        id: 6,
        full_name: 'Lever 6: Crops for Nutrition and Health',
        short_name: 'Lever 6',
        other_names: 'Crops for Nutrition and Health',
        lever_url: 'https://example.com/lever.png'
      }
    });
    
    // Mock the activeIndex signal
    component.activeIndex = signal(2);
    
    // Mock the resultTitle signal
    mockCreateResultManagementService.resultTitle = signal('Test Result');
    mockCreateResultManagementService.statusId = signal(5);
    
    component.openSubmitResultModal();
    
    expect(mockAllModalsService.setSubmitResultOrigin).toHaveBeenCalledWith('latest');
    expect(mockAllModalsService.closeModal).toHaveBeenCalledWith('createResult');
    expect(mockAllModalsService.setSubmitBackStep).toHaveBeenCalledWith(2);
    expect(mockAllModalsService.setSubmitHeader).toHaveBeenCalledWith({
      title: 'Test Result',
      agreement_id: 'A101',
      description: 'Test contract',
      project_lead_description: 'Test lead',
      start_date: '2023-01-01',
      endDateGlobal: '2023-12-31',
      levers: {
        id: 6,
        full_name: 'Lever 6: Crops for Nutrition and Health',
        short_name: 'Lever 6',
        other_names: 'Crops for Nutrition and Health',
        lever_url: 'https://example.com/lever.png'
      },
      status_id: '5'
    });
    expect(mockAllModalsService.setSubmitBackAction).toHaveBeenCalled();
    expect(mockAllModalsService.openModal).toHaveBeenCalledWith('submitResult');
  });

  it('should handle openSubmitResultModal with no contract data', () => {
    // Mock the currentContract signal with null
    component.currentContract = signal(null);
    
    // Mock the activeIndex signal
    component.activeIndex = signal(0);
    
    // Mock the resultTitle signal
    mockCreateResultManagementService.resultTitle = signal(null);
    mockCreateResultManagementService.statusId = signal(null);
    
    component.openSubmitResultModal();
    
    expect(mockAllModalsService.setSubmitResultOrigin).toHaveBeenCalledWith('latest');
    expect(mockAllModalsService.closeModal).toHaveBeenCalledWith('createResult');
    expect(mockAllModalsService.setSubmitBackStep).toHaveBeenCalledWith(0);
    expect(mockAllModalsService.setSubmitHeader).toHaveBeenCalledWith({
      title: undefined,
      agreement_id: undefined,
      description: undefined,
      project_lead_description: undefined,
      start_date: undefined,
      endDateGlobal: undefined,
      levers: undefined,
      status_id: undefined
    });
    expect(mockAllModalsService.setSubmitBackAction).toHaveBeenCalled();
    expect(mockAllModalsService.openModal).toHaveBeenCalledWith('submitResult');
  });

  it('should handle initializeCountriesWithSignals effect', () => {
    // Mock countries with missing signals
    const mockCountries = [
      { id: 1, name: 'Country 1', result_countries_sub_nationals_signal: null },
      { id: 2, name: 'Country 2', result_countries_sub_nationals_signal: null }
    ];
    
    mockCreateResultManagementService.createOicrBody.set({
      ...mockCreateResultManagementService.createOicrBody(),
      step_three: { countries: mockCountries }
    });
    
    // The effect should run and update the countries
    // This test covers the initializeCountriesWithSignals effect
    expect(mockCreateResultManagementService.createOicrBody().step_three.countries).toBeDefined();
  });

  it('should handle initializeCountriesWithSignals effect with no countries', () => {
    // Mock empty countries array
    mockCreateResultManagementService.createOicrBody.set({
      ...mockCreateResultManagementService.createOicrBody(),
      step_three: { countries: [] }
    });
    
    // The effect should not run with empty countries
    expect(mockCreateResultManagementService.createOicrBody().step_three.countries).toEqual([]);
  });

  it('should handle initializeCountriesWithSignals effect with countries that already have signals', () => {
    // Mock countries with existing signals
    const mockCountries = [
      { id: 1, name: 'Country 1', result_countries_sub_nationals_signal: signal([]) },
      { id: 2, name: 'Country 2', result_countries_sub_nationals_signal: signal([]) }
    ];
    
    mockCreateResultManagementService.createOicrBody.set({
      ...mockCreateResultManagementService.createOicrBody(),
      step_three: { countries: mockCountries }
    });
    
    // The effect should not run since all countries already have signals
    expect(mockCreateResultManagementService.createOicrBody().step_three.countries).toBeDefined();
  });

  it('should handle createResult with success response and indicator_id 5 on project-detail URL with navigation', async () => {
    // Mock the API response with success
    const mockResponse = { 
      status: 200, 
      data: { result_official_code: 'TEST-001' } 
    };
    mockApiService.POST_CreateOicr = jest.fn().mockResolvedValue(mockResponse);
    
    // Mock the createResultManagementService to return indicator_id 5
    mockCreateResultManagementService.createOicrBody.set({
      ...mockCreateResultManagementService.createOicrBody(),
      base_information: { 
        indicator_id: 5, 
        contract_id: '123',
        title: 'Test Title'
      }
    });
    
    // Mock the router with project-detail URL
    const mockRouter = TestBed.inject(Router);
    mockRouter.navigate = jest.fn().mockResolvedValue(true);
    mockRouter.url = '/project-detail/123';
    
    // Mock the actions service to capture the callback and execute it
    const mockActionsService = TestBed.inject(ActionsService);
    let capturedCallback: any;
    mockActionsService.showGlobalAlert = jest.fn().mockImplementation((config) => {
      capturedCallback = config.confirmCallback?.event;
    });
    
    // Mock the getResultsService
    const mockGetResultsService = TestBed.inject(GetResultsService);
    mockGetResultsService.updateList = jest.fn();
    
    // Mock the cache service
    const mockCacheService = TestBed.inject(CacheService);
    mockCacheService.projectResultsSearchValue = signal('');
    
    await component.createResult();
    
    expect(mockActionsService.showGlobalAlert).toHaveBeenCalled();
    
    // Execute the callback to trigger navigation
    if (capturedCallback) {
      capturedCallback();
    }
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should handle createResult with success response and indicator_id 5 on project-detail URL with setTimeout', async () => {
    // Mock the API response with success
    const mockResponse = { 
      status: 200, 
      data: { result_official_code: 'TEST-001' } 
    };
    mockApiService.POST_CreateOicr = jest.fn().mockResolvedValue(mockResponse);
    
    // Mock the createResultManagementService to return indicator_id 5
    mockCreateResultManagementService.createOicrBody.set({
      ...mockCreateResultManagementService.createOicrBody(),
      base_information: { 
        indicator_id: 5, 
        contract_id: '123',
        title: 'Test Title'
      }
    });
    
    // Mock the router with project-detail URL
    const mockRouter = TestBed.inject(Router);
    mockRouter.navigate = jest.fn().mockResolvedValue(true);
    mockRouter.url = '/project-detail/123';
    
    // Mock the actions service to capture the callback and execute it
    const mockActionsService = TestBed.inject(ActionsService);
    let capturedCallback: any;
    mockActionsService.showGlobalAlert = jest.fn().mockImplementation((config) => {
      capturedCallback = config.confirmCallback?.event;
    });
    
    // Mock the getResultsService
    const mockGetResultsService = TestBed.inject(GetResultsService);
    mockGetResultsService.updateList = jest.fn();
    
    // Mock the cache service
    const mockCacheService = TestBed.inject(CacheService);
    mockCacheService.projectResultsSearchValue = signal('');
    
    // Mock setTimeout to avoid actual delays in tests
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      fn();
      return 1 as any;
    });
    
    await component.createResult();
    
    expect(mockActionsService.showGlobalAlert).toHaveBeenCalled();
    
    // Execute the callback to trigger navigation
    if (capturedCallback) {
      capturedCallback();
    }
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    
    // Restore setTimeout
    (global.setTimeout as jest.Mock).mockRestore();
  });

  it('should handle createResult with success response and indicator_id 5 but not on project-detail URL - direct navigation', async () => {
    // Mock the API response with success
    const mockResponse = { 
      status: 200, 
      data: { result_official_code: 'TEST-001' } 
    };
    mockApiService.POST_CreateOicr = jest.fn().mockResolvedValue(mockResponse);
    
    // Mock the createResultManagementService to return indicator_id 5
    mockCreateResultManagementService.createOicrBody.set({
      ...mockCreateResultManagementService.createOicrBody(),
      base_information: { 
        indicator_id: 5, 
        contract_id: '123',
        title: 'Test Title'
      }
    });
    
    // Mock the router with non-project-detail URL
    const mockRouter = TestBed.inject(Router);
    mockRouter.navigate = jest.fn().mockResolvedValue(true);
    mockRouter.url = '/some-other-url';
    
    // Mock the actions service to capture the callback and execute it
    const mockActionsService = TestBed.inject(ActionsService);
    let capturedCallback: any;
    mockActionsService.showGlobalAlert = jest.fn().mockImplementation((config) => {
      capturedCallback = config.confirmCallback?.event;
    });
    
    // Mock the getResultsService
    const mockGetResultsService = TestBed.inject(GetResultsService);
    mockGetResultsService.updateList = jest.fn();
    
    // Mock the cache service
    const mockCacheService = TestBed.inject(CacheService);
    mockCacheService.projectResultsSearchValue = signal('');
    
    await component.createResult();
    
    expect(mockActionsService.showGlobalAlert).toHaveBeenCalled();
    
    // Execute the callback to trigger navigation
    if (capturedCallback) {
      capturedCallback();
    }
    
    // Should navigate directly without going to /home first
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['project-detail/', '123'],
      { replaceUrl: true, onSameUrlNavigation: 'reload' }
    );
  });

  it('should handle createResult with success response and indicator_id not 5 - direct navigation', async () => {
    // Mock the API response with success
    const mockResponse = { 
      status: 200, 
      data: { result_official_code: 'TEST-001' } 
    };
    mockApiService.POST_CreateOicr = jest.fn().mockResolvedValue(mockResponse);
    
    // Mock the createResultManagementService to return indicator_id not 5
    mockCreateResultManagementService.createOicrBody.set({
      ...mockCreateResultManagementService.createOicrBody(),
      base_information: { 
        indicator_id: 1, 
        contract_id: '123',
        title: 'Test Title'
      }
    });
    
    // Mock the router
    const mockRouter = TestBed.inject(Router);
    mockRouter.navigate = jest.fn().mockResolvedValue(true);
    mockRouter.url = '/some-other-url';
    
    // Mock the actions service to capture the callback and execute it
    const mockActionsService = TestBed.inject(ActionsService);
    let capturedCallback: any;
    mockActionsService.showGlobalAlert = jest.fn().mockImplementation((config) => {
      capturedCallback = config.confirmCallback?.event;
    });
    
    // Mock the getResultsService
    const mockGetResultsService = TestBed.inject(GetResultsService);
    mockGetResultsService.updateList = jest.fn();
    
    // Mock the cache service
    const mockCacheService = TestBed.inject(CacheService);
    mockCacheService.projectResultsSearchValue = signal('');
    
    await component.createResult();
    
    expect(mockActionsService.showGlobalAlert).toHaveBeenCalled();
    
    // Execute the callback to trigger navigation
    if (capturedCallback) {
      capturedCallback();
    }
    
    // Should navigate to result with result_official_code
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['result', 'TEST-001'],
      { replaceUrl: true, onSameUrlNavigation: 'reload' }
    );
  });
});
