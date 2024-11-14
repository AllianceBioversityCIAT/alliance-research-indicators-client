import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CacheService } from '@services/cache/cache.service';
import { DarkModeService } from '@services/dark-mode.service';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AllianceNavOptions } from '@interfaces/nav.interface';
import { DropdownComponent } from '@components/dropdown/dropdown.component';
import { ActionsService } from '@services/actions.service';
import { AllModalsService } from '@services/cache/all-modals.service';
import { ResultsListDropdownComponent } from '@components/dropdowns/results-list-dropdown/results-list-dropdown.component';
import { DropdownsCacheService } from '../../services/cache/dropdowns-cache.service';
import { FilterByTextWithAttrPipe } from '../../pipes/filter-by-text-with-attr.pipe';
@Component({
  selector: 'alliance-navbar',
  standalone: true,
  imports: [ButtonModule, BadgeModule, ChipModule, RouterLink, RouterLinkActive, AvatarModule, AvatarGroupModule, DropdownComponent, ResultsListDropdownComponent, FilterByTextWithAttrPipe],
  templateUrl: './alliance-navbar.component.html',
  styleUrl: './alliance-navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllianceNavbarComponent {
  dropdownsCache = inject(DropdownsCacheService);
  allModalsService = inject(AllModalsService);
  cache = inject(CacheService);
  darkModeService = inject(DarkModeService);
  router = inject(Router);
  actions = inject(ActionsService);
  searchText = signal('');
  options: AllianceNavOptions[] = [
    { label: 'Home', path: '/home' },
    { label: 'My Results', path: '/settings', icon: 'keyboard_arrow_down' },
    { label: 'My Projects', path: '/profile', icon: 'keyboard_arrow_down' }
  ];

  onSearchTextChange(event: Event) {
    this.searchText.set((event.target as HTMLInputElement).value);
  }
}
