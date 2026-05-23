import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Subject } from 'rxjs';
import { WebsocketService } from '@sockets/websocket.service';

import PoolFundingAlignmentComponent from './pool-funding-alignment.component';
import { BilateralService, PatchAlignmentResult } from '@shared/services/bilateral.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { ActionsService } from '@shared/services/actions.service';
import { ClarityService } from '@shared/services/clarity.service';
import { SubmissionService } from '@shared/services/submission.service';
import { AlignmentResponse } from '@interfaces/bilateral/pool-funding-alignment.interface';

describe('PoolFundingAlignmentComponent', () => {
  let component: PoolFundingAlignmentComponent;
  let fixture: ComponentFixture<PoolFundingAlignmentComponent>;
  let currentAlignment: ReturnType<typeof signal<AlignmentResponse | null>>;
  let loadingAlignment: ReturnType<typeof signal<boolean>>;
  let savingAlignment: ReturnType<typeof signal<boolean>>;
  let editable: ReturnType<typeof signal<boolean>>;
  let getAlignmentMock: jest.Mock;
  let patchAlignmentMock: jest.Mock;
  let routerNavigate: jest.Mock;
  let showToastMock: jest.Mock;
  let socketEvents$: Subject<unknown>;
  let listenMock: jest.Mock;
  let trackEventMock: jest.Mock;

  const baseAlignment: AlignmentResponse = {
    result_code: 'RES-001',
    eligible: true,
    has_pool_funding_alignment_eligible: true,
    has_contribution: null,
    selected_levers: [],
    is_synced_to_prms: false,
    is_read_only: false
  };

  beforeEach(async () => {
    currentAlignment = signal<AlignmentResponse | null>(null);
    loadingAlignment = signal<boolean>(false);
    savingAlignment = signal<boolean>(false);
    editable = signal<boolean>(true);
    getAlignmentMock = jest.fn().mockResolvedValue(null);
    patchAlignmentMock = jest.fn();
    routerNavigate = jest.fn().mockResolvedValue(true);
    showToastMock = jest.fn();
    socketEvents$ = new Subject<unknown>();
    listenMock = jest.fn().mockReturnValue(socketEvents$.asObservable());
    trackEventMock = jest.fn();

    const bilateralServiceMock = {
      currentAlignment,
      loadingAlignment,
      savingAlignment,
      editable,
      getAlignment: getAlignmentMock,
      patchAlignment: patchAlignmentMock
    };

    const cacheServiceMock = {
      currentResultId: signal(123),
      getCurrentNumericResultId: () => 123,
      currentMetadata: signal({ result_title: 'Test Title' }),
      currentResultIsLoading: signal(false),
      isSidebarCollapsed: () => false,
      hasSmallScreen: () => false,
      showSectionHeaderActions: () => false
    };

    const routeMock = {
      snapshot: {
        paramMap: {
          get: (k: string) => (k === 'id' ? 'RES-001' : null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [PoolFundingAlignmentComponent, HttpClientTestingModule],
      providers: [
        { provide: BilateralService, useValue: bilateralServiceMock },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: Router, useValue: { navigate: routerNavigate } },
        { provide: ActionsService, useValue: { showToast: showToastMock } },
        { provide: SubmissionService, useValue: { isEditableStatus: signal(true) } },
        { provide: WebsocketService, useValue: { listen: listenMock } },
        { provide: ClarityService, useValue: { trackEvent: trackEventMock } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PoolFundingAlignmentComponent);
    component = fixture.componentInstance;
    // NOTE: detectChanges intentionally skipped — child template renders standalone components
    // whose DI is exercised in T-BIL-AS-09 DOM-level cases.
  });

  it('should create and call getAlignment with the route resultCode on init', () => {
    expect(component).toBeTruthy();
    expect(getAlignmentMock).toHaveBeenCalledWith('RES-001');
  });

  it('falls back to cache.getCurrentNumericResultId when route param is absent', async () => {
    TestBed.resetTestingModule();
    const altRoute = { snapshot: { paramMap: { get: () => null } } };
    const altCache = {
      currentResultId: signal(456),
      getCurrentNumericResultId: () => 456,
      currentMetadata: signal({}),
      currentResultIsLoading: signal(false),
      isSidebarCollapsed: () => false,
      hasSmallScreen: () => false,
      showSectionHeaderActions: () => false
    };
    const altGet = jest.fn().mockResolvedValue(null);
    await TestBed.configureTestingModule({
      imports: [PoolFundingAlignmentComponent, HttpClientTestingModule],
      providers: [
        {
          provide: BilateralService,
          useValue: {
            currentAlignment: signal<AlignmentResponse | null>(null),
            loadingAlignment: signal(false),
            savingAlignment: signal(false),
            editable: signal(true),
            getAlignment: altGet
          }
        },
        { provide: CacheService, useValue: altCache },
        { provide: ActivatedRoute, useValue: altRoute },
        { provide: Router, useValue: { navigate: jest.fn().mockResolvedValue(true) } },
        { provide: ActionsService, useValue: { showToast: jest.fn() } },
        { provide: WebsocketService, useValue: { listen: jest.fn().mockReturnValue(new Subject().asObservable()) } },
        { provide: ClarityService, useValue: { trackEvent: jest.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    TestBed.createComponent(PoolFundingAlignmentComponent);

    expect(altGet).toHaveBeenCalledWith('456');
  });

  describe('view modes — has_contribution', () => {
    it('formData is null/empty when alignment is null (loading)', () => {
      expect(component.formData()).toEqual({
        has_contribution: null,
        lever_ids: []
      });
    });

    it('seeds formData from server when alignment loads (has_contribution=null)', () => {
      currentAlignment.set({ ...baseAlignment });
      component.seedFromServer(currentAlignment()!);

      expect(component.formData().has_contribution).toBeNull();
      expect(component.formData().lever_ids).toEqual([]);
    });

    it('seeds formData from server with has_contribution=false', () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);

      expect(component.formData().has_contribution).toBe(false);
      expect(component.formData().lever_ids).toEqual([]);
    });

    it('seeds formData from server with has_contribution=true and pre-filled levers', () => {
      currentAlignment.set({
        ...baseAlignment,
        has_contribution: true,
        selected_levers: [
          { lever_code: '10', lever_name: 'Lever 10' },
          { lever_code: '11', lever_name: 'Lever 11' }
        ]
      });
      component.seedFromServer(currentAlignment()!);

      expect(component.formData().has_contribution).toBe(true);
      expect(component.formData().lever_ids.sort()).toEqual([10, 11]);
    });
  });

  describe('toggle behavior — onContributionChange', () => {
    beforeEach(() => {
      currentAlignment.set({
        ...baseAlignment,
        has_contribution: true,
        selected_levers: [{ lever_code: '10', lever_name: 'Lever 10' }]
      });
      component.seedFromServer(currentAlignment()!);
    });

    it('flip true → false clears lever_ids', () => {
      expect(component.formData().lever_ids).toEqual([10]);
      component.onContributionChange(false);
      expect(component.formData().has_contribution).toBe(false);
      expect(component.formData().lever_ids).toEqual([]);
    });

    it('flip false → true preserves lever_ids already in form state', () => {
      component.onContributionChange(false);
      expect(component.formData().lever_ids).toEqual([]);
      component.onContributionChange(true);
      expect(component.formData().has_contribution).toBe(true);
      expect(component.formData().lever_ids).toEqual([]);
    });
  });

  describe('canSave gate (AC-04.2 + AC-06.1)', () => {
    beforeEach(() => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
    });

    it('false when not dirty (form matches server)', () => {
      expect(component.canSave()).toBe(false);
    });

    it('false when has_contribution=true and lever_ids is empty (≥1 lever required)', () => {
      component.onContributionChange(true);
      expect(component.formData().has_contribution).toBe(true);
      expect(component.formData().lever_ids).toEqual([]);
      expect(component.canSave()).toBe(false);
    });

    it('true when has_contribution=true and ≥1 lever selected and form is dirty', () => {
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, lever_ids: [10] }));
      expect(component.canSave()).toBe(true);
    });

    it('false when not editable, even with valid dirty form', () => {
      editable.set(false);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, lever_ids: [10] }));
      expect(component.canSave()).toBe(false);
    });

    it('false when alignment is read-only, even with valid dirty form', () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false, is_read_only: true });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, lever_ids: [10] }));
      expect(component.canSave()).toBe(false);
    });
  });

  describe('eligibility redirect (AC-01.2)', () => {
    const buildWith = async (alignmentValue: AlignmentResponse | null) => {
      TestBed.resetTestingModule();
      const navigate = jest.fn().mockResolvedValue(true);
      const altGet = jest.fn().mockResolvedValue(alignmentValue);
      const route = { snapshot: { paramMap: { get: (k: string) => (k === 'id' ? 'RES-001' : null) } } };
      const cache = {
        currentResultId: signal(123),
        getCurrentNumericResultId: () => 123,
        currentMetadata: signal({}),
        currentResultIsLoading: signal(false),
        isSidebarCollapsed: () => false,
        hasSmallScreen: () => false,
        showSectionHeaderActions: () => false
      };
      await TestBed.configureTestingModule({
        imports: [PoolFundingAlignmentComponent, HttpClientTestingModule],
        providers: [
          {
            provide: BilateralService,
            useValue: {
              currentAlignment: signal<AlignmentResponse | null>(null),
              loadingAlignment: signal(false),
              savingAlignment: signal(false),
              editable: signal(true),
              getAlignment: altGet,
              patchAlignment: jest.fn()
            }
          },
          { provide: CacheService, useValue: cache },
          { provide: ActivatedRoute, useValue: route },

          { provide: Router, useValue: { navigate } },
          { provide: ActionsService, useValue: { showToast: jest.fn() } },
          { provide: WebsocketService, useValue: { listen: jest.fn().mockReturnValue(new Subject().asObservable()) } }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
      const f = TestBed.createComponent(PoolFundingAlignmentComponent);
      // Let the constructor's getAlignment promise resolve.
      await Promise.resolve();
      await Promise.resolve();
      return { component: f.componentInstance, navigate };
    };

    it('does not redirect when alignment resolves with eligible=true', async () => {
      const { navigate, component: c } = await buildWith({
        result_code: 'RES-001',
        eligible: true,
        has_pool_funding_alignment_eligible: true,
        has_contribution: null,
        selected_levers: [],
        is_synced_to_prms: false,
        is_read_only: false
      });

      expect(navigate).not.toHaveBeenCalled();
      expect(c.loadFailed()).toBe(false);
    });

    it('redirects to general-information when alignment resolves with eligible=false', async () => {
      const { navigate } = await buildWith({
        result_code: 'RES-001',
        eligible: false,
        has_pool_funding_alignment_eligible: false,
        has_contribution: null,
        selected_levers: [],
        is_synced_to_prms: false,
        is_read_only: false
      });

      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith(['/result', 'RES-001', 'general-information'], { replaceUrl: true });
    });

    it('does not redirect and flips loadFailed when getAlignment resolves null (network error)', async () => {
      const { navigate, component: c } = await buildWith(null);

      expect(navigate).not.toHaveBeenCalled();
      expect(c.loadFailed()).toBe(true);
    });
  });

  describe('mockup-remediation (RR-A..G + RR-I)', () => {
    it('exposes the canonical mockup copy as i18n-extractable constants', () => {
      // RR-B / RR-C / RR-D — copy literals locked here so a drift fails CI.
      expect(component.CONTRIBUTION_QUESTION).toBe('Does this result contribute to a Science Program or Accelerator?');
      expect(component.INFO_BANNER).toBe(
        'Select the High-Level Outputs (HLO) and related indicators this result contributes to.'
      );
    });

    it('formData no longer carries a justification field (RR-G)', () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: true });
      component.seedFromServer(currentAlignment()!);

      expect(Object.keys(component.formData()).sort()).toEqual(['has_contribution', 'lever_ids']);
    });

    it('does not send justification on PATCH (RR-G)', async () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, lever_ids: [10] }));
      patchAlignmentMock.mockResolvedValue({ ok: true, data: { ...baseAlignment, has_contribution: true } } as PatchAlignmentResult);

      await component.onSave();

      const [, body] = patchAlignmentMock.mock.calls[0];
      expect(body).not.toHaveProperty('justification');
    });
  });

  describe('onSave — patchAlignment branching (AC-06.x, AC-12.x)', () => {
    const dirtyForm = () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, lever_ids: [10] }));
    };

    it('200 — calls seedFromServer with returned data and fires success toast', async () => {
      dirtyForm();
      const returned: AlignmentResponse = {
        ...baseAlignment,
        has_contribution: true,
        selected_levers: [{ lever_code: '10', lever_name: 'Lever 10' }]
      };
      patchAlignmentMock.mockResolvedValue({ ok: true, data: returned } as PatchAlignmentResult);

      await component.onSave();

      expect(patchAlignmentMock).toHaveBeenCalledWith('RES-001', {
        has_contribution: true,
        lever_codes: ['10']
      });
      expect(showToastMock).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Pool Funding Alignment',
        detail: 'Saved'
      });
      expect(component.formData().has_contribution).toBe(true);
      expect(component.formData().lever_ids).toEqual([10]);
      expect(component.inlineErrors()).toBeNull();
    });

    it('400 with fieldErrors — sets inlineErrors and does NOT fire toast', async () => {
      dirtyForm();
      patchAlignmentMock.mockResolvedValue({
        ok: false,
        status: 400,
        description: 'Validation failed',
        fieldErrors: { has_contribution: 'invalid', lever_codes: 'at least one required' }
      } as PatchAlignmentResult);

      await component.onSave();

      expect(component.inlineErrors()).toEqual({
        has_contribution: 'invalid',
        lever_codes: 'at least one required'
      });
      expect(showToastMock).not.toHaveBeenCalled();
    });

    it('400 without parseable fieldErrors — populates inlineErrors._global from description', async () => {
      dirtyForm();
      patchAlignmentMock.mockResolvedValue({
        ok: false,
        status: 400,
        description: 'has_contribution must be set'
      } as PatchAlignmentResult);

      await component.onSave();

      expect(component.inlineErrors()).toEqual({ _global: 'has_contribution must be set' });
      expect(showToastMock).not.toHaveBeenCalled();
    });

    it('409 — refetches alignment and fires warning toast', async () => {
      dirtyForm();
      patchAlignmentMock.mockResolvedValue({
        ok: false,
        status: 409,
        description: 'synced'
      } as PatchAlignmentResult);
      getAlignmentMock.mockClear();
      getAlignmentMock.mockResolvedValue({ ...baseAlignment, is_read_only: true });

      await component.onSave();

      expect(getAlignmentMock).toHaveBeenCalledWith('RES-001');
      expect(showToastMock).toHaveBeenCalledWith({
        severity: 'warning',
        summary: 'Synced to PRMS',
        detail: 'This result was synced to PRMS. Your unsaved alignment changes were not applied.'
      });
    });

    it('5xx — no toast from the component; form state preserved for retry', async () => {
      dirtyForm();
      patchAlignmentMock.mockResolvedValue({
        ok: false,
        status: 500,
        description: 'boom'
      } as PatchAlignmentResult);
      const beforeForm = component.formData();

      await component.onSave();

      expect(showToastMock).not.toHaveBeenCalled();
      expect(component.formData()).toEqual(beforeForm);
      expect(component.inlineErrors()).toBeNull();
    });

    it('does nothing when canSave is false (guards against double-clicks)', async () => {
      // No dirtying — canSave is false because form == server.
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      expect(component.canSave()).toBe(false);

      await component.onSave();

      expect(patchAlignmentMock).not.toHaveBeenCalled();
    });

    it('builds PATCH body without lever_codes when has_contribution=false', async () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: true, selected_levers: [{ lever_code: '10', lever_name: 'L10' }] });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(false);
      patchAlignmentMock.mockResolvedValue({ ok: true, data: { ...baseAlignment, has_contribution: false } } as PatchAlignmentResult);

      await component.onSave();

      expect(patchAlignmentMock).toHaveBeenCalledWith('RES-001', { has_contribution: false });
    });

  });

  describe('read-only states (AC-07.x, AC-10.x)', () => {
    it('isReadOnly is true when alignment.is_read_only=true', () => {
      currentAlignment.set({ ...baseAlignment, is_read_only: true });
      expect(component.isReadOnly()).toBe(true);
    });

    it('isReadOnly is false when alignment.is_read_only=false', () => {
      currentAlignment.set({ ...baseAlignment, is_read_only: false });
      expect(component.isReadOnly()).toBe(false);
    });

    it('isReadOnly is false when alignment is null (loading)', () => {
      currentAlignment.set(null);
      expect(component.isReadOnly()).toBe(false);
    });

    it('canSave returns false when alignment is read-only, even with valid dirty form', () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, lever_ids: [10] }));
      currentAlignment.set({ ...baseAlignment, is_read_only: true });
      expect(component.canSave()).toBe(false);
    });

    it('canSave returns false when not editable, even with valid dirty form', () => {
      editable.set(false);
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, lever_ids: [10] }));
      expect(component.canSave()).toBe(false);
    });

    it('banner copy constants are stable (regression guard against drift)', () => {
      expect(component.SYNCED_BANNER).toBe(
        'This result has been pushed to PRMS. Alignment can no longer be edited from STAR.'
      );
      expect(component.READ_ONLY_BANNER).toBe("You don't have permission to edit this section.");
      expect(component.SYNCED_BADGE_LABEL).toBe('Synced — read only');
      expect(component.SYNCED_BADGE_ARIA_LABEL).toBe('Pool Funding Alignment is synced and read only');
    });
  });

  describe('read-only DOM (banners + badge + Save visibility)', () => {
    it('renders synced badge + synced banner when is_read_only=true; Save absent', () => {
      currentAlignment.set({ ...baseAlignment, is_read_only: true });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('[data-testid="pf-alignment-synced-badge"]')).not.toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-synced-banner"]')).not.toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-readonly-banner"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-save"]')).toBeNull();
    });

    it('renders read-only banner when !editable && !is_read_only; Save absent; no synced badge', () => {
      editable.set(false);
      currentAlignment.set({ ...baseAlignment, is_read_only: false });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('[data-testid="pf-alignment-readonly-banner"]')).not.toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-synced-banner"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-synced-badge"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-save"]')).toBeNull();
    });

    it('synced wins when both is_read_only and !editable hold (precedence)', () => {
      editable.set(false);
      currentAlignment.set({ ...baseAlignment, is_read_only: true });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('[data-testid="pf-alignment-synced-banner"]')).not.toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-readonly-banner"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-synced-badge"]')).not.toBeNull();
    });

    it('renders Save button when editable && !is_read_only; no banners', () => {
      editable.set(true);
      currentAlignment.set({ ...baseAlignment, is_read_only: false });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('[data-testid="pf-alignment-save"]')).not.toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-synced-banner"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-readonly-banner"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-synced-badge"]')).toBeNull();
    });
  });

  describe('real-time reconcile via Socket.IO (AC-11.x)', () => {
    it('subscribes to result.pool-funding-alignment.changed on init', () => {
      expect(listenMock).toHaveBeenCalledWith('result.pool-funding-alignment.changed');
    });

    it('on matching event with clean form, refetches alignment silently (no toast)', () => {
      currentAlignment.set({ ...baseAlignment });
      component.seedFromServer(currentAlignment()!);
      expect(component.isDirty()).toBe(false);
      getAlignmentMock.mockClear();
      getAlignmentMock.mockResolvedValue({ ...baseAlignment, has_contribution: true });

      socketEvents$.next({ result_code: 'RES-001', by_user_id: 99, at: '2026-05-22T00:00:00Z' });

      expect(getAlignmentMock).toHaveBeenCalledWith('RES-001');
      expect(showToastMock).not.toHaveBeenCalled();
    });

    it('on matching event with dirty form, fires info toast and does NOT auto-refetch', () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, lever_ids: [10] }));
      expect(component.isDirty()).toBe(true);
      getAlignmentMock.mockClear();

      socketEvents$.next({ result_code: 'RES-001', by_user_id: 99, at: '2026-05-22T00:00:00Z' });

      expect(getAlignmentMock).not.toHaveBeenCalled();
      expect(showToastMock).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Alignment updated',
        detail: 'Another user updated this alignment. Refresh to see the latest.'
      });
    });

    it('event with non-matching result_code is ignored (no refetch, no toast)', () => {
      currentAlignment.set({ ...baseAlignment });
      component.seedFromServer(currentAlignment()!);
      getAlignmentMock.mockClear();

      socketEvents$.next({ result_code: 'OTHER-RES', by_user_id: 99, at: '2026-05-22T00:00:00Z' });

      expect(getAlignmentMock).not.toHaveBeenCalled();
      expect(showToastMock).not.toHaveBeenCalled();
    });

    it('after destroy, no longer reacts to events (DestroyRef cleanup)', () => {
      fixture.destroy();
      getAlignmentMock.mockClear();
      showToastMock.mockClear();

      socketEvents$.next({ result_code: 'RES-001', by_user_id: 99, at: '2026-05-22T00:00:00Z' });

      expect(getAlignmentMock).not.toHaveBeenCalled();
      expect(showToastMock).not.toHaveBeenCalled();
    });
  });

  describe('telemetry (Clarity events)', () => {
    const eligibleAlignment: AlignmentResponse = {
      result_code: 'RES-001',
      eligible: true,
      has_pool_funding_alignment_eligible: true,
      has_contribution: true,
      selected_levers: [{ lever_code: '10', lever_name: 'Lever 10' }],
      justification: 'matters because reasons',
      is_synced_to_prms: false,
      is_read_only: false
    };

    const buildWithAlignment = async (alignment: AlignmentResponse | null) => {
      TestBed.resetTestingModule();
      const altTrack = jest.fn();
      const altGet = jest.fn().mockResolvedValue(alignment);
      await TestBed.configureTestingModule({
        imports: [PoolFundingAlignmentComponent, HttpClientTestingModule],
        providers: [
          {
            provide: BilateralService,
            useValue: {
              currentAlignment: signal<AlignmentResponse | null>(null),
              loadingAlignment: signal(false),
              savingAlignment: signal(false),
              editable: signal(true),
              getAlignment: altGet,
              patchAlignment: jest.fn()
            }
          },
          {
            provide: CacheService,
            useValue: {
              currentResultId: signal(123),
              getCurrentNumericResultId: () => 123,
              currentMetadata: signal({}),
              currentResultIsLoading: signal(false),
              isSidebarCollapsed: () => false,
              hasSmallScreen: () => false,
              showSectionHeaderActions: () => false
            }
          },
          { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (k: string) => (k === 'id' ? 'RES-001' : null) } } } },
          { provide: Router, useValue: { navigate: jest.fn().mockResolvedValue(true) } },
          { provide: ActionsService, useValue: { showToast: jest.fn() } },
          { provide: SubmissionService, useValue: { isEditableStatus: signal(true) } },
          { provide: WebsocketService, useValue: { listen: jest.fn().mockReturnValue(new Subject().asObservable()) } },
          { provide: ClarityService, useValue: { trackEvent: altTrack } }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
      TestBed.createComponent(PoolFundingAlignmentComponent);
      await Promise.resolve();
      await Promise.resolve();
      return { track: altTrack };
    };

    it('fires bilateral.alignment.viewed with full payload when alignment loads (eligible=true)', async () => {
      const { track } = await buildWithAlignment(eligibleAlignment);

      expect(track).toHaveBeenCalledWith('bilateral.alignment.viewed', {
        result_code: 'RES-001',
        eligible: true,
        has_contribution: true,
        is_read_only: false
      });
    });

    it('does NOT fire bilateral.alignment.viewed when alignment is ineligible (redirect path)', async () => {
      const { track } = await buildWithAlignment({ ...eligibleAlignment, eligible: false });

      expect(track).not.toHaveBeenCalledWith('bilateral.alignment.viewed', expect.anything());
    });

    it('fires bilateral.alignment.saved with lever_count on successful PATCH', async () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, lever_ids: [10, 11] }));

      const returned: AlignmentResponse = {
        ...baseAlignment,
        has_contribution: true,
        selected_levers: [
          { lever_code: '10', lever_name: 'L10' },
          { lever_code: '11', lever_name: 'L11' }
        ]
      };
      patchAlignmentMock.mockResolvedValue({ ok: true, data: returned } as PatchAlignmentResult);
      trackEventMock.mockClear();

      await component.onSave();

      expect(trackEventMock).toHaveBeenCalledWith('bilateral.alignment.saved', {
        result_code: 'RES-001',
        has_contribution: true,
        lever_count: 2
      });
    });
  });
});
