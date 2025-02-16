import { Component, ViewChild, ElementRef, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsCenterService } from '../../results-center.service';

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
