import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CacheService } from '@services/cache.service';
import { RouterOutlet } from '@angular/router';
import { AllianceNavbarComponent } from '@components/alliance-navbar/alliance-navbar.component';
import { AllianceSidebarComponent } from '@components/alliance-sidebar/alliance-sidebar.component';
import { SectionHeaderComponent } from '@components/section-header/section-header.component';
import { AllModalsComponent } from '../../shared/components/all-modals/all-modals.component';

@Component({
  selector: 'app-platform',
  standalone: true,
  imports: [RouterOutlet, AllianceNavbarComponent, AllianceSidebarComponent, SectionHeaderComponent, AllModalsComponent],
  templateUrl: './platform.component.html',
  styleUrl: './platform.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PlatformComponent {
  cache = inject(CacheService);
}
