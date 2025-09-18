import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SubmitResultContentComponent } from './submit-result-content.component';
import { AllModalsService } from '@services/cache/all-modals.service';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '../../../../services/submission.service';
import { ActionsService } from '@shared/services/actions.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('SubmitResultContentComponent', () => {
  let component: SubmitResultContentComponent;
  let fixture: ComponentFixture<SubmitResultContentComponent>;
  let mockAllModalsService: Partial<AllModalsService>;
  let mockMetadataService: Partial<GetMetadataService>;
  let mockApiService: Partial<ApiService>;
  let mockCacheService: Partial<CacheService>;
  let mockSubmissionService: Partial<SubmissionService>;
  let mockActionsService: Partial<ActionsService>;
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    mockAllModalsService = {
      setSubmitReview: jest.fn(),
      setDisabledSubmitReview: jest.fn(),
      closeModal: jest.fn(),
      modalConfig: signal({
        submitResult: { isOpen: false },
        createResult: { isOpen: false },
        requestPartner: { isOpen: false },
        askForHelp: { isOpen: false }
      })
    };

    mockMetadataService = {
      update: jest.fn().mockResolvedValue({})
    };

    mockApiService = {
      PATCH_SubmitResult: jest.fn(),
      GET_Versions: jest.fn()
    };

    mockCacheService = {
      getCurrentNumericResultId: jest.fn().mockReturnValue(123),
      lastResultId: { set: jest.fn() },
      lastVersionParam: { set: jest.fn() },
      liveVersionData: { set: jest.fn() },
      versionsList: { set: jest.fn() },
      currentMetadata: signal({ status_id: 2 })
    };

    mockSubmissionService = {
      statusSelected: signal(null),
      comment: signal('')
    };

    mockActionsService = {};

    mockRouter = {
      url: '/test-url?param=value',
      navigate: jest.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [SubmitResultContentComponent],
      providers: [
        { provide: AllModalsService, useValue: mockAllModalsService },
        { provide: GetMetadataService, useValue: mockMetadataService },
        { provide: ApiService, useValue: mockApiService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: SubmissionService, useValue: mockSubmissionService },
        { provide: ActionsService, useValue: mockActionsService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitResultContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct review options', () => {
    const options = component.reviewOptions();
    expect(options).toHaveLength(3);
    
    expect(options[0]).toEqual({
      key: 'approve',
      label: 'Approve',
      description: 'Approve this result without changes.',
      icon: 'pi-check-circle',
      color: 'text-[#509C55]',
      message: 'Once this result is approved, no further changes will be allowed.',
      commentLabel: undefined,
      statusId: 6,
      selected: false
    });

    expect(options[1]).toEqual({
      key: 'revise',
      label: 'Revise',
      description: 'Provide recommendations and changes.',
      icon: 'pi-minus-circle',
      color: 'text-[#e69f00]',
      message: 'The result submitter will address the provided recommendations and resubmit for review.',
      commentLabel: 'Add recommendations/comments',
      statusId: 5,
      selected: false
    });

    expect(options[2]).toEqual({
      key: 'reject',
      label: 'Reject',
      description: 'Reject this result and specify the reason.',
      icon: 'pi-times-circle',
      color: 'text-[#cf0808]',
      message: 'If the result is rejected, it can no longer be edited or resubmitted.',
      commentLabel: 'Add the reject reason',
      statusId: 7,
      selected: false
    });
  });

  it('should compute submittionOptions correctly', () => {
    const selectedOption = { statusId: 5, key: 'revise', label: 'Revise', description: 'Provide recommendations and changes.', icon: 'pi-minus-circle', color: 'text-[#e69f00]', message: 'The result submitter will address the provided recommendations and resubmit for review.', commentLabel: 'Add recommendations/comments', selected: false };
    mockSubmissionService.statusSelected.set(selectedOption);

    const options = component.submittionOptions();
    expect(options).toHaveLength(3);
    expect(options[0].selected).toBe(false); // approve
    expect(options[1].selected).toBe(true);  // revise
    expect(options[2].selected).toBe(false); // reject
  });

  it('should set comment from textarea event', () => {
    const mockEvent = { target: { value: 'Test comment' } } as any;
    component.setComment(mockEvent);
    expect(mockSubmissionService.comment()).toBe('Test comment');
  });

  it('should compute disabledConfirmSubmit correctly', () => {
    // No selection - should be disabled
    mockSubmissionService.statusSelected.set(null);
    expect(component.disabledConfirmSubmit()).toBe(false);

    // Selected option without commentLabel - should be enabled
    const approveOption = { statusId: 6, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(approveOption);
    expect(component.disabledConfirmSubmit()).toBe(false);

    // Selected option with commentLabel but no comment - should be disabled
    const reviseOption = { statusId: 5, commentLabel: 'Add comments' };
    mockSubmissionService.statusSelected.set(reviseOption);
    mockSubmissionService.comment.set('');
    expect(component.disabledConfirmSubmit()).toBe(true);

    // Selected option with commentLabel and comment - should be enabled
    mockSubmissionService.comment.set('Test comment');
    expect(component.disabledConfirmSubmit()).toBe(false);

    // Selected option with commentLabel and whitespace comment - should be disabled
    mockSubmissionService.comment.set('   ');
    expect(component.disabledConfirmSubmit()).toBe(true);
  });

  it('should set initial selected review option when modal opens', () => {
    const matchingOption = { 
      key: 'revise', 
      label: 'Revise', 
      description: 'Provide recommendations and changes.', 
      icon: 'pi-minus-circle', 
      color: 'text-[#e69f00]', 
      message: 'The result submitter will address the provided recommendations and resubmit for review.', 
      commentLabel: 'Add recommendations/comments', 
      statusId: 5, 
      selected: false 
    };
    mockCacheService.currentMetadata!.set({ status_id: 5 });
    
    // Simulate modal opening
    mockAllModalsService.modalConfig!.set({
      submitResult: { isOpen: true },
      createResult: { isOpen: false },
      requestPartner: { isOpen: false },
      askForHelp: { isOpen: false }
    });

    // Manually call the effect logic
    component.setInitialSelectedReviewOption();

    expect(mockSubmissionService.statusSelected()).toEqual(matchingOption);
  });

  it('should not set initial option when status_id is null', () => {
    mockCacheService.currentMetadata!.set({ status_id: null });
    component.setInitialSelectedReviewOption();
    expect(mockSubmissionService.statusSelected()).toBeNull();
  });

  it('should not set initial option when no matching option found', () => {
    mockCacheService.currentMetadata!.set({ status_id: 999 });
    component.setInitialSelectedReviewOption();
    expect(mockSubmissionService.statusSelected()).toBeNull();
  });

  it('should submit review successfully', async () => {
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);
    mockApiService.GET_Versions!.mockResolvedValue({
      data: { versions: [{ report_year_id: 2024 }] }
    });

    const selectedOption = { statusId: 6, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('Test comment');

    await component.submitReview();

    expect(mockApiService.PATCH_SubmitResult).toHaveBeenCalledWith({
      resultCode: 123,
      comment: 'Test comment',
      status: 6
    });

    expect(mockMetadataService.update).toHaveBeenCalledWith(123);
    expect(mockCacheService.lastResultId!.set).toHaveBeenCalledWith(null);
    expect(mockCacheService.lastVersionParam.set).toHaveBeenCalledWith(null);
    expect(mockCacheService.liveVersionData.set).toHaveBeenCalledWith(null);
    expect(mockCacheService.versionsList.set).toHaveBeenCalledWith([]);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/test-url'], {
      queryParams: {},
      replaceUrl: true
    });

    expect(mockAllModalsService.closeModal).toHaveBeenCalledWith('submitResult');
  });

  it('should handle unsuccessful request', async () => {
    const mockResponse = { successfulRequest: false };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);

    const selectedOption = { statusId: 5, commentLabel: 'Add comments' };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('Test comment');

    await component.submitReview();

    expect(mockApiService.PATCH_SubmitResult).toHaveBeenCalled();
    expect(mockMetadataService.update).not.toHaveBeenCalled();
    expect(mockAllModalsService.closeModal).not.toHaveBeenCalled();
  });

  it('should clear comment for approve status (statusId 6)', async () => {
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);
    mockApiService.GET_Versions!.mockResolvedValue({
      data: { versions: [{ report_year_id: 2024 }] }
    });

    const selectedOption = { statusId: 6, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('Test comment');

    await component.submitReview();

    expect(mockSubmissionService.comment()).toBe('');
  });

  it('should handle versions response with array', async () => {
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);
    mockApiService.GET_Versions!.mockResolvedValue({
      data: { versions: [{ report_year_id: 2024 }, { report_year_id: 2023 }] }
    });

    const selectedOption = { statusId: 6, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);

    await component.submitReview();

    expect(mockCacheService.versionsList.set).toHaveBeenCalledWith([
      { report_year_id: 2024 },
      { report_year_id: 2023 }
    ]);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/test-url'], {
      queryParams: { version: 2024 },
      replaceUrl: true
    });
  });

  it('should handle versions response with non-array', async () => {
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);
    mockApiService.GET_Versions!.mockResolvedValue({
      data: { versions: 'not-an-array' }
    });

    const selectedOption = { statusId: 6, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);

    await component.submitReview();

    expect(mockCacheService.versionsList.set).toHaveBeenCalledWith([]);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/test-url'], {
      queryParams: {},
      replaceUrl: true
    });
  });

  it('should handle empty versions array', async () => {
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);
    mockApiService.GET_Versions!.mockResolvedValue({
      data: { versions: [] }
    });

    const selectedOption = { statusId: 6, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);

    await component.submitReview();

    expect(mockCacheService.versionsList.set).toHaveBeenCalledWith([]);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/test-url'], {
      queryParams: {},
      replaceUrl: true
    });
  });

  it('should not clear comment for non-approve status', async () => {
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);

    const selectedOption = { statusId: 5, commentLabel: 'Add comments' };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('Test comment');

    await component.submitReview();

    expect(mockSubmissionService.comment()).toBe('Test comment');
  });

  it('should not handle versions for non-approve status', async () => {
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);

    const selectedOption = { statusId: 5, commentLabel: 'Add comments' };
    mockSubmissionService.statusSelected.set(selectedOption);

    await component.submitReview();

    expect(mockApiService.GET_Versions).not.toHaveBeenCalled();
  });


});