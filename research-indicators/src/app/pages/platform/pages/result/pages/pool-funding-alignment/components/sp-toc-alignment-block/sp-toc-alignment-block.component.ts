import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select, SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import {
  SpAlignmentDraft,
  TocCatalogIndicator,
  TocCatalogResult,
  TocCatalogSp,
  TocLevel
} from '@interfaces/bilateral/pool-funding-alignment.interface';

/**
 * Minimal SP shape this block needs. Mirrors the page's local
 * `SelectedScienceProgram` view-model but is owned here so the pure block never
 * imports from the page component (T-BIL-TM2-03 scope boundary).
 */
export interface SpTocBlockScienceProgram {
  official_code: string;
  name?: string;
  category?: string | null;
  color?: string | null;
}

/** Plain dropdown option (label/value pairs fed to raw `p-select`). */
interface SelectOption<T> {
  label: string;
  value: T;
}

/** HLO option carries the AOW prefix separately so the template can bold it. */
interface HloSelectOption {
  value: number;
  aowCode: string | null;
  title: string;
}

/**
 * Per-SP ToC alignment cascade block (Level → HLO → Indicator → Contribution).
 *
 * PURE presentational component: it renders one SP's alignment from its inputs
 * and emits a brand-new `SpAlignmentDraft` on every user change (cascade resets
 * applied here). It NEVER mutates the `draft` input or its nested fields — the
 * hosting page (T-BIL-TM2-04) owns the draft array and reconciliation.
 *
 * D-8a: uses raw PrimeNG `p-select`/`p-radiobutton` (not the wrapped
 * `custom-fields/*`) because the wrapped fields source options only from a
 * registered ControlListService and can't take in-memory cascade options.
 *
 * @sdd-spec docs/specs/bilateral-module/toc-mapping-v2 (T-BIL-TM2-03)
 */
