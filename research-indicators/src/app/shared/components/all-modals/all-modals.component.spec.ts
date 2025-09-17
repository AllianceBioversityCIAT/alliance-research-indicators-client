import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AllModalsComponent } from './all-modals.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { SubmissionService } from '@shared/services/submission.service';
import { CreateResultManagementService } from './modals-content/create-result-modal/services/create-result-management.service';

describe('AllModalsComponent', () => {
  let component: AllModalsComponent;
  let fixture: ComponentFixture<AllModalsComponent>;

  beforeEach(async () => {
    (globalThis as any).ResizeObserver = class {
      observe() {
        // intentionally left blank for testing
      }
      unobserve() {
        // intentionally left blank for testing
      }
      disconnect() {
        // intentionally left blank for testing
      }
    };
    const mockSubmissionService = {
      statusSelected: signal({
        key: 'submitted',
        label: 'Submitted',
        description: 'The result has been submitted',
        icon: 'pi pi-check',
        color: 'success',
        message: 'The result was submitted successfully.',
        statusId: 1,
        selected: true
      }),
      comment: signal('')
    };
    const resultPageStepMock: any = Object.assign(jest.fn().mockReturnValue(0), { set: jest.fn() });
    const presetFromProjectResultsTableMock: any = jest.fn().mockReturnValue(false);
    const contractIdMock: any = jest.fn().mockReturnValue(null);
    const mockCreateResultManagementService: Partial<CreateResultManagementService> = {
      resultPageStep: resultPageStepMock,
      presetFromProjectResultsTable: presetFromProjectResultsTableMock,
      contractId: contractIdMock
    } as any;
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AllModalsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() },
            params: of({}) // Mock route parameters if needed
          }
        },
        {
          provide: SubmissionService,
          useValue: mockSubmissionService
        },
        {
          provide: CreateResultManagementService,
          useValue: mockCreateResultManagementService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AllModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute disabledConfirmIf: default (true)', () => {
    // statusId 1 (default) with empty comment → true
    expect(component.disabledConfirmIf()).toBe(true);
  });

  it('should compute disabledConfirmIf: undefined status (true)', () => {
    const sub = TestBed.inject(SubmissionService);
    sub.statusSelected.set({ ...sub.statusSelected(), statusId: undefined as any } as any);
    expect(component.disabledConfirmIf()).toBe(true);
  });

  it('should compute disabledConfirmIf: status 5 depends on comment', () => {
    const sub = TestBed.inject(SubmissionService);
    sub.statusSelected.set({ ...sub.statusSelected(), statusId: 5 } as any);
    sub.comment.set('');
    expect(component.disabledConfirmIf()).toBe(true);
    sub.comment.set('ok');
    expect(component.disabledConfirmIf()).toBe(false);
  });

  it('should compute disabledConfirmIf: status 6 always false', () => {
    const sub = TestBed.inject(SubmissionService);
    sub.statusSelected.set({ ...sub.statusSelected(), statusId: 6 } as any);
    sub.comment.set('');
    expect(component.disabledConfirmIf()).toBe(false);
    sub.comment.set('anything');
    expect(component.disabledConfirmIf()).toBe(false);
  });

  it('should compute disabledConfirmIf: status 7 depends on comment', () => {
    const sub = TestBed.inject(SubmissionService);
    sub.statusSelected.set({ ...sub.statusSelected(), statusId: 7 } as any);
    sub.comment.set('');
    expect(component.disabledConfirmIf()).toBe(true);
    sub.comment.set('ok');
    expect(component.disabledConfirmIf()).toBe(false);
  });

  it('should clearModal reset step to 0 after timeout', () => {
    jest.useFakeTimers();
    const mgmt = TestBed.inject(CreateResultManagementService);
    component.clearModal();
    jest.advanceTimersByTime(300);
    expect((mgmt.resultPageStep as any).set).toHaveBeenCalledWith(0);
    jest.useRealTimers();
  });
});
