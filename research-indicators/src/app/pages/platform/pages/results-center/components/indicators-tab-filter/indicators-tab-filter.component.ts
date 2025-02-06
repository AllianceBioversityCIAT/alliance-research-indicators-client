import { Component, signal, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-indicators-tab-filter',
  standalone: true,
  imports: [],
  templateUrl: './indicators-tab-filter.component.html',
  styleUrl: './indicators-tab-filter.component.scss'
})
export class IndicatorsTabFilterComponent {
  @ViewChild('filtersContainer') filtersContainer!: ElementRef;

  filters = signal([
    { filter: 'All indicators' },
    { filter: 'Capacity Sharing for Development' },
    { filter: 'Innovation Development' },
    { filter: 'Innovation Use' },
    { filter: 'Knowledge Product' },
    { filter: 'OICR' },
    { filter: 'Policy Change' }
  ]);

  scrollLeft() {
    if (this.filtersContainer) {
      const container = this.filtersContainer.nativeElement;
      container.scrollLeft -= 200; // Adjust this value to control scroll distance
    }
  }

  scrollRight() {
    if (this.filtersContainer) {
      const container = this.filtersContainer.nativeElement;
      container.scrollLeft += 200; // Adjust this value to control scroll distance
    }
  }
}
