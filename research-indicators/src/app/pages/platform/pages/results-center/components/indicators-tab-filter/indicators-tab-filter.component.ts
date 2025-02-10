import { Component, signal, ViewChild, ElementRef, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsCenterService } from '../../results-center.service';
import { GetAllIndicatorsService } from '../../../../../../shared/services/control-list/get-all-indicators.service';
import { GetAllIndicators } from '../../../../../../shared/interfaces/get-all-indicators.interface';
interface FilterItem {
  filter: string;
  id: number | null;
}

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
        indicator_id: 0
      },
      ...prev
    ]);
  }

  onFilterClick(indicatorId: number) {
    console.log(indicatorId);
    // this.resultsCenterService.selectedFilter.set(indicatorId);
    // this.resultsCenterService.updateList({
    //   type: indicatorId,
    //   userCodes: this.activeItem === 'my' ? this.userCodes : undefined
    // });
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
