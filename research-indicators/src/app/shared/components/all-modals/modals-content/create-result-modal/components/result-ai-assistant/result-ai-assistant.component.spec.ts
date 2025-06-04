import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { ResultAiAssistantComponent } from './result-ai-assistant.component';
import { CreateResultManagementService } from '../../services/create-result-management.service';
import { ToPromiseService } from '../../../../../../services/to-promise.service';
import { ActionsService } from '../../../../../../services/actions.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { FileManagerService } from '@shared/services/file-manager.service';
import { TextMiningService } from '@shared/services/text-mining.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { GetContractsService } from '@shared/services/control-list/get-contracts.service';
import { AIAssistantResult } from '../../models/AIAssistantResult';

// Mock PDF.js
jest.mock('pdfjs-dist', () => ({
  getDocument: jest.fn().mockReturnValue({
    promise: Promise.resolve({ numPages: 5 })
  }),
  GlobalWorkerOptions: { workerSrc: '' }
}));

describe('ResultAiAssistantComponent', () => {
  let component: ResultAiAssistantComponent;
  let fixture: ComponentFixture<ResultAiAssistantComponent>;
  let mockCreateResultManagementService: jest.Mocked<CreateResultManagementService>;
  let mockActionsService: jest.Mocked<ActionsService>;
  let mockAllModalsService: jest.Mocked<AllModalsService>;
  let mockFileManagerService: jest.Mocked<FileManagerService>;
  let mockTextMiningService: jest.Mocked<TextMiningService>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockGetContractsService: jest.Mocked<GetContractsService>;
  let mockToPromiseService: jest.Mocked<ToPromiseService>;
  let mockChangeDetectorRef: jest.Mocked<ChangeDetectorRef>;

  beforeEach(async () => {
    // Mock services
    mockCreateResultManagementService = {
      resetModal: jest.fn(),
      items: signal([]),
      resultPageStep: signal(0)
    } as any;

    mockActionsService = {
      showGlobalAlert: jest.fn(),
      showToast: jest.fn()
    } as any;

    mockAllModalsService = {
      setGoBackFunction: jest.fn()
    } as any;

    mockFileManagerService = {
      uploadFile: jest.fn()
    } as any;

    mockTextMiningService = {
      analyzeDocument: jest.fn()
    } as any;

    mockCacheService = {} as any;

    mockGetContractsService = {
      list: signal([])
    } as any;

    mockToPromiseService = {
      convert: jest.fn()
    } as any;

    mockChangeDetectorRef = {
      detectChanges: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ResultAiAssistantComponent, NoopAnimationsModule],
      providers: [
        { provide: CreateResultManagementService, useValue: mockCreateResultManagementService },
        { provide: ActionsService, useValue: mockActionsService },
        { provide: AllModalsService, useValue: mockAllModalsService },
        { provide: FileManagerService, useValue: mockFileManagerService },
        { provide: TextMiningService, useValue: mockTextMiningService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: GetContractsService, useValue: mockGetContractsService },
        { provide: ToPromiseService, useValue: mockToPromiseService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
        provideHttpClient(withInterceptorsFromDi())
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultAiAssistantComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.acceptedFormats).toEqual(['.pdf', '.docx', '.txt', '.xlsx', '.pptx']);
    expect(component.maxSizeMB).toBe(10);
    expect(component.pageLimit).toBe(100);
    expect(component.isDragging).toBe(false);
    expect(component.selectedFile).toBeNull();
    expect(component.analyzingDocument()).toBe(false);
    expect(component.documentAnalyzed()).toBe(false);
    expect(component.noResults()).toBe(false);
    expect(component.first()).toBe(0);
    expect(component.rows()).toBe(5);
  });

  it('should set go back function on constructor', () => {
    expect(mockAllModalsService.setGoBackFunction).toHaveBeenCalled();
  });

  describe('onContractIdChange', () => {
    it('should update contractId and body when called with number', () => {
      component.onContractIdChange(123);

      expect(component.contractId).toBe('123');
      expect(component.body().contract_id).toBe(123);
    });

    it('should set contractId to null when called with null', () => {
      component.onContractIdChange(null);

      expect(component.contractId).toBeNull();
      expect(component.body().contract_id).toBeNull();
    });
  });

  describe('goBack', () => {
    it('should return early if analyzing document', () => {
      component.analyzingDocument.set(true);
      const setSpy = jest.spyOn(mockCreateResultManagementService.resultPageStep, 'set');

      component.goBack();

      expect(setSpy).not.toHaveBeenCalled();
    });

    it('should reset document state if document was analyzed', () => {
      component.documentAnalyzed.set(true);
      component.selectedFile = new File([''], 'test.pdf');
      const setSpy = jest.spyOn(mockCreateResultManagementService.items, 'set');

      component.goBack();

      expect(component.selectedFile).toBeNull();
      expect(setSpy).toHaveBeenCalledWith([]);
      expect(component.documentAnalyzed()).toBe(false);
      expect(component.analyzingDocument()).toBe(false);
    });

    it('should set result page step to 0 if document not analyzed', () => {
      component.documentAnalyzed.set(false);
      const setSpy = jest.spyOn(mockCreateResultManagementService.resultPageStep, 'set');

      component.goBack();

      expect(setSpy).toHaveBeenCalledWith(0);
    });
  });

  describe('onPageChange', () => {
    it('should update first and rows signals', () => {
      const event = { first: 10, rows: 20 };

      component.onPageChange(event);

      expect(component.first()).toBe(10);
      expect(component.rows()).toBe(20);
    });

    it('should handle undefined values', () => {
      const event = { first: undefined, rows: undefined };

      component.onPageChange(event);

      expect(component.first()).toBe(0);
      expect(component.rows()).toBe(5);
    });
  });

  describe('drag events', () => {
    it('should set isDragging to true on dragover', () => {
      const event = new DragEvent('dragover');
      jest.spyOn(event, 'preventDefault');
      jest.spyOn(event, 'stopPropagation');

      component.onDragOver(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.isDragging).toBe(true);
    });

    it('should set isDragging to false on dragleave', () => {
      component.isDragging = true;
      const event = new DragEvent('dragleave');
      jest.spyOn(event, 'preventDefault');
      jest.spyOn(event, 'stopPropagation');

      component.onDragLeave(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.isDragging).toBe(false);
    });

    it('should handle file drop', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      const event = new DragEvent('drop');
      Object.defineProperty(event, 'dataTransfer', {
        value: { files: [file] }
      });
      jest.spyOn(event, 'preventDefault');
      jest.spyOn(event, 'stopPropagation');
      jest.spyOn(component, 'handleFile');

      component.onDrop(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.isDragging).toBe(false);
      expect(component.handleFile).toHaveBeenCalledWith(file);
    });
  });

  describe('file selection', () => {
    it('should handle file selection from input', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      const event = { target: { files: [file] } } as any;
      jest.spyOn(component, 'handleFile');

      component.onFileSelected(event);

      expect(component.handleFile).toHaveBeenCalledWith(file);
    });
  });

  describe('file validation', () => {
    it('should validate file type correctly', () => {
      const validFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      const invalidFile = new File([''], 'test.exe', { type: 'application/exe' });

      expect(component.isValidFileType(validFile)).toBe(true);
      expect(component.isValidFileType(invalidFile)).toBe(false);
    });

    it('should validate file size correctly', () => {
      const validFile = new File(['a'.repeat(1024)], 'test.pdf'); // 1KB
      const invalidFile = new File(['a'.repeat(11 * 1024 * 1024)], 'test.pdf'); // 11MB

      expect(component.isValidFileSize(validFile)).toBe(true);
      expect(component.isValidFileSize(invalidFile)).toBe(false);
    });

    it('should validate PDF page count', async () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });

      const result = await component.isValidPageCount(file);

      expect(result).toBe(true);
    });
  });

  describe('alert methods', () => {
    it('should show invalid type alert', () => {
      component.showInvalidTypeAlert();

      expect(mockActionsService.showGlobalAlert).toHaveBeenCalledWith({
        severity: 'error',
        hasNoButton: true,
        summary: 'UNSUPPORTED FILE TYPE',
        detail: 'Supported formats are: .pdf, .docx, .txt, .xlsx, .pptx'
      });
    });

    it('should show size exceeded alert', () => {
      component.showSizeExceededAlert();

      expect(mockActionsService.showGlobalAlert).toHaveBeenCalledWith({
        severity: 'error',
        hasNoButton: true,
        summary: 'FILE SIZE EXCEEDED',
        detail: 'The uploaded document exceeds the 10 MB limit. Please select a smaller file.'
      });
    });
  });

  describe('handleFile', () => {
    it('should show invalid type alert for invalid file type', async () => {
      const invalidFile = new File([''], 'test.exe');
      jest.spyOn(component, 'isValidFileType').mockReturnValue(false);
      jest.spyOn(component, 'showInvalidTypeAlert');

      await component.handleFile(invalidFile);

      expect(component.showInvalidTypeAlert).toHaveBeenCalled();
    });

    it('should show size exceeded alert for large file', async () => {
      const largeFile = new File([''], 'test.pdf');
      jest.spyOn(component, 'isValidFileType').mockReturnValue(true);
      jest.spyOn(component, 'isValidFileSize').mockReturnValue(false);
      jest.spyOn(component, 'showSizeExceededAlert');

      await component.handleFile(largeFile);

      expect(component.showSizeExceededAlert).toHaveBeenCalled();
    });

    it('should show page limit alert for PDF with too many pages', async () => {
      const pdfFile = new File([''], 'test.pdf');
      jest.spyOn(component, 'isValidFileType').mockReturnValue(true);
      jest.spyOn(component, 'isValidFileSize').mockReturnValue(true);
      jest.spyOn(component, 'isValidPageCount').mockResolvedValue(false);

      await component.handleFile(pdfFile);

      expect(mockActionsService.showGlobalAlert).toHaveBeenCalledWith({
        severity: 'error',
        hasNoButton: true,
        summary: 'PAGE LIMIT EXCEEDED',
        detail: 'The PDF exceeds the 100 page limit. Please select a shorter document.'
      });
    });

    it('should select valid file', async () => {
      const validFile = new File([''], 'test.txt');
      jest.spyOn(component, 'isValidFileType').mockReturnValue(true);
      jest.spyOn(component, 'isValidFileSize').mockReturnValue(true);
      jest.spyOn(component, 'fileSelected');

      await component.handleFile(validFile);

      expect(component.fileSelected).toHaveBeenCalledWith(validFile);
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
    });
  });

  describe('fileSelected', () => {
    it('should set selectedFile', () => {
      const file = new File([''], 'test.pdf');

      component.fileSelected(file);

      expect(component.selectedFile).toBe(file);
    });
  });

  describe('goBackToCreateResult', () => {
    it('should reset modal state', () => {
      component.selectedFile = new File([''], 'test.pdf');
      component.analyzingDocument.set(true);
      component.documentAnalyzed.set(true);

      component.goBackToCreateResult();

      expect(mockCreateResultManagementService.resetModal).toHaveBeenCalled();
      expect(component.selectedFile).toBeNull();
      expect(component.analyzingDocument()).toBe(false);
      expect(component.documentAnalyzed()).toBe(false);
    });
  });

  describe('goBackToUploadNewFile', () => {
    it('should reset and set result page step to 1', () => {
      jest.spyOn(component, 'goBackToCreateResult');
      const setSpy = jest.spyOn(mockCreateResultManagementService.resultPageStep, 'set');

      component.goBackToUploadNewFile();

      expect(component.goBackToCreateResult).toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('getContractStatusClasses', () => {
    it('should return correct status classes', () => {
      expect(component.getContractStatusClasses('active')).toBe('text-green-600 bg-green-50');
      expect(component.getContractStatusClasses('completed')).toBe('text-blue-600 bg-blue-50');
      expect(component.getContractStatusClasses('cancelled')).toBe('text-red-600 bg-red-50');
      expect(component.getContractStatusClasses('suspended')).toBe('text-yellow-600 bg-yellow-50');
      expect(component.getContractStatusClasses('unknown')).toBe('text-gray-600 bg-gray-50');
    });
  });

  describe('progress methods', () => {
    it('should start progress correctly', () => {
      jest.spyOn(component, 'runStep');
      jest.spyOn(component, 'getRandomInterval').mockReturnValue(1000);

      component.startProgress();

      expect(component.runStep).toHaveBeenCalledWith(0);
      expect(component.activeIndex()).toBe(0);
    });

    it('should generate random interval', () => {
      const interval = component.getRandomInterval();

      expect(interval).toBeGreaterThanOrEqual(3000);
      expect(interval).toBeLessThanOrEqual(5000);
    });
  });

  describe('mapResultRawAiToAIAssistantResult', () => {
    it('should map results correctly', () => {
      component.body.set({ contract_id: 123 });
      const rawResults: AIAssistantResult[] = [
        {
          indicator: 'Test Indicator',
          title: 'Test Title',
          description: 'Test Description',
          keywords: ['test'],
          geoscope: [],
          training_type: 'Workshop',
          total_participants: 50,
          evidence_for_stage: 'Test Evidence',
          policy_type: 'Test Policy',
          alliance_main_contact_person_first_name: 'John',
          alliance_main_contact_person_last_name: 'Doe',
          stage_in_policy_process: 'Implementation',
          male_participants: 25,
          female_participants: 25,
          non_binary_participants: '0'
        }
      ];

      const result = component['mapResultRawAiToAIAssistantResult'](rawResults);

      expect(result[0].contract_code).toBe('123');
      expect(result[0].male_participants).toBe(25);
      expect(result[0].female_participants).toBe(25);
      expect(result[0].non_binary_participants).toBe('0');
    });

    it('should handle null values in mapping', () => {
      component.body.set({ contract_id: null });
      const rawResults: AIAssistantResult[] = [
        {
          indicator: 'Test',
          title: 'Test',
          description: 'Test',
          keywords: [],
          geoscope: [],
          training_type: '',
          total_participants: 0,
          evidence_for_stage: '',
          policy_type: '',
          alliance_main_contact_person_first_name: '',
          alliance_main_contact_person_last_name: '',
          stage_in_policy_process: '',
          male_participants: 0,
          female_participants: 0,
          non_binary_participants: '0'
        }
      ];

      const result = component['mapResultRawAiToAIAssistantResult'](rawResults);

      expect(result[0].contract_code).toBeUndefined();
      expect(result[0].geoscope).toEqual([]);
      expect(result[0].male_participants).toBe(0);
      expect(result[0].female_participants).toBe(0);
      expect(result[0].non_binary_participants).toBe('0');
    });
  });
});
