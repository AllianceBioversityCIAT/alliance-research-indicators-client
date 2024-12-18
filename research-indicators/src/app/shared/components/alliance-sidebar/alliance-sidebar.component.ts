import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CacheService } from '@services/cache/cache.service';
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
    { icon: 'finance', label: 'About indicators', link: '/about-indicators', disabled: false },
    { icon: 'info', label: 'About the tool', link: '1', disabled: true },
    { icon: 'table_rows', label: 'Power BI dashboard', link: '23', disabled: true },
    { icon: 'open_in_new', label: 'Other reporting tools', link: '45', disabled: true },
    { icon: 'forum', label: 'Give feedback', disabled: true }
  ];

  isCollapsed = signal(window.innerHeight <= 768);

  collapse() {
    this.isCollapsed.update(isCollapsed => !isCollapsed);
  }

  getSidebarWidth() {
    return this.isCollapsed() ? '140px' : '250px';
  }
}
