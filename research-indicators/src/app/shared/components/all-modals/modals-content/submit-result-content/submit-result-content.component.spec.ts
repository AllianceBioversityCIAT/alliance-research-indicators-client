import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { SubmitResultContentComponent } from './submit-result-content.component';
import { AllModalsService } from '@services/cache/all-modals.service';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '../../../../services/submission.service';
import { signal } from '@angular/core';

describe('SubmitResultContentComponent', () => {
  let component: SubmitResultContentComponent;
  let fixture: ComponentFixture<SubmitResultContentComponent>;

  const mockHttpClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn()
  };

  const mockAllModalsService = {
    setSubmitReview: jest.fn(),
    modalConfig: jest.fn().mockReturnValue({
      submitResult: { isOpen: false }
    }),
    closeModal: jest.fn()
  };

  const mockGetMetadataService = {
    update: jest.fn()
  };

  const mockApiService = {
    PATCH_SubmitResult: jest.fn()
  };

  const mockCacheService = {
    currentMetadata: jest.fn(),
    currentResultId: jest.fn()
  };

  const mockSubmissionService = {
    statusSelected: signal(null),
    comment: signal('')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitResultContentComponent],
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: AllModalsService, useValue: mockAllModalsService },
        { provide: GetMetadataService, useValue: mockGetMetadataService },
        { provide: ApiService, useValue: mockApiService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: SubmissionService, useValue: mockSubmissionService }
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
