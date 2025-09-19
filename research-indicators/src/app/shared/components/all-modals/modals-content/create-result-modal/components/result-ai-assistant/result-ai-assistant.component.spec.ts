import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultAiAssistantComponent } from './result-ai-assistant.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { FileManagerService } from '@shared/services/file-manager.service';
import { TextMiningService } from '@shared/services/text-mining.service';
import { ActionsService } from '@shared/services/actions.service';
import { ApiService } from '@shared/services/api.service';
import { GetContractsService } from '@shared/services/control-list/get-contracts.service';
import { CreateResultManagementService } from '../../services/create-result-management.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { signal } from '@angular/core';

jest.mock('pdfjs-dist', () => {
  return {
    getDocument: jest.fn().mockImplementation(() => ({ promise: Promise.resolve({ numPages: 5 }) })),
    GlobalWorkerOptions: { workerSrc: '' }
  };
});

describe('ResultAiAssistantComponent', () => {
  let component: ResultAiAssistantComponent;
  let fixture: ComponentFixture<ResultAiAssistantComponent>;

  let allModalsServiceMock: any;
  let fileManagerServiceMock: any;
  let textMiningServiceMock: any;
  let actionsServiceMock: any;
  let apiServiceMock: any;
  let getContractsServiceMock: any;
  let createResultManagementServiceMock: any;
  let cacheServiceMock: any;

  function createFile(name: string, sizeBytes = 1000, content = 'dummy') {
    const file = new File([content], name, { type: 'application/octet-stream' });
    Object.defineProperty(file, 'size', { value: sizeBytes });
    (file).arrayBuffer = jest.fn().mockResolvedValue(new TextEncoder().encode(content).buffer);
    return file;
  }

  beforeEach(async () => {
    allModalsServiceMock = {
      setGoBackFunction: jest.fn(),
      setModalWidth: jest.fn(),
      modalConfig: jest.fn().mockReturnValue({ createResult: { isWide: false } })
    };

    fileManagerServiceMock = {
      uploadFile: jest.fn().mockResolvedValue({ data: { filename: 'file.pdf' } })
    } as Partial<FileManagerService>;

    textMiningServiceMock = {
      executeTextMining: jest.fn().mockResolvedValue({ content: [{ text: JSON.stringify({ results: [{ title: 't' }] }) }] })
    } as Partial<TextMiningService>;

    actionsServiceMock = {
      showGlobalAlert: jest.fn(),
      showToast: jest.fn()
    } as Partial<ActionsService>;

    apiServiceMock = {
      GET_IssueCategories: jest.fn().mockResolvedValue({ data: [] }),
      POST_DynamoFeedback: jest.fn().mockResolvedValue({})
    } as Partial<ApiService>;

    getContractsServiceMock = {
      list: jest.fn().mockReturnValue([])
    };

    createResultManagementServiceMock = {
      items: signal<[]>([]),
      resultPageStep: signal(0),
      resetModal: jest.fn()
    } as Partial<CreateResultManagementService>;

    cacheServiceMock = {
      dataCache: signal({ user: { id: 1 } })
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ResultAiAssistantComponent],
      providers: [
        { provide: AllModalsService, useValue: allModalsServiceMock },
        { provide: FileManagerService, useValue: fileManagerServiceMock },
        { provide: TextMiningService, useValue: textMiningServiceMock },
        { provide: ActionsService, useValue: actionsServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: GetContractsService, useValue: getContractsServiceMock },
        { provide: CreateResultManagementService, useValue: createResultManagementServiceMock },
        { provide: CacheService, useValue: cacheServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultAiAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should execute goBack function registered in constructor', () => {
    const registered = allModalsServiceMock.setGoBackFunction.mock.calls[0][0] as () => void;
    component.analyzingDocument.set(false);
    registered();
    expect(createResultManagementServiceMock.resultPageStep()).toBe(0);
  });

  it('isValidFileType and isValidFileSize should work', () => {
    expect(component.isValidFileType(createFile('a.pdf'))).toBe(true);
    expect(component.isValidFileType(createFile('a.exe'))).toBe(false);
    expect(component.isValidFileSize(createFile('a.pdf', 1024))).toBe(true);
    expect(component.isValidFileSize(createFile('a.pdf', 20 * 1024 * 1024))).toBe(false);
  });

  it('handleFile should alert on invalid type and size', async () => {
    const badType = createFile('a.exe');
    await component.handleFile(badType);
    expect(actionsServiceMock.showGlobalAlert).toHaveBeenCalled();

    const bigFile = createFile('a.pdf', 11 * 1024 * 1024);
    await component.handleFile(bigFile);
    expect(actionsServiceMock.showGlobalAlert).toHaveBeenCalledTimes(2);
  });

  it('isValidPageCount should detect password and page overflow', async () => {
    const { getDocument } = jest.requireMock('pdfjs-dist');
    (getDocument as jest.Mock).mockImplementationOnce(() => ({ promise: Promise.reject({ name: 'PasswordException' }) }));
    const res1 = await component.isValidPageCount(createFile('a.pdf'));
    expect(['password', false]).toContain(res1);
    (getDocument as jest.Mock).mockImplementationOnce(() => ({ promise: Promise.resolve({ numPages: 999 }) }));
    const res2 = await component.isValidPageCount(createFile('a.pdf'));
    expect(res2).toBe(false);
  });

  it('isValidPageCount should log error and return false on non-password failure', async () => {
    const { getDocument } = jest.requireMock('pdfjs-dist');
    (getDocument as jest.Mock).mockImplementationOnce(() => ({ promise: Promise.reject({ name: 'Other', message: 'Some error' }) }));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await component.isValidPageCount(createFile('a.pdf'));
    expect(res).toBe(false);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('handleFile should accept valid file and set selectedFile', async () => {
    const file = createFile('a.txt', 1000);
    await component.handleFile(file);
    expect(component.selectedFile).toBe(file);
  });

  it('handleFile should show protected doc alert and not set file when password', async () => {
    const { getDocument } = jest.requireMock('pdfjs-dist');
    (getDocument as jest.Mock).mockImplementationOnce(() => ({ promise: Promise.reject({ name: 'PasswordException' }) }));
    const file = createFile('a.pdf', 1000);
    await component.handleFile(file);
    expect(actionsServiceMock.showGlobalAlert).toHaveBeenCalledWith(expect.objectContaining({ summary: 'PROTECTED DOCUMENT' }));
    expect(component.selectedFile).toBeNull();
  });

  it('handleFile should show PAGE LIMIT EXCEEDED alert when PDF exceeds limit', async () => {
    const { getDocument } = jest.requireMock('pdfjs-dist');
    (getDocument as jest.Mock).mockImplementationOnce(() => ({ promise: Promise.resolve({ numPages: 999 }) }));
    const file = createFile('huge.pdf', 1000);
    await component.handleFile(file);
    expect(actionsServiceMock.showGlobalAlert).toHaveBeenCalledWith(expect.objectContaining({ summary: 'PAGE LIMIT EXCEEDED' }));
    expect(component.selectedFile).toBeNull();
  });

  it('goBack should reset states when analyzed and not when analyzing', () => {
    component.analyzingDocument.set(true);
    component.goBack();
    expect(createResultManagementServiceMock.items()).toEqual([]);

    component.analyzingDocument.set(false);
    component.documentAnalyzed.set(true);
    component.selectedFile = {} as File;
    component.goBack();
    expect(component.selectedFile).toBeNull();
    expect(allModalsServiceMock.setModalWidth).toHaveBeenCalledWith('createResult', false);
    // when not analyzing and not analyzed, it should go to step 0
    component.documentAnalyzed.set(false);
    component.goBack();
    expect(createResultManagementServiceMock.resultPageStep()).toBe(0);
  });

  it('onPageChange should set first and rows', () => {
    component.onPageChange({ first: 10, rows: 20 });
    expect(component.first()).toBe(10);
    expect(component.rows()).toBe(20);
  });

  it('onPageChange should default first=0 and rows=5 when undefined', () => {
    // set to non-defaults first
    component.first.set(99);
    component.rows.set(99);
    component.onPageChange({});
    expect(component.first()).toBe(0);
    expect(component.rows()).toBe(5);
  });

  it('drag events should toggle isDragging', () => {
    const evt = new Event('drag') as DragEvent;
    jest.spyOn(evt, 'preventDefault');
    jest.spyOn(evt, 'stopPropagation');
    component.onDragOver(evt);
    expect(component.isDragging).toBe(true);
    component.onDragLeave(evt);
    expect(component.isDragging).toBe(false);
  });

  it('onDrop should call handleFile', async () => {
    const file = createFile('a.pdf');
    const dt = { files: [file] } as unknown as DataTransfer;
    const evt = { preventDefault: jest.fn(), stopPropagation: jest.fn(), dataTransfer: dt } as unknown as DragEvent;
    const spy = jest.spyOn(component, 'handleFile');
    component.onDrop(evt);
    expect(spy).toHaveBeenCalled();
  });

  it('handleAnalyzingDocument success path should set items and documentAnalyzed', async () => {
    const file = createFile('a.pdf');
    component.selectedFile = file;
    await component.handleAnalyzingDocument();
    expect(component.documentAnalyzed()).toBe(true);
    expect(createResultManagementServiceMock.items().length).toBeGreaterThan(0);
  });

  it('handleAnalyzingDocument no results should set noResults and not set analyzed', async () => {
    textMiningServiceMock.executeTextMining.mockResolvedValueOnce({ content: [{ text: JSON.stringify({ results: [] }) }] });
    const file = createFile('a.pdf');
    component.selectedFile = file;
    await component.handleAnalyzingDocument();
    expect(component.noResults()).toBe(true);
    expect(component.documentAnalyzed()).toBe(false);
  });

  it('handleAnalyzingDocument with empty content should toast error and not analyze', async () => {
    const file = createFile('a.pdf');
    component.selectedFile = file;
    textMiningServiceMock.executeTextMining.mockResolvedValueOnce({ content: [] });
    await component.handleAnalyzingDocument();
    expect(actionsServiceMock.showToast).toHaveBeenCalledWith({ severity: 'error', summary: 'Error', detail: 'Something went wrong. Please try again.' });
    expect(component.documentAnalyzed()).toBe(false);
  });

  it('handleAnalyzingDocument should warn and return when no file selected', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await component.handleAnalyzingDocument();
    expect(warnSpy).toHaveBeenCalledWith('No file selected.');
    expect(component.analyzingDocument()).toBe(false);
    warnSpy.mockRestore();
  });

  it('handleAnalyzingDocument with items missing text should set noResults', async () => {
    const file = createFile('a.pdf');
    component.selectedFile = file;
    textMiningServiceMock.executeTextMining.mockResolvedValueOnce({ content: [{}, { text: '' }] });
    await component.handleAnalyzingDocument();
    expect(component.noResults()).toBe(true);
  });

  it('handleAnalyzingDocument with non-array results should set noResults', async () => {
    const file = createFile('a.pdf');
    component.selectedFile = file;
    textMiningServiceMock.executeTextMining.mockResolvedValueOnce({ content: [{ text: JSON.stringify({ results: { foo: 'bar' } }) }] });
    await component.handleAnalyzingDocument();
    expect(component.noResults()).toBe(true);
  });

  it('getContractStatusClasses should map statuses', () => {
    expect(component.getContractStatusClasses('ONGOING')).toContain('153C71');
    expect(component.getContractStatusClasses('unknown')).toContain('235B2D');
  });

  it('getContractStatusClasses should handle undefined and empty status', () => {
    expect(component.getContractStatusClasses(undefined as unknown as string)).toContain('235B2D');
    expect(component.getContractStatusClasses('')).toContain('235B2D');
  });

  it('feedback panel flow and submitFeedback', async () => {
    // open bad feedback
    component.toggleFeedback('bad');
    expect(component.showFeedbackPanel()).toBe(true);
    expect(component.feedbackType()).toBe('bad');
    expect(component.isRequired()).toBe(true);
    component.selectType('t1');
    component.body.update(b => ({ ...b, feedbackText: 'desc' }));
    component.miningResponse = [{ text: 'x' }];
    await component.submitFeedback();
    expect(apiServiceMock.POST_DynamoFeedback).toHaveBeenCalled();
    expect(actionsServiceMock.showToast).toHaveBeenCalled();
    expect(component.feedbackSent).toBe(true);
    expect(component.lastFeedbackType).toBe('bad');
    expect(component.showFeedbackPanel()).toBe(false);
  });

  it('toggleFeedback should close when same type clicked and reopen when switching type', () => {
    jest.useFakeTimers();
    const removeSpy = jest.spyOn(document, 'removeEventListener');
    // open good
    component.toggleFeedback('good');
    jest.runOnlyPendingTimers();
    expect(component.showFeedbackPanel()).toBe(true);
    // click same type -> close
    component.toggleFeedback('good');
    expect(component.showFeedbackPanel()).toBe(false);
    expect(removeSpy).toHaveBeenCalledWith('click', component.handleOutsideClick);
    // switch to bad -> close then reopen with delay
    component.toggleFeedback('bad');
    jest.advanceTimersByTime(200);
    expect(component.showFeedbackPanel()).toBe(true);
    jest.useRealTimers();
  });

  it('toggleFeedback switch case should reattach outside listener after delay', () => {
    jest.useFakeTimers();
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');
    // open with good
    component.toggleFeedback('good');
    jest.runOnlyPendingTimers();
    // switch to bad triggers close then reopen after 100ms and then inner attach
    component.toggleFeedback('bad');
    // first close removes listener
    expect(removeSpy).toHaveBeenCalledWith('click', component.handleOutsideClick);
    // advance to trigger reopen and inner attach
    jest.advanceTimersByTime(150);
    expect(component.showFeedbackPanel()).toBe(true);
    expect(addSpy).toHaveBeenCalledWith('click', component.handleOutsideClick);
    jest.useRealTimers();
  });

  it('toggleFeedback initial open should attach outside click listener', () => {
    jest.useFakeTimers();
    const addSpy = jest.spyOn(document, 'addEventListener');
    component.toggleFeedback('good');
    jest.runOnlyPendingTimers();
    expect(component.showFeedbackPanel()).toBe(true);
    expect(addSpy).toHaveBeenCalledWith('click', component.handleOutsideClick);
    jest.useRealTimers();
  });

  it('closeFeedbackPanel should reset state and remove listener', () => {
    const removeSpy = jest.spyOn(document, 'removeEventListener');
    component.showFeedbackPanel.set(true);
    component.feedbackType.set('bad');
    component.body.update(b => ({ ...b, feedbackText: 'x' }));
    component.closeFeedbackPanel();
    expect(component.showFeedbackPanel()).toBe(false);
    expect(component.feedbackType()).toBeNull();
    expect(component.body().feedbackText).toBe('');
    expect(removeSpy).toHaveBeenCalledWith('click', component.handleOutsideClick);
  });

  it('selectType should toggle values', () => {
    component.selectedType = [];
    component.selectType('1');
    expect(component.selectedType).toEqual(['1']);
    component.selectType('1');
    expect(component.selectedType).toEqual([]);
  });

  it('handleOutsideClick should close when click is outside panel', () => {
    component.showFeedbackPanel.set(true);
    const removeSpy = jest.spyOn(document, 'removeEventListener');
    const fakePanel = document.createElement('div');
    fakePanel.id = 'feedbackPanelRef';
    document.body.appendChild(fakePanel);
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    component.handleOutsideClick({ target: outside } as any);
    expect(component.showFeedbackPanel()).toBe(false);
    expect(removeSpy).toHaveBeenCalledWith('click', component.handleOutsideClick);
    fakePanel.remove();
    outside.remove();
  });

  it('startProgress, runStep and timers should progress through steps', () => {
    jest.useFakeTimers();
    jest.spyOn(component, 'getRandomInterval').mockReturnValue(100);
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      (cb as FrameRequestCallback)(0);
      return 1;
    });
    component.startProgress();
    jest.advanceTimersByTime(5000);
    const steps = component.steps();
    expect(steps.some(s => s.completed)).toBe(true);
    rafSpy.mockRestore();
    jest.useRealTimers();
  });

  it('runStep should complete single step through animation and finishStep timers', () => {
    jest.useFakeTimers();
    jest.spyOn(component, 'getRandomInterval').mockReturnValue(100);
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      (cb as FrameRequestCallback)(0);
      return 1;
    });
    component.runStep(0);
    jest.advanceTimersByTime(500);
    jest.advanceTimersByTime(150);
    jest.advanceTimersByTime(100);
    const s = component.steps()[0];
    expect(s.completed).toBe(true);
    expect(s.inProgress).toBe(false);
    rafSpy.mockRestore();
    jest.useRealTimers();
  });

  it('onFileSelected should call handleFile with selected file', async () => {
    const spy = jest.spyOn(component, 'handleFile').mockResolvedValue();
    const input = document.createElement('input');
    const file = createFile('z.pdf');
    Object.defineProperty(input, 'files', { value: [file] });
    const evt = { target: input } as unknown as Event;
    component.onFileSelected(evt);
    expect(spy).toHaveBeenCalledWith(file);
  });

  it('goBackToCreateResult and goBackToUploadNewFile should reset state and call services', () => {
    component.selectedFile = createFile('a.pdf');
    component.documentAnalyzed.set(true);
    component.noResults.set(true);
    component.feedbackSent = true;
    component.lastFeedbackType = 'good';
    component.goBackToCreateResult();
    expect(component.selectedFile).toBeNull();
    expect(component.documentAnalyzed()).toBe(false);
    expect(component.noResults()).toBe(false);
    expect(component.feedbackSent).toBe(false);
    expect(component.lastFeedbackType).toBeNull();
    expect(allModalsServiceMock.setModalWidth).toHaveBeenCalledWith('createResult', false);

    component.goBackToUploadNewFile();
    expect(createResultManagementServiceMock.resultPageStep()).toBe(1);
  });

  it('getRandomInterval should be within expected bounds', () => {
    for (let i = 0; i < 5; i++) {
      const v = component.getRandomInterval();
      expect(v).toBeGreaterThanOrEqual(3000);
      expect(v).toBeLessThanOrEqual(5000);
    }
  });

  it('isRequired false when type is good', () => {
    component.toggleFeedback('good');
    expect(component.isRequired()).toBe(false);
  });

  it('mapResultRawAiToAIAssistantResult should coalesce optional fields and contract_code', () => {
    component.body.update(b => ({ ...b, contract_id: 123 }));
    const input = [{
      indicator: 'i', title: 't', description: 'd', keywords: [], geoscope: undefined,
      training_type: 'tt', length_of_training: 1, start_date: 's', end_date: 'e', degree: 'deg', delivery_modality: 'dm',
      total_participants: 10, evidence_for_stage: 'ev', policy_type: 'pol',
      alliance_main_contact_person_first_name: 'n', alliance_main_contact_person_last_name: 'l', stage_in_policy_process: 'st',
      male_participants: undefined, female_participants: undefined, non_binary_participants: undefined,
      innovation_nature: 'in', innovation_type: 'it', assess_readiness: 'ar', anticipated_users: 'au', organization_type: 'ot', organization_sub_type: 'ost', organizations: [], innovation_actors_detailed: []
    }];
    const out = (component as any).mapResultRawAiToAIAssistantResult(input);
    expect(out[0].geoscope).toEqual([]);
    expect(out[0].male_participants).toBe(0);
    expect(out[0].female_participants).toBe(0);
    expect(out[0].non_binary_participants).toBe('0');
    expect(out[0].contract_code).toBe('123');
  });

  it('handleAnalyzingDocument should throw and toast on upload missing filename', async () => {
    const file = createFile('a.pdf');
    component.selectedFile = file;
    fileManagerServiceMock.uploadFile.mockResolvedValueOnce({ data: { filename: '' } });
    await expect(component.handleAnalyzingDocument()).rejects.toBeInstanceOf(Error);
    expect(actionsServiceMock.showToast).toHaveBeenCalledWith({ severity: 'error', summary: 'Error', detail: 'Something went wrong. Please try again.' });
  });

  it('handleAnalyzingDocument should ignore parse errors and continue', async () => {
    const file = createFile('a.pdf');
    component.selectedFile = file;
    textMiningServiceMock.executeTextMining.mockResolvedValueOnce({ content: [{ text: '{invalid json' }] });
    await component.handleAnalyzingDocument();
    expect(component.noResults() || component.documentAnalyzed()).toBe(true);
  });
});


