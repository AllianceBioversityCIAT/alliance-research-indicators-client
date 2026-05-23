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
import {
  AlignmentChangedEvent,
  AlignmentResponse,
  UpdatePoolFundingAlignmentDto
} from '@interfaces/bilateral/pool-funding-alignment.interface';

interface AlignmentFormData {
  has_contribution: boolean | null;
  lever_ids: number[];
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
    CustomTagComponent
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
  private readonly destroyRef = inject(DestroyRef);

  readonly loadFailed = signal(false);
  readonly inlineErrors = signal<Record<string, string> | null>(null);

  readonly SYNCED_BANNER = 'This result has been pushed to PRMS. Alignment can no longer be edited from STAR.';
  readonly READ_ONLY_BANNER = "You don't have permission to edit this section.";
  readonly SYNCED_BADGE_LABEL = 'Synced — read only';
  readonly SYNCED_BADGE_ARIA_LABEL = 'Pool Funding Alignment is synced and read only';
  readonly INFO_BANNER = 'Select the High-Level Outputs (HLO) and related indicators this result contributes to.';
  readonly CONTRIBUTION_QUESTION = 'Does this result contribute to a Science Program or Accelerator?';

  readonly alignment = this.bilateralService.currentAlignment;
  readonly loading = this.bilateralService.loadingAlignment;
  readonly saving = this.bilateralService.savingAlignment;
  readonly editable = this.bilateralService.editable;

  readonly isReadOnly = computed(() => !!this.alignment()?.is_read_only);
  readonly eligible = computed(() => !!this.alignment()?.eligible);

  readonly formData = signal<AlignmentFormData>({
    has_contribution: null,
    lever_ids: []
  });

  // AR.1 — alignment edit is NOT gated by result_status.
  readonly canSave = computed(() => {
    const form = this.formData();
    const hasMinimalLevers = form.has_contribution === false || form.lever_ids.length >= 1;
    return this.editable() && !this.isReadOnly() && this.isDirty() && hasMinimalLevers;
  });

  readonly isDirty = computed(() => {
    const alignment = this.alignment();
    if (!alignment) return false;
    const server = this.snapshotFromServer(alignment);
    const form = this.formData();
    return (
      server.has_contribution !== form.has_contribution ||
      !this.sameLeverSet(server.lever_ids, form.lever_ids)
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
      lever_ids: value === false ? [] : form.lever_ids
    }));
  }

  async onSave(): Promise<void> {
    if (!this.canSave()) return;
    this.inlineErrors.set(null);

    const form = this.formData();
    const body: UpdatePoolFundingAlignmentDto = {
      has_contribution: form.has_contribution as boolean,
      ...(form.has_contribution ? { lever_codes: form.lever_ids.map(String) } : {})
    };

    const result = await this.bilateralService.patchAlignment(this.resultCode(), body);

    if (result.ok) {
      this.seedFromServer(result.data);
      this.clarityService?.trackEvent('bilateral.alignment.saved', {
        result_code: result.data.result_code,
        has_contribution: result.data.has_contribution,
        lever_count: result.data.selected_levers.length
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
      await this.bilateralService.getAlignment(this.resultCode());
      this.actions.showToast({
        severity: 'warning',
        summary: 'Synced to PRMS',
        detail: 'This result was synced to PRMS. Your unsaved alignment changes were not applied.'
      });
      return;
    }
    // 5xx — global httpErrorInterceptor owns the toast; form state preserved for retry.
  }

  private snapshotFromServer(alignment: AlignmentResponse): AlignmentFormData {
    return {
      has_contribution: alignment.has_contribution,
      lever_ids: alignment.selected_levers.map(l => Number(l.lever_code)).filter(n => Number.isFinite(n))
    };
  }

  private sameLeverSet(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort((x, y) => x - y);
    const sortedB = [...b].sort((x, y) => x - y);
    return sortedA.every((v, i) => v === sortedB[i]);
  }
}
