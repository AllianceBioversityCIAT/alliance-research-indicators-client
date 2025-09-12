import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CacheService } from '@services/cache/cache.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { S3ImageUrlPipe } from '@shared/pipes/s3-image-url.pipe';

@Component({
  selector: 'alliance-sidebar',
  imports: [RouterModule, CommonModule, TooltipModule, S3ImageUrlPipe],
  templateUrl: './alliance-sidebar.component.html',
  styleUrl: './alliance-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllianceSidebarComponent implements OnInit {
  cache = inject(CacheService);
  allModalsService = inject(AllModalsService);
  options = [
    { icon: 'pi-file', label: 'About Indicators', link: '/about-indicators', disabled: false },
    { icon: 'pi-exclamation-circle transform scale-y-[-1]', label: 'About the Tool', link: '1', underConstruction: true, hide: false },
    { icon: 'pi-chart-bar', label: 'Alliance Dashboard', link: '23', underConstruction: true, hide: false },
    { icon: 'pi-external-link', label: 'Other Reporting Tools', link: '45', underConstruction: true, hide: false },
    { icon: 'pi-comments', label: 'Ask for Help', underConstruction: false, hide: false, action: () => this.allModalsService.openModal('askForHelp') }
  ];

  innerWidth = 0;

  ngOnInit() {
    this.innerWidth = window.innerWidth;

    if ((this.innerWidth <= 1200 || this.cache.hasSmallScreen()) && !this.cache.isSidebarCollapsed()) {
      this.cache.toggleSidebar();
    }
  }

  toggleSidebarAndResize(): void {
    this.cache.toggleSidebar();

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150);
  }
}
