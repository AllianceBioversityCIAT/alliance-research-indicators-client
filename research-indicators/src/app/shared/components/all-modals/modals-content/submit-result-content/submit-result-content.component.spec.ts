import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmitResultContentComponent } from './submit-result-content.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AllModalsService } from '@services/cache/all-modals.service';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';
import { signal } from '@angular/core';
import { ReviewOption } from '@shared/interfaces/review-option.interface';

describe('SubmitResultContentComponent', () => {
  let component: SubmitResultContentComponent;
  let fixture: ComponentFixture<SubmitResultContentComponent>;
  let allModalsService: Partial<AllModalsService>;
  let getMetadataService: Partial<GetMetadataService>;
  let apiService: Partial<ApiService>;
  let cacheService: Partial<CacheService>;
  let submissionService: Partial<SubmissionService>;

  beforeEach(async () => {
    allModalsService = {
      setSubmitReview: jest.fn(),
      setDisabledSubmitReview: jest.fn(),
      modalConfig: signal({
        createResult: {
          isOpen: false,
          title: 'Create a result'
        },
        submitResult: {
          isOpen: false,
          title: 'Review Result',
          cancelText: 'Cancel',
          confirmText: 'Confirm'
        },
        requestPartner: {
          isOpen: false,
          title: 'Request Partner'
        }
      }),
      closeModal: jest.fn()
    };

    getMetadataService = {
      update: jest.fn()
    };

    apiService = {
      PATCH_SubmitResult: jest.fn().mockResolvedValue({ successfulRequest: true })
    };

    cacheService = {
      windowHeight: signal(0),
      dataCache: signal({
        access_token: 'dummy_token',
        refresh_token: 'dummy_refresh_token',
        user: {
          sec_user_id: 1,
          is_active: true,
          first_name: 'John',
          last_name: 'Doe',
          roleName: 'Admin',
          email: 'john.doe@example.com',
          status_id: 1,
          user_role_list: [
            {
              is_active: true,
              user_id: 1,
              role_id: 1,
              role: {
                is_active: true,
                justification_update: null,
                sec_role_id: 1,
                name: 'Admin',
                focus_id: 0
              }
            }
          ]
        },
        exp: 3600
      }),
      isLoggedIn: signal<boolean>(false),
      currentMetadata: signal({
        status_id: 5
      }),
      currentResultId: signal(123)
    };

    submissionService = {
      statusSelected: signal<ReviewOption>({
        key: 'submitted',
        label: 'Submitted',
        description: 'The result has been submitted',
        icon: 'pi pi-check',
        color: 'success',
        message: 'The result was submitted successfully.',
        statusId: 1,
        selected: true
      }),
      comment: signal('')
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SubmitResultContentComponent],
      providers: [
        { provide: AllModalsService, useValue: allModalsService },
        { provide: GetMetadataService, useValue: getMetadataService },
        { provide: ApiService, useValue: apiService },
        { provide: CacheService, useValue: cacheService },
        { provide: SubmissionService, useValue: submissionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitResultContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
