import { TestBed } from '@angular/core/testing';
import { SubmissionService } from './submission.service';
import { signal } from '@angular/core';

const cacheMock = {
  allGreenChecksAreTrue: jest.fn(),
  greenChecks: jest.fn(),
  isMyResult: jest.fn(),
  currentMetadata: jest.fn(),
  getCurrentPlatformCode: jest.fn()
};

describe('SubmissionService', () => {
  let service: SubmissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SubmissionService, { provide: 'CacheService', useValue: cacheMock }]
    });
    service = TestBed.inject(SubmissionService);
    service.cache = cacheMock as any;
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getStatusNameById returns correct name', () => {
    expect(service.getStatusNameById(1)).toBe('Editing');
    expect(service.getStatusNameById(99)).toBe('');
  });

  it('getStatusNameById returns empty string for non-existent status', () => {
    expect(service.getStatusNameById(999)).toBe('');
    expect(service.getStatusNameById(0)).toBe('');
    expect(service.getStatusNameById(-1)).toBe('');
  });

  it('isEditableStatus true for status_id 4 and STAR platform', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 4 });
    cacheMock.getCurrentPlatformCode.mockReturnValue('STAR');
    expect(service.isEditableStatus()).toBe(true);
  });

  it('isEditableStatus true for status_id 5 and STAR platform', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 5 });
    cacheMock.getCurrentPlatformCode.mockReturnValue('STAR');
    expect(service.isEditableStatus()).toBe(true);
  });

  it('isEditableStatus false for status_id 4 but TIP platform', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 4 });
    cacheMock.getCurrentPlatformCode.mockReturnValue('TIP');
    expect(service.isEditableStatus()).toBe(false);
  });

  it('isEditableStatus false for status_id 5 but TIP platform', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 5 });
    cacheMock.getCurrentPlatformCode.mockReturnValue('TIP');
    expect(service.isEditableStatus()).toBe(false);
  });

  it('isEditableStatus false for status_id 2 and STAR platform', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 2 });
    cacheMock.getCurrentPlatformCode.mockReturnValue('STAR');
    expect(service.isEditableStatus()).toBe(false);
  });

  it('isEditableStatus false for null status_id', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: null });
    cacheMock.getCurrentPlatformCode.mockReturnValue('STAR');
    expect(service.isEditableStatus()).toBe(false);
  });

  it('isEditableStatus false for undefined status_id', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: undefined });
    cacheMock.getCurrentPlatformCode.mockReturnValue('STAR');
    expect(service.isEditableStatus()).toBe(false);
  });

  it('isEditableStatus false for status_id 4 but empty platform code', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 4 });
    cacheMock.getCurrentPlatformCode.mockReturnValue('');
    expect(service.isEditableStatus()).toBe(false);
  });

  it('isSubmitted true for status_id 2', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 2 });
    expect(service.isSubmitted()).toBe(true);
  });

  it('isSubmitted false for status_id 4', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 4 });
    expect(service.isSubmitted()).toBe(false);
  });

  it('isSubmitted false for null status_id', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: null });
    expect(service.isSubmitted()).toBe(false);
  });

  it('isSubmitted false for undefined status_id', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: undefined });
    expect(service.isSubmitted()).toBe(false);
  });

  it('canSubmitResult true when all conditions met', () => {
    cacheMock.allGreenChecksAreTrue.mockReturnValue(true);
    cacheMock.greenChecks.mockReturnValue({ a: 1 });
    cacheMock.isMyResult.mockReturnValue(true);
    cacheMock.currentMetadata.mockReturnValue({ is_principal_investigator: false });
    expect(service.canSubmitResult()).toBe(true);
  });

  it('canSubmitResult true when principal investigator', () => {
    cacheMock.allGreenChecksAreTrue.mockReturnValue(true);
    cacheMock.greenChecks.mockReturnValue({ a: 1 });
    cacheMock.isMyResult.mockReturnValue(false);
    cacheMock.currentMetadata.mockReturnValue({ is_principal_investigator: true });
    expect(service.canSubmitResult()).toBe(true);
  });

  it('canSubmitResult false if not allGreenChecksAreTrue', () => {
    cacheMock.allGreenChecksAreTrue.mockReturnValue(false);
    cacheMock.greenChecks.mockReturnValue({ a: 1 });
    cacheMock.isMyResult.mockReturnValue(true);
    cacheMock.currentMetadata.mockReturnValue({ is_principal_investigator: false });
    expect(service.canSubmitResult()).toBe(false);
  });

  it('canSubmitResult false if greenChecks empty', () => {
    cacheMock.allGreenChecksAreTrue.mockReturnValue(true);
    cacheMock.greenChecks.mockReturnValue({});
    cacheMock.isMyResult.mockReturnValue(true);
    cacheMock.currentMetadata.mockReturnValue({ is_principal_investigator: false });
    expect(!!service.canSubmitResult()).toBe(false);
  });

  it('currentResultIsSubmitted true for status_id 2', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 2 });
    expect(service.currentResultIsSubmitted()).toBe(true);
  });

  it('currentResultIsSubmitted false for status_id 1', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 1 });
    expect(service.currentResultIsSubmitted()).toBe(false);
  });
});
