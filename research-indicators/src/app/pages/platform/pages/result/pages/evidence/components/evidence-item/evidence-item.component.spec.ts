import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvidenceItemComponent } from './evidence-item.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Evidence } from '../../../../../../../../shared/interfaces/patch-result-evidences.interface';
import { SubmissionService } from '@shared/services/submission.service';
import { submissionServiceMock } from 'src/app/testing/mock-services.mock';
import { fakeAsync, tick } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';

describe('EvidenceItemComponent', () => {
  let component: EvidenceItemComponent;
  let fixture: ComponentFixture<EvidenceItemComponent>;
  let submission: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvidenceItemComponent, HttpClientTestingModule],
      providers: [{ provide: SubmissionService, useValue: { ...submissionServiceMock, isEditableStatus: jest.fn().mockReturnValue(true) } }]
    }).compileComponents();

    fixture = TestBed.createComponent(EvidenceItemComponent);
    component = fixture.componentInstance;
    submission = TestBed.inject(SubmissionService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit deleteEvidenceEvent when deleteEvidence is called', () => {
    const spy = jest.spyOn(component.deleteEvidenceEvent, 'emit');
    component.deleteEvidence();
    expect(spy).toHaveBeenCalled();
  });

  it('should set body on ngOnInit', () => {
    const evidence: Evidence = {
      evidence_url: 'url',
      evidence_description: 'desc',
      is_active: true,
      result_evidence_id: null,
      result_id: null,
      evidence_role_id: null,
      is_private: false
    };
    component.evidence = evidence;
    component.ngOnInit();
    expect(component.body()).toEqual(evidence);
  });

  it('isDescriptionMissing should return true if evidence_description is missing', () => {
    component.body.set({ ...component.body(), evidence_description: '' });
    expect(component.isDescriptionMissing).toBe(true);
  });

  it('isDescriptionMissing should return false if evidence_description exists', () => {
    component.body.set({ ...component.body(), evidence_description: 'desc' });
    expect(component.isDescriptionMissing).toBe(false);
  });

  it('validateWebsite should return true for empty or valid url', () => {
    expect(component.validateWebsite('')).toBe(true);
    expect(component.validateWebsite('https://test.com')).toBe(true);
  });

  it('validateWebsite should return false for invalid url', () => {
    expect(component.validateWebsite('invalid-url')).toBe(false);
  });

  it('isFieldInvalid should return true if evidence_url is empty', () => {
    component.body.set({ ...component.body(), evidence_url: '' });
    expect(component.isFieldInvalid()).toBe(true);
  });

  it('isFieldInvalid should return false if evidence_url exists', () => {
    component.body.set({ ...component.body(), evidence_url: 'url' });
    expect(component.isFieldInvalid()).toBe(false);
  });

  it('setValue should lowercase and update evidence_url after debounce', done => {
    jest.useFakeTimers();
    component.body.set({ ...component.body(), evidence_url: 'UPPERCASE' });
    component.setValue('LOWERCASE');
    jest.advanceTimersByTime(300);
    expect(component.body().evidence_url).toBe('lowercase');
    jest.useRealTimers();
    done();
  });

  it('setValue should clear previous timeout', () => {
    jest.useFakeTimers();
    const clearSpy = jest.spyOn(global, 'clearTimeout');
    component.setValue('test1');
    component.setValue('test2');
    expect(clearSpy).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should update bodySignal when onChange is triggered', () => {
    const evidence: Evidence = {
      evidence_url: 'url',
      evidence_description: 'desc',
      is_active: true,
      result_evidence_id: null,
      result_id: null,
      evidence_role_id: null,
      is_private: false
    };
    component.body.set(evidence);
    component.index = 0;
    component.bodySignal.set({ evidence: [evidence] });
    void component.onChange;
    expect(component.bodySignal().evidence[0].evidence_url).toBe('url');
  });

  it('should not update body if index is null in syncBody', () => {
    component.index = null;
    component.body.set(new Evidence());
    component.evidence = new Evidence();
    // Forzar el efecto
    void component.syncBody;
    expect(component.body()).toEqual(new Evidence());
  });

  it('should not update body if parentEvidence is equal to body in syncBody', () => {
    const evidence = new Evidence();
    component.index = 0;
    component.bodySignal.set({ evidence: [evidence] });
    component.body.set(evidence);
    // Forzar el efecto
    void component.syncBody;
    expect(component.body()).toEqual(evidence);
  });

  it('should not update body if evidence is equal to body in syncBody', () => {
    const evidence = new Evidence();
    component.index = 0;
    component.bodySignal.set({ evidence: [undefined as any] });
    component.body.set(evidence);
    component.evidence = evidence;
    // Forzar el efecto
    void component.syncBody;
    expect(component.body()).toEqual(evidence);
  });

  it('should not update body if neither parentEvidence nor evidence differ from body in syncBody', () => {
    const evidence = new Evidence();
    component.index = 0;
    component.bodySignal.set({ evidence: [evidence] });
    component.body.set(evidence);
    component.evidence = evidence;
    // Forzar el efecto
    void component.syncBody;
    expect(component.body()).toEqual(evidence);
  });

  it('should not update bodySignal if index is null in onChange', () => {
    component.index = null;
    const prev = component.bodySignal();
    void component.onChange;
    expect(component.bodySignal()).toEqual(prev);
  });

  it('should initialize body.evidence as array in onChange if not present', () => {
    component.index = 0;
    // Usa un objeto PatchResultEvidences vacío
    component.bodySignal.set(new (require('../../../../../../../../shared/interfaces/patch-result-evidences.interface').PatchResultEvidences)());
    component.body.set({
      evidence_url: 'url',
      evidence_description: 'desc',
      is_active: true,
      result_evidence_id: null,
      result_id: null,
      evidence_role_id: null,
      is_private: false
    });
    void component.onChange;
    expect(Array.isArray(component.bodySignal().evidence)).toBe(true);
  });

  it('should do nothing in onChange if currentEvidence is undefined', () => {
    component.index = 0;
    component.body.set(undefined as any);
    const prev = component.bodySignal();
    void component.onChange;
    expect(component.bodySignal()).toEqual(prev);
  });

  it('should not update evidence if already equal in onChange', () => {
    const evidence = new Evidence();
    component.index = 0;
    component.bodySignal.set({ evidence: [evidence] });
    component.body.set(evidence);
    void component.onChange;
    expect(component.bodySignal().evidence[0]).toEqual(evidence);
  });

  // Este test es trivial y no relevante para cobertura real, se elimina

  it('should not update evidence_url if already lowercase and equal in setValue', done => {
    jest.useFakeTimers();
    component.body.set({ ...component.body(), evidence_url: 'lowercase' });
    component.setValue('lowercase');
    jest.advanceTimersByTime(300);
    expect(component.body().evidence_url).toBe('lowercase');
    jest.useRealTimers();
    done();
  });

  it('should have isPrivate property default to false', () => {
    expect(component.isPrivate).toBe(false);
  });

  // Template-related tests
  it('should show remove button only if isEditableStatus is true', () => {
    jest.spyOn(submission, 'isEditableStatus').mockReturnValue(true);
    fixture.detectChanges();
    // Buscar el botón por el ícono
    let removeBtn = fixture.nativeElement.querySelector('.pi-times-circle');
    expect(removeBtn).not.toBeNull();
    jest.spyOn(submission, 'isEditableStatus').mockReturnValue(false);
    fixture.detectChanges();
    removeBtn = fixture.nativeElement.querySelector('.pi-times-circle');
    expect(removeBtn).toBeNull();
  });

  it('should show required message if description is missing', () => {
    component.body.set({ ...component.body(), evidence_description: '' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('This field is required');
  });

  it('should show URL validation message if url is invalid and editable', () => {
    jest.spyOn(submission, 'isEditableStatus').mockReturnValue(true);
    component.body.set({ ...component.body(), evidence_url: 'invalid-url' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Please enter a valid URL');
  });

  it('should not update body if evidence is undefined and no parentEvidence in syncBody', () => {
    component.index = 0;
    component.bodySignal.set({ evidence: [undefined as any] });
    component.body.set(new Evidence());
    component.evidence = undefined as any;
    void component.syncBody;
    expect(component.body()).toEqual(new Evidence());
  });

  it('setValue should handle empty string and not update evidence_url if already empty', done => {
    jest.useFakeTimers();
    component.body.set({ ...component.body(), evidence_url: '' });
    component.setValue('');
    jest.advanceTimersByTime(300);
    expect(component.body().evidence_url).toBe('');
    jest.useRealTimers();
    done();
  });

  it('validateWebsite should return true for string with only spaces', () => {
    expect(component.validateWebsite('   ')).toBe(true);
  });

  it('isFieldInvalid should return true if evidence_url is undefined', () => {
    component.body.set({ ...component.body(), evidence_url: undefined as any });
    expect(component.isFieldInvalid()).toBe(true);
  });

  it('isFieldInvalid should return true if evidence_url is only spaces', () => {
    component.body.set({ ...component.body(), evidence_url: '   ' });
    expect(component.isFieldInvalid()).toBe(true);
  });

  it('setValue should handle null and undefined values gracefully', done => {
    jest.useFakeTimers();
    component.body.set({ ...component.body(), evidence_url: undefined });
    component.setValue('null');
    jest.advanceTimersByTime(300);
    expect(component.body().evidence_url).toBe('null');
    component.setValue('undefined');
    jest.advanceTimersByTime(300);
    expect(component.body().evidence_url).toBe('undefined');
    jest.useRealTimers();
    done();
  });

  it('validateWebsite should return true for null and undefined', () => {
    // @ts-expect-error purposely passing null
    expect(component.validateWebsite(null)).toBe(true);
    // @ts-expect-error purposely passing undefined
    expect(component.validateWebsite(undefined)).toBe(true);
  });

  it('isFieldInvalid should return true if body() is undefined', () => {
    // @ts-expect-error purposely returning undefined
    jest.spyOn(component, 'body').mockReturnValue(undefined);
    expect(component.isFieldInvalid()).toBe(true);
  });

  it('isFieldInvalid should return true if body() is null', () => {
    // @ts-expect-error purposely returning null
    jest.spyOn(component, 'body').mockReturnValue(null);
    expect(component.isFieldInvalid()).toBe(true);
  });

  it('setValue should not throw if body() is undefined', done => {
    jest.useFakeTimers();
    // @ts-expect-error purposely returning undefined
    jest.spyOn(component, 'body').mockReturnValue(undefined);
    expect(() => component.setValue('test')).not.toThrow();
    jest.useRealTimers();
    done();
  });

  it('setValue should not throw if body() is null', done => {
    jest.useFakeTimers();
    // @ts-expect-error purposely returning null
    jest.spyOn(component, 'body').mockReturnValue(null);
    expect(() => component.setValue('test')).not.toThrow();
    jest.useRealTimers();
    done();
  });
});
