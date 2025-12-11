import { TestBed } from '@angular/core/testing';
import { SubmissionService } from './submission.service';
import { signal } from '@angular/core';
import { RolesService } from './cache/roles.service';

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
      providers: [
        SubmissionService,
        { provide: 'CacheService', useValue: cacheMock },
        { provide: RolesService, useValue: { isAdmin: jest.fn().mockReturnValue(false) } }
      ]
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

  it('isEditableStatus true for status_id 4 and empty platform code', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 4 });
    cacheMock.getCurrentPlatformCode.mockReturnValue('');
    expect(service.isEditableStatus()).toBe(true);
  });

  it('isEditableStatus true for status_id 5 and empty platform code', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 5 });
    cacheMock.getCurrentPlatformCode.mockReturnValue('');
    expect(service.isEditableStatus()).toBe(true);
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

  it('canSubmitResult false when not my result and not principal investigator', () => {
    cacheMock.allGreenChecksAreTrue.mockReturnValue(true);
    cacheMock.greenChecks.mockReturnValue({ a: 1 });
    cacheMock.isMyResult.mockReturnValue(false);
    cacheMock.currentMetadata.mockReturnValue({ is_principal_investigator: false });
    expect(service.canSubmitResult()).toBe(false);
  });

  it('canSubmitResult false when greenChecks is empty object', () => {
    cacheMock.allGreenChecksAreTrue.mockReturnValue(true);
    cacheMock.greenChecks.mockReturnValue({});
    cacheMock.isMyResult.mockReturnValue(true);
    cacheMock.currentMetadata.mockReturnValue({ is_principal_investigator: false });
    expect(!!service.canSubmitResult()).toBe(false);
  });

  it('canSubmitResult false when greenChecks is null', () => {
    cacheMock.allGreenChecksAreTrue.mockReturnValue(true);
    cacheMock.greenChecks.mockReturnValue({});
    cacheMock.isMyResult.mockReturnValue(true);
    cacheMock.currentMetadata.mockReturnValue({ is_principal_investigator: false });
    expect(!!service.canSubmitResult()).toBe(false);
  });

  it('canSubmitResult false when greenChecks is undefined', () => {
    cacheMock.allGreenChecksAreTrue.mockReturnValue(true);
    cacheMock.greenChecks.mockReturnValue({});
    cacheMock.isMyResult.mockReturnValue(true);
    cacheMock.currentMetadata.mockReturnValue({ is_principal_investigator: false });
    expect(!!service.canSubmitResult()).toBe(false);
  });

  it('canSubmitResult false when greenChecks is empty array', () => {
    cacheMock.allGreenChecksAreTrue.mockReturnValue(true);
    cacheMock.greenChecks.mockReturnValue({});
    cacheMock.isMyResult.mockReturnValue(true);
    cacheMock.currentMetadata.mockReturnValue({ is_principal_investigator: false });
    expect(!!service.canSubmitResult()).toBe(false);
  });

  it('signals are properly initialized', () => {
    expect(service.comment()).toBe('');
    expect(service.melRegionalExpert()).toBe('');
    expect(service.oicrNo()).toBe('');
    expect(service.sharePointFolderLink()).toBe('');
    expect(service.statusSelected()).toBe(null);
    expect(service.refreshSubmissionHistory()).toBe(0);
  });

  it('submissionStatuses contains all expected statuses', () => {
    const statuses = service.submissionStatuses();
    expect(statuses).toHaveLength(14);
    expect(statuses.find(s => s.id === 1)?.name).toBe('Editing');
    expect(statuses.find(s => s.id === 2)?.name).toBe('Submitted');
    expect(statuses.find(s => s.id === 3)?.name).toBe('Accepted');
    expect(statuses.find(s => s.id === 4)?.name).toBe('Draft');
    expect(statuses.find(s => s.id === 5)?.name).toBe('Pending Revision');
    expect(statuses.find(s => s.id === 6)?.name).toBe('Approved');
    expect(statuses.find(s => s.id === 7)?.name).toBe('Do not approve');
    expect(statuses.find(s => s.id === 8)?.name).toBe('Deleted');
    expect(statuses.find(s => s.id === 9)?.name).toBe('Requested');
    expect(statuses.find(s => s.id === 10)?.name).toBe('Approved');
    expect(statuses.find(s => s.id === 11)?.name).toBe('Postponed');
    expect(statuses.find(s => s.id === 12)?.name).toBe('Science Edition');
    expect(statuses.find(s => s.id === 13)?.name).toBe('KM Curation');
    expect(statuses.find(s => s.id === 14)?.name).toBe('Published');
  });

  it('getStatusNameById returns correct names for all statuses', () => {
    expect(service.getStatusNameById(1)).toBe('Editing');
    expect(service.getStatusNameById(2)).toBe('Submitted');
    expect(service.getStatusNameById(3)).toBe('Accepted');
    expect(service.getStatusNameById(4)).toBe('Draft');
    expect(service.getStatusNameById(5)).toBe('Pending Revision');
    expect(service.getStatusNameById(6)).toBe('Approved');
    expect(service.getStatusNameById(7)).toBe('Do not approve');
    expect(service.getStatusNameById(8)).toBe('Deleted');
    expect(service.getStatusNameById(9)).toBe('Requested');
    expect(service.getStatusNameById(10)).toBe('Approved');
    expect(service.getStatusNameById(11)).toBe('Postponed');
    expect(service.getStatusNameById(12)).toBe('Science Edition');
    expect(service.getStatusNameById(13)).toBe('KM Curation');
    expect(service.getStatusNameById(14)).toBe('Published');
  });

  it('isEditableStatus handles edge cases', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 3 });
    cacheMock.getCurrentPlatformCode.mockReturnValue('STAR');
    expect(service.isEditableStatus()).toBe(false);
  });

  it('isEditableStatus handles status_id 0', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 0 });
    cacheMock.getCurrentPlatformCode.mockReturnValue('STAR');
    expect(service.isEditableStatus()).toBe(false);
  });

  it('isEditableStatus handles status_id -1', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: -1 });
    cacheMock.getCurrentPlatformCode.mockReturnValue('STAR');
    expect(service.isEditableStatus()).toBe(false);
  });

  it('isSubmitted handles status_id 0', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 0 });
    expect(service.isSubmitted()).toBe(false);
  });

  it('isSubmitted handles status_id -1', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: -1 });
    expect(service.isSubmitted()).toBe(false);
  });

  it('currentResultIsSubmitted handles status_id 0', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: 0 });
    expect(service.currentResultIsSubmitted()).toBe(false);
  });

  it('currentResultIsSubmitted handles status_id -1', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: -1 });
    expect(service.currentResultIsSubmitted()).toBe(false);
  });

  it('currentResultIsSubmitted handles null status_id', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: null });
    expect(service.currentResultIsSubmitted()).toBe(false);
  });

  it('currentResultIsSubmitted handles undefined status_id', () => {
    cacheMock.currentMetadata.mockReturnValue({ status_id: undefined });
    expect(service.currentResultIsSubmitted()).toBe(false);
  });
});
