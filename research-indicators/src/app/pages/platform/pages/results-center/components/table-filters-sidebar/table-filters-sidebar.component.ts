import { Component, effect, inject, Input, output, signal, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { ResultsCenterService } from '../../results-center.service';
import { TooltipModule } from 'primeng/tooltip';
import { getContractStatusClasses } from '@shared/constants/status-classes.constants';
import { PlatformSourceFilter } from '@shared/interfaces/platform-source-filter.interface';
import { S3ImageUrlPipe } from '@shared/pipes/s3-image-url.pipe';
import { SOURCE_FILTER_OPTIONS } from '@shared/constants/source-filter-options.constants';

@Component({
  selector: 'app-table-filters-sidebar',
  imports: [FormsModule, MultiSelectModule, ButtonModule, MultiselectComponent, TooltipModule, S3ImageUrlPipe],
  templateUrl: './table-filters-sidebar.component.html',
  styleUrl: './table-filters-sidebar.component.scss'
})
export class TableFiltersSidebarComponent implements AfterViewInit {
  @ViewChild('indicatorSelect') indicatorSelect?: MultiselectComponent;
  @ViewChild('statusSelect') statusSelect?: MultiselectComponent;
  @ViewChild('projectSelect') projectSelect?: MultiselectComponent;
  @ViewChild('leverSelect') leverSelect?: MultiselectComponent;
  @ViewChild('yearSelect') yearSelect?: MultiselectComponent;
  @ViewChild('containerRef') containerRef!: ElementRef;

  resultsCenterService = inject(ResultsCenterService);
  getContractStatusClasses = getContractStatusClasses;

  sourceOptions = SOURCE_FILTER_OPTIONS;

  @Input() showSignal = signal(false);
  @Input() confirmSidebarEvent = output<void>();
  @Input() indicatorHiddenIds: number[] = [];
  @Input() forceIndicatorFilter = false;
  @Input() hideProjectFilter = false;

  indicatorOptionFilter = (indicator: { indicator_id?: number } | null) => {
    if (indicator?.indicator_id == null) return true;
    const id = Number(indicator.indicator_id);
    if (Number.isNaN(id)) return true;
    return !this.indicatorHiddenIds.includes(id);
  };

  /** Códigos seleccionados para el multiselect. Propiedad estable (no getter) para evitar bucle de change detection. */
  selectedSourceCodes: string[] = [];

  constructor() {
    effect(() => {
      const sources = this.resultsCenterService.tableFilters().sources;
      const codes = sources.map(s => s.platform_code);
      const same =
        codes.length === this.selectedSourceCodes.length &&
        codes.every((c, i) => c === this.selectedSourceCodes[i]);
      if (!same) {
        this.selectedSourceCodes = [...codes];
      }
    });
  }

  toggleSidebar() {
    this.showSignal.update(prev => !prev);
  }

  onSourceChange(value: string[] | PlatformSourceFilter[]): void {
    const codes = Array.isArray(value) ? value : [];
    this.selectedSourceCodes = typeof codes[0] === 'string' ? [...(codes as string[])] : (codes as PlatformSourceFilter[]).map(s => s.platform_code);
    const sources: PlatformSourceFilter[] = this.selectedSourceCodes.length
      ? (this.selectedSourceCodes.map(code => SOURCE_FILTER_OPTIONS.find(o => o.platform_code === code)).filter(Boolean) as PlatformSourceFilter[])
      : [];
    this.resultsCenterService.tableFilters.update(prev => ({ ...prev, sources }));
  }

  ngAfterViewInit() {
    this.selectedSourceCodes = this.resultsCenterService.tableFilters().sources.map(s => s.platform_code);
    this.resultsCenterService.multiselectRefs.set({
      indicator: this.indicatorSelect!,
      status: this.statusSelect!,
      project: this.projectSelect!,
      lever: this.leverSelect!,
      year: this.yearSelect!
    });
  }
}
