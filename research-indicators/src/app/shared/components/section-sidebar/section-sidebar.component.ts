import { Component, inject, Input, signal } from '@angular/core';
import { ResultsCenterService } from '@pages/platform/pages/results-center/results-center.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-section-sidebar',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './section-sidebar.component.html',
  styleUrl: './section-sidebar.component.scss'
})
export class SectionSidebarComponent {
  @Input() title!: string;
  @Input() description!: string;
  @Input() showSignal = signal(false);

  resultsCenterService = inject(ResultsCenterService);

  hideSidebar = () => this.showSignal.set(false);

  confirmSidebar() {
    this.resultsCenterService.applyFilters();
    this.hideSidebar();
  }
}
