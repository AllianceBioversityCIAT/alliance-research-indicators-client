import { Component, ViewChild, ElementRef, inject, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsCenterService } from '../../results-center.service';

@Component({
  selector: 'app-indicators-tab-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicators-tab-filter.component.html',
  styleUrl: './indicators-tab-filter.component.scss'
})
export class IndicatorsTabFilterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('filtersContainer') filtersContainer!: ElementRef;
  resultsCenterService = inject(ResultsCenterService);
  showLeftArrow = signal(false);
  showRightArrow = signal(false);
  private resizeObserver: ResizeObserver | null = null;

  ngAfterViewInit() {
    if (this.filtersContainer) {
      this.filtersContainer.nativeElement.addEventListener('scroll', () => this.updateArrowVisibility());

      // Crear ResizeObserver para detectar cambios en el tamaño
      this.resizeObserver = new ResizeObserver(() => {
        this.updateArrowVisibility();
      });

      this.resizeObserver.observe(this.filtersContainer.nativeElement);
      // Validación inicial
      this.updateArrowVisibility();
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  updateArrowVisibility() {
    const container = this.filtersContainer.nativeElement;
    const hasHorizontalScroll = container.scrollWidth > container.clientWidth;

    if (!hasHorizontalScroll) {
      this.showLeftArrow.set(false);
      this.showRightArrow.set(false);
      return;
    }

    this.showLeftArrow.set(container.scrollLeft > 0);
    this.showRightArrow.set(container.scrollLeft < container.scrollWidth - container.clientWidth);
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
