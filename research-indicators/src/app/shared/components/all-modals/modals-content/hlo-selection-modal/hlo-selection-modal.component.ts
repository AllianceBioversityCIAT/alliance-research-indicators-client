import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { AllModalsService } from '@services/cache/all-modals.service';
import { BilateralService } from '@services/bilateral.service';
import { HloSelectionModalContextService } from '@services/cache/hlo-selection-modal-context.service';
import { BilateralHlosPair, HloKeyString, IndicatorRow } from '@interfaces/bilateral/pool-funding-alignment.interface';

// @sdd-spec docs/specs/bilateral-module/indicator-mapping (T-BIL-IM-05)

/** Stable compound key identifying a sidebar AOW entry. */
type AowKey = string; // `${program}|${area_of_work}`

/** AOW entry derived from a BilateralHlosPair. */
interface SidebarAowEntry {
  aowKey: AowKey;
  program: string;
  area_of_work: string;
}

/** SP group for sidebar rendering. */
interface SidebarSpGroup {
  program: string;
  aows: SidebarAowEntry[];
}

@Component({
  selector: 'app-hlo-selection-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule,
    BadgeModule,
    TooltipModule,
    SkeletonModule
  ],
  templateUrl: './hlo-selection-modal.component.html',
  styleUrl: './hlo-selection-modal.component.scss'
})
export class HloSelectionModalComponent implements OnDestroy {
  readonly allModalsService = inject(AllModalsService);
  readonly bilateralService = inject(BilateralService);
  readonly hloSelectionModalContextService = inject(HloSelectionModalContextService);

  // --- Component-local signals -------------------------------------------------

  /** Currently active sidebar AOW key. Null while nothing is selected yet. */
  readonly activeAowKey = signal<AowKey | null>(null);

  /** Set of expanded SP program codes. Signal so OnPush picks up changes. */
  readonly expandedSps = signal<Set<string>>(new Set());

  /** Local search input value (synced to bilateralService.indicatorSearch via effect). */
  readonly searchInput = signal('');

  /** Debounce timer id for the search input. */
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  // --- Sidebar model (computed) ------------------------------------------------

  /** Build the SP → AOW tree from the raw hlosIndicators response. */
  readonly sidebarGroups = computed<SidebarSpGroup[]>(() => {
    const hlos = this.bilateralService.hlosIndicators();
    if (!hlos || hlos.pairs.length === 0) return [];

    const groupsMap = new Map<string, SidebarSpGroup>();
    for (const pair of hlos.pairs) {
      let group = groupsMap.get(pair.program);
      if (!group) {
        group = { program: pair.program, aows: [] };
        groupsMap.set(pair.program, group);
      }
      const aowKey: AowKey = `${pair.program}|${pair.area_of_work}`;
      if (!group.aows.some(a => a.aowKey === aowKey)) {
        group.aows.push({
          aowKey,
          program: pair.program,
          area_of_work: pair.area_of_work
        });
      }
    }
    return Array.from(groupsMap.values());
  });

  /** True if a given SP group is expanded. */
  isSpExpanded(program: string): boolean {
    return this.expandedSps().has(program);
  }

  /** Selection count badge value per AOW key. */
  readonly selectionCountByAow = computed<Map<AowKey, number>>(() => {
    const selection = this.bilateralService.hloModalSelection();
    const counts = new Map<AowKey, number>();
    for (const key of selection) {
      const parts = key.split('|');
      const aowKey: AowKey = `${parts[0]}|${parts[1]}`;
      counts.set(aowKey, (counts.get(aowKey) ?? 0) + 1);
    }
    return counts;
  });

  /** Total selection count (footer counter). */
  readonly selectionCount = computed<number>(() => this.bilateralService.hloModalSelection().size);

  /** Rows visible in the main pane: filtered to the active AOW + search. */
  readonly visibleRows = computed<IndicatorRow[]>(() => {
    const activeKey = this.activeAowKey();
    if (!activeKey) return [];
    const parts = activeKey.split('|');
    const program = parts[0];
    const area_of_work = parts[1];
    const rows = this.bilateralService.indicatorRows();
    const search = this.bilateralService.indicatorSearch().toLowerCase().trim();
    return rows
      .filter(r => r.program === program && r.area_of_work === area_of_work)
      .filter(r => !search || r.indicator_name.toLowerCase().includes(search));
  });

  /** The active AOW's full indicator list (no search filter — for empty-aow state). */
  private readonly activeAowAllRows = computed<IndicatorRow[]>(() => {
    const activeKey = this.activeAowKey();
    if (!activeKey) return [];
    const parts = activeKey.split('|');
    return this.bilateralService.indicatorRows().filter(r => r.program === parts[0] && r.area_of_work === parts[1]);
  });

  // --- Empty-state helpers (derived from aow_status) ---------------------------

