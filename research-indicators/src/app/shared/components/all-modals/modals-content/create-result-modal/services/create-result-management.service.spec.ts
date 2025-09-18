import { TestBed } from '@angular/core/testing';
import { CreateResultManagementService } from './create-result-management.service';
import { AIAssistantResult } from '../models/AIAssistantResult';

describe('CreateResultManagementService', () => {
  let service: CreateResultManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateResultManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(service.resultPageStep()).toBe(0);
    expect(service.expandedItem()).toBeNull();
    expect(service.items()).toEqual([]);
    expect(service.contractId()).toBeNull();
    expect(service.resultTitle()).toBeNull();
    expect(service.year()).toBeNull();
    expect(service.modalTitle()).toBe('Create A Result');
  });

  it('should have correct step constants', () => {
    expect(service.STEPS.CREATE_RESULT).toBe(0);
    expect(service.STEPS.UPLOAD_FILE).toBe(1);
    expect(service.STEPS.CREATE_OICR).toBe(2);
  });

  it('should reset modal to default values', () => {
    // Set some values first
    service.resultPageStep.set(2);
    service.expandedItem.set({} as AIAssistantResult);
    service.items.set([{} as AIAssistantResult]);
    service.contractId.set(123);
    service.resultTitle.set('Test Title');
    service.modalTitle.set('Test Modal');

    // Reset
    service.resetModal();

    // Verify reset
    expect(service.resultPageStep()).toBe(0);
    expect(service.expandedItem()).toBeNull();
    expect(service.items()).toEqual([]);
    expect(service.contractId()).toBeNull();
    expect(service.resultTitle()).toBeNull();
    expect(service.modalTitle()).toBe('Create A Result');
  });

  it('should set contract ID', () => {
    service.setContractId(456);
    expect(service.contractId()).toBe(456);
    
    service.setContractId(null);
    expect(service.contractId()).toBeNull();
  });

  it('should set result title', () => {
    service.setResultTitle('New Title');
    expect(service.resultTitle()).toBe('New Title');
    
    service.setResultTitle(null);
    expect(service.resultTitle()).toBeNull();
  });

  it('should set year', () => {
    service.setYear(2024);
    expect(service.year()).toBe(2024);
    
    service.setYear(null);
    expect(service.year()).toBeNull();
  });

  it('should set modal title', () => {
    service.setModalTitle('New Modal Title');
    expect(service.modalTitle()).toBe('New Modal Title');
  });
});
