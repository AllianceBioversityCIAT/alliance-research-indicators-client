import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { CreateResultFormComponent } from './create-result-form.component';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { ApiService } from '@shared/services/api.service';
import { IndicatorsService } from '@shared/services/control-list/indicators.service';
import { GetContractsService } from '@shared/services/control-list/get-contracts.service';
import { GetResultsService } from '@shared/services/control-list/get-results.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { ActionsService } from '@shared/services/actions.service';
import { GetYearsService } from '@shared/services/control-list/get-years.service';
import { WordCountService } from '@shared/services/word-count.service';

describe('CreateResultFormComponent', () => {
  let component: CreateResultFormComponent;
  let fixture: ComponentFixture<CreateResultFormComponent>;

  let router: Router;
  let apiServiceMock: any;
  let actionsServiceMock: any;
  let yearsServiceMock: any;
  let resultsServiceMock: any;
  let contractsServiceMock: any;
  let indicatorsServiceMock: any;
  let allModalsServiceMock: any;
  let cacheServiceMock: any;

  beforeEach(async () => {
    (globalThis as any).ResizeObserver = class {
      observe() {
        // intentionally left blank for testing
      }
      unobserve() {
        // intentionally left blank for testing
      }
      disconnect() {
        // intentionally left blank for testing
      }
    };

    apiServiceMock = {
      POST_Result: jest.fn()
    } as Partial<ApiService> 

    actionsServiceMock = {
      showToast: jest.fn(),
      handleBadRequest: jest.fn()
    } as Partial<ActionsService> 

    const currentYear = new Date().getFullYear();
    yearsServiceMock = {
      list: jest.fn().mockReturnValue([{ report_year: currentYear }])
    } 

    resultsServiceMock = {
      updateList: jest.fn()
    } as Partial<GetResultsService> 

    contractsServiceMock = {
      list: jest.fn().mockReturnValue([])
    } 

    indicatorsServiceMock = {
      indicatorsGrouped: jest.fn().mockReturnValue([])
    } 

    allModalsServiceMock = {
      closeModal: jest.fn()
    } as Partial<AllModalsService> 

    cacheServiceMock = {
      currentResultId: signal<number | null>(null)
    } as Partial<CacheService>

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, CreateResultFormComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map() }, params: of({}) } },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: ActionsService, useValue: actionsServiceMock },
        { provide: GetYearsService, useValue: yearsServiceMock },
        { provide: GetResultsService, useValue: resultsServiceMock },
        { provide: GetContractsService, useValue: contractsServiceMock },
        { provide: IndicatorsService, useValue: indicatorsServiceMock },
        { provide: AllModalsService, useValue: allModalsServiceMock },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: WordCountService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateResultFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set current year on onYearsLoaded when available', () => {
    const currentYear = new Date().getFullYear();
    expect(component.body().year).toBe(currentYear);
  });

  it('should not set year when years list does not include current year', () => {
    yearsServiceMock.list.mockReturnValue([{ report_year: 1999 }]);
    // Recreate component so the effect re-evaluates with new mock
    const newFixture = TestBed.createComponent(CreateResultFormComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();
    expect(newComponent.body().year).toBeNull();
  });

  it('getters for missing fields should reflect body state', () => {
    component.body.set({ indicator_id: null, title: null, year: null, contract_id: null });
    expect(component.isYearMissing).toBe(true);
    expect(component.isTitleMissing).toBe(true);
    expect(component.isIndicatorIdMissing).toBe(true);
  });

  it('isDisabled should depend on sharedFormValid and body fields', () => {
    component.sharedFormValid = false;
    component.body.set({ indicator_id: 1, title: 't', contract_id: 2, year: 2024 });
    expect(component.isDisabled).toBe(true);

    component.sharedFormValid = true;
    component.body.set({ indicator_id: 1, title: 't', contract_id: 2, year: 2024 });
    expect(component.isDisabled).toBe(false);
  });

  it('onContractIdChange should update contractId and body', () => {
    component.onContractIdChange(123);
    expect(component.contractId).toBe(123);
    expect(component.body().contract_id).toBe(123);
  });

  it('navigateToOicr should set management values and step 2', () => {
    const management = (component as any).createResultManagementService;
    management.setContractId = jest.fn();
    management.setResultTitle = jest.fn();
    management.setYear = jest.fn();
    management.setModalTitle = jest.fn();
    management.resultPageStep = signal(0);

    component.body.update(b => ({ ...b, title: 'Title', contract_id: 77, year: 2024 }));
    component.navigateToOicr();

    expect(management.setContractId).toHaveBeenCalledWith(77);
    expect(management.setResultTitle).toHaveBeenCalledWith('Title');
    expect(management.setYear).toHaveBeenCalledWith(2024);
    expect(management.setModalTitle).toHaveBeenCalledWith('OICR result');
    expect(management.resultPageStep()).toBe(2);
  });

  it('createResult should call successRequest on successful response', async () => {
    const spy = jest.spyOn(component, 'successRequest');
    apiServiceMock.POST_Result.mockResolvedValue({ successfulRequest: true, data: { result_official_code: '555' } });
    await component.createResult(true);
    expect(spy).toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('createResult should call handleBadRequest on failure', async () => {
    apiServiceMock.POST_Result.mockResolvedValue({ successfulRequest: false });
    await component.createResult(true);
    expect(actionsServiceMock.handleBadRequest).toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('successRequest should reset state and optionally navigate/close modal', async () => {
    const currentYear = new Date().getFullYear();
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true as any);
    const result = { data: { result_official_code: '999' } } as any;

    // with openresult = false
    component.body.update(b => ({ ...b, title: 'Some Title' }));
    component.successRequest(result, false);
    expect(actionsServiceMock.showToast).toHaveBeenCalled();
    expect(component.body().year).toBe(currentYear);
    expect(component.sharedFormValid).toBe(false);
    expect(resultsServiceMock.updateList).toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();

    // with openresult = true
    component.body.update(b => ({ ...b, title: 'Another Title' }));
    component.successRequest(result, true);
    expect(cacheServiceMock.currentResultId()).toBe(999);
    expect(navigateSpy).toHaveBeenCalledWith(['result', 'STAR-999'], { replaceUrl: true });
    expect(allModalsServiceMock.closeModal).toHaveBeenCalledWith('createResult');
  });

  it('getWordCount and getWordCounterColor should work as expected', () => {
    component.body.update(b => ({ ...b, title: '' }));
    expect(component.getWordCount()).toBe(0);
    expect(component.getWordCounterColor()).toBe('#8d9299');

    const words = Array(31).fill('w').join(' ');
    component.body.update(b => ({ ...b, title: words }));
    expect(component.getWordCount()).toBe(31);
    expect(component.getWordCounterColor()).toBe('#CF0808');

    component.body.update(b => ({ ...b, title: 'one two' }));
    expect(component.getWordCounterColor()).toBe('#358540');
  });

  it('truncateTitle should handle limits and empty strings', () => {
    expect(component.truncateTitle('')).toBe('');
    const text = Array(10).fill('word').join(' ');
    expect(component.truncateTitle(text)).toBe(text);
    const longText = Array(40).fill('word').join(' ');
    expect(component.truncateTitle(longText, 30)).toBe(Array(30).fill('word').join(' ') + '...');
  });
});
