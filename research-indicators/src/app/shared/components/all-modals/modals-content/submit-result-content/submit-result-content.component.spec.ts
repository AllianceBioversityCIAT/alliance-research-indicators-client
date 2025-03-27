import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmitResultContentComponent } from './submit-result-content.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AllModalsService } from '@services/cache/all-modals.service';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';
import { signal } from '@angular/core';

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
      currentMetadata: signal({
        status_id: 5
      }),
      currentResultId: signal(123)
    };

    submissionService = {
      statusSelected: signal(null),
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
