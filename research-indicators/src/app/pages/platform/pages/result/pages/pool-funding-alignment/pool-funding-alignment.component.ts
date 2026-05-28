import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { BilateralService } from '@shared/services/bilateral.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { ActionsService } from '@shared/services/actions.service';
import { ClarityService } from '@shared/services/clarity.service';
import { WebsocketService } from '@sockets/websocket.service';
import { MultiselectComponent } from '@shared/components/custom-fields/multiselect/multiselect.component';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';
import { BilateralActionCardComponent } from '@shared/components/bilateral-action-card/bilateral-action-card.component';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { HloSelectionModalContextService } from '@shared/services/cache/hlo-selection-modal-context.service';
import {
  AlignmentChangedEvent,
  AlignmentResponse,
  UpdatePoolFundingAlignmentDto
} from '@interfaces/bilateral/pool-funding-alignment.interface';

interface SelectedScienceProgram {
  official_code: string;
  name?: string;
  category?: string | null;
  color?: string | null;
}

interface AlignmentFormData {
  has_contribution: boolean | null;
  selected_sps: SelectedScienceProgram[];
}

@Component({
  selector: 'app-pool-funding-alignment',
  imports: [
    FormsModule,
    RadioButtonModule,
    TooltipModule,
    MultiselectComponent,
    FormHeaderComponent,
    NavigationButtonsComponent,
    CustomTagComponent,
    BilateralActionCardComponent
  ],
  templateUrl: './pool-funding-alignment.component.html',
  styleUrl: './pool-funding-alignment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PoolFundingAlignmentComponent {
  private readonly bilateralService = inject(BilateralService);
  private readonly cache = inject(CacheService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly actions = inject(ActionsService);
  // Defensive: if WebsocketService can't be constructed (e.g., SocketIoModule
  // not provided in this environment), the alignment tab should still work —
  // socket reconcile silently degrades to "manual refresh" UX.
  private readonly websocketService: WebsocketService | null = (() => {
    try { return inject(WebsocketService); } catch { return null; }
  })();
  // Same defensive pattern for ClarityService — telemetry must never block UX.
  private readonly clarityService: ClarityService | null = (() => {
    try { return inject(ClarityService); } catch { return null; }
  })();
  private readonly allModals = inject(AllModalsService);
  private readonly hloContext = inject(HloSelectionModalContextService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loadFailed = signal(false);
  readonly inlineErrors = signal<Record<string, string> | null>(null);

  readonly SYNCED_BANNER = 'This result has been pushed to PRMS. Alignment can no longer be edited from STAR.';
  readonly READ_ONLY_BANNER = "You don't have permission to edit this section.";
  readonly SYNCED_BADGE_LABEL = 'Synced — read only';
  readonly SYNCED_BADGE_ARIA_LABEL = 'Pool Funding Alignment is synced and read only';
  // REQ-BIL-ASR-02 — PRMS-sourced read-only differentiation. The result is owned
  // by PRMS (is_read_only && !is_synced_to_prms), distinct from the synced cause.
  readonly PRMS_SOURCED_BADGE_LABEL = 'Owned by PRMS';
  readonly PRMS_SOURCED_BADGE_ARIA_LABEL = 'Pool Funding Alignment is owned by PRMS and read only';
  readonly PRMS_SOURCED_BANNER = 'This result is owned by PRMS. Bilateral alignment is read-only in STAR.';
  // Locked backend 409 description that signals the PRMS-sourced read-only cause.
  readonly PRMS_SOURCED_409_DESCRIPTION = 'Result is PRMS-sourced; bilateral alignment is read-only in STAR';
  readonly INFO_BANNER = 'Select the High-Level Outputs (HLO) and related indicators this result contributes to.';
  readonly CONTRIBUTION_QUESTION = 'Does this result contribute to a Science Program or Accelerator?';
  readonly SP_PICKER_LABEL = 'Select the Science Program(s) this is related to';
  readonly UNMAPPED_SP_MESSAGE =
    "This result isn't linked to a CLARISA project yet. Contact the bilateral operations team to register the project mapping.";
  readonly NO_SP_DEFINED_MESSAGE = 'The linked CLARISA project has no Science Programs defined.';
  readonly HLO_SECTION_LABEL = 'Map HLOs and/or indicators';
  readonly HLO_CARD_TITLE = 'VIEW HIGH LEVEL OUTPUTS';
  readonly HLO_CARD_BODY =
    'Browse and select the High-Level Outputs associated with this result. You can review their details before linking them to ensure proper alignment and reporting accuracy.';
  readonly HLO_CARD_CTA_LABEL = 'Select';

  readonly alignment = this.bilateralService.currentAlignment;
  readonly loading = this.bilateralService.loadingAlignment;
  readonly saving = this.bilateralService.savingAlignment;
  readonly editable = this.bilateralService.editable;

  readonly isReadOnly = computed(() => !!this.alignment()?.is_read_only);
  readonly eligible = computed(() => !!this.alignment()?.eligible);

  // REQ-BIL-ASR-02 — distinguish WHY the section is read-only so the badge + banner
  // copy can differ while inputs stay disabled identically (AC-02.5). `is_read_only`
  // is now a union (R-BIL-071): synced-to-PRMS OR PRMS-sourced.
  readonly isSyncedToPrms = computed(() => !!this.alignment()?.is_synced_to_prms);
  readonly readOnlyCause = computed<'synced' | 'prms-sourced' | 'permission' | null>(() => {
    if (this.isReadOnly()) return this.isSyncedToPrms() ? 'synced' : 'prms-sourced';
    if (!this.editable()) return 'permission';
    return null;
  });

  // Per-result SP picker source + empty-state discriminators (REQ-BIL-ASR-01).
  readonly sciencePrograms = this.bilateralService.sciencePrograms;
  readonly mappingStatus = this.bilateralService.mappingStatus;
  readonly loadingSciencePrograms = this.bilateralService.loadingSciencePrograms;
  // AC-01.2 — unmapped: picker empty + contact-ops message; no 13-SP fallback.
  readonly isUnmapped = computed(() => this.mappingStatus() === 'unmapped');
  // AC-01.3 — mapped but the CLARISA project carries no SPs (distinct message).
  readonly hasNoSciencePrograms = computed(() => this.mappingStatus() === 'mapped' && this.sciencePrograms().length === 0);
  // Single named gate for the picker (used directly in the template). Renders only
  // once the per-result source has resolved (mappingStatus non-null) AND the
  // project is mapped with ≥1 SP. The null guard prevents an empty-picker flash
  // while getSciencePrograms is still in flight.
  readonly showSpPicker = computed(
    () => this.mappingStatus() !== null && !this.isUnmapped() && !this.hasNoSciencePrograms()
  );

  readonly showHloSection = computed(() => {
    const form = this.formData();
    return form.has_contribution === true && form.selected_sps.length >= 1;
  });

  readonly formData = signal<AlignmentFormData>({
    has_contribution: null,
    selected_sps: []
  });

  // AR.1 — alignment edit is NOT gated by result_status.
  readonly canSave = computed(() => {
    const form = this.formData();
    const hasMinimalSelection = form.has_contribution === false || form.selected_sps.length >= 1;
    return this.editable() && !this.isReadOnly() && this.isDirty() && hasMinimalSelection;
  });

  readonly isDirty = computed(() => {
    const alignment = this.alignment();
    if (!alignment) return false;
    const server = this.snapshotFromServer(alignment);
    const form = this.formData();
    return (
      server.has_contribution !== form.has_contribution ||
      !this.sameCodeSet(server.selected_sps.map(sp => sp.official_code), form.selected_sps.map(sp => sp.official_code))
    );
  });

  readonly resultCode = computed(() => {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) return routeId;
    const numeric = this.cache.getCurrentNumericResultId();
    return numeric ? String(numeric) : '';
  });

  constructor() {
    const resultCode = this.resultCode();
    void this.bilateralService.getAlignment(resultCode).then(alignment => {
      if (!alignment) {
        this.loadFailed.set(true);
        return;
      }
      if (alignment.eligible === false) {
        void this.router.navigate(['/result', resultCode, 'general-information'], { replaceUrl: true });
        return;
      }
      this.seedFromServer(alignment);
      // Picker options are per-result (REQ-BIL-ASR-01): only fetch once the
      // alignment confirms the result is eligible. The picker endpoint is only
      // reachable on eligible results (pitfall 4).
      void this.bilateralService.getSciencePrograms(resultCode);
      this.clarityService?.trackEvent('bilateral.alignment.viewed', {
        result_code: alignment.result_code,
        eligible: alignment.eligible,
        has_contribution: alignment.has_contribution,
        is_read_only: alignment.is_read_only
      });
    });

    this.websocketService
      ?.listen('result.pool-funding-alignment.changed')
      .pipe(
        filter((evt): evt is AlignmentChangedEvent =>
          !!evt && typeof evt === 'object' && (evt as AlignmentChangedEvent).result_code === this.resultCode()
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.handleRemoteChange());
  }

  handleRemoteChange(): void {
    if (!this.isDirty()) {
      void this.bilateralService.getAlignment(this.resultCode()).then(alignment => {
        if (alignment) this.seedFromServer(alignment);
      });
      return;
    }
    this.actions.showToast({
      severity: 'info',
      summary: 'Alignment updated',
      detail: 'Another user updated this alignment. Refresh to see the latest.'
    });
  }

  seedFromServer(alignment: AlignmentResponse): void {
    this.formData.set(this.snapshotFromServer(alignment));
  }

  onContributionChange(value: boolean | null): void {
    this.formData.update(form => ({
      ...form,
      has_contribution: value,
      selected_sps: value === false ? [] : form.selected_sps
    }));
  }

  onOpenHloSelector(): void {
    this.hloContext.setContext({ resultCode: this.resultCode() });
    this.allModals.openModal('hloSelection');
    this.clarityService?.trackEvent('bilateral.alignment.hlo_selector_opened', {
      result_code: this.resultCode(),
      sp_count: this.formData().selected_sps.length
    });
  }

  async onSave(): Promise<void> {
    if (!this.canSave()) return;
    this.inlineErrors.set(null);

    const form = this.formData();
    const body: UpdatePoolFundingAlignmentDto = {
      has_contribution: form.has_contribution as boolean,
      ...(form.has_contribution ? { sp_codes: form.selected_sps.map(sp => sp.official_code) } : {})
    };

    const result = await this.bilateralService.patchAlignment(this.resultCode(), body);

    if (result.ok) {
      this.seedFromServer(result.data);
      this.clarityService?.trackEvent('bilateral.alignment.saved', {
        result_code: result.data.result_code,
        has_contribution: result.data.has_contribution,
        sp_count: (result.data.selected_science_programs ?? []).length
      });
      this.actions.showToast({
        severity: 'success',
        summary: 'Pool Funding Alignment',
        detail: 'Saved'
      });
      return;
    }

    if (result.status === 400) {
      this.inlineErrors.set(result.fieldErrors ?? { _global: result.description || 'Validation failed' });
      return;
    }

    if (result.status === 409) {
      // Refetch so the read-only flags refresh — `readOnlyCause` then resolves to
      // the right cause ('prms-sourced' vs 'synced') and the matching banner renders
      // (AC-02.4). Differentiate the toast copy by the locked PRMS-sourced 409 desc.
      await this.bilateralService.getAlignment(this.resultCode());
      const isPrmsSourced = result.description === this.PRMS_SOURCED_409_DESCRIPTION;
      this.actions.showToast(
        isPrmsSourced
          ? {
              severity: 'warning',
              summary: 'Owned by PRMS',
              detail: 'This result is owned by PRMS. Bilateral alignment is read-only in STAR. Your changes were not applied.'
            }
          : {
              severity: 'warning',
              summary: 'Synced to PRMS',
              detail: 'This result was synced to PRMS. Your unsaved alignment changes were not applied.'
            }
      );
      return;
    }
    // 5xx — global httpErrorInterceptor owns the toast; form state preserved for retry.
  }

  private snapshotFromServer(alignment: AlignmentResponse): AlignmentFormData {
    // Prefer the new SP field; fall back to the deprecated lever payload so a
    // response that hasn't migrated yet still seeds something readable. Form
    // state must be objects with `official_code` populated — the multiselect
    // enriches them with name/color from the SP catalog.
    const sps = alignment.selected_science_programs;
    const selected_sps: SelectedScienceProgram[] = sps && sps.length > 0
      ? sps.filter(sp => !!sp.code).map(sp => ({
          official_code: sp.code,
          name: sp.name,
          category: sp.category ?? null,
          color: sp.color ?? null
        }))
      : alignment.selected_levers
          .filter(l => !!l.lever_code)
          .map(l => ({ official_code: l.lever_code, name: l.lever_name }));
    return {
      has_contribution: alignment.has_contribution,
      selected_sps
    };
  }

  private sameCodeSet(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((v, i) => v === sortedB[i]);
  }
}
