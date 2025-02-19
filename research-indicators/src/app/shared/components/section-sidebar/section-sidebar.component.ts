import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CacheService } from '../../services/cache/cache.service';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-section-sidebar',
    imports: [ButtonModule],
    templateUrl: './section-sidebar.component.html',
    styleUrl: './section-sidebar.component.scss'
})
export class SectionSidebarComponent {
  cache = inject(CacheService);
  @Input() title!: string;
  @Input() description!: string;
  @Input() showSignal = signal(false);
  @Input() confirmText = 'Confirm';
  @Output() confirm = new EventEmitter<void>();

  hideSidebar = () => this.showSignal.set(false);

  confirmSidebar() {
    this.hideSidebar();
    this.confirm.emit();
  }
}
