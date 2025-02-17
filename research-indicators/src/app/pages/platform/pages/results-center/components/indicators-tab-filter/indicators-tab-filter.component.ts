import { Component, ViewChild, ElementRef, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsCenterService } from '../../results-center.service';

@Component({
  selector: 'app-indicators-tab-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicators-tab-filter.component.html',
  styleUrl: './indicators-tab-filter.component.scss'
})
export class IndicatorsTabFilterComponent implements AfterViewInit {
  @ViewChild('filtersContainer') filtersContainer!: ElementRef;
  resultsCenterService = inject(ResultsCenterService);
  showLeftArrow = signal(false);

  ngAfterViewInit() {
    if (this.filtersContainer) {
      this.filtersContainer.nativeElement.addEventListener('scroll', () => this.updateArrowVisibility());
    }
  }

  updateArrowVisibility() {
    const container = this.filtersContainer.nativeElement;
    this.showLeftArrow.set(container.scrollLeft > 0);
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
