import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CacheService } from '../../shared/services/cache.service';
import { RouterOutlet } from '@angular/router';
import { AllianceNavbarComponent } from '../../shared/components/alliance-navbar/alliance-navbar.component';
import { AllianceSidebarComponent } from '../../shared/components/alliance-sidebar/alliance-sidebar.component';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';

@Component({
  selector: 'app-platform',
  standalone: true,
  imports: [RouterOutlet, AllianceNavbarComponent, AllianceSidebarComponent, SectionHeaderComponent],
  templateUrl: './platform.component.html',
  styleUrl: './platform.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PlatformComponent {
  cache = inject(CacheService);
}
