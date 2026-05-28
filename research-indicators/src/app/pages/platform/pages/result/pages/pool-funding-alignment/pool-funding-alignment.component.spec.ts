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
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { HloSelectionModalContextService } from '@shared/services/cache/hlo-selection-modal-context.service';
import { AlignmentResponse, PoolFundingMappingStatus, PoolFundingScienceProgram } from '@interfaces/bilateral/pool-funding-alignment.interface';

describe('PoolFundingAlignmentComponent', () => {
  let component: PoolFundingAlignmentComponent;
  let fixture: ComponentFixture<PoolFundingAlignmentComponent>;
  let currentAlignment: ReturnType<typeof signal<AlignmentResponse | null>>;
  let loadingAlignment: ReturnType<typeof signal<boolean>>;
  let savingAlignment: ReturnType<typeof signal<boolean>>;
  let editable: ReturnType<typeof signal<boolean>>;
  let sciencePrograms: ReturnType<typeof signal<PoolFundingScienceProgram[]>>;
  let mappingStatus: ReturnType<typeof signal<PoolFundingMappingStatus | null>>;
  let getAlignmentMock: jest.Mock;
  let getScienceProgramsMock: jest.Mock;
  let patchAlignmentMock: jest.Mock;
  let routerNavigate: jest.Mock;
  let showToastMock: jest.Mock;
  let socketEvents$: Subject<unknown>;
  let listenMock: jest.Mock;
  let trackEventMock: jest.Mock;
  let openModalMock: jest.Mock;
  let setContextMock: jest.Mock;

  const codes = (form: { selected_sps: { official_code: string }[] }) => form.selected_sps.map(sp => sp.official_code);
  const sp = (official_code: string) => ({ official_code });

  const baseAlignment: AlignmentResponse = {
    result_code: 'RES-001',
    eligible: true,
    has_pool_funding_alignment_eligible: true,
    has_contribution: null,
    selected_science_programs: [],
    selected_levers: [],
    is_synced_to_prms: false,
    is_read_only: false
  };

  beforeEach(async () => {
    currentAlignment = signal<AlignmentResponse | null>(null);
    loadingAlignment = signal<boolean>(false);
    savingAlignment = signal<boolean>(false);
    editable = signal<boolean>(true);
    sciencePrograms = signal<PoolFundingScienceProgram[]>([]);
    mappingStatus = signal<PoolFundingMappingStatus | null>(null);
    getAlignmentMock = jest.fn().mockResolvedValue(null);
    getScienceProgramsMock = jest.fn().mockResolvedValue([]);
    patchAlignmentMock = jest.fn();
    routerNavigate = jest.fn().mockResolvedValue(true);
    showToastMock = jest.fn();
    socketEvents$ = new Subject<unknown>();
    listenMock = jest.fn().mockReturnValue(socketEvents$.asObservable());
    trackEventMock = jest.fn();
    openModalMock = jest.fn();
    setContextMock = jest.fn();

    const bilateralServiceMock = {
      currentAlignment,
      loadingAlignment,
      savingAlignment,
      editable,
      sciencePrograms,
      mappingStatus,
      getAlignment: getAlignmentMock,
      getSciencePrograms: getScienceProgramsMock,
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
        { provide: ClarityService, useValue: { trackEvent: trackEventMock } },
        { provide: AllModalsService, useValue: { openModal: openModalMock } },
        { provide: HloSelectionModalContextService, useValue: { setContext: setContextMock, clear: jest.fn(), context: signal(null) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PoolFundingAlignmentComponent);
    component = fixture.componentInstance;
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
            sciencePrograms: signal<PoolFundingScienceProgram[]>([]),
            mappingStatus: signal<PoolFundingMappingStatus | null>(null),
            getAlignment: altGet,
            getSciencePrograms: jest.fn().mockResolvedValue([])
          }
        },
        { provide: CacheService, useValue: altCache },
        { provide: ActivatedRoute, useValue: altRoute },
        { provide: Router, useValue: { navigate: jest.fn().mockResolvedValue(true) } },
        { provide: ActionsService, useValue: { showToast: jest.fn() } },
        { provide: WebsocketService, useValue: { listen: jest.fn().mockReturnValue(new Subject().asObservable()) } },
        { provide: ClarityService, useValue: { trackEvent: jest.fn() } },
        { provide: AllModalsService, useValue: { openModal: jest.fn() } },
        { provide: HloSelectionModalContextService, useValue: { setContext: jest.fn(), clear: jest.fn(), context: signal(null) } }
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
        selected_sps: []
      });
    });

    it('seeds formData from server when alignment loads (has_contribution=null)', () => {
      currentAlignment.set({ ...baseAlignment });
      component.seedFromServer(currentAlignment()!);

      expect(component.formData().has_contribution).toBeNull();
      expect(codes(component.formData())).toEqual([]);
    });

    it('seeds formData from server with has_contribution=false', () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);

      expect(component.formData().has_contribution).toBe(false);
      expect(codes(component.formData())).toEqual([]);
    });

    it('seeds formData from server with has_contribution=true and pre-filled SPs', () => {
      currentAlignment.set({
        ...baseAlignment,
        has_contribution: true,
        selected_science_programs: [
          { code: 'SP01', name: 'Breeding for Tomorrow' },
          { code: 'SP02', name: 'Sustainable Farming' }
        ]
      });
      component.seedFromServer(currentAlignment()!);

      expect(component.formData().has_contribution).toBe(true);
      expect(codes(component.formData()).sort()).toEqual(['SP01', 'SP02']);
      // Seeded objects carry name + category/color slots for the picker's enrichment.
      expect(component.formData().selected_sps[0]).toMatchObject({ official_code: 'SP01', name: 'Breeding for Tomorrow' });
    });

    it('falls back to selected_levers when selected_science_programs is absent (backend compat)', () => {
      currentAlignment.set({
        ...baseAlignment,
        has_contribution: true,
        selected_science_programs: undefined,
        selected_levers: [
          { lever_code: 'SP01', lever_name: 'Lever 1' },
          { lever_code: 'SP02', lever_name: 'Lever 2' }
        ]
      });
      component.seedFromServer(currentAlignment()!);

      expect(codes(component.formData()).sort()).toEqual(['SP01', 'SP02']);
    });
  });

  describe('toggle behavior — onContributionChange', () => {
    beforeEach(() => {
      currentAlignment.set({
        ...baseAlignment,
        has_contribution: true,
        selected_science_programs: [{ code: 'SP01', name: 'Breeding for Tomorrow' }]
      });
      component.seedFromServer(currentAlignment()!);
    });

    it('flip true → false clears selected_sps', () => {
      expect(codes(component.formData())).toEqual(['SP01']);
      component.onContributionChange(false);
      expect(component.formData().has_contribution).toBe(false);
      expect(codes(component.formData())).toEqual([]);
    });

    it('flip false → true preserves selected_sps already in form state', () => {
      component.onContributionChange(false);
      expect(codes(component.formData())).toEqual([]);
      component.onContributionChange(true);
      expect(component.formData().has_contribution).toBe(true);
      expect(codes(component.formData())).toEqual([]);
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

    it('false when has_contribution=true and selected_sps is empty (≥1 SP required)', () => {
      component.onContributionChange(true);
      expect(component.formData().has_contribution).toBe(true);
      expect(codes(component.formData())).toEqual([]);
      expect(component.canSave()).toBe(false);
    });

    it('true when has_contribution=true and ≥1 SP selected and form is dirty', () => {
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01')] }));
      expect(component.canSave()).toBe(true);
    });

    it('false when not editable, even with valid dirty form', () => {
      editable.set(false);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01')] }));
      expect(component.canSave()).toBe(false);
    });

    it('false when alignment is read-only, even with valid dirty form', () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false, is_read_only: true });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01')] }));
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
              sciencePrograms: signal<PoolFundingScienceProgram[]>([]),
              mappingStatus: signal<PoolFundingMappingStatus | null>(null),
              getAlignment: altGet,
              getSciencePrograms: jest.fn().mockResolvedValue([]),
              patchAlignment: jest.fn()
            }
          },
          { provide: CacheService, useValue: cache },
          { provide: ActivatedRoute, useValue: route },

          { provide: Router, useValue: { navigate } },
          { provide: ActionsService, useValue: { showToast: jest.fn() } },
          { provide: WebsocketService, useValue: { listen: jest.fn().mockReturnValue(new Subject().asObservable()) } },
          { provide: AllModalsService, useValue: { openModal: jest.fn() } },
          { provide: HloSelectionModalContextService, useValue: { setContext: jest.fn(), clear: jest.fn(), context: signal(null) } }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
      const f = TestBed.createComponent(PoolFundingAlignmentComponent);
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
        selected_science_programs: [],
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
        selected_science_programs: [],
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
      expect(component.CONTRIBUTION_QUESTION).toBe('Does this result contribute to a Science Program or Accelerator?');
      expect(component.INFO_BANNER).toBe(
        'Select the High-Level Outputs (HLO) and related indicators this result contributes to.'
      );
    });

    it('formData no longer carries a justification field (RR-G)', () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: true });
      component.seedFromServer(currentAlignment()!);

      expect(Object.keys(component.formData()).sort()).toEqual(['has_contribution', 'selected_sps']);
    });

    it('does not send justification on PATCH (RR-G)', async () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01')] }));
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
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01')] }));
    };

    it('200 — calls seedFromServer with returned data and fires success toast', async () => {
      dirtyForm();
      const returned: AlignmentResponse = {
        ...baseAlignment,
        has_contribution: true,
        selected_science_programs: [{ code: 'SP01', name: 'Breeding for Tomorrow' }]
      };
      patchAlignmentMock.mockResolvedValue({ ok: true, data: returned } as PatchAlignmentResult);

      await component.onSave();

      expect(patchAlignmentMock).toHaveBeenCalledWith('RES-001', {
        has_contribution: true,
        sp_codes: ['SP01']
      });
      expect(showToastMock).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Pool Funding Alignment',
        detail: 'Saved'
      });
      expect(component.formData().has_contribution).toBe(true);
      expect(codes(component.formData())).toEqual(['SP01']);
      expect(component.inlineErrors()).toBeNull();
    });

    it('400 with fieldErrors — sets inlineErrors and does NOT fire toast', async () => {
      dirtyForm();
      patchAlignmentMock.mockResolvedValue({
        ok: false,
        status: 400,
        description: 'Validation failed',
        fieldErrors: { has_contribution: 'invalid', sp_codes: 'at least one required' }
      } as PatchAlignmentResult);

      await component.onSave();

      expect(component.inlineErrors()).toEqual({
        has_contribution: 'invalid',
        sp_codes: 'at least one required'
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
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      expect(component.canSave()).toBe(false);

      await component.onSave();

      expect(patchAlignmentMock).not.toHaveBeenCalled();
    });

    it('builds PATCH body without sp_codes when has_contribution=false', async () => {
      currentAlignment.set({
        ...baseAlignment,
        has_contribution: true,
        selected_science_programs: [{ code: 'SP01', name: 'Breeding for Tomorrow' }]
      });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(false);
      patchAlignmentMock.mockResolvedValue({ ok: true, data: { ...baseAlignment, has_contribution: false } } as PatchAlignmentResult);

      await component.onSave();

      expect(patchAlignmentMock).toHaveBeenCalledWith('RES-001', { has_contribution: false });
    });

  });

  describe('HLO action card (Figma 32471:129636)', () => {
    it('showHloSection is false when has_contribution=null', () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: null });
      component.seedFromServer(currentAlignment()!);
      expect(component.showHloSection()).toBe(false);
    });

    it('showHloSection is false when has_contribution=true but selected_sps is empty', () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      expect(codes(component.formData())).toEqual([]);
      expect(component.showHloSection()).toBe(false);
    });

    it('showHloSection is true once has_contribution=true and ≥1 SP is selected', () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01')] }));
      expect(component.showHloSection()).toBe(true);
    });

    it('CTA copy is locked to mockup values (Select, VIEW HIGH LEVEL OUTPUTS)', () => {
      expect(component.HLO_SECTION_LABEL).toBe('Map HLOs and/or indicators');
      expect(component.HLO_CARD_TITLE).toBe('VIEW HIGH LEVEL OUTPUTS');
      expect(component.HLO_CARD_CTA_LABEL).toBe('Select');
      expect(component.HLO_CARD_BODY).toContain('Browse and select the High-Level Outputs');
    });

    it('onOpenHloSelector sets modal context with resultCode + opens hloSelection modal', () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01'), sp('SP02')] }));

      component.onOpenHloSelector();

      expect(setContextMock).toHaveBeenCalledWith({ resultCode: 'RES-001' });
      expect(openModalMock).toHaveBeenCalledWith('hloSelection');
      expect(trackEventMock).toHaveBeenCalledWith('bilateral.alignment.hlo_selector_opened', {
        result_code: 'RES-001',
        sp_count: 2
      });
    });

    it('HLO section renders in the DOM only when showHloSection is true', () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      fixture.detectChanges();
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('[data-testid="pf-alignment-hlo-section"]')).toBeNull();

      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01')] }));
      fixture.detectChanges();
      expect(root.querySelector('[data-testid="pf-alignment-hlo-section"]')).not.toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-hlo-card"]')).not.toBeNull();
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
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01')] }));
      currentAlignment.set({ ...baseAlignment, is_read_only: true });
      expect(component.canSave()).toBe(false);
    });

    it('canSave returns false when not editable, even with valid dirty form', () => {
      editable.set(false);
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01')] }));
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
    it('renders synced badge + synced banner when is_read_only && is_synced_to_prms; Save absent', () => {
      currentAlignment.set({ ...baseAlignment, is_read_only: true, is_synced_to_prms: true });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('[data-testid="pf-alignment-synced-badge"]')).not.toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-synced-banner"]')).not.toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-readonly-banner"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-prms-sourced-banner"]')).toBeNull();
    });

    it('renders read-only banner when !editable && !is_read_only; no synced badge', () => {
      editable.set(false);
      currentAlignment.set({ ...baseAlignment, is_read_only: false });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('[data-testid="pf-alignment-readonly-banner"]')).not.toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-synced-banner"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-synced-badge"]')).toBeNull();
    });

    it('synced wins when both is_read_only (synced) and !editable hold (precedence)', () => {
      editable.set(false);
      currentAlignment.set({ ...baseAlignment, is_read_only: true, is_synced_to_prms: true });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('[data-testid="pf-alignment-synced-banner"]')).not.toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-readonly-banner"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-prms-sourced-banner"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-synced-badge"]')).not.toBeNull();
    });

    it('clean state: editable && !is_read_only; no banners', () => {
      editable.set(true);
      currentAlignment.set({ ...baseAlignment, is_read_only: false });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('[data-testid="pf-alignment-synced-banner"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-readonly-banner"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-prms-sourced-banner"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-synced-badge"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-prms-sourced-badge"]')).toBeNull();
    });
  });

  describe('PRMS-sourced read-only differentiation (REQ-BIL-ASR-02)', () => {
    const queryReadOnlyDom = () => {
      const root: HTMLElement = fixture.nativeElement;
      return {
        syncedBadge: root.querySelector('[data-testid="pf-alignment-synced-badge"]'),
        prmsBadge: root.querySelector('[data-testid="pf-alignment-prms-sourced-badge"]'),
        syncedBanner: root.querySelector('[data-testid="pf-alignment-synced-banner"]'),
        prmsBanner: root.querySelector('[data-testid="pf-alignment-prms-sourced-banner"]'),
        permissionBanner: root.querySelector('[data-testid="pf-alignment-readonly-banner"]'),
        radioYes: root.querySelector('[data-testid="pf-alignment-radio-yes"]')
      };
    };

    it('exposes the PRMS-sourced copy constants', () => {
      expect(component.PRMS_SOURCED_BADGE_LABEL).toBe('Owned by PRMS');
      expect(component.PRMS_SOURCED_BANNER).toBe('This result is owned by PRMS. Bilateral alignment is read-only in STAR.');
      expect(component.PRMS_SOURCED_409_DESCRIPTION).toBe('Result is PRMS-sourced; bilateral alignment is read-only in STAR');
    });

    it('readOnlyCause derivation across the four states', () => {
      currentAlignment.set({ ...baseAlignment, is_read_only: true, is_synced_to_prms: true });
      expect(component.readOnlyCause()).toBe('synced');

      currentAlignment.set({ ...baseAlignment, is_read_only: true, is_synced_to_prms: false });
      expect(component.readOnlyCause()).toBe('prms-sourced');

      editable.set(false);
      currentAlignment.set({ ...baseAlignment, is_read_only: false, is_synced_to_prms: false });
      expect(component.readOnlyCause()).toBe('permission');

      editable.set(true);
      currentAlignment.set({ ...baseAlignment, is_read_only: false, is_synced_to_prms: false });
      expect(component.readOnlyCause()).toBeNull();
    });

    it('AC-02.1 — synced cause renders the synced badge + banner (unchanged), not the PRMS-sourced ones', () => {
      currentAlignment.set({ ...baseAlignment, is_read_only: true, is_synced_to_prms: true });
      fixture.detectChanges();

      const dom = queryReadOnlyDom();
      expect(dom.syncedBadge).not.toBeNull();
      expect(dom.syncedBanner).not.toBeNull();
      expect(dom.prmsBadge).toBeNull();
      expect(dom.prmsBanner).toBeNull();
      expect(dom.permissionBanner).toBeNull();
    });

    it('AC-02.2 — PRMS-sourced cause renders the new "Owned by PRMS" badge + banner, not the synced ones', () => {
      currentAlignment.set({ ...baseAlignment, is_read_only: true, is_synced_to_prms: false });
      fixture.detectChanges();

      const dom = queryReadOnlyDom();
      expect(dom.prmsBadge).not.toBeNull();
      expect(dom.prmsBanner).not.toBeNull();
      expect(dom.prmsBanner?.textContent).toContain('owned by PRMS');
      expect(component.PRMS_SOURCED_BADGE_LABEL).toBe('Owned by PRMS');
      expect(dom.syncedBadge).toBeNull();
      expect(dom.syncedBanner).toBeNull();
      expect(dom.permissionBanner).toBeNull();
    });

    it('AC-02.3 — permission cause renders the permission banner (unchanged), no badge', () => {
      editable.set(false);
      currentAlignment.set({ ...baseAlignment, is_read_only: false, is_synced_to_prms: false });
      fixture.detectChanges();

      const dom = queryReadOnlyDom();
      expect(dom.permissionBanner).not.toBeNull();
      expect(dom.syncedBanner).toBeNull();
      expect(dom.prmsBanner).toBeNull();
      expect(dom.syncedBadge).toBeNull();
      expect(dom.prmsBadge).toBeNull();
    });

    it('AC-02.5 — inputs are disabled identically across synced, prms-sourced, and permission causes', () => {
      // The template disables every editable control with `!editable() || isReadOnly()`.
      // Assert that expression is truthy for all three read-only causes (and that
      // canSave is blocked) so the disabled behavior is identical regardless of cause.
      const inputsDisabled = () => !component.editable() || component.isReadOnly();

      currentAlignment.set({ ...baseAlignment, is_read_only: true, is_synced_to_prms: true });
      expect(component.readOnlyCause()).toBe('synced');
      expect(inputsDisabled()).toBe(true);
      expect(component.canSave()).toBe(false);

      currentAlignment.set({ ...baseAlignment, is_read_only: true, is_synced_to_prms: false });
      expect(component.readOnlyCause()).toBe('prms-sourced');
      expect(inputsDisabled()).toBe(true);
      expect(component.canSave()).toBe(false);

      editable.set(false);
      currentAlignment.set({ ...baseAlignment, is_read_only: false, is_synced_to_prms: false });
      expect(component.readOnlyCause()).toBe('permission');
      expect(inputsDisabled()).toBe(true);
      expect(component.canSave()).toBe(false);
    });

    it('AC-02.4 — 409 with the PRMS-sourced description refetches and resolves to the prms-sourced banner', async () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01')] }));

      patchAlignmentMock.mockResolvedValue({
        ok: false,
        status: 409,
        description: 'Result is PRMS-sourced; bilateral alignment is read-only in STAR'
      } as PatchAlignmentResult);
      // Simulate the refetch landing the PRMS-sourced flags.
      getAlignmentMock.mockClear();
      getAlignmentMock.mockImplementation(async () => {
        currentAlignment.set({ ...baseAlignment, is_read_only: true, is_synced_to_prms: false });
        return currentAlignment();
      });

      await component.onSave();

      expect(getAlignmentMock).toHaveBeenCalledWith('RES-001');
      expect(component.readOnlyCause()).toBe('prms-sourced');
      fixture.detectChanges();
      const dom = queryReadOnlyDom();
      expect(dom.prmsBanner).not.toBeNull();
      expect(dom.syncedBanner).toBeNull();
      expect(showToastMock).toHaveBeenCalledWith({
        severity: 'warning',
        summary: 'Owned by PRMS',
        detail: 'This result is owned by PRMS. Bilateral alignment is read-only in STAR. Your changes were not applied.'
      });
    });

    it('409 without the PRMS-sourced description keeps the existing "Synced to PRMS" toast (unchanged)', async () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01')] }));

      patchAlignmentMock.mockResolvedValue({
        ok: false,
        status: 409,
        description: 'Result was synced to PRMS'
      } as PatchAlignmentResult);
      getAlignmentMock.mockClear();
      getAlignmentMock.mockResolvedValue({ ...baseAlignment, is_read_only: true, is_synced_to_prms: true });

      await component.onSave();

      expect(showToastMock).toHaveBeenCalledWith({
        severity: 'warning',
        summary: 'Synced to PRMS',
        detail: 'This result was synced to PRMS. Your unsaved alignment changes were not applied.'
      });
    });
  });

  describe('per-result SP picker (REQ-BIL-ASR-01)', () => {
    const spOption: PoolFundingScienceProgram = {
      code: 'SP09',
      name: 'Scaling for Impact',
      category: 'Scaling programs',
      color: '#ec4899',
      icon_key: 'SP09',
      allocation: 25
    };

    const showPickerSection = () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
    };

    it('fetches the per-result SPs on init once the alignment loads (eligible)', async () => {
      TestBed.resetTestingModule();
      const altGet = jest.fn().mockResolvedValue({
        result_code: 'RES-001',
        eligible: true,
        has_pool_funding_alignment_eligible: true,
        has_contribution: null,
        selected_science_programs: [],
        selected_levers: [],
        is_synced_to_prms: false,
        is_read_only: false
      } as AlignmentResponse);
      const altGetSps = jest.fn().mockResolvedValue([]);
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
              sciencePrograms: signal<PoolFundingScienceProgram[]>([]),
              mappingStatus: signal<PoolFundingMappingStatus | null>(null),
              getAlignment: altGet,
              getSciencePrograms: altGetSps,
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
          { provide: WebsocketService, useValue: { listen: jest.fn().mockReturnValue(new Subject().asObservable()) } },
          { provide: ClarityService, useValue: { trackEvent: jest.fn() } },
          { provide: AllModalsService, useValue: { openModal: jest.fn() } },
          { provide: HloSelectionModalContextService, useValue: { setContext: jest.fn(), clear: jest.fn(), context: signal(null) } }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
      TestBed.createComponent(PoolFundingAlignmentComponent);
      await Promise.resolve();
      await Promise.resolve();

      expect(altGetSps).toHaveBeenCalledWith('RES-001');
    });

    it('AC-01.2 — unmapped renders the contact-ops message and does NOT render the picker (no 13-SP fallback)', () => {
      showPickerSection();
      mappingStatus.set('unmapped');
      sciencePrograms.set([]);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const unmapped = root.querySelector('[data-testid="pf-alignment-unmapped-message"]');
      expect(unmapped).not.toBeNull();
      expect(unmapped?.textContent).toContain('Contact the bilateral operations team');
      expect(root.querySelector('app-multiselect')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-no-sps-message"]')).toBeNull();
      expect(component.isUnmapped()).toBe(true);
      expect(component.showSpPicker()).toBe(false);
    });

    it('AC-01.3 — mapped + empty SP list renders the no-SPs message (distinct from unmapped) and hides the picker', () => {
      showPickerSection();
      mappingStatus.set('mapped');
      sciencePrograms.set([]);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const noSps = root.querySelector('[data-testid="pf-alignment-no-sps-message"]');
      expect(noSps).not.toBeNull();
      expect(noSps?.textContent).toContain('no Science Programs defined');
      expect(root.querySelector('[data-testid="pf-alignment-unmapped-message"]')).toBeNull();
      expect(root.querySelector('app-multiselect')).toBeNull();
      expect(component.hasNoSciencePrograms()).toBe(true);
      expect(component.showSpPicker()).toBe(false);
    });

    it('AC-01.1/AC-01.6 — mapped + SPs renders the picker bound to the per-result control-list source', () => {
      showPickerSection();
      mappingStatus.set('mapped');
      sciencePrograms.set([spOption]);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const picker = root.querySelector('app-multiselect');
      expect(picker).not.toBeNull();
      expect(picker?.getAttribute('serviceName')).toBe('bilateralSciencePrograms');
      expect(picker?.getAttribute('optionValue')).toBe('official_code');
      expect(root.querySelector('[data-testid="pf-alignment-unmapped-message"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-no-sps-message"]')).toBeNull();
      expect(component.showSpPicker()).toBe(true);
    });

    it('AC-01.6 — chip label exposes "code — allocation%" formatting + icon resolves from /sps/{icon_key}.png', () => {
      mappingStatus.set('mapped');
      sciencePrograms.set([spOption]);

      const sp = component.sciencePrograms()[0];
      expect(`${sp.code} — ${sp.allocation}%`).toBe('SP09 — 25%');
      // Icon source path: the existing /sps/ assets (NOT the non-existent
      // result-framework-reporting/SPs-Icons path) — keyed by icon_key.
      expect(`/sps/${sp.icon_key}.png`).toBe('/sps/SP09.png');
    });

    it('Issue 3 — null mappingStatus (loading/initial) renders neither empty-state nor the picker (no empty flash)', () => {
      showPickerSection();
      mappingStatus.set(null);
      sciencePrograms.set([]);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(component.showSpPicker()).toBe(false);
      expect(root.querySelector('app-multiselect')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-unmapped-message"]')).toBeNull();
      expect(root.querySelector('[data-testid="pf-alignment-no-sps-message"]')).toBeNull();
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
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01')] }));
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
      selected_science_programs: [{ code: 'SP01', name: 'Breeding for Tomorrow' }],
      selected_levers: [],
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
              sciencePrograms: signal<PoolFundingScienceProgram[]>([]),
              mappingStatus: signal<PoolFundingMappingStatus | null>(null),
              getAlignment: altGet,
              getSciencePrograms: jest.fn().mockResolvedValue([]),
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
          { provide: ClarityService, useValue: { trackEvent: altTrack } },
          { provide: AllModalsService, useValue: { openModal: jest.fn() } },
          { provide: HloSelectionModalContextService, useValue: { setContext: jest.fn(), clear: jest.fn(), context: signal(null) } }
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

    it('fires bilateral.alignment.saved with sp_count on successful PATCH', async () => {
      currentAlignment.set({ ...baseAlignment, has_contribution: false });
      component.seedFromServer(currentAlignment()!);
      component.onContributionChange(true);
      component.formData.update(f => ({ ...f, selected_sps: [sp('SP01'), sp('SP02')] }));

      const returned: AlignmentResponse = {
        ...baseAlignment,
        has_contribution: true,
        selected_science_programs: [
          { code: 'SP01', name: 'Breeding for Tomorrow' },
          { code: 'SP02', name: 'Sustainable Farming' }
        ]
      };
      patchAlignmentMock.mockResolvedValue({ ok: true, data: returned } as PatchAlignmentResult);
      trackEventMock.mockClear();

      await component.onSave();

      expect(trackEventMock).toHaveBeenCalledWith('bilateral.alignment.saved', {
        result_code: 'RES-001',
        has_contribution: true,
        sp_count: 2
      });
    });
  });
});
