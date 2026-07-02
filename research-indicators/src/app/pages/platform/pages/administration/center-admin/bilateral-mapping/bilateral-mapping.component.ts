// @sdd-spec docs/specs/bilateral-module/center-admin-project-mapping (T-BIL-CAM-03)
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { TableModule } from 'primeng/table';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { BilateralMappingService } from '@services/bilateral-mapping.service';
import {
  BilateralMappingListMeta,
  BilateralMappingSource,
  BilateralProjectMapping
} from '@interfaces/bilateral/bilateral-project-mapping.interface';

type ActiveFilter = 'all' | 'active' | 'inactive';

/** Option shape used by p-select in filter dropdowns. */
interface SelectOption<T extends string> {
  label: string;
  value: T;
}

const ACTIVE_OPTIONS: SelectOption<ActiveFilter>[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
];

type SourceFilter = 'all' | BilateralMappingSource;

const SOURCE_OPTIONS: SelectOption<SourceFilter>[] = [
  { label: 'All sources', value: 'all' },
  { label: 'Manual', value: 'MANUAL' },
  { label: 'AI Suggested', value: 'AI_SUGGESTED' },
  { label: 'AI Auto', value: 'AI_AUTO' }
];

@Component({
  selector: 'app-bilateral-mapping',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    TableModule,
    PaginatorModule,
    InputTextModule,
    SelectModule,
    ButtonModule
  ],
  templateUrl: './bilateral-mapping.component.html',
  styleUrl: './bilateral-mapping.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class BilateralMappingComponent implements OnInit, OnDestroy {
  private readonly service = inject(BilateralMappingService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInput$ = new Subject<string>();

  // --- List state ---
  readonly rows = signal<BilateralProjectMapping[]>([]);
  readonly meta = signal<BilateralMappingListMeta | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal(false);

  // --- Filter / pagination state ---
  readonly search = signal('');
  readonly activeFilter = signal<ActiveFilter>('all');
  readonly sourceFilter = signal<SourceFilter>('all');
  readonly page = signal(1);
  readonly limit = signal(20);

  // --- Option lists for filter dropdowns ---
  readonly activeOptions = ACTIVE_OPTIONS;
  readonly sourceOptions = SOURCE_OPTIONS;

  ngOnInit(): void {
    // Debounce the search input stream (AC-04.1)
    this.searchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(term => {
        this.search.set(term);
        this.page.set(1);
        void this.load();
      });

    void this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(false);
    this.rows.set([]);

    const af = this.activeFilter();
    const sf = this.sourceFilter();

    const result = await this.service.list({
      page: this.page(),
      limit: this.limit(),
      ...(this.search().trim() ? { search: this.search().trim() } : {}),
      ...(af !== 'all' ? { is_active: af === 'active' } : {}),
      ...(sf !== 'all' ? { source: sf as BilateralMappingSource } : {})
    });

    // NF-06: always resolve to a terminal state — never leave spinner forever.
    if (result === null) {
      this.loadError.set(true);
    } else {
      this.rows.set(result.items);
      this.meta.set(result.meta);
    }
    this.loading.set(false);
  }

  onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  onActiveFilterChange(value: ActiveFilter): void {
    this.activeFilter.set(value);
    this.page.set(1);
    void this.load();
  }

  onSourceFilterChange(value: SourceFilter): void {
    this.sourceFilter.set(value);
    this.page.set(1);
    void this.load();
  }

  onPageChange(event: PaginatorState): void {
    // PrimeNG paginator is zero-based; backend is 1-based (AC-03.2)
    this.page.set((event.page ?? 0) + 1);
    void this.load();
  }

  /** Returns true when the confidence score column should be shown for a row. */
  showConfidence(row: BilateralProjectMapping): boolean {
    return row.source !== 'MANUAL';
  }

  /** Human-readable source label for display in the table badge. */
  sourceLabel(source: BilateralMappingSource): string {
    switch (source) {
      case 'MANUAL': return 'Manual';
      case 'AI_SUGGESTED': return 'AI Suggested';
      case 'AI_AUTO': return 'AI Auto';
    }
  }
}
