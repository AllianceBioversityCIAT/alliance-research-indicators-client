import { Component, Input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { OrderListModule } from 'primeng/orderlist';

@Component({
  selector: 'app-table-configuration',
  standalone: true,
  imports: [ButtonModule, OrderListModule],
  templateUrl: './table-configuration.component.html',
  styleUrl: './table-configuration.component.scss'
})
export class TableConfigurationComponent {
  @Input() showSignal = signal(false);

  filters = signal([
    { name: 'Code' },
    { name: 'Title' },
    { name: 'Indicator' },
    { name: 'Status' },
    { name: 'Project' },
    { name: 'Lever' },
    { name: 'Year' },
    { name: 'Creator' },
    { name: 'Creation date' }
  ]);

  toggleSidebar() {
    this.showSignal.update(prev => !prev);
  }
}
