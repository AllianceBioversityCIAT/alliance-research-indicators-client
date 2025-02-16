import { Component, signal, ViewChild, ElementRef, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsCenterService } from '../../results-center.service';
import { GetAllIndicatorsService } from '../../../../../../shared/services/control-list/get-all-indicators.service';
import { GetAllIndicators } from '../../../../../../shared/interfaces/get-all-indicators.interface';

@Component({
  selector: 'app-indicators-tab-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicators-tab-filter.component.html',
  styleUrl: './indicators-tab-filter.component.scss'
})
export class IndicatorsTabFilterComponent {
  @Input() activeItem = 'all';

  @ViewChild('filtersContainer') filtersContainer!: ElementRef;
  resultsCenterService = inject(ResultsCenterService);

  onFilterClick(indicatorId: number) {
    this.resultsCenterService.indicatorsTabFilterList.update(prev =>
      prev.map(item => ({
        ...item,
        active: item.indicator_id === indicatorId
      }))
    );

    this.resultsCenterService.resultsFilter.update(prev => ({
      ...prev,
      'indicator-codes-tabs': indicatorId === 0 ? [] : [indicatorId]
    }));

    this.resultsCenterService.resultsFilter()['indicator-codes-filter'] = [];
    this.resultsCenterService.tableFilters.update(prev => ({
      ...prev,
      indicators: []
    }));
  }

  scrollLeft() {
    if (this.filtersContainer) {
      const container = this.filtersContainer.nativeElement;
      container.scrollLeft -= 200;
    }
  }

  scrollRight() {
    if (this.filtersContainer) {
      const container = this.filtersContainer.nativeElement;
      container.scrollLeft += 200;
    }
  }
}
