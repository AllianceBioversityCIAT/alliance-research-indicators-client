import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
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
  @Output() confirm = new EventEmitter<void>();

  hideSidebar = () => this.showSignal.set(false);

  confirmSidebar() {
    this.hideSidebar();
    this.confirm.emit();
  }
}
