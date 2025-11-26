import { Component, OnDestroy, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { ResultsCenterService } from '@pages/platform/pages/results-center/results-center.service';
import { Result, ResultFilter } from '@shared/interfaces/result/result.interface';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';
import { FiltersActionButtonsComponent } from '@shared/components/filters-action-buttons/filters-action-buttons.component';
import { SearchExportControlsComponent } from '@shared/components/search-export-controls/search-export-controls.component';
import { PLATFORM_COLOR_MAP } from '@shared/constants/platform-colors';
import { CacheService } from '@shared/services/cache/cache.service';
import { ApiService } from '@shared/services/api.service';
import { LinkResultsResponse } from '@shared/interfaces/link-results.interface';
import { ActionsService } from '@shared/services/actions.service';
import { SectionSidebarComponent } from '@shared/components/section-sidebar/section-sidebar.component';
import { TableFiltersSidebarComponent } from '@pages/platform/pages/results-center/components/table-filters-sidebar/table-filters-sidebar.component';
import { PLATFORM_CODES } from '@shared/constants/platform-codes';
import { Router, RouterLink, UrlTree } from '@angular/router';

const MODAL_INDICATOR_CODES = [1, 2, 4, 6] as const;

@Component({
  selector: 'app-select-linked-results-modal',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    TagModule,
    CustomTagComponent,
    FiltersActionButtonsComponent,
    SearchExportControlsComponent,
    SectionSidebarComponent,
    TableFiltersSidebarComponent,
    RouterLink
  ],
  templateUrl: './select-linked-results-modal.component.html'
})
export class SelectLinkedResultsModalComponent implements OnDestroy {
  allModalsService = inject(AllModalsService);
  resultsCenterService = inject(ResultsCenterService);
  cacheService = inject(CacheService);
  apiService = inject(ApiService);
  actions = inject(ActionsService);
  private readonly router = inject(Router);

  @ViewChild('dt2') dt2!: Table;

  selectedResults = signal<Result[]>([]);
  searchInput = signal('');
  saving = signal(false);
  private modalWasOpen = false;
  private readonly modalVisibilityWatcher = effect(
    () => {
      const modalConfig = this.allModalsService.isModalOpen('selectLinkedResults');
      const isOpen = modalConfig?.isOpen ?? false;
      if (isOpen && !this.modalWasOpen) {
        void this.onModalOpened();
      }
      if (!isOpen && this.modalWasOpen) {
        this.resetModalFilters();
      }
      this.modalWasOpen = isOpen;
    },
    { allowSignalWrites: true }
  );

  selectedCount = computed(() => this.selectedResults().length);

  onSearchInputChange = effect(() => {
    const searchValue = this.searchInput();
    if (this.dt2) {
      this.dt2.filterGlobal(searchValue, 'contains');
    }
  });

  ngOnDestroy(): void {
    this.modalVisibilityWatcher.destroy();
    this.onSearchInputChange.destroy();
  }

  setSearchInputFilter($event: Event) {
    this.searchInput.set(($event.target as HTMLInputElement).value);
  }

  getResultHref(result: Result): string {
    if (result.platform_code === PLATFORM_CODES.PRMS) {
      this.onResultLinkClick(result);
      return '';
    }
    const resultCode = `${result.platform_code}-${result.result_official_code}`;
    let urlTree: UrlTree;
    if (result.result_status?.result_status_id === 6 && Array.isArray(result.snapshot_years) && result.snapshot_years.length > 0) {
      const latestYear = Math.max(...result.snapshot_years);
      urlTree = this.router.createUrlTree(['/result', resultCode, 'general-information'], {
        queryParams: { version: latestYear }
      });
    } else {
      urlTree = this.router.createUrlTree(['/result', resultCode]);
    }
    return this.router.serializeUrl(urlTree);
  }

  openResult(result: Result) {
    this.resultsCenterService.clearAllFilters();
    if (result.platform_code === PLATFORM_CODES.PRMS || result.platform_code === PLATFORM_CODES.TIP) {
      this.allModalsService.selectedResultForInfo.set(result);
      this.allModalsService.openModal('resultInformation');
      return;
    }
    const href = this.getResultHref(result);
    this.openHrefInNewTab(href);
  }

  openResultByYear(result: number, year: string | number, platformCode: string) {
    if (platformCode === PLATFORM_CODES.PRMS) {
      return;
    }
    this.resultsCenterService.clearAllFilters();
    const resultCode = `${platformCode}-${result}`;
    const tree = this.router.createUrlTree(['/result', resultCode], {
      queryParams: { version: year }
    });
    const href = this.router.serializeUrl(tree);
    this.openHrefInNewTab(href);
  }

  onResultLinkClick(result: Result): void {
    if (result.platform_code === PLATFORM_CODES.TIP || result.platform_code === PLATFORM_CODES.PRMS) {
      this.allModalsService.selectedResultForInfo.set(result);
      this.allModalsService.openModal('resultInformation');
    }
  }

  private openHrefInNewTab(href: string): void {
    if (!href) {
      return;
    }
    const baseOrigin = globalThis.location?.origin ?? '';
    const absoluteUrl = href.startsWith('http') ? href : new URL(href, baseOrigin).toString();
    globalThis.open?.(absoluteUrl, '_blank', 'noopener');
  }

  formatResultCode(code: string | number): string {
    if (!code) return String(code || '');
    return String(code).padStart(3, '0');
  }

  getPlatformColors(platformCode: string): { text: string; background: string } | undefined {
    return PLATFORM_COLOR_MAP[platformCode];
  }

  isSelected(result: Result): boolean {
    return this.selectedResults().some(r => r.result_id === result.result_id);
  }

