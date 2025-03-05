import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CacheService } from '@services/cache/cache.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'alliance-sidebar',
  imports: [RouterModule, CommonModule, TooltipModule],
  templateUrl: './alliance-sidebar.component.html',
  styleUrl: './alliance-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllianceSidebarComponent implements OnInit {
  cache = inject(CacheService);
  options = [
    { icon: 'finance', label: 'About indicators', link: '/about-indicators', disabled: false },
    { icon: 'info', label: 'About the tool', link: '1', underConstruction: true, hide: false },
    { icon: 'table_rows', label: 'Power BI dashboard', link: '23', underConstruction: true, hide: false },
    { icon: 'open_in_new', label: 'Other reporting tools', link: '45', underConstruction: true, hide: false },
    { icon: 'forum', label: 'Give feedback', underConstruction: true, hide: false }
  ];

  innerWidth = 0;

  ngOnInit() {
    this.innerWidth = window.innerWidth;

    if ((this.innerWidth <= 1200 || this.cache.hasSmallScreen()) && !this.cache.isSidebarCollapsed()) {
      this.cache.toggleSidebar();
    }
  }
}
