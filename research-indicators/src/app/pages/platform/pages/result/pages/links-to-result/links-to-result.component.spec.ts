import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import LinksToResultComponent from './links-to-result.component';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { ApiService } from '@shared/services/api.service';
import { ActionsService } from '@shared/services/actions.service';

describe('LinksToResultComponent', () => {
  let component: LinksToResultComponent;
  let fixture: ComponentFixture<LinksToResultComponent>;
  let router: jest.Mocked<Router>;
  let cache: jest.Mocked<CacheService>;
  let apiService: jest.Mocked<ApiService>;
  let allModalsService: jest.Mocked<AllModalsService>;

  beforeEach(async () => {
    router = {
      navigate: jest.fn().mockResolvedValue(true)
    } as unknown as jest.Mocked<Router>;

    cache = {
      currentResultId: signal('123'),
      getCurrentNumericResultId: jest.fn().mockReturnValue(123),
      showSectionHeaderActions: signal(false),
      currentMetadata: jest.fn().mockReturnValue({ result_title: 'Mock Result' }),
      isSidebarCollapsed: jest.fn().mockReturnValue(false),
      headerHeight: signal(0),
      navbarHeight: signal(0)
    } as unknown as jest.Mocked<CacheService>;

    apiService = {
      GET_LinkedResults: jest.fn().mockResolvedValue({ data: { link_results: [] } }),
      GET_Results: jest.fn().mockResolvedValue({ data: [] }),
      PATCH_LinkedResults: jest.fn().mockResolvedValue({ data: { link_results: [] } })
    } as unknown as jest.Mocked<ApiService>;

    allModalsService = {
      modalConfig: signal({
        createResult: { isOpen: false, title: 'Create a result' },
        submitResult: { isOpen: false, title: 'Submit Result' },
        requestPartner: { isOpen: false, title: 'Request Partner' },
        createOicrResult: { isOpen: false, title: 'Create OICR Result' },
        askForHelp: { isOpen: false, title: 'Ask For Help' },
        resultInformation: { isOpen: false, title: 'Result Information' },
        addContactPerson: { isOpen: false, title: 'Add Contact Person' },
        selectLinkedResults: {
          isOpen: false,
          title: 'Existing Results',
          isWide: true
        }
      }),
      openModal: jest.fn()
    } as unknown as jest.Mocked<AllModalsService>;

    await TestBed.configureTestingModule({
      imports: [LinksToResultComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: CacheService, useValue: cache },
        { provide: HttpClient, useValue: { get: jest.fn(), post: jest.fn(), patch: jest.fn() } },
        { provide: ApiService, useValue: apiService },
        { provide: AllModalsService, useValue: allModalsService },
        {
          provide: ActionsService,
          useValue: {
            showToast: jest.fn()
          }
        },
        {
          provide: SubmissionService,
          useValue: {
            isEditableStatus: jest.fn().mockReturnValue(true)
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: jest.fn().mockReturnValue('1.0')
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LinksToResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back to geographic scope', async () => {
    router.navigate.mockClear();
    await component.navigate('back');
    expect(router.navigate).toHaveBeenCalledWith(['result', '123', 'geographic-scope'], { queryParams: { version: '1.0' }, replaceUrl: true });
  });

  it('should navigate next to evidence', async () => {
    router.navigate.mockClear();
    await component.navigate('next');
    expect(apiService.PATCH_LinkedResults).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['result', '123', 'evidence'], { queryParams: { version: '1.0' }, replaceUrl: true });
  });
});

