import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-section-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './section-sidebar.component.html',
  styleUrl: './section-sidebar.component.scss'
})
export class SectionSidebarComponent {
  @Input() title!: string;
  @Input() description!: string;
  @Input() showSignal = signal(false);

  hideSidebar() {
    this.showSignal.set(false);
  }
}