  toggleSelection(result: Result) {
    const current = this.selectedResults();
    const index = current.findIndex(r => r.result_id === result.result_id);
    
    if (index >= 0) {
      this.selectedResults.set(current.filter(r => r.result_id !== result.result_id));
    } else {
      this.selectedResults.set([...current, result]);
    }
  }

  cancel() {
    this.allModalsService.closeModal('selectLinkedResults');
    this.selectedResults.set([]);
    this.saving.set(false);
  }

  async saveSelection(): Promise<void> {
    const selected = this.selectedResults();
    if (selected.length === 0) return;

    const payload: LinkResultsResponse = {
      link_results: selected.map(result => ({
        other_result_id: Number(result.result_id)
      }))
    };

    const resultId = this.cacheService.getCurrentNumericResultId();

    this.saving.set(true);
    try {
      await this.apiService.PATCH_LinkedResults(resultId, payload);
      await this.allModalsService.refreshLinkedResults?.();
      this.actions.showToast({
        severity: 'success',
        summary: 'Linked results',
        detail: 'Results linked successfully'
      });
      this.selectedResults.set([]);
      this.allModalsService.closeModal('selectLinkedResults');
    } catch (error) {
      this.actions.showToast({
        severity: 'error',
        summary: 'Linked results',
        detail: 'Unable to link results, please try again'
      });
      console.error(error);
    } finally {
      this.saving.set(false);
    }
  }
  

  showFiltersSidebar() {
    this.resultsCenterService.showFiltersSidebar.set(true);
  }

  clearFilters(): void {
    this.resultsCenterService.clearAllFiltersWithPreserve([...MODAL_INDICATOR_CODES]);
    this.applyModalIndicatorFilter({ resetIndicatorFilters: true });
    void this.loadResultsForModal();
  }

  getScrollHeight = computed(
    () => `calc(100vh - ${this.cacheService.headerHeight() + this.cacheService.navbarHeight() + 400}px)`
  );

  private async onModalOpened(): Promise<void> {
    this.applyModalIndicatorFilter({ resetIndicatorFilters: true });
    await this.ensureResultsListLoaded();
    await this.loadExistingLinkedResults();
  }

  private async loadExistingLinkedResults(): Promise<void> {
    const resultId = this.cacheService.getCurrentNumericResultId();
    try {
      const response = await this.apiService.GET_LinkedResults(resultId);
      const codes = response.data?.link_results?.map(item => String(item.other_result_id)) ?? [];
      if (codes.length === 0) {
        this.selectedResults.set([]);
        return;
      }

      const availableResults = this.resultsCenterService.list();
      const matched = availableResults.filter(result => codes.includes(String(result.result_id)));
      this.selectedResults.set(matched);
    } catch (error) {
      console.error('Error loading linked results', error);
    }
  }

  private async ensureResultsListLoaded(): Promise<void> {
    if (this.resultsCenterService.list().length === 0) {
      await this.loadResultsForModal();
    }
  }

  private async loadResultsForModal(): Promise<void> {
    try {
      this.resultsCenterService.list.set([]);
      this.resultsCenterService.loading.set(true);

      await this.resultsCenterService.main();
    } catch (error) {
      console.error('Error loading results for modal', error);
      this.resultsCenterService.list.set([]);
    } finally {
      this.resultsCenterService.loading.set(false);
    }
  }

  private applyModalIndicatorFilter(options: { resetIndicatorFilters?: boolean; tabsOverride?: readonly number[] } = {}): void {

    const { resetIndicatorFilters = false, tabsOverride } = options;
    const hasActiveIndicatorFilter =
      (this.resultsCenterService.tableFilters().indicators?.length ?? 0) > 0 ||
      (this.resultsCenterService.resultsFilter()['indicator-codes-filter']?.length ?? 0) > 0;

    let tabs: number[];
    if (Array.isArray(tabsOverride)) {
      tabs = [...tabsOverride];
    } else if (resetIndicatorFilters || !hasActiveIndicatorFilter) {
      tabs = [...MODAL_INDICATOR_CODES];
    } else {
      tabs = [];
    }

    const setIndicators = (prev: ResultFilter) => ({
      ...prev,
      'indicator-codes-tabs': tabs,
      'indicator-codes-filter': resetIndicatorFilters ? [] : prev['indicator-codes-filter'] ?? []
    });

    this.resultsCenterService.resultsFilter.update(prev => setIndicators(prev));
    this.resultsCenterService.appliedFilters.update(prev => setIndicators(prev));
  }

  private resetModalFilters(): void {
    this.resultsCenterService.showFiltersSidebar.set(false);
    this.selectedResults.set([]);
    this.searchInput.set('');
    this.clearFilters();
  }

  onFiltersConfirm(): void {
    const filters = this.resultsCenterService.tableFilters();

    const updater = (prev: ResultFilter) => ({
      ...prev,
      'lever-codes': filters.levers.map(lever => lever.id),
      'status-codes': filters.statusCodes.map(status => status.result_status_id),
      years: filters.years.map(year => year.id),
      'contract-codes': filters.contracts.map(contract => contract.agreement_id),
      'indicator-codes-filter': filters.indicators.map(indicator => indicator.indicator_id)
    });

    this.resultsCenterService.resultsFilter.update(updater);
    this.resultsCenterService.appliedFilters.update(updater);

    const shouldUseDefaultIndicatorTabs = filters.indicators.length === 0;

    this.applyModalIndicatorFilter({
      tabsOverride: shouldUseDefaultIndicatorTabs ? [...MODAL_INDICATOR_CODES] : []
    });
    void this.loadResultsForModal();
  }
}

