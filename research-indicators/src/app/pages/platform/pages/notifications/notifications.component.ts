import { Component } from '@angular/core';

import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [TabViewModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export default class NotificationsComponent {
  selectedFilter = 'unread';

  selectFilter(filter: string): void {
    this.selectedFilter = filter;
  }
}
