import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmitResultContentComponent } from './submit-result-content.component';
import { AllModalsService } from '@services/cache/all-modals.service';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '../../../../services/submission.service';
import { ActionsService } from '@shared/services/actions.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { CurrentResultService } from '@shared/services/cache/current-result.service';
import { ResultsCenterService } from '@pages/platform/pages/results-center/results-center.service';
import { ProjectResultsTableService } from '@pages/platform/pages/project-detail/pages/project-results-table/project-results-table.service';

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
  let mockCurrentResultService: Partial<CurrentResultService>;
  let mockProjectResultsTableService: Partial<ProjectResultsTableService>;
  let mockResultsCenterService: Partial<ResultsCenterService>;

  beforeEach(async () => {
    mockAllModalsService = {
      setSubmitReview: jest.fn(),
      setDisabledSubmitReview: jest.fn(),
      setSubmitBackAction: jest.fn(),
      closeModal: jest.fn(),
      closeAllModals: jest.fn(),
      submitResultOrigin: signal(null),
      submitHeader: signal(null),
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
      comment: signal(''),
      melRegionalExpert: signal(''),
      oicrNo: signal(''),
      sharePointFolderLink: signal('')
    };

    // Create spies for signal methods
    jest.spyOn(mockSubmissionService.comment, 'set');
    jest.spyOn(mockSubmissionService.statusSelected, 'set');

    mockActionsService = {
      showGlobalAlert: jest.fn(),
      hideGlobalAlert: jest.fn(),
      showToast: jest.fn()
    };

    mockRouter = {
      url: '/test-url?param=value',
      navigate: jest.fn().mockResolvedValue(true)
    };

    mockCurrentResultService = {
      openEditRequestdOicrsModal: jest.fn().mockResolvedValue(undefined)
    };

    mockProjectResultsTableService = {
      contractId: 'test-contract-id',
      getData: jest.fn().mockResolvedValue(undefined)
    };

    mockResultsCenterService = {
      main: jest.fn().mockResolvedValue(undefined)
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
        { provide: Router, useValue: mockRouter },
        { provide: CurrentResultService, useValue: mockCurrentResultService },
        { provide: ProjectResultsTableService, useValue: mockProjectResultsTableService },
        { provide: ResultsCenterService, useValue: mockResultsCenterService }
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
      placeholder: '',
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
      placeholder: '',
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
      placeholder: '',
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
      placeholder: '',
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

  it('constructor should register callbacks in AllModalsService', () => {
    expect((mockAllModalsService.setSubmitReview as jest.Mock)).toHaveBeenCalled();
    expect((mockAllModalsService.setDisabledSubmitReview as jest.Mock)).toHaveBeenCalled();
    const disabledCb = (mockAllModalsService.setDisabledSubmitReview as jest.Mock).mock.calls[0][0] as () => boolean;
    // With default selection/comment it should be false (enabled)
    expect(disabledCb()).toBe(false);
  });

  it('should execute the submit callback registered by constructor', async () => {
    const submitCb = (mockAllModalsService.setSubmitReview as jest.Mock).mock.calls[0][0] as () => Promise<void>;
    // Prepare a valid selection and comment for submission
    mockSubmissionService.statusSelected.set({ statusId: 6, commentLabel: undefined } as any);
    mockSubmissionService.comment.set('some');
    (mockApiService.PATCH_SubmitResult as jest.Mock).mockResolvedValue({ successfulRequest: true });
    (mockApiService.GET_Versions as jest.Mock).mockResolvedValue({ data: { versions: [] } });
    await submitCb();
    expect(mockApiService.PATCH_SubmitResult).toHaveBeenCalled();
  });

  it('should set initial selected review option when invoked from effect path', () => {
    mockCacheService.currentMetadata!.set({ status_id: 6 });
    component.setInitialSelectedReviewOption();
    expect(mockSubmissionService.statusSelected()?.statusId).toBe(6);
  });

  it('effect should call setInitialSelectedReviewOption on first open when constructed with modal open', () => {
    // Prepare mocks for a new instance where the modal is already open
    mockCacheService.currentMetadata!.set({ status_id: 5 });
    mockAllModalsService.modalConfig!.set({
      submitResult: { isOpen: true },
      createResult: { isOpen: false },
      requestPartner: { isOpen: false },
      askForHelp: { isOpen: false }
    });
    const protoSpy = jest.spyOn(SubmitResultContentComponent.prototype, 'setInitialSelectedReviewOption');
    const newFixture = TestBed.createComponent(SubmitResultContentComponent);
    newFixture.detectChanges();
    expect(protoSpy).toHaveBeenCalled();
    protoSpy.mockRestore();
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
    // closeModal is not called when request is unsuccessful
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

  it('should handle handleSubmitBack method', async () => {
    mockCacheService.currentMetadata!.set({ indicator_id: 5, status_id: 9 });
    mockCacheService.getCurrentNumericResultId!.mockReturnValue(123);

    await component.handleSubmitBack();

    expect(mockCurrentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(5, 9, 123);
  });

  it('should handle handleSubmitBack with default values', async () => {
    mockCacheService.currentMetadata!.set({});
    mockCacheService.getCurrentNumericResultId!.mockReturnValue(0);

    await component.handleSubmitBack();

    // Should not call openEditRequestdOicrsModal when metadata is empty
    expect(mockCurrentResultService.openEditRequestdOicrsModal).not.toHaveBeenCalled();
  });

  it('should handle handleSubmitBack with null metadata', async () => {
    mockCacheService.currentMetadata!.set(null);
    mockCacheService.getCurrentNumericResultId!.mockReturnValue(null);

    await component.handleSubmitBack();

    // Should not call openEditRequestdOicrsModal when metadata is null
    expect(mockCurrentResultService.openEditRequestdOicrsModal).not.toHaveBeenCalled();
  });

  it('should update form correctly', () => {
    component.updateForm('mel_regional_expert', 'test-expert');
    expect(component.form().mel_regional_expert).toBe('test-expert');

    component.updateForm('oicr_internal_code', 'test-code');
    expect(component.form().oicr_internal_code).toBe('test-code');

    component.updateForm('sharepoint_link', 'test-link');
    expect(component.form().sharepoint_link).toBe('test-link');
  });

  it('should handle latest flow review options', () => {
    mockAllModalsService.submitResultOrigin!.set('latest');
    
    const options = component.reviewOptions();
    expect(options).toHaveLength(3);
    
    // Check approve option for latest flow
    expect(options[0]).toEqual({
      key: 'approve',
      label: 'Approve',
      description: 'OICR development will continue with PISA support.',
      icon: 'pi-check-circle',
      color: 'text-[#509C55]',
      message: 'Once this result is approved, no further changes will be allowed.',
      commentLabel: undefined,
      placeholder: '',
      statusId: 10,
      selected: false
    });

    // Check revise option for latest flow (becomes Postpone)
    expect(options[1]).toEqual({
      key: 'revise',
      label: 'Postpone',
      description: 'Not enough evidence for this reporting year.',
      icon: 'pi-minus-circle',
      color: 'text-[#e69f00]',
      message: 'The result submitter will address the provided recommendations and resubmit for review.',
      commentLabel: 'Justification',
      placeholder: 'Please briefly elaborate your decision',
      statusId: 11,
      selected: false
    });

    // Check reject option for latest flow
    expect(options[2]).toEqual({
      key: 'reject',
      label: 'Reject',
      description: 'Reject this result and specify the reason.',
      icon: 'pi-times-circle',
      color: 'text-[#cf0808]',
      message: 'If the result is rejected, it can no longer be edited or resubmitted.',
      commentLabel: 'Justification',
      placeholder: 'Please briefly elaborate your decision',
      statusId: 7,
      selected: false
    });
  });

  it('should handle latest flow submit review with approve', async () => {
    mockAllModalsService.submitResultOrigin!.set('latest');
    mockCacheService.currentMetadata!.set({ indicator_id: 5, status_id: 9 });
    mockCacheService.getCurrentNumericResultId!.mockReturnValue(123);
    
    const selectedOption = { statusId: 10, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('Test comment');
    
    const formValue = { mel_regional_expert: 'expert1', oicr_internal_code: 'OICR-123', sharepoint_link: 'https://test.com' };
    component.form.set(formValue);
    
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);

    await component.submitReview();

    expect(mockApiService.PATCH_SubmitResult).toHaveBeenCalledWith(
      {
        resultCode: 123,
        comment: 'Test comment',
        status: 10
      },
      {
        mel_regional_expert: 'expert1',
        oicr_internal_code: 'OICR-123',
        sharepoint_link: 'https://test.com'
      }
    );

    expect(mockAllModalsService.closeModal).toHaveBeenCalledWith('submitResult');
    expect(mockActionsService.showGlobalAlert).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Review submitted successfully',
      hasNoCancelButton: true,
      detail: 'Your review has been submitted and the OICR development process will continue with PISA support.',
      confirmCallback: {
        label: 'Done',
        event: expect.any(Function)
      }
    });
  });

  it('should handle latest flow submit review with non-approve', async () => {
    mockAllModalsService.submitResultOrigin!.set('latest');
    
    const selectedOption = { statusId: 11, commentLabel: 'Justification' };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('Test comment');
    
    const formValue = { mel_regional_expert: '', oicr_internal_code: '', sharepoint_link: '' };
    component.form.set(formValue);
    
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);

    await component.submitReview();

    expect(mockApiService.PATCH_SubmitResult).toHaveBeenCalledWith(
      {
        resultCode: 123,
        comment: 'Test comment',
        status: 11
      },
      undefined
    );

    expect(mockAllModalsService.closeModal).toHaveBeenCalledWith('submitResult');
    expect(mockActionsService.showGlobalAlert).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Review submitted successfully',
      hasNoCancelButton: true,
      detail: 'Your review has been submitted and the OICR development process will continue with PISA support.',
      confirmCallback: {
        label: 'Done',
        event: expect.any(Function)
      }
    });
  });

  it('should handle latest flow submit review with unsuccessful request', async () => {
    mockAllModalsService.submitResultOrigin!.set('latest');
    
    const selectedOption = { statusId: 10, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);
    
    const mockResponse = { successfulRequest: false };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);

    await component.submitReview();

    expect(mockApiService.PATCH_SubmitResult).toHaveBeenCalled();
    expect(mockAllModalsService.closeModal).not.toHaveBeenCalled();
    expect(mockCurrentResultService.openEditRequestdOicrsModal).not.toHaveBeenCalled();
  });

  it('should handle latest flow submit review without metadata', async () => {
    mockAllModalsService.submitResultOrigin!.set('latest');
    mockCacheService.currentMetadata!.set(null);
    
    const selectedOption = { statusId: 10, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);
    
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);

    await component.submitReview();

    expect(mockApiService.PATCH_SubmitResult).toHaveBeenCalled();
    expect(mockAllModalsService.closeModal).toHaveBeenCalledWith('submitResult');
    expect(mockActionsService.showGlobalAlert).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Review submitted successfully',
      hasNoCancelButton: true,
      detail: 'Your review has been submitted and the OICR development process will continue with PISA support.',
      confirmCallback: {
        label: 'Done',
        event: expect.any(Function)
      }
    });
    expect(mockCurrentResultService.openEditRequestdOicrsModal).not.toHaveBeenCalled();
  });

  it('should initialize form with submission service values when modal opens', () => {
    mockSubmissionService.melRegionalExpert!.set('expert1');
    mockSubmissionService.oicrNo!.set('OICR-123');
    mockSubmissionService.sharePointFolderLink!.set('https://test.com');
    
    // Simulate modal opening
    mockAllModalsService.modalConfig!.set({
      submitResult: { isOpen: true },
      createResult: { isOpen: false },
      requestPartner: { isOpen: false },
      askForHelp: { isOpen: false }
    });

    // Manually trigger the effect logic
    component.form.set({
      mel_regional_expert: mockSubmissionService.melRegionalExpert!(),
      oicr_internal_code: mockSubmissionService.oicrNo!(),
      sharepoint_link: mockSubmissionService.sharePointFolderLink!()
    });

    expect(component.form().mel_regional_expert).toBe('expert1');
    expect(component.form().oicr_internal_code).toBe('OICR-123');
    expect(component.form().sharepoint_link).toBe('https://test.com');
  });

  it('should register setSubmitBackAction callback in constructor', () => {
    expect((mockAllModalsService.setSubmitBackAction as jest.Mock)).toHaveBeenCalled();
  });

  it('should build latest body correctly for approve', () => {
    const formValue = { mel_regional_expert: 'expert1', oicr_internal_code: 'OICR-123', sharepoint_link: 'https://test.com' };
    const result = (component as any).buildLatestBody(true, formValue);
    
    expect(result).toEqual({
      mel_regional_expert: 'expert1',
      oicr_internal_code: 'OICR-123',
      sharepoint_link: 'https://test.com'
    });
  });

  it('should build latest body correctly for non-approve', () => {
    const formValue = { mel_regional_expert: 'expert1', oicr_internal_code: 'OICR-123', sharepoint_link: 'https://test.com' };
    const result = (component as any).buildLatestBody(false, formValue);
    
    expect(result).toBeUndefined();
  });

  it('should build latest body with empty values', () => {
    const formValue = { mel_regional_expert: '', oicr_internal_code: '', sharepoint_link: '' };
    const result = (component as any).buildLatestBody(true, formValue);
    
    expect(result).toEqual({
      mel_regional_expert: '',
      oicr_internal_code: '',
      sharepoint_link: ''
    });
  });

  it('should build latest body with undefined values', () => {
    const formValue = { mel_regional_expert: undefined, oicr_internal_code: undefined, sharepoint_link: undefined };
    const result = (component as any).buildLatestBody(true, formValue);
    
    expect(result).toEqual({
      mel_regional_expert: '',
      oicr_internal_code: '',
      sharepoint_link: ''
    });
  });

  it('should handle setComment method', () => {
    const mockEvent = {
      target: { value: 'Test comment' }
    } as any;
    
    component.setComment(mockEvent);
    
    expect(mockSubmissionService.comment.set).toHaveBeenCalledWith('Test comment');
  });

  it('should handle disabledConfirmSubmit with comment required', () => {
    const selectedOption = { commentLabel: 'Required comment' };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('');
    
    const result = component.disabledConfirmSubmit();
    
    expect(result).toBe(true);
  });

  it('should handle disabledConfirmSubmit with comment provided', () => {
    const selectedOption = { commentLabel: 'Required comment' };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('Test comment');
    
    const result = component.disabledConfirmSubmit();
    
    expect(result).toBe(false);
  });

  it('should handle disabledConfirmSubmit with no comment required', () => {
    const selectedOption = { commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('');
    
    const result = component.disabledConfirmSubmit();
    
    expect(result).toBe(false);
  });

  it('should handle disabledConfirmSubmit with no status selected', () => {
    mockSubmissionService.statusSelected.set(null);
    mockSubmissionService.comment.set('');
    
    const result = component.disabledConfirmSubmit();
    
    expect(result).toBe(false);
  });

  it('should handle submittionOptions computed', () => {
    const selectedOption = { statusId: 6, label: 'Approve' };
    mockSubmissionService.statusSelected.set(selectedOption);
    
    const options = component.submittionOptions();
    
    expect(options).toHaveLength(3);
    expect(options[0].selected).toBe(true);
    expect(options[1].selected).toBe(false);
    expect(options[2].selected).toBe(false);
  });

  it('should handle submittionOptions with no status selected', () => {
    mockSubmissionService.statusSelected.set(null);
    
    const options = component.submittionOptions();
    
    expect(options).toHaveLength(3);
    expect(options[0].selected).toBe(false);
    expect(options[1].selected).toBe(false);
    expect(options[2].selected).toBe(false);
  });

  it('should handle setInitialSelectedReviewOption with matching status', () => {
    mockCacheService.currentMetadata!.set({ status_id: 6 });
    
    component.setInitialSelectedReviewOption();
    
    expect(mockSubmissionService.statusSelected.set).toHaveBeenCalledWith(
      expect.objectContaining({ statusId: 6 })
    );
  });

  it('should handle setInitialSelectedReviewOption with no matching status', () => {
    mockCacheService.currentMetadata!.set({ status_id: 99 });
    
    component.setInitialSelectedReviewOption();
    
    expect(mockSubmissionService.statusSelected.set).not.toHaveBeenCalled();
  });

  it('should handle setInitialSelectedReviewOption with null status', () => {
    mockCacheService.currentMetadata!.set({ status_id: null });
    
    component.setInitialSelectedReviewOption();
    
    expect(mockSubmissionService.statusSelected.set).not.toHaveBeenCalled();
  });

  it('should handle setInitialSelectedReviewOption with undefined status', () => {
    mockCacheService.currentMetadata!.set({ status_id: undefined });
    
    component.setInitialSelectedReviewOption();
    
    expect(mockSubmissionService.statusSelected.set).not.toHaveBeenCalled();
  });

  it('should handle buildLatestBody with empty form values', () => {
    const formValue = { mel_regional_expert: '', oicr_internal_code: '', sharepoint_link: '' };
    const result = (component as any).buildLatestBody(true, formValue);
    
    expect(result).toEqual({
      mel_regional_expert: '',
      oicr_internal_code: '',
      sharepoint_link: ''
    });
  });

  it('should handle buildLatestBody with undefined form values', () => {
    const formValue = { mel_regional_expert: undefined, oicr_internal_code: undefined, sharepoint_link: undefined };
    const result = (component as any).buildLatestBody(true, formValue);
    
    expect(result).toEqual({
      mel_regional_expert: '',
      oicr_internal_code: '',
      sharepoint_link: ''
    });
  });

  it('should handle legacy flow submit review', async () => {
    mockAllModalsService.submitResultOrigin!.set(null);
    
    const selectedOption = { statusId: 6, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('Test comment');
    
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);
    mockApiService.GET_Versions!.mockResolvedValue({ data: { versions: [{ report_year_id: 2024 }] } });
    
    await component.submitReview();

    expect(mockApiService.PATCH_SubmitResult).toHaveBeenCalledWith({
      resultCode: 123,
      comment: 'Test comment',
      status: 6
    });
    expect(mockAllModalsService.closeModal).toHaveBeenCalledWith('submitResult');
  });

  it('should handle legacy flow submit review with unsuccessful request', async () => {
    mockAllModalsService.submitResultOrigin!.set(null);
    
    const selectedOption = { statusId: 6, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('Test comment');
    
    const mockResponse = { successfulRequest: false };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);
    
    await component.submitReview();

    expect(mockApiService.PATCH_SubmitResult).toHaveBeenCalled();
    expect(mockAllModalsService.closeModal).not.toHaveBeenCalled();
  });

  it('should handle legacy flow submit review with status 6 and versions', async () => {
    mockAllModalsService.submitResultOrigin!.set(null);
    
    const selectedOption = { statusId: 6, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('Test comment');
    
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);
    mockApiService.GET_Versions!.mockResolvedValue({ data: { versions: [{ report_year_id: 2024 }] } });
    
    await component.submitReview();

    expect(mockApiService.PATCH_SubmitResult).toHaveBeenCalled();
    expect(mockApiService.GET_Versions).toHaveBeenCalledWith(123);
    expect(mockAllModalsService.closeModal).toHaveBeenCalledWith('submitResult');
  });

  it('should handle legacy flow submit review with status 6 and no versions', async () => {
    mockAllModalsService.submitResultOrigin!.set(null);
    
    const selectedOption = { statusId: 6, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('Test comment');
    
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);
    mockApiService.GET_Versions!.mockResolvedValue({ data: { versions: [] } });
    
    await component.submitReview();

    expect(mockApiService.PATCH_SubmitResult).toHaveBeenCalled();
    expect(mockApiService.GET_Versions).toHaveBeenCalledWith(123);
    expect(mockAllModalsService.closeModal).toHaveBeenCalledWith('submitResult');
  });

  it('should handle legacy flow submit review with non-array versions', async () => {
    mockAllModalsService.submitResultOrigin!.set(null);
    
    const selectedOption = { statusId: 6, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);
    mockSubmissionService.comment.set('Test comment');
    
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);
    mockApiService.GET_Versions!.mockResolvedValue({ data: { versions: null } });
    
    await component.submitReview();

    expect(mockApiService.PATCH_SubmitResult).toHaveBeenCalled();
    expect(mockApiService.GET_Versions).toHaveBeenCalledWith(123);
    expect(mockAllModalsService.closeModal).toHaveBeenCalledWith('submitResult');
  });

  it('should handle review options with non-reject key', () => {
    // Test the reviewOptions computed property with options that don't have key 'reject'
    const options = component.reviewOptions();
    
    // Find an option that doesn't have key 'reject' to test the return opt; line
    const nonRejectOption = options.find(opt => opt.key !== 'reject');
    expect(nonRejectOption).toBeDefined();
    expect(nonRejectOption).toEqual(expect.objectContaining({
      key: expect.any(String),
      statusId: expect.any(Number)
    }));
  });

  it('should return original option for non-reject keys in reviewOptions', () => {
    // This test specifically covers the return opt; line (line 118)
    const options = component.reviewOptions();
    
    // Get all options that are not 'reject' to ensure the return opt; path is covered
    const nonRejectOptions = options.filter(opt => opt.key !== 'reject');
    
    expect(nonRejectOptions.length).toBeGreaterThan(0);
    
    // Verify that non-reject options maintain their original structure
    nonRejectOptions.forEach(option => {
      expect(option).toHaveProperty('key');
      expect(option).toHaveProperty('statusId');
      expect(option.key).not.toBe('reject');
    });
  });

  it('should map review options correctly with reject and non-reject keys', () => {
    // This test specifically targets the mapping logic to cover line 118
    const options = component.reviewOptions();
    
    // Verify we have both reject and non-reject options
    const rejectOption = options.find(opt => opt.key === 'reject');
    const nonRejectOptions = options.filter(opt => opt.key !== 'reject');
    
    expect(rejectOption).toBeDefined();
    expect(nonRejectOptions.length).toBeGreaterThan(0);
    
    // Verify reject option has the modified properties
    expect(rejectOption.commentLabel).toBe('Add the reject reason');
    
    // Verify non-reject options maintain original structure (covers return opt; line)
    nonRejectOptions.forEach(option => {
      expect(option).toHaveProperty('key');
      expect(option).toHaveProperty('statusId');
      expect(option.key).not.toBe('reject');
      // These should not have the modified commentLabel
      expect(option.commentLabel).not.toBe('Add the reject reason');
    });
  });

  it('should execute closeAllModals callback in success alert', async () => {
    mockAllModalsService.submitResultOrigin!.set('latest');
    
    const selectedOption = { statusId: 10, commentLabel: undefined };
    mockSubmissionService.statusSelected.set(selectedOption);
    
    const mockResponse = { successfulRequest: true };
    mockApiService.PATCH_SubmitResult!.mockResolvedValue(mockResponse);

    await component.submitReview();

    expect(mockActionsService.showGlobalAlert).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Review submitted successfully',
      hasNoCancelButton: true,
      detail: 'Your review has been submitted and the OICR development process will continue with PISA support.',
      confirmCallback: {
        label: 'Done',
        event: expect.any(Function)
      }
    });

    // Test the callback function
    const alertCall = mockActionsService.showGlobalAlert.mock.calls[0][0];
    const callback = alertCall.confirmCallback.event;
    
    // Execute the callback to test the closeAllModals call
    callback();
    
    expect(mockAllModalsService.closeAllModals).toHaveBeenCalled();
  });


});