import { Component, signal, ViewChild, ElementRef, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndicatorsIds } from '@shared/enums/indicators-enum';
import { ResultsCenterService } from '../../results-center.service';
import { MenuItem } from 'primeng/api';

interface FilterItem {
  filter: string;
  id: IndicatorsIds | null;
}

@Component({
  selector: 'app-indicators-tab-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicators-tab-filter.component.html',
  styleUrl: './indicators-tab-filter.component.scss'
})
export class IndicatorsTabFilterComponent {
  @Input() activeItem = 'all';
  @Input() userCodes?: string[];

  @ViewChild('filtersContainer') filtersContainer!: ElementRef;
  resultsCenterService = inject(ResultsCenterService);

  filters = signal<FilterItem[]>([
    { filter: 'All indicators', id: null },
    { filter: 'Capacity Sharing for Development', id: 'CAPACITY_SHARING_FOR_DEVELOPMENT' },
    { filter: 'Innovation Development', id: 'INNOVATION_DEV' },
    { filter: 'Innovation Use', id: 'INNOVATION_USE' },
    { filter: 'Knowledge Product', id: 'KNOWLEDGE_PRODUCT' },
    { filter: 'OICR', id: 'OICR' },
    { filter: 'Policy Change', id: 'POLICY_CHANGE' }
  ]);

  onFilterClick(filter: FilterItem) {
    this.resultsCenterService.selectedFilter.set(filter.id as IndicatorsIds);
    this.resultsCenterService.updateList({
      type: filter.id as IndicatorsIds,
      userCodes: this.activeItem === 'my' ? this.userCodes : undefined
    });
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
