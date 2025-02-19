import { Component, ViewChild, ElementRef, inject, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsCenterService } from '../../results-center.service';
import { ApiService } from '../../../../../../shared/services/api.service';

@Component({
    selector: 'app-indicators-tab-filter',
    imports: [CommonModule],
    templateUrl: './indicators-tab-filter.component.html',
    styleUrl: './indicators-tab-filter.component.scss'
})
export class IndicatorsTabFilterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('filtersContainer') filtersContainer!: ElementRef;
  api = inject(ApiService);
  resultsCenterService = inject(ResultsCenterService);
  showLeftArrow = signal(false);
  showRightArrow = signal(false);
  private resizeObserver: ResizeObserver | null = null;

  ngAfterViewInit() {
    if (this.filtersContainer) {
      this.filtersContainer.nativeElement.addEventListener('scroll', () => this.updateArrowVisibility());

      // Verificar si ResizeObserver está disponible
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          this.updateArrowVisibility();
        });

        this.resizeObserver.observe(this.filtersContainer.nativeElement);
      } else {
        // Fallback para navegadores que no soportan ResizeObserver
        window.addEventListener('resize', () => this.updateArrowVisibility());
      }

      // Validación inicial
      this.updateArrowVisibility();
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    // Limpiar el event listener de resize si se usó el fallback
    if (typeof ResizeObserver === 'undefined') {
      window.removeEventListener('resize', () => this.updateArrowVisibility());
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