  readonly isUnmapped = computed<boolean>(() => this.bilateralService.hlosIndicators()?.aow_status === 'unmapped');
  readonly isNoAowMappings = computed<boolean>(() => this.bilateralService.hlosIndicators()?.aow_status === 'no_aow_mappings');
  readonly isPairsEmpty = computed<boolean>(() => {
    const hlos = this.bilateralService.hlosIndicators();
    return hlos !== null && hlos.pairs.length === 0;
  });
  readonly isActiveAowEmpty = computed<boolean>(
    () => !this.isUnmapped() && !this.isPairsEmpty() && this.activeAowAllRows().length === 0 && this.activeAowKey() !== null
  );
  readonly isSearchEmpty = computed<boolean>(
    () =>
      !this.isUnmapped() &&
      !this.isPairsEmpty() &&
      !this.isActiveAowEmpty() &&
      this.bilateralService.indicatorSearch().trim().length > 0 &&
      this.visibleRows().length === 0
  );

  // --- Lifecycle (watcher for modal open) --------------------------------------

  private readonly modalVisibilityWatcher = effect(
    () => {
      const cfg = this.allModalsService.isModalOpen('hloSelection');
      if (cfg?.isOpen) {
        void this.onModalOpened();
      }
    }
  );

  private async onModalOpened(): Promise<void> {
    const context = this.hloSelectionModalContextService.context();
    if (context?.resultCode && !this.bilateralService.hlosIndicators()) {
      await this.bilateralService.getHlosIndicators(context.resultCode);
    }
    // Seed modal selection from current pending mappings (T-BIL-IM-07 seeds here)
    this.bilateralService.loadModalSelection();

    // Auto-expand first SP and set the first AOW as active
    const groups = this.sidebarGroups();
    if (groups.length > 0) {
      const firstSp = groups[0];
      this.expandedSps.update(set => new Set([...set, firstSp.program]));
      if (firstSp.aows.length > 0) {
        this.activeAowKey.set(firstSp.aows[0].aowKey);
      }
    }
  }

  ngOnDestroy(): void {
    this.modalVisibilityWatcher.destroy();
    if (this.searchDebounceTimer !== null) {
      clearTimeout(this.searchDebounceTimer);
    }
  }

  // --- Sidebar interactions ----------------------------------------------------

  toggleSpExpanded(program: string): void {
    this.expandedSps.update(set => {
      const next = new Set(set);
      if (next.has(program)) {
        next.delete(program);
      } else {
        next.add(program);
      }
      return next;
    });
  }

  setActiveAow(aowKey: AowKey, program: string): void {
    this.expandedSps.update(set => new Set([...set, program]));
    this.activeAowKey.set(aowKey);
    // Clear search when switching AOW
    this.searchInput.set('');
    this.bilateralService.indicatorSearch.set('');
  }

  // --- Search ------------------------------------------------------------------

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput.set(value);
    if (this.searchDebounceTimer !== null) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.bilateralService.indicatorSearch.set(value);
    }, 300);
  }

  // --- Row selection -----------------------------------------------------------

  isRowSelected(row: IndicatorRow): boolean {
    return this.bilateralService.hloModalSelection().has(this.rowKey(row));
  }

  toggleRowSelection(row: IndicatorRow): void {
    if (row.disabled_reason) return;
    const key = this.rowKey(row);
    this.bilateralService.hloModalSelection.update(set => {
      const next = new Set(set);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  private rowKey(row: IndicatorRow): HloKeyString {
    return `${row.program}|${row.area_of_work}|${String(row.indicator_id)}`;
  }

  // --- Badge helpers -----------------------------------------------------------

  getAowBadgeCount(aowKey: AowKey): number {
    return this.selectionCountByAow().get(aowKey) ?? 0;
  }

  getAowBadgeLabel(aowEntry: SidebarAowEntry): string {
    const count = this.getAowBadgeCount(aowEntry.aowKey);
    const label = aowEntry.area_of_work || aowEntry.program;
    return `${count} indicators selected in ${label}`;
  }

  getPairForAow(aowKey: AowKey): BilateralHlosPair | undefined {
    const parts = aowKey.split('|');
    return this.bilateralService.hlosIndicators()?.pairs.find(p => p.program === parts[0] && p.area_of_work === parts[1]);
  }

  // --- Footer actions ----------------------------------------------------------

  /** Confirm: commit selection and close modal. */
  confirm(): void {
    this.bilateralService.commitModalSelection();
    this.close();
  }

  /** Cancel: close modal without committing (seed/discard T-BIL-IM-07 is a separate task). */
  cancel(): void {
    this.close();
  }

  private close(): void {
    this.bilateralService.indicatorSearch.set('');
    this.searchInput.set('');
    this.activeAowKey.set(null);
    this.expandedSps.set(new Set());
    this.allModalsService.closeModal('hloSelection');
    this.hloSelectionModalContextService.clear();
  }

  // --- Active breadcrumb helpers -----------------------------------------------

  getActiveProgramLabel(): string {
    const key = this.activeAowKey();
    if (!key) return '';
    return key.split('|')[0];
  }

  getActiveAowLabel(): string {
    const key = this.activeAowKey();
    if (!key) return '';
    return key.split('|')[1];
  }

  /** Returns true when the Confirm button should be disabled. */
  readonly isConfirmDisabled = computed<boolean>(
    () => this.isUnmapped() || this.isPairsEmpty() || this.bilateralService.loadingHlos()
  );
}
