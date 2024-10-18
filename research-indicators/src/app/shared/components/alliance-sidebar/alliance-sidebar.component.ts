import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CacheService } from '../../services/cache.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'alliance-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './alliance-sidebar.component.html',
  styleUrl: './alliance-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllianceSidebarComponent {
  cache = inject(CacheService);
  options = [
    { icon: 'finance', label: 'About indicators', link: '/about-indicators' },
    { icon: 'info', label: 'About the tool', link: '' },
    { icon: 'table_rows', label: 'Power BI dashboard', link: '' },
    { icon: 'open_in_new', label: 'Other reporting tools', link: '' }
  ];

  isCollapsed = signal(false);

  collapse() {
    this.isCollapsed.update(isCollapsed => !isCollapsed);
  }

  getSidebarWidth() {
    return this.isCollapsed() ? '140px' : '250px';
  }
}
