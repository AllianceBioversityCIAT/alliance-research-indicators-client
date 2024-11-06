import { Component } from '@angular/core';
import { OrderListModule } from 'primeng/orderlist';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [TabViewModule, OrderListModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export default class NotificationsComponent {
  selectedFilter = 'unread';

  selectFilter(filter: string): void {
    this.selectedFilter = filter;
  }
}
