import { Component, OnInit, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { ResultsCenterService } from '@pages/platform/pages/results-center/results-center.service';
import { Result } from '@shared/interfaces/result/result.interface';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';
import { FiltersActionButtonsComponent } from '@shared/components/filters-action-buttons/filters-action-buttons.component';
import { SearchExportControlsComponent } from '@shared/components/search-export-controls/search-export-controls.component';
import { PLATFORM_COLOR_MAP } from '@shared/constants/platform-colors';
import { CacheService } from '@shared/services/cache/cache.service';
import { ApiService } from '@shared/services/api.service';
import { LinkResultsResponse } from '@shared/interfaces/link-results.interface';
import { ActionsService } from '@shared/services/actions.service';

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
    SearchExportControlsComponent
  ],
  templateUrl: './select-linked-results-modal.component.html'
})
export class SelectLinkedResultsModalComponent implements OnInit {
  allModalsService = inject(AllModalsService);
  resultsCenterService = inject(ResultsCenterService);
  cacheService = inject(CacheService);
  apiService = inject(ApiService);
  actions = inject(ActionsService);

  @ViewChild('dt2') dt2!: Table;

  selectedResults = signal<Result[]>([]);
  searchInput = signal('');
  saving = signal(false);

  selectedCount = computed(() => this.selectedResults().length);

  onSearchInputChange = effect(() => {
    const searchValue = this.searchInput();
    if (this.dt2) {
      this.dt2.filterGlobal(searchValue, 'contains');
    }
  });

  ngOnInit(): void {
    void this.initialize();
  }

  setSearchInputFilter($event: Event) {
    this.searchInput.set(($event.target as HTMLInputElement).value);
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
        other_result_id: Number(result.result_official_code)
      }))
    };

    const resultId = this.cacheService.getCurrentNumericResultId();

    this.saving.set(true);
    try {
      await this.apiService.PATCH_LinkedResults(resultId, payload);
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

  getScrollHeight = computed(
    () => `calc(100vh - ${this.cacheService.headerHeight() + this.cacheService.navbarHeight() + 400}px)`
  );

  private async ensureResultsListLoaded(): Promise<void> {
    if (this.resultsCenterService.list().length === 0) {
      await this.resultsCenterService.main();
    }
  }

  private async initialize(): Promise<void> {
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
      const matched = availableResults.filter(result => codes.includes(String(result.result_official_code)));
      this.selectedResults.set(matched);
    } catch (error) {
      console.error('Error loading linked results', error);
    }
  }
}