@Component({
  selector: 'app-sp-toc-alignment-block',
  standalone: true,
  imports: [FormsModule, SelectModule, RadioButtonModule, InputNumberModule],
  templateUrl: './sp-toc-alignment-block.component.html',
  styleUrl: './sp-toc-alignment-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpTocAlignmentBlockComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  // --- Inputs (signal inputs) -------------------------------------------------
  readonly sp = input.required<SpTocBlockScienceProgram>();
  readonly catalog = input<TocCatalogSp | null>(null);
  readonly allowedLevels = input<TocLevel[]>([]);
  readonly draft = input.required<SpAlignmentDraft>();
  readonly disabled = input<boolean>(false);
  readonly inlineErrors = input<Record<string, string> | null>(null);
  readonly catalogState = input<'loading' | 'ready' | 'error'>('ready');

  // --- Outputs ----------------------------------------------------------------
  readonly draftChange = output<SpAlignmentDraft>();
  readonly retryCatalog = output<void>();

  // --- Static copy / label maps ----------------------------------------------
  /** §4.7 — Level key → display label. Single map, trivially revisable (OQ-3). */
  private static readonly LEVEL_LABELS: Record<TocLevel, string> = {
    OUTPUT: 'High Level Output',
    OUTCOME: 'Intermediate Outcome',
    EOI: '2030 Outcome'
  };

  readonly ALIGN_QUESTION = "Does this result align with the Program's TOC indicators?";
  readonly LEVEL_LABEL = 'Level';
  readonly INDICATOR_LABEL = 'Indicator';
  readonly CONTRIBUTION_LABEL = 'Quantitative contribution';
  readonly UNIT_LABEL = 'Unit of measurement';
  readonly TARGET_LABEL = 'Target';
  readonly EMPTY_HLO_MESSAGE = 'No Theory of Change results are available for this Science Program at the selected level.';
  readonly EMPTY_INDICATOR_MESSAGE = 'No indicators are available for the selected result in the Theory of Change catalog.';
  readonly LOADING_MESSAGE = 'Loading the Theory of Change catalog…';
  readonly CATALOG_ERROR_MESSAGE = "We couldn't load the Theory of Change catalog for this Science Program.";
  readonly RETRY_LABEL = 'Retry';
  /** AC-07.3 — callout wording uses the active reporting year (2026), not 2025. */
  readonly CONTRIBUTION_CALLOUT =
    'Enter this result’s quantitative contribution toward the selected indicator’s 2026 target. Use the indicator’s unit of measurement.';

  /** Dropdown panel height — long HLO/indicator labels scroll inside the panel. */
  readonly SELECT_SCROLL_HEIGHT = '280px';

  /** Measured trigger width (px) so the body-appended overlay matches the field. */
  private readonly selectPanelWidthPx = signal<number | null>(null);

  // --- Derived view state -----------------------------------------------------
  /** Stable, unique-ish id fragment for label/control wiring. */
  readonly spCode = computed(() => this.sp().official_code);

  /** True when the per-SP question is answered "Yes" (cascade visible). */
  readonly alignsYes = computed(() => this.draft().aligns_with_toc === true);

  /** HLO/level field label follows the selected level (§4.7); defaults generic. */
  readonly hloFieldLabel = computed(() => {
    const level = this.draft().level;
    return level ? SpTocAlignmentBlockComponent.LEVEL_LABELS[level] : 'High Level Output';
  });

  /** Level options from the server-owned allowedLevels, labeled per §4.7. */
  readonly levelOptions = computed<SelectOption<TocLevel>[]>(() =>
    this.allowedLevels().map(level => ({ label: SpTocAlignmentBlockComponent.LEVEL_LABELS[level], value: level }))
  );

  /** The catalog results for the currently selected level (or []). */
  private readonly tocResultsForLevel = computed<TocCatalogResult[]>(() => {
    const level = this.draft().level;
    const cat = this.catalog();
    if (!level || !cat) return [];
    return cat.levels.find(group => group.level === level)?.toc_results ?? [];
  });

  /** HLO options at the selected level. Title-only when `aow_code === null` (EOI). */
  readonly hloOptions = computed<HloSelectOption[]>(() =>
    this.tocResultsForLevel().map(result => ({
      value: result.toc_result_id,
      aowCode: result.aow_code,
      title: result.title
    }))
  );

  /** True when a level is chosen but the (SP, level) pair yields no results. */
  readonly showEmptyHlo = computed(() => !!this.draft().level && this.tocResultsForLevel().length === 0);

  /** The selected HLO (toc_result) from the catalog, if resolvable. */
  private readonly selectedTocResult = computed<TocCatalogResult | null>(() => {
    const id = this.normalizeNumericId(this.draft().toc_result_id);
    if (id == null) return null;
    return this.tocResultsForLevel().find(result => this.normalizeNumericId(result.toc_result_id) === id) ?? null;
  });

  /**
   * Indicator options for the chosen HLO — UNFILTERED (D-5). `type_value` is
   * retained on the catalog item for a future type filter but is not applied.
   */
  readonly indicatorOptions = computed<SelectOption<number>[]>(() =>
    (this.selectedTocResult()?.indicators ?? []).map(indicator => ({
      label: indicator.indicator_description?.trim() || '—',
      value: indicator.indicator_id
    }))
  );

  /** True when an HLO is chosen but its catalog row carries no indicators. */
  readonly showEmptyIndicators = computed(
    () => this.normalizeNumericId(this.draft().toc_result_id) != null && this.indicatorOptions().length === 0
  );

  /** The selected indicator — drives the contribution panel reveal (AC-06.2). */
  readonly selectedIndicator = computed<TocCatalogIndicator | null>(() => {
    const id = this.normalizeNumericId(this.draft().indicator_id);
    if (id == null) return null;
    return (
      this.selectedTocResult()?.indicators.find(
        indicator => this.normalizeNumericId(indicator.indicator_id) === id
      ) ?? null
    );
  });

  // --- Emission helpers (cascade resets applied; inputs never mutated) --------
  private emit(patch: Partial<SpAlignmentDraft>): void {
    // Always build a brand-new object from the current input draft — no mutation.
    this.draftChange.emit({ ...this.draft(), ...patch });
  }

  onAlignsChange(value: boolean): void {
    // "No" hides the cascade and nulls all downstream fields (AC-03.2).
    if (value === false) {
      this.emit({
        aligns_with_toc: false,
        level: null,
        toc_result_id: null,
        indicator_id: null,
        quantitative_contribution: null
      });
      return;
    }
    this.emit({ aligns_with_toc: true });
  }

  onLevelChange(level: TocLevel | null): void {
    // Changing level resets HLO + indicator + contribution (AC-04.4).
    this.emit({ level, toc_result_id: null, indicator_id: null, quantitative_contribution: null });
  }

  onHloChange(tocResultId: number | string | null): void {
    // Changing HLO resets indicator + contribution (AC-05.3).
    this.emit({ toc_result_id: this.normalizeNumericId(tocResultId), indicator_id: null, quantitative_contribution: null });
  }

  onIndicatorChange(indicatorId: number | string | null): void {
    // New indicator clears any stale contribution so the panel re-prompts.
    this.emit({ indicator_id: this.normalizeNumericId(indicatorId), quantitative_contribution: null });
  }

  onContributionChange(value: number | null): void {
    // Guard against negatives at the emit boundary (AC-07.2; UI also clamps).
    const normalized = value != null && value < 0 ? 0 : value;
    this.emit({ quantitative_contribution: normalized });
  }

  onRetry(): void {
    this.retryCatalog.emit();
  }

  /** PrimeNG may emit numeric ids as strings — normalize before catalog lookups. */
  private normalizeNumericId(value: unknown): number | null {
    if (value == null || value === '') return null;
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  /** Overlay width tracks the trigger; capped so it never spills past the viewport. */
  selectPanelStyle(): Record<string, string> {
    const measured = this.selectPanelWidthPx();
    const base: Record<string, string> = { boxSizing: 'border-box' };
    if (measured == null || measured <= 0) {
      return { ...base, maxWidth: 'min(40rem, calc(100vw - 2rem))' };
    }
    const capped = Math.min(measured, window.innerWidth - 32);
    return {
      ...base,
      width: `${capped}px`,
      maxWidth: `${capped}px`,
      minWidth: `${capped}px`
    };
  }

  onSelectPanelShow(select: Select, trigger: HTMLElement): void {
    const width = Math.round(trigger.getBoundingClientRect().width);
    if (width <= 0) {
      return;
    }
    this.selectPanelWidthPx.set(width);
    this.cdr.markForCheck();
    setTimeout(() => select.overlayViewChild?.alignOverlay());
  }
}
