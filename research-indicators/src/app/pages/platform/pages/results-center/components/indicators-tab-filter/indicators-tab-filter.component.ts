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
export class IndicatorsTabFilterComponent implements OnInit {
  getAllIndicatorsServiceInstance = inject(GetAllIndicatorsService).getInstance;
  @Input() activeItem = 'all';
  @Input() userCodes?: string[];
  indicators = signal<GetAllIndicators[]>([]);

  @ViewChild('filtersContainer') filtersContainer!: ElementRef;
  resultsCenterService = inject(ResultsCenterService);

  ngOnInit(): void {
    this.getIndicators();
  }

  async getIndicators() {
    const response = await this.getAllIndicatorsServiceInstance();
    this.indicators.set(response());
    this.indicators.update(prev => [
      {
        name: 'All Indicators',
        indicator_id: 0,
        active: true
      },
      ...prev
    ]);
  }

  onFilterClick(indicatorId: number) {
    this.indicators.update(prev => {
      if (indicatorId === 0) {
        return prev.map(item => ({
          ...item,
          active: item.indicator_id === 0
        }));
      }

      return prev.map(item => ({
        ...item,
        active: item.indicator_id === 0 ? false : item.indicator_id === indicatorId ? !item.active : item.active
      }));
    });

    this.resultsCenterService.resultsFilter.update(prev => ({
      ...prev,
      indicatorsCodes: this.indicators()
        .filter(item => item.active && item.indicator_id !== 0)
        .map(item => item.indicator_id)
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
